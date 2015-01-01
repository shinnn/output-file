/*!
 * output-file | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/output-file
*/
'use strict';

var dirname = require('path').dirname;
var writeFile = require('fs').writeFile;

var mkdirp = require('mkdirp');
var oneTime = require('one-time');
var xtend = require('xtend');

module.exports = function outputFile(filePath, data, options, cb) {
  var mkdirpOptions;
  var writeFileOptions;

  if (arguments.length === 3) {
    cb = options;
    mkdirpOptions = null;
    writeFileOptions = null;
  } else {
    options = options || {};

    if (typeof options === 'string') {
      mkdirpOptions = null;
    } else {
      if (options.dirMode) {
        mkdirpOptions = xtend(options, {mode: options.dirMode});
      } else {
        mkdirpOptions = options;
      }
    }

    if (options.fileMode) {
      writeFileOptions = xtend(options, {mode: options.fileMode});
    } else {
      writeFileOptions = options;
    }
  }

  if (typeof cb !== 'function') {
    throw new TypeError(cb + ' is not a function. Last argument must be a callback function.');
  }

  cb = oneTime(cb);

  mkdirp(dirname(filePath), mkdirpOptions, function(err, createdDirPath) {
    if (err) {
      cb(err);
      return;
    }

    if (createdDirPath === null) {
      return;
    }

    writeFile(filePath, data, writeFileOptions, function(err) {
      cb(err, createdDirPath);
    });
  });

  writeFile(filePath, data, writeFileOptions, function(err) {
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
