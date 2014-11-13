/**
 * A CLI tool that wraps the `schema-mapper` library.
 */

var jsonStream = require("JSONStream");
var converter = require("./lib/converter");

/**
 * Handle command-line arguments.
 *
 * If a `rules` file is supplied, attempt reading it and pipe the dataset's
 * remapped objects to `stdout` in valid JSON format. May `exit()`, if
 * incorrect arguments are supplied.
 *
 * @param {array of string} args `process.argv.slice(2)`
 */
function handleUserArgs(args){
	var helpMessage = [
		"schema-mapper --help | RULES [...]",
		"",
		"\t--help: Print this message and exit.",
		"\tRULES [...]: One or more JS/JSON files, each specifying how to",
		"\t\tload a single dataset."
	].join("\n");

	if(args.length === 0){
		console.error(helpMessage);
		process.exit(1);
	}

	if(args[0] === "--help"){
		console.log(helpMessage);
		process.exit(0);
	}

	for(var ind = 0; ind < args.length; ind++){
		var rulesFile = require("./" + args[ind]);
		var dataConverter = converter(rulesFile);

		if(dataConverter === null){
			console.error(
				"No Reader could be found for the `%s` format.",
				rulesFile.reader.format
			);
			process.exit(1);
		}

		dataConverter
			.pipe(jsonStream.stringify('{"objects":[\n', ",\n", "\n]}\n"))
			.pipe(process.stdout);
	}
}

handleUserArgs(process.argv.slice(2));
