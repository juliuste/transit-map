#!/usr/bin/env node
'use strict'

const l = require('lodash')
const mri = require('mri')
const getStdin = require('get-stdin')
const writeJSON = require('write-json-file')

const transitMap = require('.')
const pkg = require('./package.json')

const argv = mri(process.argv.slice(2), {
	boolean: ['help', 'h', 'version', 'v', 'silent', 's']
})

if (argv.help === true || argv.h === true) {
	process.stdout.write(`
transit-map [options]

Usage:
	cat graph.json | transit-map > network.json

Options:
	--tmp-dir      -t  Directory to store intermediate files. Default: unique tmp dir.
	--output-file  -o  File to store result (instead of stdout).
	--silent       -s  Disable solver logging to stderr.

	--help         -h  Show this help message.
	--version      -v  Show the version number.

`)
	process.exit(0)
}

if (argv.version === true || argv.v === true) {
	process.stdout.write(`${pkg.version}\n`)
	process.exit(0)
}

// main program

const config = {
	workDir: argv['tmp-dir'] || argv.t || null,
	verbose: !(argv.silent || argv.s || null),
	outputFile: argv['output-file'] || argv.o || null
}

const main = async () => {
	const stdin = await getStdin()
	if (!stdin) throw new Error('No input network found in stdin.')
    const graph = JSON.parse(stdin)

	const solution = await transitMap(graph, l.pick(config, ['workDir', 'verbose']))

	if (config.outputFile) {
		await writeJSON(outputFile, solution)
	} else {
		process.stdout.write(JSON.stringify(solution))
	}
}

main()
.catch((err) => {
	console.error(err)
	process.exitCode = 1
})
