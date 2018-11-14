'use strict';

const {inspect} = require('util');
const {join, sep} = require('path');
const {lstat, readFile} = require('fs').promises;
const {pathToFileURL} = require('url');

const outputFile = require('.');
const rmfr = require('rmfr');
const test = require('tape');

const sepCode = sep.charCodeAt(0);

test('outputFile()', async t => {
	await rmfr('tmp*', {glob: true});
	await Promise.all([
		(async () => {
			await outputFile('tmp_file', 'foo');

			t.equal(
				await readFile('tmp_file', 'utf8'),
				'foo',
				'should write correct contents to a file.'
			);
		})(),
		(async () => {
			try {
				await outputFile(new Uint8Array([...__dirname].map(char => char.charCodeAt(0))), 'foo');
				t.fail('Unexpectedly succeeded');
			} catch ({code}) {
				t.equal(
					code,
					'EISDIR',
					'should fail when fs.writeFile() fails.'
				);
			}
		})(),
		(async () => {
			try {
				await outputFile(Buffer.from(join('.travis.yml', '_')), 'foo', {encoding: null});
				t.fail('Unexpectedly succeeded');
			} catch ({code}) {
				t.equal(
					code,
					'EEXIST',
					'should fail when fs.mkdir() fails.'
				);
			}
		})(),
		(async () => {
			await outputFile(pathToFileURL(join(__dirname, 'tmp_dir_another/1/2')), '≤≥', {
				dirMode: '0745',
				fileMode: '0755',
				encoding: 'base64'
			});

			const expected = `40${process.platform === 'win32' ? '666' : '745'}`;

			return Promise.all([
				(async () => {
					t.equal(
						(await lstat('tmp_dir_another')).mode.toString(8),
						expected,
						'should reflect `dirMode` option to the mode of a directory.'
					);
				})(),
				(async () => {
					t.equal(
						(await lstat('tmp_dir_another/1')).mode.toString(8),
						expected,
						'should reflect `dirMode` option to the mode of a deep directory.'
					);
				})(),
				(async () => {
					t.equal(
						(await lstat('tmp_dir_another/1/2')).mode.toString(8),
						`100${process.platform === 'win32' ? '666' : '755'}`,
						'should reflect `fileMode` option to the file mode.'
					);
				})(),
				(async () => {
					t.deepEqual(
						await readFile('tmp_dir_another/1/2', 'utf8'),
						Buffer.from('≤≥', 'base64').toString(),
						'should support fs.writeFile() option.'
					);
				})()
			]);
		})()
	]);

	t.end();
});

test('Argument validation', async t => {
	async function getError(...args) {
		try {
			return await outputFile(...args);
		} catch (err) {
			return err;
		}
	}

	t.equal(
		(await getError(true, '')).code,
		'ERR_INVALID_ARG_TYPE',
		'should fail when the first argument is not a valid path type.'
	);

	t.equal(
		(await getError(new URL('https://localhost:3000'), '')).code,
		'ERR_INVALID_URL_SCHEME',
		'should fail when the first argument is a non-file URL.'
	);

	const PATH_ERROR = 'Expected a file path where the data to be written (<string|Buffer|Uint8Array|URL>)';

	t.equal(
		(await getError('', '')).message,
		`${PATH_ERROR}, but got '' (empty string).`,
		'should fail when the first argument is an empty string.'
	);

	t.equal(
		(await getError(Buffer.alloc(0), '')).message,
		`${PATH_ERROR}, but got an empty Buffer.`,
		'should fail when the first argument is an empty Buffer.'
	);

	t.equal(
		(await getError(new Uint8Array(), '')).message,
		`${PATH_ERROR}, but got an empty Uint8Array.`,
		'should fail when the first argument is an empty Uint8Array.'
	);

	t.equal(
		(await getError(`a${sep}`, '')).message,
		`Expected a file path, not a directory path, but got ${inspect(`a${sep}`)} which ends with a path separator character '${sep}'.`,
		'should fail when the first argument is a directory path string.'
	);

	t.equal(
		(await getError(Buffer.from(`a${sep}`), '')).message,
		`Expected a file path, not a directory path, but got <Buffer 61 ${sepCode.toString(16)}> which ends with a path separator character '${sep}'.`,
		'should fail when the first argument is a directory path Buffer.'
	);

	t.equal(
		(await getError(new Uint8Array([97, sepCode]), '')).message,
		`Expected a file path, not a directory path, but got Uint8Array [ 97, ${sepCode} ] which ends with a path separator character '${sep}'.`,
		'should fail when the first argument is a directory path Uint8Array.'
	);

	const url = pathToFileURL(`${__dirname}${sep}`);

	t.equal(
		(await getError(url, '')).message,
		`Expected a file path, not a directory path, but got a file URL ${url} whose pathname ends with a path separator character '/'.`,
		'should fail when the first argument is a directory URL.'
	);

	t.equal(
		(await getError('foo', 'bar', -0)).code,
		'ERR_INVALID_ARG_TYPE',
		'should fail when the option is neither a string nor a plain object.'
	);

	t.equal(
		(await getError('foo', 'bar', 'utf9')).code,
		'ERR_INVALID_OPT_VALUE_ENCODING',
		'should fail when the option is not valid for fs.writeFile.'
	);

	t.equal(
		(await getError('foo', 'bar', {mode: 123})).message,
		'output-file doesn\'t support `mode` option, but 123 was provided for it. Use `fileMode` option for file mode and `dirMode` for director mode.',
		'should fail when `mode` option is provided.'
	);

	t.equal(
		(await getError('foo', 'bar', {recursive: Symbol('!')})).code,
		'ERR_INVALID_OPT_VALUE',
		'should fail when `recursive` option is provided.'
	);

	t.equal(
		(await getError()).message,
		'Expected 2 or 3 arguments (<string|Buffer|Uint8Array|URL>, <string|Buffer|Uint8Array>[, <string|Object>]), but got no arguments.',
		'should fail when it takes no arguments.'
	);

	t.equal(
		(await getError('1', '2', '3', '4')).message,
		'Expected 2 or 3 arguments (<string|Buffer|Uint8Array|URL>, <string|Buffer|Uint8Array>[, <string|Object>]), but got 4 arguments.',
		'should fail when it takes too many arguments.'
	);

	t.end();
});
