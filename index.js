'use strict';

const {dirname} = require('path');
const {writeFile} = require('fs');

const mkdirp = require('mkdirp');
const oneTime = require('one-time');

module.exports = function outputFile(...args) {
	const argLen = args.length;

	if (argLen !== 3 && argLen !== 4) {
		throw new RangeError(`Expected 3 or 4 arguments (<string>, <string|Buffer>[, <string|Object>], <Function>), but got ${
			argLen === 0 ? 'no' : argLen
		} arguments.`);
	}

	let mkdirpOptions;
	let writeFileOptions;

	const [filePath, data] = args;
	let options = args[2];
	let cb = args[3];

	if (argLen === 3) {
		cb = options;
		mkdirpOptions = null;
		writeFileOptions = null;
	} else {
		options = options || {};

		if (typeof options === 'string') {
			mkdirpOptions = null;
		} else if (options.dirMode) {
			mkdirpOptions = {...options, mode: options.dirMode};
		} else {
			mkdirpOptions = options;
		}

		if (options.fileMode) {
			writeFileOptions = {...options, mode: options.fileMode};
		} else {
			writeFileOptions = options;
		}
	}

	if (typeof cb !== 'function') {
		throw new TypeError(`${cb} is not a function. Last argument must be a callback function.`);
	}

	cb = oneTime(cb);

	mkdirp(dirname(filePath), mkdirpOptions, (mkdirpErr, createdDirPath) => {
		if (mkdirpErr) {
			cb(mkdirpErr);
			return;
		}

		if (createdDirPath === null) {
			return;
		}

		writeFile(filePath, data, writeFileOptions, writeFileErr => cb(writeFileErr, createdDirPath));
	});

	writeFile(filePath, data, writeFileOptions, err => {
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
