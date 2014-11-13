'use strict';

var fs = require('fs');
var path = require('path');

var noop = require('nop');
var outputFile = require('./');
var test = require('tape');

test('outputFile()', function(t) {
  t.plan(14);

  outputFile('tmp_file', 'foo', function(err, dir) {
    t.strictEqual(err, null, 'should write a file without error.');
    t.strictEqual(
      dir, null,
      'should pass null to the second argument when it doesn\'t create any directories.'
    );
    t.strictEqual(
      fs.readFileSync('tmp_file', 'utf8'), 'foo',
      'should create a file with correct contents.'
    );
  });

  outputFile('tmp/foo/bar', '00', {
    encoding: 'hex',
    mode: 33260
  }, function(err, dir) {
    t.strictEqual(err, null, 'should create directories and write a file without error.');
    t.strictEqual(
      dir, path.resolve('tmp'),
      'should pass the first directory created by outputFile() to the second argument.'
    );
    t.strictEqual(
      fs.readFileSync('tmp/foo/bar', 'hex'), '00',
      'should accept fs.writeFIle\'s option.'
    );
    t.strictEqual(
      fs.statSync('tmp/foo/bar').mode,
      /*eslint-disable no-multi-spaces */
      process.platform === 'win32' ? /* istanbul ignore next */ 33206 : 33260,
      /*eslint-enable no-multi-spaces */
      'should accept mkdir\'s option.'
    );
  });

  outputFile('node_modules/mkdirp', 'foo', function(err) {
    t.equal(
      err.code, 'EISDIR',
      'should pass an error to the callback when fs.writeFile() fails.'
    );
    t.equal(
      arguments.length, 1,
      'should not pass any values to the second argument when fs.writeFile() fails.'
    );
  });

  outputFile('index.js/foo', 'foo', 'utf8', function(err) {
    t.equal(
      /*eslint-disable no-multi-spaces */
      err.code, process.platform === 'win32' ? /* istanbul ignore next */ 'EEXIST' : 'ENOTDIR',
      /*eslint-enable no-multi-spaces */
      'should pass an error to the callback when mkdirp() fails.'
    );
    t.equal(
      arguments.length, 1,
      'should not pass any values to the second argument when mkdirp() fails.'
    );
  });

  t.throws(function() {
    outputFile('foo', 'bar', 'baz', noop);
  }, /Unknown encoding/, 'should throw an error when the option is not valid for fs.writeFile.');

  t.throws(function() {
    outputFile('f/o/o', 'bar', {fs: []}, noop);
  }, /TypeError/, 'should throw an error when the option is not valid for mkdirp.');

  t.throws(function() {
    outputFile('foo', 'bar', 'baz');
  }, /TypeError/, 'should throw a type error when the last argument is not a function.');
});
