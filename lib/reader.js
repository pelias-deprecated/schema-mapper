var fs = require("fs");
var csvStream = require("fast-csv");

function createReader(reader){
	switch(reader.format){
		case "csv":
			var csvOptions = {
				headers: reader.header || false,
				delimiter: reader.delimiter || ","
			}
			return fs.createReadStream(reader.path)
				.pipe(csvStream(csvOptions));
		default:
			return null;
	}
}

module.exports = createReader;
