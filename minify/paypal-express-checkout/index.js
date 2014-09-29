// Copyright 2012-2014 (c) Peter Širka <petersirka@gmail.com>
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

function Paypal(e,t,n,r,i,s){this.username=e,this.password=t,this.solutiontype="Mark",this.signature=n,this.debug=s||!1,this.returnUrl=r,this.cancelUrl=i,this.url="https://"+(s?"api-3t.sandbox.paypal.com":"api-3t.paypal.com")+"/nvp",this.redirect="https://"+(s?"www.sandbox.paypal.com/cgi-bin/webscr":"www.paypal.com/cgi-bin/webscr")}function prepareNumber(e,t){var n=e.toString().replace(",","."),r=n.indexOf(".");if(r>-1){var i=n.substring(r+1).length;i===1&&(n+="0"),i>2&&(n=n.substring(0,r+3))}else if(t||!0)n+=".00";return n}var urlParser=require("url"),https=require("https"),querystring=require("querystring");Paypal.prototype.params=function(){var e=this;return{USER:e.username,PWD:e.password,SIGNATURE:e.signature,SOLUTIONTYPE:e.solutiontype,VERSION:"52.0"}},Paypal.prototype.detail=function(e,t,n){typeof e.get!="undefined"&&typeof t=="function"&&(n=t,t=e.get.PayerID,e=e.get.token);var r=this,i=r.params();return i.TOKEN=e,i.METHOD="GetExpressCheckoutDetails",r.request(r.url,"POST",i,function(i,s){if(i){n(i,s);return}if(typeof s.CUSTOM=="undefined"){n(s,null);return}var o=s.CUSTOM.split("|"),u=r.params();u.PAYMENTACTION="Sale",u.PAYERID=t,u.TOKEN=e,u.AMT=o[1],u.CURRENCYCODE=o[2],u.METHOD="DoExpressCheckoutPayment",r.request(r.url,"POST",u,function(e,t){if(e){n(e,t);return}n(null,t,o[0],o[1])})}),r},Paypal.prototype.pay=function(e,t,n,r,i){var s=this,o=s.params();return o.PAYMENTACTION="Sale",o.AMT=prepareNumber(t),o.RETURNURL=s.returnUrl,o.CANCELURL=s.cancelUrl,o.DESC=n,o.NOSHIPPING=1,o.ALLOWNOTE=1,o.CURRENCYCODE=r,o.METHOD="SetExpressCheckout",o.INVNUM=e,o.CUSTOM=e+"|"+o.AMT+"|"+r,s.request(s.url,"POST",o,function(e,t){if(e){i(e,null);return}if(t.ACK==="Success"){i(null,s.redirect+"?cmd=_express-checkout&useraction=commit&token="+t.TOKEN);return}i(new Error("ACK "+t.ACK+": "+t.L_LONGMESSAGE0),null)}),s},Paypal.prototype.request=function(e,t,n,r){var i=this,s=querystring.stringify(n);t==="GET"&&(e+="?"+s);var o=urlParser.parse(e),u={};u["Content-Type"]=t==="POST"?"application/x-www-form-urlencoded":"text/plain",u["Content-Length"]=s.length;var a="",f={protocol:o.protocol,auth:o.auth,method:t||"GET",hostname:o.hostname,port:o.port,path:o.path,agent:!1,headers:u},l=function(e){var t="";e.on("data",function(e){t+=e.toString("utf8")}),c.setTimeout(exports.timeout,function(){r(new Error("timeout"),null)}),e.on("end",function(){var n=null,i="";e.statusCode>200?(n=new Error(e.statusCode),i=t):i=querystring.parse(t),r(n,i)})},c=https.request(f,l);return t==="POST"?c.end(s):c.end(),i},exports.Paypal=Paypal,exports.init=function(e,t,n,r,i,s){return new Paypal(e,t,n,r,i,s)},exports.create=function(e,t,n,r,i,s){return exports.init(e,t,n,r,i,s)};
