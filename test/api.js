var test = require('tape');
var http = require('http');
var url = require('url');
var Poller = require('../index');

test('polling url', function(t) {
  t.plan(7);
  var pollCount = 0;
  // create a test server that just returns the message value sent in the query string.
  var server = http.createServer(function(req, res) {
    res.statusCode = 200;
    res.end(url.parse(req.url, true).query.message);
  });
  server.listen(6660);
  var poller = new Poller({
    url: 'http://localhost:6660',
    query: { 'message': 'hello' },
    interval: 1000
  });
  poller.on('data', function(data){
    t.ok(poller.isPolling, 'is polling after start');
    pollCount = pollCount + 1;
    t.equal(data, 'hello', 'data should match server response');
    if(pollCount === 3) poller.stop();
  });
  poller.on('error', function(err) {
    t.error(err);
  });
  poller.on('end', function() {
    t.false(poller.isPolling, 'isn\'t polling after stopping');
    server.close();
  });
  poller.start();
});
