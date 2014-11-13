var mapper = require("./mapper");
var reader = require("./reader");

function converter(rules){
	var dataReader = reader(rules.reader);
	if(dataReader === null){
		return null;
	}
	return dataReader.pipe(mapper(rules.mapper));
}

module.exports = converter;
