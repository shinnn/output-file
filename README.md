# output-file

[![NPM version](https://img.shields.io/npm/v/output-file.svg?style=flat)](https://www.npmjs.com/package/output-file)
[![Build Status](https://travis-ci.org/shinnn/output-file.svg)](https://travis-ci.org/shinnn/output-file)
[![Build status](https://ci.appveyor.com/api/projects/status/q435g7uifts9ud1q?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/output-file)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/output-file.svg?style=flat)](https://coveralls.io/r/shinnn/output-file)
[![Dependency Status](https://img.shields.io/david/shinnn/output-file.svg?style=flat&label=deps)](https://david-dm.org/shinnn/output-file)
[![devDependency Status](https://img.shields.io/david/dev/shinnn/output-file.svg?style=flat&label=devDeps)](https://david-dm.org/shinnn/output-file#info=devDependencies)

Write a file and create its ancestor directories if needed

```javascript
var fs = require('fs');
var path = require('path');
var outputFile = require('output-file');

// When the direcory `foo` exists:
outputFile('foo/bar/baz.txt', 'Hi!', function(err, createdDir) {
  if (err) {
    throw err;
  }

  createdDir === path.resolve('foo/bar'); //=> true
  fs.readFileSync('foo/bar/baz.txt').toString(); //=> 'Hi!'
});

```

## Difference from fs.outputFile

This module is very similar to [fs-extra](https://github.com/jprichardson/node-fs-extra)'s [`fs.outputFile`](https://github.com/jprichardson/node-fs-extra#outputfilefile-data-callback) but they are different in the following points:

1. *output-file* passes the path of the directory created first to the second argument of its callback. [See the API document for more details.](#callbackerror-createddirectorypath)
2. *output-file* throws an error immediately if it takes a wrong argument. 
   ```javascript
   var outputFile = require('output-file');
   outputFile('path', 'content', 'utf7', function() {/* ... */});
   // Error: Unknown encoding: utf7

   var fs = require('fs-extra');
   fs.outputFile('path', 'content', 'utf7', function() {/* ... */});
   // Doesn't throw any errors immediately
   ```

## Installation

[Use npm.](https://docs.npmjs.com/cli/install)

```sh
npm install output-file
```

## API

```javascript
var outputFile = require('output-file');
```

### outputFile(*path*, *data* [, *options*], *callback*)

*path*: `String`  
*data*: `String` or [`Buffer`](https://iojs.org/api/buffer.html#buffer_class_buffer)  
*options*: `Object` or `String` (options for [fs.writeFile] and [mkdirp])  
*callback*: `Function`

It writes the data to a file asynchronously. If ancestor directories of the file don't exist, it creates the directories before writing the file.

```javascript
var fs = require('fs');
var outputFile = require('output-file');

// When the directory `foo/bar` exists
outputFile('foo/bar/baz/qux.txt', 'Hello', 'utf-8', function(err, dir) {
  if (err) {
    throw err;
  }

  fs.statSync('foo/bar/baz').isDirectory(); //=> true
  fs.statSync('foo/bar/baz/qux.txt').isFile(); //=> true
});
```

All options for [fs.writeFile] and [mkdirp] are available.

```javascript
outputFile('foo', '012345', {encoding: 'foo', mode: 33260}, function(err, dir) {
  fs.readFileSync('foo').toString(); //=> 'MDEyMzQ1'
  fs.statSync('foo').mode; //=> 33260
});
```

#### options

All options for [fs.writeFile] and [mkdirp] are available.

Additionally, you can use [`fileMode`](#optionsfilemode) option and [`dirMode`](#optionsdirmode) option to set different permission between the file and directories.

##### options.fileMode

Set modes of a file, overriding `mode` option.

##### options.dirMode

Set modes of directories, overriding `mode` option.

```javascript
outputFile('dir/file', 'content', {dirMode: '0745', fileMode: '0644'}, function(err) {
  if (err) {
    throw err;
  }

  fs.statSync('dir').mode.toString(8); //=> '40745'
  fs.statSync('dir/file').mode.toString(8); //=> '100644'
});
```

#### callback(*error*, *createdDirectoryPath*)

*error*: `Error` if it fails to write a file or create directories, otherwise `null`  
*createdDirectoryPath*: `String` if it creates more than one directories, otherwise `null`

It passes the directory path to the second argument of its callback, just like [mkdirp](https://github.com/substack/node-mkdirp#mkdirpdir-opts-cb):

> `cb(err, made)` fires with the error or the first directory `made` that had to be created, if any.

```javascript
outputFile('foo/bar/baz.txt', 'data', function(err, dir) {
  if (err) {
    throw err;
  }

  dir; // the same value as `path.resolve('foo')`
});

outputFile('foo.txt', 'data', function(err, dir) {
  if (err) {
    throw err;
  }

  dir; //=> null
});
```

## Related project

* [output-file-sync](https://github.com/shinnn/output-file-sync) (synchronous version)

## License

Copyright (c) 2014 - 2015 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).

[fs.writeFile]: https://iojs.org/api/fs.html#fs_fs_writefile_filename_data_options_callback
[mkdirp]: https://github.com/substack/node-mkdirp
