'use strict';

var fs = require('fs');
var path = require('path');

var outputFile = require('./');
var readRemoveFile = require('read-remove-file');
var test = require('tape');

test('outputFile()', function(t) {
  t.plan(18);

  outputFile('tmp_file', 'foo', function(err, dir) {
    t.deepEqual(
      [err, dir],
      [null, null],
      'should pass null to the arguments when it doesn\'t create any directories.'
    );
    readRemoveFile('tmp_file', 'utf8', function(err, content) {
      t.deepEqual(
        [err, content],
        [null, 'foo'],
        'should write correct contents to a file.'
      );
    });
  });

  outputFile('tmp/foo/bar', '00', {
    encoding: 'hex',
    mode: '0745'
  }, function(err, dir) {
    t.deepEqual(
      [err, dir],
      [null, path.resolve('tmp')],
      'should pass a path of the directory created first to the argument.'
    );

    var expected;
    /* istanbul ignore if */
    if (process.platform === 'win32') {
      expected = '40666';
    } else {
      expected = '40745';
    }

    t.deepEqual(
      [fs.statSync('tmp').mode.toString(8), fs.statSync('tmp/foo').mode.toString(8)],
      [expected, expected],
      'should accept mkdir\'s option.'
    );
    readRemoveFile('tmp/foo/bar', 'hex', function(err, content) {
      t.deepEqual(
        [err, content],
        [null, '00'],
        'should accept fs.writeFile\'s options.'
      );
    });
  });

  outputFile('node_modules/mkdirp', 'foo', function(err) {
    t.equal(
      err.code, 'EISDIR',
      'should pass an error to the callback when fs.writeFile fails.'
    );
    t.equal(
      arguments.length,
      1,
      'should not pass any values to the second argument when fs.writeFile fails.'
    );
  });

  outputFile('index.js/foo', 'foo', 'utf8', function(err) {
    var expected;
    /* istanbul ignore if */
    if (process.platform === 'win32') {
      expected = 'EEXIST';
    } else {
      expected = 'ENOTDIR';
    }

    t.equal(
      err.code,
      expected,
      'should pass an error to the callback when mkdirp fails.'
    );
    t.equal(
      arguments.length,
      1,
      'should not pass any values to the second argument when mkdirp fails.'
    );
  });

  outputFile(path.resolve('t/m/p'), 'ə', {
    dirMode: '0745',
    fileMode: '0755',
    encoding: null
  }, function(err, dir) {
    t.deepEqual(
      [err, dir],
      [null, path.resolve('t')],
      'should accept an absolute path as its first argument.'
    );

    var expected;
    /* istanbul ignore if */
    if (process.platform === 'win32') {
      expected = '40666';
    } else {
      expected = '40745';
    }

    t.deepEqual(
      [fs.statSync('t').mode.toString(8), fs.statSync('t/m').mode.toString(8)],
      [expected, expected],
      'should reflect `dirMode` option to the directory mode.'
    );

    /* istanbul ignore if */
    if (process.platform === 'win32') {
      expected = '100666';
    } else {
      expected = '100755';
    }

    t.equal(
      fs.statSync('t/m/p').mode.toString(8),
      expected,
      'should reflect `fileMode` option to the file mode.'
    );

    readRemoveFile('t/m/p', 'utf8', function(err, content) {
      t.deepEqual(
        [err, content],
        [null, 'ə'],
        'should write a file in UTF-8 when `encoding` option is null.'
      );
    });
  });

  t.throws(
    outputFile.bind(null, 'foo', 'bar', 'utf9', t.fail),
    /Unknown encoding.*utf9/,
    'should throw an error when the option is not valid for fs.writeFile.'
  );

  t.throws(
    outputFile.bind(null, 'f/o/o', 'bar', {fs: []}, t.fail),
    /TypeError/,
    'should throw an error when the option is not valid for mkdirp.'
  );

  t.throws(
    outputFile.bind(null, 'foo', 'bar', null, 'baz'),
    /TypeError.*not a function/,
    'should throw a type error when the last argument is not a function.'
  );

  t.throws(
    outputFile.bind(null, true, '', t.fail),
    /TypeError.*path/,
    'should throw a type error when the first argument is not a string.'
  );

  t.throws(
    outputFile.bind(null),
    /TypeError.*not a function/,
    'should throw a type error when it takes no arguments.'
  );
});
