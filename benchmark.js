/* eslint-disable no-await-in-loop, no-loop-func */
'use strict';

const {join} = require('path');
const {performance} = require('perf_hooks');
const {mkdir} = require('fs').promises;

const fsExtraOutputFile = require('fs-extra').outputFile;
const outputFile = require('.');
const rmfr = require('rmfr');

const TIME = 2000;

async function measure(fn, title) {
	const MAX_LENGTH = 39;
	title = title.padEnd(MAX_LENGTH);

	const start = performance.now();
	let times = TIME;

	while (times--) {
		await fn(times);
	}

	console.log(`${title}${((performance.now() - start) / (TIME / 1000)).toFixed(15).padStart(19)} ms/op avg.`);
}

const tmp = join(__dirname, 'tmp_benchmark');
const contents = Buffer.from('Hi');

(async () => {
	let caseIndex = 0;

	for (const [fnName, fn] of Object.entries({
		'output-file (this project)': outputFile,
		'fs-extra': fsExtraOutputFile
	})) {
		await mkdir(tmp);
		console.log(`${fnName}:`);

		await measure(
			async index => fn(join(tmp, `${caseIndex}-${index}.txt`), contents),
			'Write a file to an existing directory'
		);

		process.chdir(tmp);

		await measure(
			async index => fn(join(tmp, `cwd-${caseIndex}-${index}.txt`), contents),
			'Write a file to the current directory'
		);

		process.chdir(__dirname);

		await measure(
			async index => fn(join(tmp, `deep-${caseIndex}-${index}/0/1/2/3/4/5/6/7/8/9/out.txt`), contents),
			'Create directories and write a file'
		);

		await rmfr(tmp);

		caseIndex++;
		console.log();
	}
})();
