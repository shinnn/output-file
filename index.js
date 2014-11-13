/*!
 * output-file | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/output-file
*/
'use strict';

var dirname = require('path').dirname;
var writeFile = require('fs').writeFile;

var mkdirp = require('mkdirp');
var oneTime = require('one-time');

module.exports = function outputFile(filePath, data, options, cb) {
  if (arguments.length === 3) {
    cb = options;
    options = null;
  }

  if (typeof cb !== 'function') {
    throw new TypeError(cb + ' is not a function. Last argument must be a callback function.');
  }

  cb = oneTime(cb);

  var mkdirpOptions;
  if (typeof options === 'object') {
    mkdirpOptions = options;
  } else {
    mkdirpOptions = null;
  }

  mkdirp(dirname(filePath), mkdirpOptions, function(err, createdDirPath) {
    if (err) {
      cb(err);
      return;
    }

    if (createdDirPath === null) {
      return;
    }

    writeFile(filePath, data, options, function(err) {
      cb(err, createdDirPath);
    });
  });

  writeFile(filePath, data, options, function(err) {
    if (err) {
      if (err.code === 'ENOENT') {
        return;
      }

      cb(err);
      return;
    }

    cb(err, null);
  });
};
