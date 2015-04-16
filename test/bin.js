var test = require('tape');
var fs = require('fs');
var path = require('path');
var os = require('os');
var spawn = require('win-spawn');
var mkdirp = require('mkdirp');

var cmd = path.resolve(__dirname, '../bin/cmd.js');
var tmpdir = path.join((os.tmpdir || os.tmpDir)(), 'url-poller' + Math.random());

var files = {
  out: path.join(tmpdir, 'test.out'),
  err: path.join(tmpdir, 'test.err')
};

var responses = {
  message: 'peace and love',
  err: 'hate and discontent'
};

mkdirp.sync(tmpdir);

test('poll url at interval. log output to screen.', function(t) {
  var server = http.createServer(function(req, res) {
    res.statusCode = 200;
    res.end(url.parse(req.url, true).query.message);
  });
  server.listen(6660);
  var ps = spawn(cmd, ['poll', '--url', 'http://localhost:6660?message='+responses.message, '--interval', 1000]);
  run(ps, function(err, output) {
    t.ifError(err);
    var expectedContent = [responses.message, responses.message, responses.message].join('\n');
    var content = fs.readFileSync(files.out);
    t.equal(content, expectedContent, 'data logged to stdout');
  });
});

test.skip('poll using settings from config file', function(t) {
  var server = http.createServer(function(req, res) {
    res.statusCode = 200;
    res.end(url.parse(req.url, true).query.message);
  });
  server.listen(6660);
  var ps = spawn(cmd, ['poll', '--config', './config.json']);
});

test.skip('poll and append data to --out', function(t) {
  var server = http.createServer(function(req, res) {
    res.statusCode = 200;
    res.end(url.parse(req.url, true).query.message);
  });
  server.listen(6660);
  var ps = spawn(cmd, ['poll', '--url', 'http://localhost:6660?message='+responses.message, '--interval', 1000, '--out', files.out]);
});

test.skip('poll and append errors to --err', function(t) {
  t.plan(2);
  var server = http.createServer(function(req, res) {
    res.statusCode = 500;
    res.end(responses.err);
  });
  server.listen(6660);
  var ps = spawn(cmd, ['poll', '--url', 'http://localhost:6660?message='+responses.message, '--interval', 1000, '--out', files.out, '--err', files.err]);

  function pollingComplete() {
    var expectedErrorContent = [responses.err, responses.err, responses.err].join('\n');
    var errContent = fs.readFileSync(files.err);
    t.ok(errContent === expectedErrorContent, 'error file contains errors');
    t.false(fs.existsSync(files.out), 'no out file');
  }
});

function run(ps, cb) {
  var count = 0;
  var out = [];
  var err = [];
  var checkComplete = function() {
    if (count === 3) {
      ps.kill();
      cb(null, Buffer.concat(out).toString('utf8'), Buffer.concat(err).toString('utf8'));
    }
  };
  ps.stdout.on('data', function (buf) {
    out.push(buf);
    count ++;
    checkComplete();
  });
  ps.stderr.on('data', function (buf) {
    err.push(buf);
    count ++;
    checkComplete();
  });
  ps.on('error', cb);
}
