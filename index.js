'use strict';

const {dirname, relative, resolve, sep} = require('path');
const {promisify} = require('util');
const URLConstructor = global.URL || require('url').URL; // eslint-disable-line node/prefer-global/url
const {access, writeFile} = require('fs');

const mkdirp = require('mkdirp');
const fileUriToPath = require('file-uri-to-path');
const noop = require('nop');

const PATH_ERROR = 'Expected a file path where the data to be written (<string|Buffer|Uint8Array|URL>)';
const promisifiedMkdirp = promisify(mkdirp);
const promisifiedWriteFile = promisify(writeFile);

module.exports = async function outputFile(...args) {
	const argLen = args.length;

	if (argLen !== 2 && argLen !== 3) {
		throw new RangeError(`Expected 2 or 3 arguments (<string|Buffer|Uint8Array|URL>, <string|Buffer|Uint8Array>[, <string|Object>], <Function>), but got ${
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

	// validate the 1st argument
	access(filePath, noop);

	if (filePath === '') {
		const error = new Error(`${PATH_ERROR}, but got '' (empty string).`);
		error.code = 'ERROR_INVALID_ARG_VALUE';

		throw error;
	}

	if (filePath.length === 0) {
		const error = new Error(`${
			PATH_ERROR
		}, but got an empty ${Buffer.isBuffer(filePath) ? 'Buffer' : 'Uint8Array'}.`);
		error.code = 'ERROR_INVALID_ARG_VALUE';

		throw error;
	}

	// validate the 2nd and 3rd arguments
	writeFile(__dirname, data, writeFileOptions, noop);

	let absoluteFilePath;

	if (typeof filePath === 'string') {
		absoluteFilePath = resolve(filePath);
	} else if (filePath instanceof URLConstructor) {
		absoluteFilePath = fileUriToPath(filePath.toString());
	} else if (Buffer.isBuffer(filePath)) {
		absoluteFilePath = resolve(filePath.toString());
	} else {
		absoluteFilePath = resolve(Buffer.from(filePath).toString());
	}

	if (!relative(process.cwd(), absoluteFilePath).includes(sep)) {
		await promisifiedWriteFile(absoluteFilePath, data, writeFileOptions);
		return null;
	}

	const dir = dirname(absoluteFilePath);

	return (await Promise.all([
		(async () => {
			const createdDirPath = await promisifiedMkdirp(dir, mkdirpOptions);
			await promisifiedWriteFile(absoluteFilePath, data, writeFileOptions);

			return createdDirPath;
		})(),
		(async () => {
			try {
				await promisifiedWriteFile(absoluteFilePath, data, writeFileOptions);
			} catch (err) {
				if (err.code === 'ENOENT') {
					return;
				}

				throw err;
			}
		})()
	]))[0];
};
