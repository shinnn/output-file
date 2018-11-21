# output-file

[![npm version](https://img.shields.io/npm/v/output-file.svg?style=flat)](https://www.npmjs.com/package/output-file)
[![Build Status](https://travis-ci.org/shinnn/output-file.svg)](https://travis-ci.org/shinnn/output-file)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/output-file.svg?style=flat)](https://coveralls.io/github/shinnn/output-file)

Write a file and create its ancestor directories if needed

```javascript
const {readFile} = require('fs').promises;
const outputFile = require('output-file');

(async () => {
  await outputFile('foo/bar/baz.txt', 'Hi!');
  await readFile('foo/bar/baz.txt', 'utf8'); //=> 'Hi!'
})();
```

This module is very similar to [fs-extra](https://github.com/jprichardson/node-fs-extra)'s [`fs.outputFile`](https://github.com/jprichardson/node-fs-extra/blob/HEAD/docs/outputFile.md), but has the following features fs-extra doesn't have:

* Support for various non-string path types – `Buffer`, `Uint8Array` and `URL`
* An option to set mode of created directories

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

*path*: `string` `Buffer` `Uint8Array` `URL`  
*data*: `string` `Buffer` `TypedArray` `DataView`  
*options*: `Object` ([options](#options)) or `string` (file encoding)  
Return: `Promise`

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

#### options

All options for [`fs.writeFile()`][writeFile] and [`fs.mkdir()`][mkdir], except for `mode` and `recursive`, are supported.

`recursive` option is enabled by default and cannot be disabled.

Instead of `mode` option, use the followings:

##### options.fileMode

Set mode of a file.

##### options.dirMode

Set mode of directories.

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

[ISC License](./LICENSE) © 2018 Shinnosuke Watanabe

[writeFile]: https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
[mkdir]: https://nodejs.org/api/fs.html#fs_fs_mkdir_path_options_callback
