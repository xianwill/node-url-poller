var http = require('http');
var url = require('url');
var querystring = require('querystring');
var Readable = require('stream').Readable;
var util = require('util');
var xtend = require('xtend');

util.inherits(Poller, Readable);

function Poller(options) {
  if (!( this instanceof Poller )) return new Poller(options);
  Readable.call(this, options);
  this.options = xtend({ interval: 60 * 1000 }, options);
  if (!options.url) throw new Error('url is a required option.');
  this.intervalId = null;
}

Poller.prototype.stop = function () {
  if (!this.isPolling()) return;
  clearInterval(this.intervalId);
  this.intervalId = null;
  this.push(null);
};

Poller.prototype._read = function () {
  if (this.isPolling()) return;
  this.intervalId = setInterval(this._request.bind(this), this.options.interval);
};

Poller.prototype._request = function () {
  var self = this;
  var urlObject = url.parse(this.options.url);
  var query = xtend(urlObject.query || {}, this.options.query || {});
  urlObject.query = query;
  var options = {
    hostname: urlObject.hostname,
    port: urlObject.port,
    method: 'GET',
    path: url.format(urlObject)
  };
  var req = http.request(options, this._respond.bind(this));
  req.on('error', function (err) {
    self.emit('error', new Error([
      'Request Error',
      err.toString()
    ].join('\n')));
  });
  req.end();
};

Poller.prototype._respond = function (res) {
  // TODO: follow redirects
  var self = this;
  // TODO: handle more status codes
  if (res.statusCode !== 200) {
    var buf = [];
    res.on('data', function(chunk) {
      buf.push(chunk);
    });
    res.on('end', function() {
      self.emit('error', new Error([
        'Response Error ',
        '  status code: ' + res.statusCode,
        '  status msg : ' + res.statusMessage,
        buf.join('')
      ].join('\n')));
    });
  }
  else {
    res.on('data', this._emitChunk.bind(this));
  }
};

Poller.prototype._emitChunk = function (chunk) {
  // TODO: buffer while not reading
  if (!this.isPolling()) return;
  if (!this.push(chunk)) {
    this.stop();
  }
};

Poller.prototype.isPolling = function() {
  return this.intervalId !== null;
};

module.exports = Poller;
