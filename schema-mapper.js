/**
 * @file The main entry point for the schema-mapper library; exports two
 * functions, for reading/evaluating rules files and then creating a converted
 * data stream from rules objects.
 */

"use strict";

var fs = require("fs");
var combinedStream = require("combined-stream");
var mapper = require("./lib/mapper");
var reader = require("./lib/reader");

/**
 * Read and evaluate a rules file, and then pass it to a function.
 *
 * @param {string | array of string} paths One or more paths to rules objects,
 *      which will be read, evaluated, and passed to `callback()` as an array
 *      argument.
 * @param {function} callback The function to call once the rules files
 *      pointed to be `path` have been read and evaluated; will receive the
 *      `rules` objects as an array argument.
 */
function loadRulesFiles(paths, callback){
	if(!(paths instanceof Array)){
		paths = [paths];
	}

	var numFilesRead = 0;
	var rulesObjects = [];

	for(var ind = 0; ind < paths.length; ind++){
		fs.readFile(paths[ind], function readFileCallback(err, data){
			if(err){
				console.error(err);
				process.exit(1);
			}

			rulesObjects.push(eval("(" + data.toString() + ")"))
			if(++numFilesRead == paths.length){
				callback(rulesObjects);
			}
		});
	}
}

/**
 * Given one or more Rules objects, create a readable stream of remapped
 * objects from the datasets they specify.
 *
 * @param {Rules object | array of Rules object} rules Either one Rules object,
 *      or an array of them.
 * @return {readable Stream} All of the remapped data streams (created per
 *      `rules`) appended into a single Readable stream.
 */
function createConverter(rules){
	var converter = combinedStream.create();
	if(!(rules instanceof Array)){
		rules = [rules];
	}
	for(var ind = 0; ind < rules.length; ind++){
		var dataReader = reader(rules[ind].reader);
		if(dataReader === null){
			return null;
		}
		converter.append(dataReader.pipe(mapper(rules[ind].mapper)));
	}
	return converter;
}

module.exports = {
	createConverter: createConverter,
	loadRulesFiles: loadRulesFiles
}
