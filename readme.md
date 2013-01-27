PayPal Express checkout for single payment
==========================================

* Simple and easy use
* __No dependencies__
* [demo paypal](https://github.com/petersirka/partial.js/tree/master/examples/paypal)

***

```js

var paypal = require('paypal').init('username', 'password', 'signature', 'return url', 'cancel url', [debug]);

// debug = optional, default false
// paypal.pay('Invoice nubmer', amout, 'description', 'currency', callback);
// checkout

paypal.pay('20130001', 123.23, 'iPad', 'EUR', function(err, url) {
	
	if (err) {
		console.log(err);
		return;
	}

	// redirect to paypall webpage
	response.redirect(url);
});

// result
// paypal.detail('token', 'PayerID', callback)
paypal.detail('EC-788441863R616634K', '9TM892TKTDWCE', function(err, data) {
	
	if (err) {
		console.log(err);
		return;
	}

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

```text
$ npm install node-paypal
```

## Contact

<http://www.petersirka.sk>