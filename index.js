'use strict';

const {dirname} = require('path');
const {promisify} = require('util');
const {writeFile} = require('fs');

const mkdirp = require('mkdirp');

const promisifiedMkdirp = promisify(mkdirp);
const promisifiedWriteFile = promisify(writeFile);

module.exports = async function outputFile(...args) {
	const argLen = args.length;

	if (argLen !== 2 && argLen !== 3) {
		throw new RangeError(`Expected 2 or 3 arguments (<string>, <string|Buffer|Uint8Array>[, <string|Object>], <Function>), but got ${
			argLen === 0 ? 'no' : argLen
		} arguments.`);
	}

	let mkdirpOptions;
	let writeFileOptions;

	const [filePath, data, options = {}] = args;

	if (argLen === 3) {
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

	return (await Promise.all([
		(async () => {
			const createdDirPath = await promisifiedMkdirp(dirname(filePath), mkdirpOptions);

			if (createdDirPath === null) {
				return null;
			}

			await promisifiedWriteFile(filePath, data, writeFileOptions);

			return createdDirPath;
		})(),
		(async () => {
			try {
				await promisifiedWriteFile(filePath, data, writeFileOptions);
			} catch (err) {
				if (err.code === 'ENOENT') {
					return;
				}

				throw err;
			}
		})()
	]))[0];
};
