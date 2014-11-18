var mapper = require("./lib/mapper");
var reader = require("./lib/reader");

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

function createConverter(rules){
	var dataReader = reader(rules.reader);
	if(dataReader === null){
		return null;
	}
	return dataReader.pipe(mapper(rules.mapper));
}

module.exports = {
	createConverter: createConverter,
	loadRulesFile: loadRulesFile
}
