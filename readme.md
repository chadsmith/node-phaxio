# node-phaxio

Send faxes with the [Phaxio API](http://www.phaxio.com).

## Installation

`npm install phaxio`

## Usage overview

	var Phaxio = require('phaxio'),
	  phaxio = new Phaxio('e222........................', '62e5........................');

	phaxio.sendFax('13165555555', {
	  string_data: 'Faxing from Node.js',
	  string_data_type: 'text'
	});

## Methods

### phaxio.getApiKey()

Returns the current API key

### phaxio.getApiSecret()

Returns the current API secret

### phaxio.setApiKey(api_key)

Changes the API key to `api_key`

	phaxio.setApiKey('e222........................');
	
### phaxio.setApiSecret(api_secret)

Changes the API secret to `api_secret`

	phaxio.setApiSecret('62e5........................');
	
### phaxio.faxStatus(faxId, callback)

Returns the status of `faxId`

	phaxio.faxStatus('123456', function(res) {
	  console.log(res);
	});

### phaxio.sendFax(to [, filename, options], callback)

Sends `to` a fax containing `filename` or `options`

	phaxio.sendFax('13165555555', ['coverletter.doc', 'resume.pdf'], function(res) {
	  console.log(res);
	});

	phaxio.sendFax('13165555555', {
	  string_data: 'http://www.google.com/',
	  string_data_type: 'url'
	});

	var batchID;
	phaxio.sendFax(['13165555555', '19135555555'], 'my-cat.jpg', { batch: true }, function(res) {
	  if(res.batchId)
	    batchId = res.batchId;
	});

### phaxio.fireBatch(batchId, callback)

Fires the batch `batchId`

	phaxio.fireBatch(batchId);

### phaxio.closeBatch(batchId, callback)

Closes the batch `batchId`

	phaxio.closeBatch('123456');

### phaxio.provisionNumber(area_code [, callback_url], callback)

Provisions a number in area code `area_code`

	phaxio.provisionNumber('847', function(res) {
	  console.log(res);
	});

### phaxio.releaseNumber(number, callback)

Releases the number `number`

	phaxio.releaseNumber('8475551234', function(res) {
	  console.log(res);
	});

### phaxio.numberList([params,] callback)

Returns user phone numbers matching optional params `area_code` or `number`

	phaxio.numberList(function(res) {
	  console.log(res);
	});

	phaxio.numberList({ area_code: '847' }, function(res) {
	  console.log(res);
	});

### phaxio.accountStatus(callback)

Returns the account status

	phaxio.accountStatus(function(res) {
	  console.log(res);
	});

### phaxio.testReceive(filename [, params], callback)

Simulates receiving a fax containing the PhaxCode in `filename` with optional params `from_number` and `to_number`

	phaxio.testReceive('PhaxCode.pdf', function(res) {
	  console.log(res);
	});

	phaxio.testReceive('PhaxCode.pdf', { from_number: '3165555555', to_number: '9135555555' }, function(res) {
	  console.log(res);
	});

### phaxio.attachPhaxCodeToPdf(filename, x, y [, params], callback)

Returns a PDF of `filename` with a PhaxCode at the `x`,`y` location specified with optional params `metadata` and `page_number`

	phaxio.attachPhaxCodeToPdf('resume.doc', 0, 5, function(buffer) {
	  fs.writeFileSync(path.join(__dirname, 'resume-with-PhaxCode.pdf'), buffer, 'binary');
	});

	phaxio.attachPhaxCodeToPdf('kittens.pdf', 5, 25, { metadata: 'Fax with kittens', page_number: 5 }, function(buffer) {
	  fs.writeFileSync(path.join(__dirname, 'kittens-with-PhaxCode.pdf'), buffer, 'binary');
	});

### phaxio.createPhaxCode([params,] callback)

Creates a new PhaxCode with optional `metadata` param and returns the URL or returns a PDF if optional `redirect` param is true

	phaxio.createPhaxCode(function(res) {
	  console.log(res);
	});

	phaxio.createPhaxCode({ metadata: 'Awesome', redirect: true }, function(buffer) {
	  fs.writeFileSync(path.join(__dirname, 'Awesome-PhaxCode.pdf'), buffer, 'binary');
	});

### phaxio.getHostedDocument(name [, metadata], callback)

Returns the hosted document `name` with a basic PhaxCode or custom PhaxCode if `metadata` is set

	phaxio.getHostedDocument('order-form', function(buffer) {
	  fs.writeFileSync(path.join(__dirname, 'order-form.pdf'), buffer, 'binary');
	});

	phaxio.getHostedDocument('order-form', 'Referred by Chad Smith', function(buffer) {
	  fs.writeFileSync(path.join(__dirname, 'order-form-with-referral-code.pdf'), buffer, 'binary');
	});

### phaxio.faxFile(faxId [, type], callback)

Returns the thumbnail or PDF of fax requested, optional `type` specifies _p_df (default), _s_mall or _l_arge thumbnail

	phaxio.faxFile('123456', function(buffer) {
	  fs.writeFileSync(path.join(__dirname, 'fax-123456.pdf'), buffer, 'binary');
	});

	phaxio.faxFile('123456', 'l', function(buffer) {
	  fs.writeFileSync(path.join(__dirname, '123456.jpg'), buffer, 'binary');
	});

## TODO

* Receiving [fax callbacks](http://www.phaxio.com/docs/api/receive/receiveCallback)
* Support for [faxList](http://www.phaxio.com/docs/api/general/faxList)

See the [issue tracker](http://github.com/chadsmith/node-phaxio/issues) for more.

## Author

[Chad Smith](http://twitter.com/chadsmith) ([chad@nospam.me](mailto:chad@nospam.me)).

## License

This project is [UNLICENSED](http://unlicense.org/) and not endorsed by or affiliated with [Phaxio](http://www.phaxio.com).
