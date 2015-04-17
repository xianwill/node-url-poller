var test = require('tape');
var fs = require('fs');
var path = require('path');
var os = require('os');
var spawn = require('win-spawn');
var mkdirp = require('mkdirp');
var http = require('http');
var url = require('url');

var cmd = path.resolve(__dirname, '../bin/cmd.js');
var tmpdir = path.join((os.tmpdir || os.tmpDir)(), 'url-poller' + Math.random());

var files = {
  out: path.join(tmpdir, 'test.out'),
  err: path.join(tmpdir, 'test.err'),
  conf: path.join(tmpdir, 'test.config.json')
};

var responses = {
  message: 'peace and love'
};

var expected = {
  out: [responses.message, responses.message, responses.message].join('\n') + '\n'
};

mkdirp.sync(tmpdir);

test('poll url at interval and log output to stdout', function (t) {
  t.plan(2);
  var server = launchServer();
  var ps = spawn(cmd, ['poll', '--url', 'http://localhost:6660?message=' + responses.message, '--interval', 1000]);
  collectStdIO(ps, assertStdOut.bind(null, t, server));
});

test('poll using settings from config file', function (t) {
  t.plan(2);
  var server = launchServer();
  fs.writeFileSync(files.conf, JSON.stringify({
    "url": "http://localhost:6660?message=" + responses.message,
    "interval": 1000
  }));
  var ps = spawn(cmd, ['poll', '--configFile', files.conf]);
  collectStdIO(ps, assertStdOut.bind(null, t, server));
});

test('poll and log err to stderr', function (t) {
  t.plan(2);
  var server = launchBustedServer();
  var ps = spawn(cmd, ['poll', '--url', 'http://localhost:6660?message=' + responses.message, '--interval', 1000]);
  collectStdIO(ps, assertStdErr.bind(null, t, server));
});

test.skip('poll and append data to --out', function (t) {
  t.plan(2);
  var server = launchServer();
  var ps = spawn(cmd, ['poll', '--url', 'http://localhost:6660?message='+responses.message, '--interval', 1000, '--out', files.out]);
  collectFiles(ps, assertStdOut.bind(null, t, server));
});

test.skip('poll and append errors to --err', function (t) {
  t.plan(2);
  var server = launchBustedServer();
  var ps = spawn(cmd, ['poll', '--url', 'http://localhost:6660?message='+responses.message, '--interval', 1000, '--out', files.out, '--err', files.err]);
  collectFiles(ps, assertStdErr.bind(null, t, server));
});

function assertStdOut(t, server, out, err) {
  server.close();
  t.equal(err, '', 'no error');
  t.equal(out, expected.out, 'data collected');
}

function assertStdErr(t, server, out, err) {
  server.close();
  t.equal(out, '', 'no data');
  t.ok(/Response Error/.test(err), 'errors collected');
}

function launchServer () {
  var server = http.createServer(function (req, res) {
    res.statusCode = 200;
    var msg = url.parse(req.url, true).query.message + '\n';
    res.end(msg);
  });
  server.listen(6660);
  return server;
}

function launchBustedServer () {
  var server = http.createServer(function (req, res) {
    res.statusCode = 500;
    res.end();
  });
  server.listen(6660);
  return server;
}

function collectStdIO (ps, cb) {
  var count = 0;
  var out = [];
  var err = [];
  var collect = function (buf, dat) {
    buf.push(dat);
    if (++count === 3) ps.kill();
  };
  ps.stdout.on('data', function (dat) {
    collect(out, dat);
  });
  ps.stderr.on('data', function (dat) {
    collect(err, dat);
  });
  ps.on('close', function (code) {
    cb(Buffer.concat(out).toString('utf8'), Buffer.concat(err).toString('utf8'));
  });

  /*
  ps.on('error', function (err) {
    cb(err);
  });
  */

  function collectFiles(ps, cb) {

  }
}
