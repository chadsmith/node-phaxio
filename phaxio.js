var util = require('util'),
  path = require('path'),
  mime = require('mime'),
  fs = require('fs'),
  request = require('request');

var Phaxio = module.exports = function(api_key, api_secret) {
  this.api_key = api_key;
  this.api_secret = api_secret;
  this.host = 'https://api.phaxio.com';
  this.endpoint = '/v1';
};

Phaxio.prototype.faxStatus = function(faxId, cb) {
  if(!faxId) {
    return cb( new Error('You must include a fax id.') );
  }
  return this.doRequest('/faxStatus', { id: faxId  }, cb);
};

Phaxio.prototype.sendFax = function(opt, cb) {
  if(!opt.to) {
    return cb( new Error("You must include a 'to' number.") );
  }
  if( !opt.filenames && !opt.string_data ){
    return cb(new Error("You must include filenames or string_data."));
  }
  return this.doRequest('/send', opt, cb);
};

Phaxio.prototype.fireBatch = function(batchId, cb) {
  if(!batchId) {
    return cb(new Error('You must provide a batchId.'));
  }
  return this.doRequest('/fireBatch', { id: batchId }, cb);
};

Phaxio.prototype.closeBatch = function(batchId, cb) {
  if(!batchId) {
    return cb( new Error('You must provide a batchId.') );
  }
  return this.doRequest('/closeBatch', { id: batchId }, cb);
};

Phaxio.prototype.provisionNumber =  function(opt, cb) {
  if(!opt.area_code) {
    return cb(new Error('You must provide an area code.'));
  }
  this.doRequest('/provisionNumber', opt, cb);
};

Phaxio.prototype.releaseNumber = function(number, cb) {
  if(!number) { return cb( new Error('You must provide a number.') ); }
  return this.doRequest('/releaseNumber', { number: number }, cb);
};

Phaxio.prototype.numberList = function(opt, cb) {
  if(typeof opt === 'function') {
    cb = opt;
    opt = {};
  }
  return this.doRequest('/numberList', opt, cb);
};

Phaxio.prototype.accountStatus = function(cb) {
    return this.doRequest('/accountStatus', {}, cb);
};

Phaxio.prototype.testReceive = function(opt, cb) {
  if(!opt.filename){ return cb( new Error('You must provide a filename') ); }
  return this.doRequest('/testReceive', opt, cb);
};
  
Phaxio.prototype.attachPhaxCodeToPdf = function(opt, cb) {
  if(typeof opt.x !== 'number' || typeof opt.y !== 'number'){
    return cb( new Error("x and y need to be numbers") );
  }
  if(!opt.filename){
    return cb( new Error("You must provide a filename"));
  }
  return this.doRequest('/attachPhaxCodeToPdf', opt, cb, true);
};

Phaxio.prototype.createPhaxCode = function(opt, cb) {
    if(typeof opt === 'function') {
      cb = opt;
      opt = {};
    }
    return this.doRequest('/createPhaxCode', opt, cb, opt.redirect);
  };

Phaxio.prototype.getHostedDocument = function(opt, cb) {
  if(!opt.name){
    return cb( new Error('You must provide a document name.') );
  }
  return this.doRequest('/getHostedDocument', opt, cb, true);
};

Phaxio.prototype.faxFile = function(opt, cb) {
  if(!opt.faxId) {
    return cb( new Error('You must include a fax id.') );
  }
  return this.doRequest('/faxFile', opt, cb, true);
};

Phaxio.prototype.doRequest = function(resource, params, cb, download) {
  var multipart = [],
    k,
    l,
    file;
  download = download || false;
  params.api_key = this.api_key;
  params.api_secret = this.api_secret;
  if(params.to){
    for(k = 0, l = params.to.length; k < l; k++){
      multipart.push({
        'content-disposition': 'form-data; name="to[' + k + ']"',
        body: params.to[k]
      });
    }
  }
  delete params.to;
  if(params.filename){
    for(k = 0, l = params.filename.length; k < l; k++){
      if(params.filename[k]) {
        file = path.join(__dirname, params.filename[k]);
        if(!fs.existsSync(file)){
          return cb( new Error("The file '" + file + "' does not exist.") );
        }
        multipart.push({
          'content-disposition': 'form-data; name="filename[' + k + ']"; filename="' + params.filename[k] + '"',
          'content-type': (mime.lookup(file) || 'application/octet-stream'),
          body: fs.readFileSync(file)
        });
      }
    }
  }
  delete params.filename;
  for(k in params){
    if(params.hasOwnProperty(k)){
      multipart.push({
        'content-disposition': 'form-data; name="' + k + '"',
        body: params[k]
      });
    }
  }

  request(
    {
      method: 'POST',
      uri: this.host + this.endpoint + resource,
      headers: { 'content-type': 'multipart/form-data;' },
      multipart: multipart,
      encoding: 'binary'
    }, function(err, res, body) {
      if(!download) {
        body = JSON.parse(body);
      }
      cb && cb(err, body);
    }
  );
  return this;
};