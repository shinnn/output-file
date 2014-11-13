/*global suite:false, bench:false, before:false, after:false */
'use strict';

var path = require('path');

var fsExtra = require('fs-extra');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');

var tmpPath = 'benchmark_tmp';
var content = 'Hello, World!';

var one = require('./');
var another = fsExtra.outputFile;

suite('Write a file to an existing directory', function() {
  before(mkdirp.bind(null, 'benchmark_tmp'));

  var count = 0;
  var countAnother = 0;

  bench('outputFile()', function(next) {
    one(path.join(tmpPath, '' + count++), content, next);
  });

  bench('fs.outputFile()', function(next) {
    another(path.join(tmpPath, '' + countAnother++), content, next);
  });

  after(rimraf.bind(null, tmpPath));
});

suite('Create directories and write a file', function() {
  before(mkdirp.bind(null, 'benchmark_tmp'));

  var count = 0;
  var countAnother = 0;

  bench('outputFile()', function(next) {
    one(path.join(tmpPath, 'nested/' + count++, 'foo/bar'), content, next);
  });

  bench('fs.outputFile()', function(next) {
    another(path.join(tmpPath, 'nested/' + countAnother++, 'foo/bar'), content, next);
  });

  after(rimraf.bind(null, tmpPath));
});
