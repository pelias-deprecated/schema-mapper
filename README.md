# schema mapper
A lightweight library and CLI tool for remapping datasets to different schemas. **schema-mapper** revolves around
*rules* object, which specify how to:

  * import a dataset, in the *reader* sub-object
  * modify values in the input objects and remap them onto keys in output objects, in the *mapper* sub-object

```
npm install schema-mapper
```

## example

For instance, if you want to convert a CSV file (called, say, `data.csv`) in the following format:

```
id,name,color
10,schema,red
20,mapper,blue
```

to output objects like:

```javascript
{
	unique_id: 10,
	text_name: "schema"
},
{
	unique_id: 20,
	text_name: "mapper"
}
```

you'd use a *rules* object like the following:

```javascript
{
	reader: {
		path
		format: "csv",
		options: {
			headers: true
		}
	},
	mapper: {
		unique_id: id,
		text_name: name
	}
}
```

# documentation
A *rules* object consists of `reader` and `mapper` objects.

## reader
The `reader` object has the following keys (required unless specified otherwise):

  * `path`: the path of the file to import
  * `format`: the format of the file at `path`. **schema-mapper** currently supports the following:
    * `csv`: *CSVs*, using [fast-csv](https://www.npmjs.org/package/fast-csv)
    * `shp`: *shapefiles*, using [shapefile-stream](https://www.npmjs.org/package/shapefile-stream)
    * `osm`: *OSM PBF/XML*, using [osmium](https://www.npmjs.org/package/osmium)
  * `options` (**optional**): an options object to pass down to the underlying data-importer module (see the above
    links for detailed options documentation).
    * `csv`: the options object will simply be passed down to `require("fast-csv")()`.
    * `shp`: *no options*.
    * `osm`: accepts the following key-value pairs:
     * `format`: `pbf`/`osm`, for PBF/XML format respectively. `pbf` is assumed by default.
     * `types`: An object specifying which types to read, like `{node: true, way: true}`. `relation`s will be ignored.


## mapper
The `mapper` object has the following keys:

  * `keep` (**optional**): A function that accepts a single argument, which will contain one of the objects ingested
    from the target dataset. Returns a boolean indicating whether that object should proceed to remapping and
    then the end of the pipeline, or be discarded outright.
  * `fields`: An object whose keys represent keys in the output object, and whose values represent means of retrieving
    values from the input object. May be any of the following:
      * `string`: a Javascript style "path" to the desired value.
        * `".a"`: `object.a`
        * `"a"`: `object.a` (the leading `.` is optional).
        * `".a.b"`: `object.a.b`
        * `".a[0].b"`: `object.a[0].b`
        * `"['my key']"`: `object['my key']`
      * `object`: allows use of pre-defined functions. It may contain the following key-value pairs:
        * `constant`: the value is a constant value assigned to this field in ALL output objects.
        * `coalesce`: the value is an array of value paths (see the `string` version of a `field` value above). The
          values to which they point will be null-coalesced.
      * `function`: will receive a single argument containing one of the input objects, and must return the value to
        map to the current field. Allows arbitrary massaging of the input object.

# usage
`schema-mapper` may either be used as a library in a node project, or a standalone command-line tool.

## library
The `schema-mapper` package exports an object containing the following functions:

`createConverter(rules)`
Creates a stream of re-mapped data given one or more rules objects.

  * `rules`: either a single Rules object, or an array of them.
  * `returns` A combined stream of remapped data, as generated from the `rules` argument.

`loadRulesFiles(paths, callback)`
Read any number of files containing Javascript objects (not necessarily conforming JSON, as they can map functions to
`mapper.keep` and `mapper.fields` values, which are not supported by the spec), and pass the objects to a callback
(common usage might be `loadRulesFiles(["file1", "file2"], createConverter);`).

  * `paths`: an array of string file paths.
  * `callback`: the function to call once all files have been read and evaluated. Will receive an argument containing
    an array of all the rules objects.

## cli tool
Run `schema-mapper --help` for full usage information.

# more examples
Here's a more comprehensive example of a rules object. It can either be passed directly to `createConverter()`, or
stuck in a file and used with the command-line `schema-mapper` tool.

```javascript
{
	reader: {
		path: "my.csv",
		format: "csv",
		options: {
			delimiter: "\t",
			quote: null // if your CSV has unterminated quotes
		}
	},
	mapper: {
		keep: function(record){
			return record.id % 2 == 0; // only care about records with even IDs
		},
		mapper: {
			key1: ".a.deeply.['nested value']",
			key2: function(record){
				return record.mixedCaseName.toLowerCase();
			},
			key3: {"constant", "Constant value. No touch."},
			key4: {
				"coalesce": ["possibly.null", "safe.fallback"]
			}
		}
	}
}
```
