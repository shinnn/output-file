'use strict';

const {access, mkdir, writeFile} = require('fs');
const {dirname, relative, resolve, sep} = require('path');
const {fileURLToPath} = require('url');
const {inspect, promisify} = require('util');

const inspectWithKind = require('inspect-with-kind');
const isPlainObj = require('is-plain-obj');
const noop = require('nop');

const PATH_ERROR = 'Expected a file path where the data to be written (<string|Buffer|Uint8Array|URL>)';
const promisifiedMkdir = promisify(mkdir);
const promisifiedWriteFile = promisify(writeFile);

function validatePath(path) {
	try {
		access(path, noop);
	} catch (err) {
		Error.captureStackTrace(err, validatePath);
		throw err;
	}
}

function validateDataAndWriteFileOptions(data, options) {
	try {
		writeFile(__dirname, data, options, noop);
	} catch (err) {
		Error.captureStackTrace(err, validateDataAndWriteFileOptions);
		throw err;
	}
}

module.exports = async function outputFile(...args) {
	const argLen = args.length;

	if (argLen !== 2 && argLen !== 3) {
		throw new RangeError(`Expected 2 or 3 arguments (<string|Buffer|Uint8Array|URL>, <string|Buffer|Uint8Array>[, <string|Object>]), but got ${
			argLen === 0 ? 'no' : argLen
		} arguments.`);
	}

	const [filePath, data, options] = args;

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

	validatePath(filePath);

	let mkdirOptions = {recursive: true};
	let writeFileOptions;

	if (argLen === 3) {
		if (typeof options !== 'string') {
			if (!isPlainObj(options)) {
				const error = new TypeError(`Expected an <Object> to set fs.writeFile() and fs.mkdir() options or an encoding <string>, nut got ${
					inspectWithKind(options)
				}.`);
				error.code = 'ERR_INVALID_ARG_TYPE';

				throw error;
			}

			if (options.mode !== undefined) {
				const error = new TypeError(`output-file doesn't support \`mode\` option, but ${
					inspect(options.mode)
				} was provided for it. Use \`fileMode\` option for file mode and \`dirMode\` for director mode.`);
				error.code = 'ERR_INVALID_OPT_VALUE';

				throw error;
			}

			if (options.recursive !== undefined) {
				const error = new TypeError(`\`recursive\` defaults to true and unconfigurable, but ${
					inspect(options.recursive)
				} was provided for it.`);
				error.code = 'ERR_INVALID_OPT_VALUE';

				throw error;
			}

			if (typeof data !== 'string' && options.encoding !== null && options.encoding !== undefined) {
				throw new Error(`\`encoding\` option is not supported when the data is not a <string>, but the data is ${
					inspectWithKind(data)
				} and ${inspectWithKind(options.encoding)} was provided for \`encoding\` option.`);
			}

			mkdirOptions = Object.assign(mkdirOptions, options);

			if (options.dirMode) {
				mkdirOptions.mode = options.dirMode;
			}

			writeFileOptions = {...options};

			if (options.fileMode) {
				writeFileOptions.mode = options.fileMode;
			}
		} else {
			if (typeof data !== 'string') {
				throw new Error(`The third argument cannot be a <string> when the data is not a <string>, but the data is ${
					inspectWithKind(data)
				} and ${inspectWithKind(options)} was passed to the third argument.`);
			}

			writeFileOptions = options;
		}
	}

	validateDataAndWriteFileOptions(data, writeFileOptions);
	writeFile(__dirname, data, writeFileOptions, noop);

	let absoluteFilePath;

	if (filePath instanceof URL) {
		if (filePath.pathname.endsWith('/')) {
			throw new Error(`Expected a file path, not a directory path, but got a file URL ${
				filePath.toString()
			} whose pathname ends with a path separator character '/'.`);
		}

		absoluteFilePath = fileURLToPath(filePath);
	} else {
		let stringPath;

		if (typeof filePath === 'string') {
			stringPath = filePath;
		} else if (Buffer.isBuffer(filePath)) {
			stringPath = filePath.toString();
		} else {
			stringPath = Buffer.from(filePath).toString();
		}

		if (stringPath.endsWith(sep)) {
			throw new Error(`Expected a file path, not a directory path, but got ${
				inspect(filePath, {breakLength: Infinity})
			} which ends with a path separator character '${sep}'.`);
		}

		absoluteFilePath = resolve(stringPath);
	}

	if (!relative(process.cwd(), absoluteFilePath).includes(sep)) {
		await promisifiedWriteFile(filePath, data, writeFileOptions);
		return;
	}

	await promisifiedMkdir(dirname(absoluteFilePath), mkdirOptions);
	await promisifiedWriteFile(absoluteFilePath, data, writeFileOptions);
};
