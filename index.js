var http = require('http');
var url = require('url');
var querystring = require('querystring');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var xtend = require('xtend');

function Poller(options) {
  if (!(this instanceof Poller )) return new Poller(options);
  this.options = xtend({ interval: 60 * 1000 }, options);
  if (!options.url) throw new Error('url is a require option.');
  this.isPolling = false;
}

util.inherits(Poller, EventEmitter);

Poller.prototype.start = function () {
  this.isPolling = true;
  this.intervalId = setInterval(this.__request.bind(this), this.options.interval);
};

Poller.prototype.stop = function () {
  clearInterval(this.intervalId);
  this.intervalId = null;
  this.isPolling = false;
  this.emit('end');
};

Poller.prototype.__request = function () {
  var self = this;
  var urlObject = url.parse(this.options.url);
  var query = xtend(urlObject.query || {}, this.options.query || {});
  var options = {
    hostname: urlObject.hostname,
    port: urlObject.port,
    method: 'GET',
    path: url.format(urlObject) + '?' + querystring.stringify(query)
  };
  var req = http.request(options, this.__respond.bind(this));
  // TODO: better error handling.
  req.on('error', function (err) {
    self.emit('error', err);
  });
  req.end();
};

Poller.prototype.__respond = function (res) {
  // TODO: follow redirects.
  var self = this;
  if (res.statusCode !== 200) {
    this.emit('error', { err: res.statusMessage });
  }
  else {
    var data = '';
    res.on('data', function (chunk) {
      data = data + chunk;
    });
    res.on('end', function () {
      self.emit('data', data);
    });
  }
};

module.exports = Poller;
