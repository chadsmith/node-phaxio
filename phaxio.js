var path = require('path'),
  mime = require('mime'),
  fs = require('fs'),
  request = require('request');

var Phaxio = module.exports = function(api_key, api_secret) {
  this.api_key = api_key;
  this.api_secret = api_secret;
  this.host = 'https://api.phaxio.com';
  this.endpoint = '/v1';
};

/*
  opt = {
  // one of these is required
    filenames = ['path','path','path'],
    string_data = 'String of data for phaxio to parse'
  // always required
    to = ['xxxxxxxx', 'xxxxxxxxx'],
  //optional
    string_data_type: '',
    batch .. and othe phaxio options
  }
*/

Phaxio.prototype.sendFax = function(opt, cb) {
  if(!opt.to) {
    return cb( new Error("You must include a 'to' number.") );
  }
  if( !opt.filenames && !opt.string_data ){
    return cb(new Error("You must include filenames or string_data."));
  }
  return this.request('/send', opt, cb);
};

Phaxio.prototype.faxStatus = function(faxId, cb) {
  if(!faxId) {
    return cb( new Error('You must include a fax id.') );
  }
  return this.request('/faxStatus', { id: faxId  }, cb);
};

Phaxio.prototype.fireBatch = function(batchId, cb) {
  if(!batchId) {
    return cb(new Error('You must provide a batchId.'));
  }
  return this.request('/fireBatch', { id: batchId }, cb);
};

Phaxio.prototype.closeBatch = function(batchId, cb) {
  if(!batchId) {
    return cb( new Error('You must provide a batchId.') );
  }
  return this.request('/closeBatch', { id: batchId }, cb);
};

Phaxio.prototype.provisionNumber =  function(opt, cb) {
  if(!opt.area_code) {
    return cb(new Error('You must provide an area code.'));
  }
  this.request('/provisionNumber', opt, cb);
};

Phaxio.prototype.releaseNumber = function(number, cb) {
  if(!number) { return cb( new Error('You must provide a number.') ); }
  return this.request('/releaseNumber', { number: number }, cb);
};

Phaxio.prototype.numberList = function(opt, cb) {
  if(typeof opt === 'function') {
    cb = opt;
    opt = {};
  }
  return this.request('/numberList', opt, cb);
};

Phaxio.prototype.accountStatus = function(cb) {
    return this.request('/accountStatus', {}, cb);
};

Phaxio.prototype.testReceive = function(opt, cb) {
  if(!opt.filename){ return cb( new Error('You must provide a filename') ); }
  return this.request('/testReceive', opt, cb);
};
  
Phaxio.prototype.attachPhaxCodeToPdf = function(opt, cb) {
  if(typeof opt.x !== 'number' || typeof opt.y !== 'number'){
    return cb( new Error("x and y need to be numbers") );
  }
  if(!opt.filename){
    return cb( new Error("You must provide a filename"));
  }
  return this.request('/attachPhaxCodeToPdf', opt, cb, true);
};

Phaxio.prototype.createPhaxCode = function(opt, cb) {
    if(typeof opt === 'function') {
      cb = opt;
      opt = {};
    }
    return this.request('/createPhaxCode', opt, cb, opt.redirect);
  };

Phaxio.prototype.getHostedDocument = function(opt, cb) {
  if(!opt.name){
    return cb( new Error('You must provide a document name.') );
  }
  return this.request('/getHostedDocument', opt, cb, true);
};

Phaxio.prototype.faxFile = function(opt, cb) {
  if(!opt.faxId) {
    return cb( new Error('You must include a fax id.') );
  }
  return this.request('/faxFile', opt, cb, true);
};

Phaxio.prototype.request = function(resource, opt, cb) {
  opt = opt || {};
  opt.api_key = opt.api_key || this.api_key;
  opt.api_secret = opt.api_secret || this.api_secret;

  var multipart = [];

  var filenames = opt.filenames;
  delete opt.filenames;

  var addPart = function(name, body){
    multipart.push({
      'content-disposition': 'form-data; name="' + name +'"',
      body: body
    });
  };

  for(var key in opt){
    var name = key;
    if(Array.isArray(opt[key])){
      name = name + '[]';
      opt[key].forEach(function(v){
        addPart(name, v);
      });
    }else{
      addPart(name, opt[key]);
    }
  }

  var addFile = function(name, filename){
    if(!fs.existsSync(filename)){
      return cb( new Error("The file '" + filename + "' does not exist.") );
    }
    multipart.push({
      'content-disposition': 'form-data; name="filename[]"; filename="' + filename + '"',
      'content-type': (mime.lookup(filename) || 'application/octet-stream'),
      body: fs.readFileSync(filename)
    });

  };

  if(filenames){
    filenames = Array.isArray(filenames) ? filenames : [filenames] ;

    filenames.forEach(function(filename, index){
      addFile(index, filename);
    });
  }

  var reqBody = {
    method: 'POST',
    uri: this.host + this.endpoint + resource,
    headers: { 'content-type': 'multipart/form-data;' },
    multipart: multipart,
    encoding: 'binary'
  };

  console.log(multipart);

  // phaxio isn't too picky about response types
  var responceCb = function(err, res, body) {
    if(true || res.headers['content-type'] === 'application/json'){
      try{
        body = JSON.parse(body);
      }catch(e){
        //err = err || e;
      }
    }
    
    if(typeof cb ==='function'){
      cb(err, body, res);
    }
  };

  return request(reqBody, responceCb);

};