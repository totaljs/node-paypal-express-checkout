// Copyright 2012-2017 (c) Peter Širka <petersirka@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

const Parser = require('url');
const Https = require('https');
const Qs = require('querystring');
const HEADERS = {};

HEADERS['User-Agent'] = 'Total.js PayPal Express Checkout';
HEADERS['Accept'] = '*/*';

function Paypal(username, password, signature, returnUrl, cancelUrl, debug) {
	this.username = username;
	this.password = password;
	this.solutiontype = 'Mark';
	this.signature = signature;
	this.debug = debug || false;
	this.returnUrl = returnUrl;
	this.cancelUrl = cancelUrl;
	this.url = 'https://' + (debug ? 'api-3t.sandbox.paypal.com' : 'api-3t.paypal.com') + '/nvp';
	this.redirect = 'https://' + (debug ? 'www.sandbox.paypal.com/cgi-bin/webscr' : 'www.paypal.com/cgi-bin/webscr');
	this.locale = '';
}

Paypal.prototype.params = function() {
	var PARAMS = {};
	PARAMS.VERSION = '204.0';
	PARAMS.USER = this.username;
	PARAMS.PWD = this.password;
	PARAMS.SIGNATURE = this.signature;
	return PARAMS;
};

Paypal.prototype.detail = function(token, payer, callback) {

	// Total.js
	if (token.query && typeof(payer) === 'function') {
		callback = payer;
		payer = token.query.PayerID || token.query.PAYERID;
		token = token.query.token || token.query.TOKEN;
	}

	var self = this;
	var params = self.params();

	params.TOKEN = token;
	params.METHOD = 'GetExpressCheckoutDetails';

	self.request(self.url, 'POST', params, function(err, data) {

		if (err || !data.PAYMENTREQUEST_0_CUSTOM) {
			callback(null, data, 0);
			return;
		}

		var custom = data.CUSTOM.split('|');
		var params = self.params();
		var prevData = data;

		params.PAYERID = payer;
		params.TOKEN = token;
		params.PAYMENTREQUEST_0_PAYMENTACTION = 'Sale';
		params.PAYMENTREQUEST_0_INVNUM = custom[0];
		params.PAYMENTREQUEST_0_AMT = custom[1];
		params.PAYMENTREQUEST_0_CURRENCYCODE = custom[2];
		params.METHOD = 'DoExpressCheckoutPayment';

		self.request(self.url, 'POST', params, function(err, data) {
			if (err)
				return callback(err, data);
			data.ACK2 = data.ACK;
			data.ACK = data.PAYMENTINFO_0_ACK; // Backward compatibility
			data.PAYMENTSTATUS = data.PAYMENTINFO_0_PAYMENTSTATUS;
			var is = (data.PAYMENTINFO_0_PAYMENTSTATUS || '').toLowerCase();
			data.success = (data.ACK || 'failure').toLowerCase() === 'success' && (is === 'completed' || is === 'processed' || is === 'pending');
			callback(null, Object.assign(prevData, data), custom[0], custom[1]);
		});
	});

	return self;
};

Paypal.prototype.pay = function(invoiceNumber, amount, description, currency, requireAddress, callback) {

	// Backward compatibility
	if (typeof(requireAddress) === 'function') {
		callback = requireAddress;
		requireAddress = false;
	}

	var self = this;
	var params = self.params();

	params.PAYMENTREQUEST_0_PAYMENTACTION = 'SALE';
	params.PAYMENTREQUEST_0_AMT = prepareNumber(amount);
	params.PAYMENTREQUEST_0_CURRENCYCODE = currency;
	params.PAYMENTREQUEST_0_DESC = description;
	params.PAYMENTREQUEST_0_CUSTOM = invoiceNumber + '|' + params.PAYMENTREQUEST_0_AMT + '|' + params.PAYMENTREQUEST_0_CURRENCYCODE;
	params.PAYMENTREQUEST_0_INVNUM = invoiceNumber;
	params.returnUrl = self.returnUrl;
	params.cancelUrl = self.cancelUrl;
	params.NOSHIPPING = requireAddress ? 0 : 1;
	params.ALLOWNOTE = 1;

	if (self.locale)
		params.LOCALECODE = self.locale;

	params.METHOD = 'SetExpressCheckout';

	self.request(self.url, 'POST', params, function(err, data) {
		if (err)
			return callback(err, null);

		if (data.ACK === 'Success')
			callback(null, self.redirect + '?cmd=_express-checkout&useraction=commit&token=' + data.TOKEN);
		else
			callback(new Error('ACK ' + data.ACK + ': ' + data.L_LONGMESSAGE0), null);
	});

	return self;
};

Paypal.prototype.request = function(url, method, data, callback) {

	var self = this;
	var params = Qs.stringify(data);

	if (method === 'GET')
		url += '?' + params;

	var uri = Parser.parse(url);

	HEADERS['Content-Type'] = method === 'POST' ? 'application/x-www-form-urlencoded' : 'text/plain';
	HEADERS['Content-Length'] = new Buffer(params).length;

	var options = { protocol: uri.protocol, auth: uri.auth, method: method || 'GET', hostname: uri.hostname, port: uri.port, path: uri.path, agent: false, headers: HEADERS };

	var response = function(res) {

		var buffer = new Buffer(0);

		res.on('data', (chunk) => buffer = Buffer.concat([buffer, chunk]));
		req.setTimeout(exports.timeout, () => callback(new Error('timeout'), null));
		res.on('end', function() {

			var error;
			var data;

			if (res.statusCode > 200) {
				error = res.statusCode + ': ' + buffer.toString('utf8');
				data = '';
			} else
				data = Qs.parse(buffer.toString('utf8'));

			callback(error, data);
		});
	};

	var req = Https.request(options, response);
	req.on('error', (err) => callback(err, null));
	req.end(params);
	return self;
};

function prepareNumber(num, doubleZero) {
	var str = num.toString().replace(',', '.');
	var index = str.indexOf('.');
	if (index > -1) {
		var len = str.substring(index + 1).length;
		if (len === 1)
			str += '0';
		if (len > 2)
			str = str.substring(0, index + 3);
	} else {
		if (doubleZero || true)
			str += '.00';
	}
	return str;
}

exports.timeout = 10000;
exports.Paypal = Paypal;

exports.init = function(username, password, signature, returnUrl, cancelUrl, debug) {
	return new Paypal(username, password, signature, returnUrl, cancelUrl, debug);
};

exports.create = function(username, password, signature, returnUrl, cancelUrl, debug) {
	return exports.init(username, password, signature, returnUrl, cancelUrl, debug);
};