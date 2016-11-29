var Loader = require("./lib/loader");
var Reader = require("./lib/reader");

var log = require("debug")("knex-fixtures");

function initopts(options){
	options = options || {};
	options.encoding = options.encoding || "utf8";
	options.log = options.log || log;
	return options;
}

function wrap(fn) {
	return function() {
		if (arguments.length < 2) {
			throw new Error("knex-fixtures: insufficient arguments provided");
		}
		var fixtures = arguments[0];
		var connection = arguments[1];
		var options = arguments[2];
		return fn(fixtures, connection, initopts(options));
	};
}

exports.loadFixture = wrap(function(fixture, connection, options) {
	var loader = new Loader(connection);
	return loader.loadFixture(fixture);
});

exports.loadFixtures = wrap(function(fixtures, connection, options) {
	var loader = new Loader(connection);
	return loader.loadFixtures(fixtures);
});

exports.loadFile = wrap(function(filename, connection, options) {
	var loader = new Loader(connection);
	var reader = new Reader(options);
	return reader.readFileGlob(filename).then(function(fixtures) {
		return loader.loadFixtures(fixtures);
	});
});

exports.loadFiles = wrap(function(filenames, connection, options) {
	if (!Array.isArray(filenames)) { var f = filenames; filenames = []; filenames.push(f) };
	var loader = new Loader(connection);
	var reader = new Reader(options);
	return reader.readFiles(filenames).then(function(fixtures){
		return loader.loadFixtures(fixtures);
	});
});

exports.Loader = Loader;
exports.Reader = Reader;