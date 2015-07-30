var minimist = require('minimist');
var path = require('path');
var fs = require('fs');

var processArgs = process.argv;
if (processArgs[0].match(/node$/))
  processArgs = processArgs.slice(2);
else
  processArgs = processArgs.slice(1);

var argv = minimist(processArgs);

var files = argv._;

var cwd = process.cwd();

files.forEach(function (filepath) {
  var absPath = path.resolve(cwd, filepath);
  var code = fs.readFileSync(absPath, 'utf8');

  code.replace(/["'](\.(\.)?\/[^'"]*)["']/mg, function (m, p, bla, offset) {
    var absP = path.join(path.dirname(absPath), p);
    if (! fs.existsSync(absP)) {
      var line = code.substring(0, offset).split(/\r\n|\r|\n/).length;
      var column = offset - code.substring(0, offset).lastIndexOf('\n');
      var formattedOffset = line + ':' + column;
      console.log(absPath + ':' + formattedOffset, p, 'resolves into', absP);
    }
  });
});
