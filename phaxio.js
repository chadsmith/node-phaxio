var util = require('util'),
  path = require('path'),
  mime = require('mime'),
  fs = require('fs'),
  request = require('request');

var Phaxio = function(api_key, api_secret) {
  this.api_key = api_key || null;
  this.api_secret = api_secret || null;
  this.host = 'https://api.phaxio.com';
  this.endpoint = '/v1';
};

Phaxio.prototype = {
  getApiKey: function() {
    return this.api_key;
  },
  getApiSecret: function() {
    return this.api_secret;
  },
  setApiKey: function(api_key) {
    if(!api_key)
      throw new Error('You must include an API key.');
    this.api_key = api_key;
    return this;
  },
  setApiSecret: function(api_secret) {
    if(!api_secret)
      throw new Error('You must include an API secret.');
    this.api_secret = api_secret;
    return this;
  },
  faxStatus: function(faxId, callback) {
    if(!faxId)
      throw new Error('You must include a fax id.');
    return this.doRequest('/faxStatus', { id: faxId  }, callback);
  },
  sendFax: function(to, filenames, params, callback) {
    if('[object Function]' == Object.prototype.toString.call(params)) {
      callback = params;
      params = {};
    }
    if('[object Object]' == Object.prototype.toString.call(filenames)) {
      params = filenames;
      filenames = [];
    }
    to = util.isArray(to) ? to : [to];
    filenames = util.isArray(filenames) ? filenames : [filenames];
    if(!to)
      throw new Error("You must include a 'to' number.");
    if(!filenames.length && !params.string_data)
      throw new Error('You must include a file to send.');
    for(var k = 0, l = filenames.length; k < l; k++)
      if(!path.existsSync(path.join(__dirname, filenames[k])))
        throw new Error("The file '" + filenames[k] + "' does not exist.");
    params = this.paramsCopy(['string_data', 'string_data_type', 'batch', 'batch_delay', 'callback_url'], params || {});
    params.to = to;
    params.filename = filenames;
    return this.doRequest('/send', params, callback);
  },
  fireBatch: function(batchId, callback) {
    if(!batchId)
      throw new Error('You must provide a batchId.');
    return this.doRequest('/fireBatch', { id: batchId }, callback);
  },
  closeBatch: function(batchId, callback) {
    if(!batchId)
      throw new Error('You must provide a batchId.');
    return this.doRequest('/closeBatch', { id: batchId }, callback);
  },
  provisionNumber: function(area_code, callback_url, callback) {
    if(!area_code)
      throw new Error('You must provide an area code.');
    var params = { area_code: area_code };
    if('[object Function]' == Object.prototype.toString.call(callback_url))
      callback = callback_url;
    else
      params.callback_url = callback;
    this.doRequest('/provisionNumber', params, callback);
  },
  releaseNumber: function(number, callback) {
    if(!number)
      throw new Error('You must provide a number.');
    return this.doRequest('/releaseNumber', { number: number }, callback);
  },
  numberList: function(params, callback) {
    if('[object Function]' == Object.prototype.toString.call(params))
      callback = params;
    else
      params = this.paramsCopy(['area_code', 'number'], params || {});
    return this.doRequest('/numberList', params, callback);
  },
  accountStatus: function(callback) {
    return this.doRequest('/accountStatus', {}, callback);
  },
  testReceive: function(params, filename, callback) {
    if(params.length) {
      callback = filename;
      filename = params;
      params = {};
    }
    params = this.paramsCopy(['from_number', 'to_number'], params);
    params.filename = [filename];
    return this.doRequest('/testReceive', params, callback);
  },
  doRequest: function(address, params, callback) {
    var multipart = [],
      k,
      l,
      file;
    params.api_key = this.api_key;
    params.api_secret = this.api_secret;
    if(params.to)
      for(k = 0, l = params.to.length; k < l; k++)
        multipart.push({
          'content-disposition': 'form-data; name="to[' + k + ']"',
          body: params.to[k]
        });
    delete params.to;
    if(params.filename)
      for(k = 0, l = params.filename.length; k < l; k++)
        if(params.filename[k]) {
          file = path.join(__dirname, params.filename[k]);
          multipart.push({
            'content-disposition': 'form-data; name="filename[' + k + ']"; filename="' + params.filename[k] + '"',
            'content-type': (mime.lookup(file) || 'application/octet-stream'),
            body: fs.readFileSync(file)
          });
        }
    delete params.filename;
    for(k in params)
      if(params.hasOwnProperty(k))
        multipart.push({
          'content-disposition': 'form-data; name="' + k + '"',
          body: params[k]
        });
    request({
      method: 'POST',
      uri: this.host + this.endpoint + address,
      headers: { 'content-type': 'multipart/form-data;' },
      multipart: multipart
    }, function(err, res, body) {
      body = JSON.parse(body);
      callback && callback(body);
    });
    return this;
  },
  paramsCopy: function(names, options) {
    for(var params = {}, k = 0, l = names.length; k < l; k++)
      if(options[names[k]])
        params[names[k]] = options[names[k]];
    return params;
  }
};

module.exports = Phaxio;
