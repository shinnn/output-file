# output-file

[![npm version](https://img.shields.io/npm/v/output-file.svg?style=flat)](https://www.npmjs.com/package/output-file)
[![Build Status](https://travis-ci.org/shinnn/output-file.svg)](https://travis-ci.org/shinnn/output-file)
[![Build status](https://ci.appveyor.com/api/projects/status/q435g7uifts9ud1q?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/output-file)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/output-file.svg?style=flat)](https://coveralls.io/github/shinnn/output-file)

Write a file and create its ancestor directories if needed

```javascript
const {readFile} = require('fs').promises;
const {resolve} = require('path');
const outputFile = require('output-file');

// When the direcory `foo` exists:
outputFile('foo/bar/baz.txt', 'Hi!', async (err, createdDir) => {
  createdDir === resolve('foo/bar'); //=> true
  await readFile('foo/bar/baz.txt', 'utf8'); //=> 'Hi!'
});
```

## Difference from [fs.outputFile](https://www.npmjs.com/package/fs-extra#outputfile-file-data-callback)

This module is very similar to [fs-extra](https://github.com/jprichardson/node-fs-extra)'s [`fs.outputFile`](https://github.com/jprichardson/node-fs-extra#outputfilefile-data-callback) but they are different in the following points:

1. *output-file* passes the path of the directory created first to the second argument of its callback. [See the API document for more details.](#callbackerror-createddirectorypath)
2. *output-file* throws an error immediately if it takes a wrong argument.
   ```javascript
   const outputFile = require('output-file');
   outputFile('path', 'content', 'utf7', () => {/* ... */});
   // Error: Unknown encoding: utf7

   const fs = require('fs-extra');
   fs.outputFile('path', 'content', 'utf7', () => {/* ... */});
   // Doesn't throw any errors immediately
   ```

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/getting-started/what-is-npm).

```
npm install output-file
```

## API

```javascript
const outputFile = require('output-file');
```

### outputFile(*path*, *data* [, *options*], *callback*)

*path*: `string`  
*data*: `string` or [`Buffer`](https://nodejs.org/api/buffer.html#buffer_class_buffer)  
*options*: `Object` or `string` (options for [fs.writeFile] and [mkdirp])  
*callback*: `Function`

It writes the data to a file asynchronously. If ancestor directories of the file don't exist, it creates the directories before writing the file.

```javascript
const fs = require('fs');
const outputFile = require('output-file');

// When the directory `foo/bar` exists
outputFile('foo/bar/baz/qux.txt', 'Hello', (err, dir) => {
  if (err) {
    throw err;
  }

  fs.statSync('foo/bar/baz').isDirectory(); //=> true
  fs.statSync('foo/bar/baz/qux.txt').isFile(); //=> true
});
```

All options for [fs.writeFile] and [mkdirp] are available.

```javascript
outputFile('foo', '234567', {encoding: 'hex', mode: 33260}, (err, dir) => {
  fs.readFileSync('foo').toString(); //=> '#Eg'
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
outputFile('dir/file', 'content', {dirMode: '0745', fileMode: '0644'}, err => {
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
outputFile('foo/bar/baz.txt', 'data', (err, dir) => {
  if (err) {
    throw err;
  }

  dir; // the same value as `path.resolve('foo')`
});

outputFile('foo.txt', 'data', (err, dir) => {
  if (err) {
    throw err;
  }

  dir; //=> null
});
```

## Related project

* [output-file-sync](https://github.com/shinnn/output-file-sync) (synchronous version)

## License

Copyright (c) 2014 - 2018 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).

[fs.writeFile]: https://nodejs.org/api/fs.html#fs_fs_writefile_filename_data_options_callback
[mkdirp]: https://github.com/substack/node-mkdirp
