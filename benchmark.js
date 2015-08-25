/* global suite:false, bench:false, before:false, after:false */
'use strong';

const path = require('path');

const fsOutputFile = require('fs-extra').outputFile;
const mkdirp = require('mkdirp');
const outputFile = require('.');
const rimraf = require('rimraf');

const tmpPath = 'benchmark_tmp';
const content = 'Hello, World!';

suite('Write a file to an existing directory', () => {
  before(done => mkdirp('benchmark_tmp', done));

  let count0 = 0;
  let count1 = 0;

  bench('outputFile()', next => {
    outputFile(path.join(tmpPath, String(count0++)), content, next);
  });

  bench('fs.outputFile()', next => {
    fsOutputFile(path.join(tmpPath, String(count1++)), content, next);
  });

  after(done => rimraf(tmpPath, done));
});

suite('Create directories and write a file', () => {
  before(done => mkdirp('benchmark_tmp', done));

  let count0 = 0;
  let count1 = 0;

  bench('outputFile()', next => {
    outputFile(path.join(tmpPath, `nested/${count0++}foo/bar`), content, next);
  });

  bench('fs.outputFile()', next => {
    fsOutputFile(path.join(tmpPath, `nested/${count1++}foo/bar`), content, next);
  });

  after(done => rimraf(tmpPath, done));
});
