# url-poller - simple endpoint polling.

### Implements a readable stream that polls a URL every so often

    var options = {
      url: 'http://example.com',
      query: { foo: "bar" },
      interval: 5000 // default is 60000
    };

    var poller = require('url-poller')(options);
    poller.pipe(process.stdout);

### When you've had enough, call

    poller.stop();

### You can also install globally and invoke the binary

    url-poller poll --url http://example.com?123 --interval 5000

### Options

    usage: url-poller [action] [options]

    actions:
      poll

    options:
      -u, --url         URL         The URL to poll
      -i, --interval    INTERVAL    The INTERVAL to poll on
      -c, --configFile  CONFIGFILE  A configFile that specifies query and interval
      -o, --out         OUT         An output file to write to in case you don't want to just pipe
      -e, --err         ERR         An error file to write to
