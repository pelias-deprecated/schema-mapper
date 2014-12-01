#! /usr/bin/env node

/**
 * A CLI tool that wraps the `schema-mapper` library. `./cli_tools.js --help`
 * for usage instructions.
 */

"use strict";

var fs = require("fs");
var jsonStream = require("JSONStream");

var schemaMapper = require("../schema-mapper");
var reader = require("../lib/reader");

/**
 * Handle command-line arguments.
 *
 * If a `rules` file is supplied, attempt reading it and pipe the dataset's
 * remapped objects to `stdout` in valid JSON format. May `exit()`, if
 * incorrect arguments are supplied.
 *
 * @param {array of string} args `process.argv.slice(2)`
 */
function handleUserArgs(args, outputStream){
	var helpMessage = [
		"schema-mapper --help | --examine RULES | RULES [...]",
		"",
		"\t--help, -h: Print this message and exit.",
		"\t--examine, -e RULES: Read and print one record from the dataset",
		"\t\tpointed to by the argument RULES file. Useful for examining its",
		"\t\toriginal schema.",
		"\tRULES [...]: One or more JS/JSON files, each specifying how to",
		"\t\tload a single dataset."
	].join("\n");

	if(args.length === 0){
		console.error(helpMessage);
		process.exit(1);
	}

	if(args[0] === "--help" || args[0] === "-h"){
		console.log(helpMessage);
	}

	// Examine a single object in the target dataset, to determine its schema.
	else if(args[0] === "--examine" || args[0] === "-e"){
		if(args.length !== 2){
			console.error(
				"Insufficient arguments: missing a rules file.\n\n",
				helpMessage
			);
			process.exit(1);
		}
		schemaMapper.loadRulesFiles(args[1], function (rules){
			examine(rules[0]);
		});
	}

	// Remap any number of datasets according to specified RULES files.
	else {
		if(outputStream === undefined){
			var outputStream = jsonStream.stringify(
				'{"objects":[\n', ",\n", "\n]}\n"
			);
			outputStream.pipe(process.stdout);
		}

		schemaMapper.loadRulesFiles(args, function remapCallback(rules){
			remap(rules, outputStream);
		});
	}
}

/**
 * Read and print the first record contained in a dataset pointed to by a rules
 * file; useful for determining its schema.
 *
 * @param {object} rules A standard Rules object.
 */
function examine(rules){
	var dataReader = reader(rules.reader);
	if(dataReader === null){
		console.error(
			"No Reader could be found for the `%s` format.",
			rules.reader.format
		);
		process.exit(1);
	}

	dataReader.once("readable", function (){
		console.log(JSON.stringify(dataReader.read(), undefined, 4));
		process.exit(0);
	});
}

/**
 * Remap a dataset pointed to by a Rules object and print the result in a JSON
 * object.
 *
 * @param {object} rules A standard Rules object.
 */
function remap(rules, outputStream){
	var dataConverter = schemaMapper.createConverter(rules);

	if(dataConverter === null){
		console.error(
			"No Reader could be found for the `%s` format.",
			rules.reader.format
		);
		process.exit(1);
	}

	dataConverter.pipe(outputStream);
}

var runFromCli = !module.parent;
if(runFromCli){
	handleUserArgs(process.argv.slice(2));
}

module.exports = handleUserArgs;
