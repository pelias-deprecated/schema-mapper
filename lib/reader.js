/**
 * @file Exports a function that creates a reader stream for a dataset.
 */

// "use strict";

var fs = require("fs");
var csvStream = require("fast-csv");
var shapefile = require("shapefile-stream");
var osmium = require("osmium");
var osmiumStream = require("osmium-stream");
var CombinedStream = require("combined-stream");

/**
 * @param {Object} reader The `reader` object as found in the `rules` object
 *      fed to the library. Must contain the following keys:
 *
 *          "path": The path of the file to ingest.
 *          "format": The format of the file. Can be:
 *
 *              "csv": The underlying CSV package, `fast-csv`
 *                  (https://www.npmjs.org/package/fast-csv), is highly
 *                  configurable. An "options" key at the same level as the
 *                  "format" key can be mapped to an options object, which will
 *                  be passed down to the package.
 *              "shapefile": No config options.
 *              "osm": The underlying OSM package, `osmium`
 *                  (https://github.com/osmcode/node-osmium/blob/master/doc/tutorial.md),
 *                  accepts configuration options. An "options" key at the same
 *                  level as the "format" key can contain the following values.
 *
 *                      "format": "pbf"/"osm", for PBF/XML format respectively.
 *                          "pbf" is assumed by default.
 *                      "types": An object specifying which types to read, like
 *                          `{node: true, way: true}`. `relation`s will be
 *                          ignored.
 *
 * @return {Readable stream} An object stream for the file found at
 *      `reader.path` of format `reader.format`.
 */
function createReader(reader){
	var formatReaders = {
		"csv": createReaderCsv,
		"shp": createReaderShp,
		"osm": createReaderOsm
	};

	return formatReaders[reader.format](reader);
}

function createReaderShp(reader){
	if(reader.path instanceof Array){
		var outStream = CombinedStream.create();
		for(var ind = 0; ind < reader.path.length; ind++){
			var filePath = reader.path[ind];
			outStream.append(shapefile.createReadStream(filePath));
		}
	}
	else {
		var outStream = shapefile.createReadStream(reader.path);
	}
	return outStream;
}

function createReaderCsv(reader){
	if(reader.path instanceof Array){
		var dataStream = CombinedStream.create();
		for(var ind = 0; ind < reader.path.length; ind++){
			var filePath = reader.path[ind];
			dataStream.append(fs.createReadStream(filePath));
		}
	}
	else {
		dataStream = fs.createReadStream(reader.path);
	}
	return dataStream.pipe(csvStream(reader.options));
}

function createReaderOsm(reader){
	function createOsmiumStream(path, options){
		var options = options || {};

		var osmiumFile = (options.format !== undefined) ?
			new osmium.File(path, options.format) :
			new osmium.File(path);

		var osmiumReader = (options.types !== undefined) ?
			new osmium.Reader(osmiumFile, options.types) :
			new osmium.Reader(osmiumFile);
		return new osmiumStream(osmiumReader);
	}

	if(reader.path instanceof Array){
		var outStream = CombinedStream.create();
		for(var ind = 0; ind < reader.path.length; ind++){
			outStream.append(createOsmiumStream(
				reader.path[ind], reader.options
			));
		}
	}
	else {
		var outStream = createOsmiumStream(
			reader.path, reader.options
		);
	}

	return outStream;
}
module.exports = createReader;
