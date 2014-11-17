/**
 * A CLI tool that wraps the `schema-mapper` library.
 */

var jsonStream = require("JSONStream");
var converter = require("./lib/converter");
var reader = require("./lib/reader");

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

	else if(args[0] === "--examine" || args[0] === "-e"){
		if(args.length !== 2){
			console.error(
				"Insufficient arguments: missing a rules file.\n\n",
				helpMessage
			);
			process.exit(1);
		}

		var rulesFile = require("./" + args[1]);
		var dataReader = reader(rulesFile.reader);
		if(dataReader === null){
			console.error(
				"No Reader could be found for the `%s` format.",
				rulesFile.reader.format
			);
			process.exit(1);
		}

		dataReader.once("readable", function (){
			console.log(JSON.stringify(dataReader.read(), undefined, 4));
			process.exit(0);
		});
	}

	else {
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
}

handleUserArgs(process.argv.slice(2));
