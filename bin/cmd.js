#!/usr/bin/env node

var fs = require('fs');
var Poller = require('../index');

var help = [
  'usage: url-poller [action] [options]',
  '',
  'actions:',
  '  poll                     Poll a URL',
  '',
  'options:',
  '  -u, --url          URL               Poll the given URL',
  '  -i, --interval     INTERVAL          Poll every INTERVAL milliseconds',
  '  -c, --configFile   CONFIGFILE        Use the settings in the given CONFIGFILE instead of args',
  '  -h, --help                           ',
  '',
  '[CONFIGFILE]',
  '  A JSON file that should take the same shape as the options accepted by the API (https://github.com/xtianwill/url-poller).',
  '',
  '  Example:',
  '    {',
  '        url: \'http://example.com\'',
  '        interval: 5000',
  '    }'
];

var actions = [
  'poll'
];

var argvOptions = {
  'url':          'u',
  'interval':     'i',
  'configFile':   'c',
  'help':         'h'
};

var argv = process.argv.slice(2);

var options = getOptions();

if (options !== undefined) start(options);
else usage(1);

function start (options) {
  var poller = new Poller(options);
  
}

function getOptions () {
  if (argv.length < 2) return usage();
  if (argv.length % 2 !== 1) return usage();
  if (argv[0] !== 'poll') return usage();
  var config = {};
  var options = argv.slice(1);
  for (var i = 0; i < options.length - 1; i += 2) {
    var option = findOption(options[i].replace(/--?/, ''));
    if (option === undefined) return usage();
    if (option === 'help') return usage(0);
    if (option === 'configFile') return loadConfigFile(argv[i + 1]);
    config[option] = argv[i + 1];
  }
  return config;
}

function usage (status) {
  console.log(help.join('\n'));
  process.exit(status || 1);
}

function findOption (arg) {
  for (var key in argvOptions) {
    if (key === arg || argvOptions[key] === arg) return key;
  }

  return undefined;
}

function loadConfigFile (file) {
  if (!file.existsSync(file)) {
    console.error('CONFIGFILE does not exist');
    return usage();
  }
  var json = null;
  try {
    json = JSON.parse(fs.readFileSync(file));
  }
  catch (err){
    console.error('CONFIGFILE does not contain valid json');
    return usage();
  }
  return json;
}
