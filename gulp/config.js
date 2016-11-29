var path = require("path");

module.exports = {
	test: {
		src: [
			path.resolve("index.js"),
			path.resolve("lib", "**", "*.js"),
		],
		tests: [
			path.resolve("tests", "tests.js")
		]
	}
};