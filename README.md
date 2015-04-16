# url-poller - simple endpoint polling.

### Poll a URL every so often

    var options = {
      url: 'http://example.com',
      query: { foo: "bar" },
      interval: 5000 // default is 60000
    };
    var poller = require('url-poller')(options);
    poller.on('data', function(data) {
      console.log(data);
    });
    poller.start();

### When you've had enough, call

    poller.stop()

### Events

    poller.on('data', function(data) { /* store the data you're collecting */ });

    poller.on('end', function() { /* tidy up */ });

    poller.on('error', function(err) { /* handle errors */ });

### Install globally and invoke the binary

    url-poller poll --url http://example.com?123 --interval 5000
