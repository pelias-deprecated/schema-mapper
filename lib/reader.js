/**
 * @file Exports a function that creates a reader stream for a dataset.
 */

var fs = require("fs");
var csvStream = require("fast-csv");
var shapefile = require("shapefile-stream");

/**
 * @param {Object} reader The `reader` object as found in the `rules` object
 *      fed to the library. Must contain the following keys:
 *
 *          "path": The path of the file to ingest.
 *          "format": The format of the file. Can be:
 *
 *              "csv": `reader.header`, which can either be an array of column
 *                  names, `true` to indicate that the first line of the CSV
 *                  contains column names, or `false`, in which case columns are
 *                  simply stringified indexes (eg, '0', '1', etc).
 *              "shapefile"
 *
 * @return {Readable stream} An object stream for the file found at
 *      `reader.path` of format `reader.format`.
 */
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
