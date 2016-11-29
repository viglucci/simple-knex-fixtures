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

var READERS = Reader.READERS = {
	".js": readJS,
	".json": readJSON,
	".yml": readYML,
	".yaml": readYML
};

function supportNestedFixtures (fixtures) { 
	return fixtures.fixtures || fixtures; 
}

function readFile (filename) {	
	return fs.readFileAsync(filename, this.options.encoding);
}

function readJS (filename) {
	return supportNestedFixtures(require(path.resolve(process.cwd(), filename)));
}

function readJSON (filename) {
	return readFile.call(this, filename)
	.then(JSON.parse)
	.then(supportNestedFixtures);;
}

function readYML (filename) {
	return readFile.call(this, filename)
	.then(yaml.safeLoad.bind(yaml))
	.then(supportNestedFixtures);;
}

function workFiles (filenames, fn) {
	function workFile (filename) {
		return fn(filename).then(concat);
	}
	function concat (res) {
		result = result.concat(res);
	}
	var result = [];
	return Promise.each(filenames, workFile)
	.then(function () {
		return result;
	});
}

Reader.prototype.readFile = Promise.method(function (filename) {
	log("reading file " + filename + "...");
	if (!filename) {throw new Error("filename cannot be null"); }
	var ext = path.extname(filename).toLowerCase();
	if (!READERS[ext]) { throw new Error("unknown file type: " + ext); }
	var parser = READERS[ext].bind(this);
	return parser(filename);
});

Reader.prototype.readFileGlob = function (globpath) {
	if (!globpath) { return Promise.reject(new Error("globpath cannot be null")); }
	var self = this;
	function assertLength (filenames) {
		if (!filenames.length) { throw new Error("no files matching '" + globpath + "' found"); }
		return filenames;
	}
	return glob(globpath)
	.then(assertLength)
	.then(function (filenames) {
		return workFiles.call(self, filenames, self.readFile.bind(self));
	})
};

Reader.prototype.readFiles = function (filenames) {
	if (!Array.isArray(filenames)) { return Promise.reject(new Error("readFiles expects an array")); }
	return workFiles.call(this, filenames, this.readFileGlob.bind(this));
};

module.exports = Reader;