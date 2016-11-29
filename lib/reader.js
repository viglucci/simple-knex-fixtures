var Promise = require('bluebird');
var path    = require('path');
var yaml    = require('js-yaml');
var glob    = Promise.promisify(require('glob'));
var fs      = Promise.promisifyAll(require('fs'));
var log     = require("debug")("knex-fixtures:reader");

var Reader = function (options) {
	options = options || {};
	options.encoding = options.encoding || "utf8";
	this.options = options;
};

var PARSERS = Reader.PARSERS = {
	".json": parseJSON,
	".yml": parseYML,
	".yaml": parseYML
};

function parseJSON (data) {
	return JSON.parse(data);
}

function parseYML (data) {
	return yaml.safeLoad(data);
}

Reader.prototype.readFile = Promise.method(function(filename) {
	log("reading file " + filename + "...");
	if (!filename) {throw new Error("filename cannot be null"); }
	var ext = path.extname(filename).toLowerCase();
	if (ext === ".js") {
		return require(path.resolve(process.cwd(), filename));
	} else {
		if (!PARSERS[ext]) {
			throw new Error("unknown file type: " + ext);
		}
		return fs.readFileAsync(filename, this.options.encoding).then(function(data) {
			var fixtures = PARSERS[ext](data);
			if (fixtures.fixtures) fixtures = fixtures.fixtures;
			return fixtures;
		});
	}
});

Reader.prototype.readFileGlob = function(globpath){
	if (!globpath) { return Promise.reject(new Error("globpath cannot be null")); }
	var self = this;
	var result = [];
	return glob(globpath).then(function(filenames) {
		if (!filenames.length) { throw new Error("no files matching '" + globpath + "' found"); }
		return Promise.each(filenames, function(filename) {
			return self.readFile(filename).then(function(res) {
				result = result.concat(res);
			});
		}).then(function() {
			return result;
		});
	});
};

Reader.prototype.readFiles = function(filenames){
	var self = this;
	var result = [];
	if (!Array.isArray(filenames)) { return Promise.reject(new Error("readFiles expects an array")); }
	return Promise.each(filenames, function(filename) {
		return self.readFileGlob(filename).then(function(res) {
			result = result.concat(res);
		});
	}).then(function() {
		return result;
	});
};

module.exports = Reader;