'use strict';

const dirname = require('path').dirname;
const writeFile = require('fs').writeFile;

const mkdirp = require('mkdirp');
const oneTime = require('one-time');

module.exports = function outputFile(filePath, data, options, cb) {
	let mkdirpOptions;
	let writeFileOptions;

	if (cb === undefined) {
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
