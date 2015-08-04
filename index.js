var minimist = require('minimist');
var path = require('path');
var fs = require('fs');
var prompt = require('prompt');
var Future = require('fibers/future');
var Fiber = require('fibers');

var processArgs = process.argv;
if (processArgs[0].match(/node$/))
  processArgs = processArgs.slice(2);
else
  processArgs = processArgs.slice(1);

var argv = minimist(processArgs);

var files = argv._;

var cwd = process.cwd();

prompt.start();

var foundFilenames = {};
files.forEach(function (filepath) {
  foundFilenames[path.basename(filepath)] = filepath;
});

Fiber(function () {
  files.forEach(function (filepath) {
    var absPath = path.resolve(cwd, filepath);
    var code = fs.readFileSync(absPath, 'utf8');

    var replaces = {};
    code = code.replace(/(["'])(\.(\.)?\/[^'"]*)(["'])/mg, function (m, q, p, q, bla, offset) {
      var absP = path.join(path.dirname(absPath), p);
      if (! fs.existsSync(absP)) {
        var line = code.substring(0, offset).split(/\r\n|\r|\n/).length;
        var column = offset - code.substring(0, offset).lastIndexOf('\n');
        var formattedOffset = line + ':' + column;
        var conflictStr = absPath + ':' + formattedOffset + ' ' + p + ' resolves into ' + absP;
        var id = '#temp-snippet-' + Math.floor(10000 * Math.random());
        replaces[id] = p;

        console.log();
        console.log(conflictStr);

        var filename = path.basename(p);
        var newLocation = foundFilenames[filename];
        var defaultChoice = newLocation ? path.relative(path.dirname(filepath), newLocation) : p;

        if (defaultChoice[0] !== '.') defaultChoice = './' + defaultChoice;

        var future = new Future;

        console.log('new value? default is ' + defaultChoice);
        prompt.get(['newFilepath'], function (err, results) {
          if (err) {
            console.log(err.stack);
            process.exit(1);
          }

          replaces[id] = results.newFilepath || defaultChoice;
          future.return();
        });

        future.wait();

        return "'" + id + "'";
      } else {
        return "'" + p + "'";
      }
    });

    Object.keys(replaces).forEach(function (id) {
      var newVal = replaces[id];
      code = code.replace(id, newVal);
    });

    fs.writeFileSync(filepath, code, 'utf8');
  });

}).run();
