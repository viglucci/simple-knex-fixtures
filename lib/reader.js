const Promise = require("bluebird");
const path = require("path");
const yaml = require("js-yaml");
const glob = Promise.promisify(require("glob"));
const fs = Promise.promisifyAll(require("fs"));
const log = require("debug")("knex-fixtures:reader");
const _ = require("lodash");

const Reader = function Reader(options) {
    this.options = _.defaults(options, {
        encoding: "utf8"
    });
};

Reader.supportNestedFixtures = function supportNestedFixtures(fixtures) {
    return fixtures.fixtures || fixtures;
};

Reader.readFile = function readFile(filename) {
    return fs.readFileAsync(filename, this.options.encoding);
};

Reader.readJS = function readJS(filename) {
    const fileContents = require(path.resolve(process.cwd(), filename));
    return Reader.supportNestedFixtures(fileContents);
};

Reader.readJSON = function readJSON(filename) {
    return Reader.readFile.call(this, filename)
    .then(JSON.parse)
    .then(Reader.supportNestedFixtures);
};

Reader.readYML = function readYML(filename) {
    return Reader.readFile.call(this, filename)
    .then(yaml.safeLoad.bind(yaml))
    .then(Reader.supportNestedFixtures);
};

Reader.workFiles = function workFiles(filenames, fn) {
    let result = [];
    function concat(res) {
        result = result.concat(res);
    }
    function workFile(filename) {
        return fn(filename).then(concat);
    }
    return Promise.each(filenames, workFile)
    .then(() => {
        return result;
    });
};

Reader.prototype.readFile = Promise.method(function readFile(filename) {
    log(`reading file ${filename}...`);
    if (!filename) {
        throw new Error("filename cannot be null");
    }
    const ext = path.extname(filename).toLowerCase();
    if (!Reader.readers[ext]) {
        throw new Error(`unknown file type: ${ext}`);
    }
    const parser = Reader.readers[ext].bind(this);
    return parser(filename);
});

Reader.prototype.readFileGlob = function readFileGlob(globpath) {
    if (!globpath) {
        return Promise.reject(new Error("globpath cannot be null"));
    }
    const self = this;
    function assertLength(filenames) {
        if (!filenames.length) {
            throw new Error(`no files matching '${globpath}' found`);
        }
        return filenames;
    }
    return glob(globpath)
    .then(assertLength)
    .then((filenames) => {
        return Reader.workFiles.call(self, filenames, self.readFile.bind(self));
    });
};

Reader.prototype.readFiles = function readFiles(filenames) {
    if (!Array.isArray(filenames)) {
        return Promise.reject(new Error("readFiles expects an array"));
    }
    return Reader.workFiles.call(this, filenames, this.readFileGlob.bind(this));
};

Reader.readers = {
    ".js": Reader.readJS,
    ".json": Reader.readJSON,
    ".yml": Reader.readYML,
    ".yaml": Reader.readYML
};

module.exports = Reader;
