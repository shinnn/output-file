'use strict';

const {lstat, readFile} = require('fs').promises;
const {join} = require('path');

const outputFile = require('.');
const rmfr = require('rmfr');
const test = require('tape');

test('outputFile()', async t => {
	await rmfr('tmp*', {glob: true});

	await Promise.all([
		(async () => {
			t.equal(
				await outputFile('tmp_file', 'foo'),
				null,
				'should be resolved with null when it creates no directories.'
			);

			t.equal(
				await readFile('tmp_file', 'utf8'),
				'foo',
				'should write correct contents to a file.'
			);
		})(),
		(async () => {
			t.equal(
				await outputFile('tmp_dir/foo/bar', '00', {
					encoding: 'hex',
					mode: '0745'
				}),
				join(__dirname, 'tmp_dir'),
				'should be resolved with a path of the directory created first.'
			);

			const expected = `40${process.platform === 'win32' ? '666' : '745'}`;

			t.deepEqual(
				[(await lstat('tmp_dir')).mode.toString(8), (await lstat('tmp_dir/foo')).mode.toString(8)],
				[expected, expected],
				'should accept mkdir\'s option.'
			);

			t.equal(
				await readFile('tmp_dir/foo/bar', 'hex'),
				'00',
				'should accept fs.writeFile\'s options.'
			);
		})(),
		(async () => {
			try {
				await outputFile(__dirname, 'foo');
			} catch ({code}) {
				t.equal(
					code,
					'EISDIR',
					'should pass an error to the callback when fs.writeFile fails.'
				);
			}
		})(),
		(async () => {
			try {
				await outputFile('index.js/foo', 'foo', 'utf8');
			} catch ({code}) {
				t.equal(
					code,
					process.platform === 'win32' ? 'EEXIST' : 'ENOTDIR',
					'should pass an error to the callback when mkdirp fails.'
				);
			}
		})(),
		(async () => {
			t.equal(
				await outputFile(join(__dirname, 'tmp_dir_another/1/2'), 'ə', {
					dirMode: '0745',
					fileMode: '0755',
					encoding: null
				}),
				join(__dirname, 'tmp_dir_another'),
				'should accept an absolute path as its first argument.'
			);

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
						'ə',
						'should write a file in UTF-8 when `encoding` option is null.'
					);
				})()
			]);
		})()
	]);

	t.end();
});

test('Argument validation', async t => {
	const fail = t.fail.bind(t, 'Unexpectedly succeeded.');

	try {
		await outputFile(true, '');
		fail();
	} catch ({code}) {
		t.equal(
			code,
			'ERR_INVALID_ARG_TYPE',
			'should fail when the first argument is neither a string, Buffer nor URL.'
		);
	}

	try {
		await outputFile('foo', 'bar', 'utf9');
		fail();
	} catch ({code}) {
		t.equal(
			code,
			'ERR_INVALID_OPT_VALUE_ENCODING',
			'should fail when the option is not valid for fs.writeFile.'
		);
	}

	try {
		await outputFile('f/o/o', 'bar', {fs: []});
		fail();
	} catch (err) {
		t.equal(
			err.toString(),
			'TypeError: xfs.mkdir is not a function',
			'should fail when the option is not valid for mkdirp.'
		);
	}

	try {
		await outputFile();
		fail();
	} catch ({message}) {
		t.equal(
			message,
			'Expected 2 or 3 arguments (<string>, <string|Buffer|Uint8Array>[, <string|Object>], <Function>), but got no arguments.',
			'should fail when it takes no arguments.'
		);
	}

	try {
		await outputFile('1', '2', '3', '4');
		fail();
	} catch ({message}) {
		t.equal(
			message,
			'Expected 2 or 3 arguments (<string>, <string|Buffer|Uint8Array>[, <string|Object>], <Function>), but got 4 arguments.',
			'should fail when it takes too many arguments.'
		);
	}

	t.end();
});
