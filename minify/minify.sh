ECHO "[COMPILING]"
cd ..
ECHO "....... index.js"
uglifyjs index.js -o minify/paypal-express-checkout/index.js

cp readme.md minify/paypal-express-checkout/readme.md
cp package.json minify/paypal-express-checkout/package.json
cp license.txt minify/paypal-express-checkout/license.txt

cd minify
node minify.js