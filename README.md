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

(async () => {
  const createdDir = await outputFile('foo/bar/baz.txt', 'Hi!');
  //=> /Users/shinnn/example/foo/bar

  await readFile('foo/bar/baz.txt', 'utf8'); //=> 'Hi!'
});
```

## Difference from [fs.outputFile](https://github.com/jprichardson/node-fs-extra/blob/HEAD/docs/outputFile.md)

This module is very similar to [fs-extra](https://github.com/jprichardson/node-fs-extra)'s `fs.outputFile` but *output-file* will be resolved with the path of the directory created first. [Check the API document for more details.](#outputfilepath-data--options)

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/getting-started/what-is-npm).

```
npm install output-file
```

## API

```javascript
const outputFile = require('output-file');
```

### outputFile(*path*, *data* [, *options*])

*path*: `string`, `Buffer` or `URL`  
*data*: `string`, `Buffer` or `Uint8Array`  
*options*: `Object` or `string` (options for [fs.writeFile] and [mkdirp])  
Return: `Promise<string|null>`

It writes the data to a file asynchronously. If ancestor directories of a file don't exist, it creates those directories before writing a file.

```javascript
const {stat} = require('fs').promises;
const outputFile = require('output-file');

// When the directory `foo/bar` exists

(async () => {
  await outputFile('foo/bar/baz/qux.txt', 'Hello');

  (await stat('foo/bar/baz')).isDirectory(); //=> true
  (await stat('foo/bar/baz/qux.txt')).isFile(); //=> true
})();
```

The returned `Promise` will be resolved with a path of the first directory that had to be created, or `null` if no directories are created.

```javascript
(async () => {
  await outputFile('foo/bar/baz.txt', 'data'); //=> /Users/shinnn/example/foo
  await outputFile('foo.txt', 'data'); //=> null
})();
```

All options for [fs.writeFile] and [mkdirp] are available.

```javascript
const {readFile, stat} = require('fs').promises;
const outputFile = require('output-file');

(async () => {
  await outputFile('foo', '234567', {encoding: 'hex', mode: 33260});

  await readFile('foo', 'utf8'); //=> '#Eg'
  (await stat('foo')).mode; //=> 33260
})();
```

#### options

All options for [fs.writeFile] and [mkdirp] are available.

Additionally, you can use [`fileMode`](#optionsfilemode) option and [`dirMode`](#optionsdirmode) option to set different permission between the file and directories.

##### options.fileMode

Set modes of a file, overriding `mode` option.

##### options.dirMode

Set modes of directories, overriding `mode` option.

```javascript
const {stat} = require('fs').promises;
const outputFile = require('output-file');

(async () => {
  await outputFile('dir/file', 'content', {
    dirMode: '0745',
    fileMode: '0644'
  });

  (await stat('dir')).mode.toString(8); //=> '40745'
  (await stat('dir/file')).mode.toString(8); //=> '100644'
})();
```

## Related project

* [output-file-sync](https://github.com/shinnn/output-file-sync) (synchronous version)

## License

Copyright (c) 2014 - 2018 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).

[fs.writeFile]: https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
[mkdirp]: https://github.com/substack/node-mkdirp
