var fs = require("fs");
var csvStream = require("fast-csv");
var shapefile = require("shapefile-stream");

function createReader(reader){
	switch(reader.format){
		case "csv":
			var csvOptions = {
				headers: reader.header || false,
				delimiter: reader.delimiter || ","
			};
			return fs.createReadStream(reader.path)
				.pipe(csvStream(csvOptions));
		case "shp":
			return shapefile.createReadStream(reader.path);
		default:
			return null;
	}
}

module.exports = createReader;
