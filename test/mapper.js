/**
 * @file Unit-tests for the `/lib/mapper` module. All functions are named after
 *      the module's functions that they test.
 */

"use strict";

var util = require("util");
var tape = require("tape");
var mapper = require("../lib/mapper");

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

			var errorMsg = util.format(
				"Succeeded for path `%s` in `%s`. Expected: `%s`. Got: `%s`.",
				path, JSON.stringify(object, undefined, 4), expectedValue,
				actualValue
			);
			test.deepEqual(actualValue, expectedValue, errorMsg);
		}
	}
};

module.exports = tests;
