/* eslint-disable no-await-in-loop, no-loop-func */
'use strict';

const {join} = require('path');
const {performance} = require('perf_hooks');
const {mkdir} = require('fs').promises;

const fsExtraOutputFile = require('fs-extra').outputFile;
const outputFile = require('.');
const rmfr = require('rmfr');

const TIME = 5000;

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

(async () => {
	const contents = Buffer.from('Hi');
	const tmp = join(__dirname, 'tmp_benchmark');
	let caseIndex = 0;

	for (const [fnName, fn] of Object.entries({
		'output-file (this project)': outputFile,
		'fs-extra': fsExtraOutputFile
	})) {
		await mkdir(join(__dirname, 'tmp_benchmark'));
		console.log(`${fnName}:`);

		await measure(
			async index => fn(join(tmp, `out-${caseIndex}-${index}.txt`), contents),
			'Write a file to an existing directory'
		);

		await measure(
			async index => fn(join(tmp, `deep-${caseIndex}-${index}/0/1/2/3/4/5/6/7/8/9/out.txt`), contents),
			'Create directories and write a file'
		);

		await rmfr(join(__dirname, 'tmp_benchmark'));

		caseIndex++;
		console.log();
	}
})();
