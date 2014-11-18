var mapper = require("./lib/mapper");
var reader = require("./lib/reader");
var combinedStream = require("combined-stream");

/**
 * Read and evaluate a rules file, and then pass it to a function.
 *
 * @param {string} path The path to a rules file.
 * @param {function} destFunction The function to call once the rules file
 *      pointed to be `path` has been read and evaluated; will receive the
 *      `rules` object as an argument.
 */
function loadRulesFile(path, destFunction){
	fs.readFile(path, function callback(err, data){
		if(err){
			console.error(err);
			process.exit(1);
		}
		destFunction(eval("(" + data.toString() + ")"));
	});
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
	loadRulesFile: loadRulesFile
}
