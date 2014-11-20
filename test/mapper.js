/**
 * @file Unit-tests for the `/lib/mapper` module. All functions are named after
 *      the module's functions that they test.
 */

"use strict";

var util = require("util");
var tape = require("tape");
var mapper = require("../lib/mapper");
var readableStream = require("readable-stream");

var tests = {};

/**
 * Tests `mapper.getPropVal()` by executing the function on a sample object for
 * a number of hard-coded attribute paths and expected values.
 */
tests.getPropVal = function getPropVal(test){
	var object = {
		"a": {
			"b": [
				"c"
			]
		},
		"d": [
			"e",
			"f",
			{
				"h": "i"
			}
		],
		"j": "k"
	};

	// Maps paths to the values they should retrieve.
	var testCases = {
		"a": {"b": ["c"]},
		"a.b": ["c"],
		"d[0]": "e",
		"d[2].h": "i",
		"j": "k",
		".j": "k"
	};

	test.plan(Object.keys(testCases).length);

	for(var testCase in testCases){
		if(testCases.hasOwnProperty(testCase)){
			var path = testCase;
			var expectedValue = testCases[testCase];
			var actualValue = mapper.getPropVal(object, path)

			var msg = util.format(
				"Succeeded for path `%s` in `%s`. Expected: `%s`. Got: `%s`.",
				path, JSON.stringify(object), expectedValue,
				actualValue
			);
			test.deepEqual(actualValue, expectedValue, msg);
		}
	}
};

/**
 * Test whether the Transform stream created by `createMapper()` properly
 * remaps String fields.
 */
tests.createMapperFields = function createMapperFields(test){
	var input = [
		{a: 1, b: 2},
		{a: 3, b: 4},
		{a: 5, b: 6}
	];

	var mapperConfig = {
		fields: {
			col1: "a",
			col2: "b"
		}
	}

	var output = [
		{col1: 1, col2: 2},
		{col1: 3, col2: 4},
		{col1: 5, col2: 6}
	];

	testCreateMapper(test, input, mapperConfig, output);
}

/**
 * Test whether the Transform stream created by `createMapper()` maps fields
 * correctly according to an object with a `coalesce` key.
 */
tests.createMapperObjectCoalesce = function createMapperObjectCoalesce(test){
	var input = [
		{a: 1, b: null},
		{a: null, b: 4},
		{a: null, b: null}
	];

	var mapperConfig = {
		fields: {
			coalesced: {"coalesce": ["a", ".b"]}
		}
	}

	var output = [
		{coalesced: 1},
		{coalesced: 4},
		{coalesced: null}
	];

	testCreateMapper(test, input, mapperConfig, output);
}

/**
 * Test whether the Transform stream created by `createMapper()` maps fields
 * correctly according to an object with a `constant` key.
 */
tests.createMapperObjectConstant = function createMapperObjectConstant(test){
	var input = [
		{a: 1},
		{a: null},
		{a: null}
	];

	var mapperConfig = {
		fields: {
			coalesced: {"constant": 1}
		}
	}

	var output = [
		{coalesced: 1},
		{coalesced: 1},
		{coalesced: 1}
	];

	testCreateMapper(test, input, mapperConfig, output);
}

/**
 * Test whether the Transform stream created by `createMapper()`
 * preserves/discards objects according to `keep()`.
 */
tests.createMapperKeep = function createMapperKeep(test){
	var input = [
		{a: 1, b: 2},
		{a: 2, b: 1},
		{a: 5, b: 6}
	];

	var mapperConfig = {
		keep: function keep(record){
			return record.a + record.b === 3;
		},
		fields: {
			"a": "a",
			"b": "b"
		}
	}

	var output = [
		{a: 1, b: 2},
		{a: 2, b: 1},
	];

	testCreateMapper(test, input, mapperConfig, output);
}

/**
 * Test whether `createMapper()` is producing correct output for a given set of
 * inputs and a Mapper configuration object.
 *
 * @param {object} test A Tape test object.
 * @param {array of object} input An array of input objects, to be written to
 *      the mapper.
 * @param {object} mapperConfig A Rules object to configure the Mapper stream.
 * @param {array of object} output An array of expected output objects, to be
 *      read from the mapper.
 */
function testCreateMapper(test, input, mapperConfig, output){
	test.plan(output.length);
	var mapperStream = mapper.createMapper(mapperConfig);

	var testStream = new readableStream.Writable({objectMode: true});
	testStream._write = function write(data, enc, next){
		var msg = util.format(
			"Remapped object `%s` matches output.", JSON.stringify(data)
		);
		test.deepEqual(data, output.shift(), msg);
		next();
	};

	mapperStream.pipe(testStream);

	for(var ind = 0; ind < input.length; ind++){
		mapperStream.write(input[ind]);
	}
}

module.exports = tests;
