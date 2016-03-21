# node-phaxio

Send faxes with [Phaxio](http://www.phaxio.com). It's completely asynchronous.

If you perfer a promised based api, take a look at our fork [phaxio-promise](https://github.com/reconbot/node-phaxio-promise)

## Installation

`npm install phaxio`

## Usage overview

```javascript
var Phaxio = require('phaxio'),
  phaxio = new Phaxio('e222........................', '62e5........................'),
  callback = function(err,data){console.log(data);};

phaxio.sendFax({
	to: '13165555555',
  string_data: 'Faxing from Node.js',
  string_data_type: 'text'
},callback);
```
Response
```javascript
{ success: true,
  message: 'Retrieved fax successfully',
  data:
   { id: '111111',
     num_pages: '0',
     cost: 0,
     direction: 'sent',
     status: 'queued',
     is_test: 'true',
     requested_at: 1344829113,
     recipients: [ { number: '13165555555', status: 'queued' } ]
   }
}

```

## Constructor

### new Phaxio(key, secret);

Returns a phaxio object with your keys set on the object.

## Methods

### phaxio.sendFax(options, callback);

```javascript
opt = {
  // always required can be an array of a single string
  to = ['xxxxxxxx', 'xxxxxxxxx'],
  // one of these is required
  filenames = ['path','path','path'],
  string_data = 'String of data for phaxio to parse'
  //optional
  string_data_type: '',
  batch: "and othe phaxio options"
}

phaxio.sendFax({
    to: '13165555555', 
    filenames: ['coverletter.doc', 'resume.pdf']
  }, function(err,res) {
  console.log(res);
});

phaxio.sendFax({
  to: '13165555555',
  string_data: 'http://www.google.com/',
  string_data_type: 'url'
});

var batchID;
phaxio.sendFax({
    to: ['13165555555', '19135555555'], 
    filenames: 'my-cat.jpg', 
    batch: true 
  }, function(err,res) {
  if(res.batchId){
    batchId = res.batchId;
  }
});
```

### phaxio.cancelFax(faxId, callback)

Cancels the fax `faxId`
```javascript
phaxio.cancelFax('123456', function(err, res) {
  console.log(res);
});
```

### phaxio.faxStatus(faxId, callback)

Returns the status of `faxId`
```javascript
phaxio.faxStatus('123456', function(err, res) {
  console.log(res);
});
```

### phaxio.fireBatch(batchId, callback)

Fires the batch `batchId`
```javascript
phaxio.fireBatch(batchId);
```
### phaxio.closeBatch(batchId, callback)

Closes the batch `batchId`
```javascript
phaxio.closeBatch('123456');
```
### phaxio.provisionNumber(options, callback);

Provisions a number in area code `area_code`
```javascript
phaxio.provisionNumber({
    area_code: '212',
    callback_url: 'http://localhost/'
  }, function(res) {
  console.log(res);
});
```
### phaxio.releaseNumber(number, callback)

Releases the number `number`
```javascript
phaxio.releaseNumber('8475551234', function(err, res) {
  console.log(res);
});
```
### phaxio.numberList([options,] callback)

Returns user phone numbers matching optional params `area_code` or `number`
```javascript
phaxio.numberList(function(err, res) {
  console.log(res);
});

phaxio.numberList({ area_code: '847' }, function(err, res) {
  console.log(res);
});
```
### phaxio.accountStatus(callback)

Returns the account status
```javascript
phaxio.accountStatus(function(err, res) {
  console.log(res);
});
```
### phaxio.testReceive(options, callback)

Simulates receiving a fax containing the PhaxCode in `filename` with optional params `from_number` and `to_number`
```javascript
phaxio.testReceive({filenames: 'PhaxCode.pdf'}, function(err, res) {
  console.log(res);
});

phaxio.testReceive({
    from_number: '3165555555',
    to_number: '9135555555',
    filenames: 'PhaxCode.pdf'
  }, function(err, res) {
  console.log(res);
});
```

### phaxio.attachPhaxCodeToPdf(options, callback)

Returns a PDF of `filenames` with a PhaxCode at the `x`,`y` location specified with optional params `metadata` and `page_number`
```javascript
phaxio.attachPhaxCodeToPdf({
    filenames: 'resume.doc',
    x:0,
    y:5
  },function(err, buffer) {
    fs.writeFile(path.join(__dirname, 'resume-with-PhaxCode.pdf'), buffer, 'binary');
});

phaxio.attachPhaxCodeToPdf({
    filenames:'kittens.pdf',
    x:5,
    y:25,
    metadata: 'Fax with kittens', 
    page_number: 5
  }, function(err, buffer) {
    fs.writeFile(path.join(__dirname, 'kittens-with-PhaxCode.pdf'), buffer, 'binary');
});
```
### phaxio.createPhaxCode([options,] callback)

Creates a new PhaxCode with optional `metadata` param and returns the URL or returns a PDF if optional `redirect` param is true
```javascript
phaxio.createPhaxCode(function(err, res) {
  console.log(res);
});

phaxio.createPhaxCode({ metadata: 'Awesome', redirect: true }, function(err, buffer) {
  fs.writeFileSync(path.join(__dirname, 'Awesome-PhaxCode.pdf'), buffer, 'binary');
});
```
### phaxio.getHostedDocument(options, callback)

Returns the hosted document `name` with a basic PhaxCode or custom PhaxCode if `metadata` is set
```javascript
	phaxio.getHostedDocument({name:'order-form'}, function(err, buffer) {
	  fs.writeFileSync(path.join(__dirname, 'order-form.pdf'), buffer, 'binary');
	});

	phaxio.getHostedDocument({
      name:'order-form', 
      metadata: 'Referred by Chad Smith'
    }, function(err, buffer) {
	  fs.writeFileSync(path.join(__dirname, 'order-form-with-referral-code.pdf'), buffer, 'binary');
	});
```
### phaxio.faxFile(options, callback)

Returns the thumbnail or PDF of fax requested, optional `type` specifies _p_df (default), _s_mall or _l_arge thumbnail
```javascript
phaxio.faxFile({id:'123456'}, function(err, buffer) {
  fs.writeFileSync(path.join(__dirname, 'fax-123456.pdf'), buffer, 'binary');
});

phaxio.faxFile({
    id:'123456',
    type:'l'
  }, function(err, buffer) {
  fs.writeFileSync(path.join(__dirname, '123456.jpg'), buffer, 'binary');
});
```
## TODO

* Receiving [fax callbacks](http://www.phaxio.com/docs/api/receive/receiveCallback)
* Support for [faxList](http://www.phaxio.com/docs/api/general/faxList)

See the [issue tracker](http://github.com/chadsmith/node-phaxio/issues) for more.

## Author

[Chad Smith](http://twitter.com/chadsmith) ([chad@nospam.me](mailto:chad@nospam.me)).
[Francis Gulotta](http://twitter.com/reconbot) ([rbrtr.com](http://www.rbrtr.com))

## License

This project is [UNLICENSED](http://unlicense.org/) and not endorsed by or affiliated with [Phaxio](http://www.phaxio.com).
