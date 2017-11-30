[![NPM version][npm-version-image]][npm-url] [![NPM quality][npm-quality]](http://packagequality.com/#?package=total.js) [![NPM downloads][npm-downloads-image]][npm-url] [![MIT License][license-image]][license-url]

- [__Live chat with professional support__](https://messenger.totaljs.com)
- [__HelpDesk with professional support__](https://helpdesk.totaljs.com)

Node.js PayPal Express Checkout
===============================

* Easy to use
* __No dependencies__
* [Full source-code of the eshop with PayPal written in node.js](http://www.totaljs.com/eshop/)

PayPal account
--------------

Read here: <https://developer.paypal.com/docs/classic/api/apiCredentials/#creating-an-api-signature>

- Log in to your PayPal business account at www.paypal.com. Click the profile icon ( Profile menu ) on the top right side of the page. From the Business Profile menu, select Profile and Settings.
- From the left menu, click My selling tools.
- In the Selling online section, click the Update link for the API access item.
- To generate the API signature, click Request API Credentials on the API Access page. ![Request API credentials](https://www.paypalobjects.com/webstatic/en_US/developer/docs/api/classicApiCerts/requestApiCreds.png)
- Select Request API signature and click Agree and Submit to generate the API signature. ![Signature](https://www.paypalobjects.com/webstatic/en_US/developer/docs/api/classicApiCerts/signatureCredentials.png)

***

```text
$ npm install paypal-express-checkout
```

***

```javascript
var Paypal = require('paypal-express-checkout');
// debug = optional, defaults to false, if true then paypal's sandbox url is used
// paypal.init('some username', 'some password', 'signature', 'return url', 'cancel url', debug);
var paypal = Paypal.init('username', 'password', 'signature', 'http://www.example.com/return', 'http://www.example.com/cancel', true);

// Localization (OPTIONAL): https://developer.paypal.com/docs/classic/api/locale_codes/
// paypal.locale = 'SK';
// or
// paypal.locale = 'en_US';

// checkout
// requireAddress = optional, defaults to false
// paypal.pay('Invoice number', amount, 'description', 'currency', requireAddress, customData, callback);
// paypal.pay('20130001', 123.23, 'iPad', 'EUR', function(err, url) {
// or with "requireAddress": true
paypal.pay('20130001', 123.23, 'iPad', 'EUR', true, ['custom', 'data'], function(err, url) {
	if (err) {
		console.log(err);
		return;
	}

	// redirect to paypal webpage
	response.redirect(url);
});

// result in GET method
// paypal.detail('token', 'PayerID', callback);
// or
// paypal.detail(totaljs.controller, callback);

paypal.detail('EC-788441863R616634K', '9TM892TKTDWCE', function(err, data, invoiceNumber, price) {

	if (err) {
		console.log(err);
		return;
	}

	// data.success == {Boolean}
	
	if (data.success)
		console.log('DONE, PAYMENT IS COMPLETED.');
	else
		console.log('SOME PROBLEM:', data);

	/*
	data (object) =
	{ TOKEN: 'EC-35S39602J3144082X',
	  TIMESTAMP: '2013-01-27T08:47:50Z',
	  CORRELATIONID: 'e51b76c4b3dc1',
	  ACK: 'Success',
	  VERSION: '52.0',
	  BUILD: '4181146',
	  TRANSACTIONID: '87S10228Y4778651P',
	  TRANSACTIONTYPE: 'expresscheckout',
	  PAYMENTTYPE: 'instant',
	  ORDERTIME: '2013-01-27T08:47:49Z',
	  AMT: '10.00',
	  TAXAMT: '0.00',
	  CURRENCYCODE: 'EUR',
	  PAYMENTSTATUS: 'Pending',
	  PENDINGREASON: 'multicurrency',
	  REASONCODE: 'None' };
	*/

});

```

## PayPal PAYMENTSTATUS

```
Canceled_Reversal: A reversal has been canceled. For example, you won a dispute with the customer, and the funds for the transaction that was reversed have been returned to you.
Completed: The payment has been completed, and the funds have been added successfully to your account balance.
Created: A German ELV payment is made using Express Checkout.
Denied: You denied the payment. This happens only if the payment was previously pending because of possible reasons described for the pending_reason variable or the Fraud_Management_Filters_x variable.
Expired: This authorization has expired and cannot be captured.
Failed: The payment has failed. This happens only if the payment was made from your customer’s bank account.
Pending: The payment is pending. See pending_reason for more information.
Refunded: You refunded the payment.
Reversed: A payment was reversed due to a chargeback or other type of reversal. The funds have been removed from your account balance and returned to the buyer. The reason for the reversal is specified in the ReasonCode element.
Processed: A payment has been accepted.
Voided: This authorization has been voided.
```

## How to prevent of pending paymentstatus?

> Login into your bussiness account and click here: https://www.sandbox.paypal.com/ca/cgi-bin/?cmd=_profile-pref&source=acct_setup&fli=true

## Contributors

| Contributor | Type | E-mail |
|-------------|------|--------|
| [Peter Širka](https://www.petersirka.eu) | author + support | <petersirka@gmail.com> |
| [Martin Smola](https://github.com/molda) | support + contributor | <smola.martin@gmail.com> |
| [Johann Botha](https://github.com/johannbotha) | contributor | <johannbbotha@gmail.com> |

## Images

![Payment Card Types](https://www.paypalobjects.com/webstatic/en_US/i/buttons/cc-badges-ppmcvdam.png)

![PayPal Express Checkout Button](https://www.paypalobjects.com/webstatic/en_US/i/btn/png/gold-pill-paypalcheckout-34px.png)

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: license.txt

[npm-url]: https://npmjs.org/package/total.js
[npm-version-image]: https://img.shields.io/npm/v/total.js.svg?style=flat
[npm-downloads-image]: https://img.shields.io/npm/dm/total.js.svg?style=flat
[npm-quality]: http://npm.packagequality.com/shield/total.js.svg
