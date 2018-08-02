'use strict';

const {lstat, readFile} = require('fs').promises;
const path = require('path');

const outputFile = require('.');
const rmfr = require('rmfr');
const test = require('tape');

test('outputFile()', async t => {
	t.plan(20);

	await rmfr('tmp*', {glob: true});

	outputFile('tmp_file', 'foo', async (err, dir) => {
		t.deepEqual(
			[err, dir],
			[null, null],
			'should pass null to the arguments when it doesn\'t create any directories.'
		);

		t.equal(
			await readFile('tmp_file', 'utf8'),
			'foo',
			'should write correct contents to a file.'
		);
	});

	outputFile('tmp_dir/foo/bar', '00', {
		encoding: 'hex',
		mode: '0745'
	}, async (err, dir) => {
		t.deepEqual(
			[err, dir],
			[null, path.resolve('tmp_dir')],
			'should pass a path of the directory created first to the argument.'
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
	});

	outputFile('node_modules/mkdirp', 'foo', (...args) => {
		t.equal(
			args[0].code,
			'EISDIR',
			'should pass an error to the callback when fs.writeFile fails.'
		);

		t.equal(
			args.length,
			1,
			'should not pass any values to the second argument when fs.writeFile fails.'
		);
	});

	outputFile('index.js/foo', 'foo', 'utf8', (...args) => {
		const expected = process.platform === 'win32' ? 'EEXIST' : 'ENOTDIR';

		t.equal(
			args[0].code,
			expected,
			'should pass an error to the callback when mkdirp fails.'
		);

		t.equal(
			args.length,
			1,
			'should not pass any values to the second argument when mkdirp fails.'
		);
	});

	outputFile(path.resolve('tmp_dir_another/1/2'), 'ə', {
		dirMode: '0745',
		fileMode: '0755',
		encoding: null
	}, async (err, dir) => {
		t.deepEqual(
			[err, dir],
			[null, path.resolve('tmp_dir_another')],
			'should accept an absolute path as its first argument.'
		);

		const expected = `40${process.platform === 'win32' ? '666' : '745'}`;

		t.equal(
			(await lstat('tmp_dir_another')).mode.toString(8),
			expected,
			'should reflect `dirMode` option to the mode of a directory.'
		);

		t.equal(
			(await lstat('tmp_dir_another/1')).mode.toString(8),
			expected,
			'should reflect `dirMode` option to the mode of a deep directory.'
		);

		t.equal(
			(await lstat('tmp_dir_another/1/2')).mode.toString(8),
			`100${process.platform === 'win32' ? '666' : '755'}`,
			'should reflect `fileMode` option to the file mode.'
		);

		t.deepEqual(
			await readFile('tmp_dir_another/1/2', 'utf8'),
			'ə',
			'should write a file in UTF-8 when `encoding` option is null.'
		);
	});

	t.throws(
		() => outputFile('foo', 'bar', 'utf9', t.fail),
		/ERR_INVALID_OPT_VALUE_ENCODING/,
		'should throw an error when the option is not valid for fs.writeFile.'
	);

	t.throws(
		() => outputFile('f/o/o', 'bar', {fs: []}, t.fail),
		/TypeError/,
		'should throw an error when the option is not valid for mkdirp.'
	);

	t.throws(
		() => outputFile('foo', 'bar', null, 'baz'),
		/TypeError.*not a function/,
		'should throw a type error when the last argument is not a function.'
	);

	t.throws(
		() => outputFile(true, '', t.fail),
		/TypeError.*path/,
		'should throw a type error when the first argument is not a string.'
	);

	t.throws(
		() => outputFile(),
		/but got no arguments\./,
		'should throw a type error when it takes no arguments.'
	);

	t.throws(
		() => outputFile('', '', '', '', ''),
		/but got 5 arguments\./,
		'should throw a type error when it takes too many arguments.'
	);
});
