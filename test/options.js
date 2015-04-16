var test = require('tape');
var Poller = require('../index');

test('throws without url', function(t) {
  t.plan(1);
  t.throws(function() {
    var poller = new Poller({
      // uh oh... no url
    }, /url is a required option/);
  });
});

test('defaults to 1 minute interval', function(t) {
  t.plan(1);
  var poller = new Poller({
    url: 'http://example.com'
  });
  t.equals(poller.options.interval, 60000);
});
