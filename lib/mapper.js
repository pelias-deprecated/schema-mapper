/**
 * @file Exports a function that creates a mapper stream, which ingests a
 * stream of objects from the source dataset and remaps their values onto
 * output objects.
 */

var through = require("through");

/**
 * @param {object} obj The object to retrieve a value from.
 * @param {string} propPath See `mapProperty()->value`.
 * @return {object} The value at `propPath`.
 */
function getPropVal(obj, propPath){
	return eval("obj" + propPath)
}

/**
 * Map a source object's property to a property in a target object.
 *
 * @param {object} source The source object.
 * @param {object} mapped The target object.
 * @param {string} prop The property to create in `target`.
 * @param {function/object/string} value The rule for retrieving a value from
 *      `source` to map onto `mapped[prop].
 *      If it's a function, pass it the `source` object as an argument and use
 *      its return value.
 *      Else, if it's an object, search for the following keys:
 *
 *          "constant": Use the value mapped to this key.
 *          "coalesce": Use the value received by null-coleascing the values
 *              pointed to by the path strings (similar to the `string` version
 *              of the `value` argument) in the array mapped to this key.
 *
 *      Else, if it's a string, treat it as the stringified path of the value
 *      to retrieve from `source` (eg "my.nested[0].value").
 */
function mapProperty(source, mapped, prop, value){
	switch(typeof value){
		case "function":
			mapped[prop] = value(source);
			break;
		case "object":
			if(value === null){
				mapped[prop] = null;
			}

			else if(value.hasOwnProperty("constant")){
				mapped[prop] = value.constant;
			}

			else if(value.hasOwnProperty("coalesce")){
				var mappedVal = null;
				for(var ind = 0; ind < value.coalesce.length; ind++){
					mappedVal = getPropVal(source, value.coalesce[ind]);
					if(mappedVal !== null){
						break;
					}
				}
			}
			break;
		case "string":
			mapped[prop] = getPropVal(source, value);
			break;
	}
}

/**
 * @param {Object} mapper A mapper object specifying how to map values in
 *      ingested objects to values in objects pushed downstream. Supports the
 *      following keys:
 *
 *          "keep" (optional): A function called for every object passing
 *              through the mapper that indicates whether or not it should be
 *              discarded. Must accept a single argument, `record` (said
 *              object), and return `true` if the `record` should be remapped
 *              using `   mapper.fields`, or `false` if it should be discarded
 *              outright.  Useful if you only want to remap certain records.
 *          "fields": Keys represent keys in the remapped object, while their
 *              values (which can be either a function, strict, or object --
 *              see mapProperty()`) indicate how to retrieve a corresponding
 *              value from the original object.
 *
 * @return {Transform stream} A stream that remaps all input objects onto
 *      output objects using `mapper`.
 */
function createMapper(mapper){
	var fields = mapper.fields;
	var noKeepLogic = (mapper.keep === undefined);

	function write(record){
		if(noKeepLogic || mapper.keep(record)){
			var mapped = {};
			for(var prop in fields){
				if(fields.hasOwnProperty(prop)){
					mapProperty(record, mapped, prop, fields[prop]);
				}
			}
			this.push(mapped);
		}
	}

	return through(write);
}

module.exports = createMapper;
