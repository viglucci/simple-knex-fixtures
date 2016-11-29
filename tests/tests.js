var lib     = require("../index");
var should  = require("should");
var chai    = require("chai");
var pchai   = require("chai-as-promised");
var Promise = require("bluebird");
var sinon   = require("sinon");
var del     = require("del");

chai.use(pchai);

var expect = chai.expect;
var assert = chai.assert;
var should = chai.should;

var Reader = require("../lib/reader.js");
var Loader = require("../lib/loader.js");

var knex = require("knex");

var db_config = {
	client: "sqlite",
	connection: {
		filename: "./testdb.sqlite"
	},
	useNullAsDefault: true
};

var connection = {};

describe("knex-fixtures", function () {

	beforeEach(function () {
		return del(db_config.connection.filename).then(function () {
			connection = knex(db_config);
			return connection.migrate.latest();
		});
	});

	afterEach(function () {
		connection.destroy();
		connection = null;
	});

	describe("reader", function () {

		describe("configuration", function () {

			it("encoding defaults to utf8", function() {
				var reader = new Reader();
				expect(reader.options.encoding).to.equal("utf8");
			});

			it("encoding can be configured", function() {
				var expected = "US-ASCII";
				var reader = new Reader({ encoding: expected });
				expect(reader.options.encoding).to.equal(expected);
			});
		});


		describe("readFile", function () {

			it("throws an error when no filename is provided", function() {
				var reader = new Reader();
				var fn = reader.readFile;
				return expect(fn())
				.to.eventually
				.be.rejectedWith("filename cannot be null")
				.and.be.an.instanceOf(Error);
			});

			it("throws an error for unsupported file extensions", function() {
				var reader = new Reader();
				var fn = reader.readFile;
				return expect(fn("file.txt"))
				.to.eventually
				.be.rejectedWith("unknown file type: .txt")
				.and.be.an.instanceOf(Error);
			});

			it("parses js files", function() {
				var reader = new Reader();
				return reader.readFile("tests/fixtures/user-fixture1.js")
				.then(function (data) {
					expect(data).to.be.a("array");
					expect(data[0]).to.deep.equal({
						"table": "users",
						"data": {
							"id": 1,
							"first": "john",
							"last": "doe"
						}
					});
				});
			});

			it("parses json files", function() {
				var reader = new Reader();
				return reader.readFile("tests/fixtures/user-fixture1.json")
				.then(function (data) {
					expect(data).to.be.a("array");
					expect(data[0]).to.deep.equal({
						"table": "users",
						"data": {
							"id": 1,
							"first": "john",
							"last": "doe"
						}
					});
				});
			});

			it("parses yaml files", function() {
				var reader = new Reader();
				return reader.readFile("tests/fixtures/user-fixture1.yml")
				.then(function (data) {
					expect(data).to.be.a("array");
					expect(data[0]).to.deep.equal({
						"table": "users",
						"data": {
							"id": 1,
							"first": "john",
							"last": "doe"
						}
					});
				});
			});
		});

		describe("readFileGlob", function () {

			it("throws an error when no globpath is provided", function() {
				var reader = new Reader();
				var fn = reader.readFileGlob;
				return expect(fn())
				.to.eventually
				.be.rejectedWith("globpath cannot be null")
				.and.be.an.instanceOf(Error);
			});

			it("throws an error if no files match globpath", function() {
				var reader = new Reader();
				var fn = reader.readFileGlob;
				return expect(fn("file.txt"))
				.to.eventually
				.be.rejectedWith("no files matching 'file.txt' found")
				.and.be.an.instanceOf(Error);
			});

			it("parses js files", function() {
				var reader = new Reader();
				return reader.readFileGlob("tests/fixtures/user-fixture1.js")
				.then(function (data) {
					expect(data).to.be.a("array");
					expect(data[0]).to.deep.equal({
						"table": "users",
						"data": {
							"id": 1,
							"first": "john",
							"last": "doe"
						}
					});
				});
			});

			it("parses json files", function() {
				var reader = new Reader();
				return reader.readFileGlob("tests/fixtures/user-fixture1.json")
				.then(function (data) {
					expect(data).to.be.a("array");
					expect(data[0]).to.deep.equal({
						"table": "users",
						"data": {
							"id": 1,
							"first": "john",
							"last": "doe"
						}
					});
				});
			});

			it("parses yaml files", function() {
				var reader = new Reader();
				return reader.readFileGlob("tests/fixtures/user-fixture1.yml")
				.then(function (data) {
					expect(data).to.be.a("array");
					expect(data[0]).to.deep.equal({
						"table": "users",
						"data": {
							"id": 1,
							"first": "john",
							"last": "doe"
						}
					});
				});
			});

			it("concatenates fixtures", function() {
				var reader = new Reader();
				return reader.readFileGlob("tests/fixtures/user-fixture[1-2].json")
				.then(function (data) {
					expect(data).to.be.a("array");
					expect(data.length).to.equal(2);
					expect(data[0]).to.deep.equal({
						"table": "users",
						"data": {
							"id": 1,
							"first": "john",
							"last": "doe"
						}
					});
					expect(data[1]).to.deep.equal({
						"table": "users",
						"data": {
							"id": 2,
							"first": "jane",
							"last": "smith"
						}
					});
				});
			});
		});

		describe("readFiles", function () {

			it("throws an error when a non array is provided", function() {
				var reader = new Reader();
				var fn = reader.readFiles;
				return expect(fn("tests/fixtures/user-fixture1.js"))
				.to.eventually
				.be.rejectedWith("readFiles expects an array")
				.and.be.an.instanceOf(Error);
			});

			it("concatenates file results", function() {
				var reader = new Reader();
				return reader.readFiles([
					"tests/fixtures/user-fixture1.json",
					"tests/fixtures/user-fixture2.json",
				])
				.then(function (data) {
					expect(data).to.be.a("array");
					expect(data.length).to.equal(2);
					expect(data[0]).to.deep.equal({
						"table": "users",
						"data": {
							"id": 1,
							"first": "john",
							"last": "doe"
						}
					});
					expect(data[1]).to.deep.equal({
						"table": "users",
						"data": {
							"id": 2,
							"first": "jane",
							"last": "smith"
						}
					});
				});
			});
		});
	});

	describe("loader", function () {

		describe("configuration", function () {

			it("throws an error if connection is not provided", function() {
				expect(Loader).to.throw(Error);
			});

			it("sets connection", function() {
				var loader = new Loader(connection);
				expect(loader.connection).to.not.be.null;
			});
		});

		describe("loadFixture", function () {

			it("persists a fixure", function() {
				var loader = new Loader(connection);
				var user = {
					"id": 2,
					"first": "jane",
					"last": "smith"
				};
				return loader.loadFixture({
					"table": "users",
					"data": user
				})
				.then(function () {
					return connection
					.select("*")
					.from("users");
				})
				.then(function (data) {
					expect(data).to.be.a("array");
					expect(data.length).to.equal(1);
					expect(data[0]).to.deep.equal(user);
				});
			});
		});

		describe("loadFixtures", function () {

			it("persists fixures", function() {
				var loader = new Loader(connection);
				var user1 = {
					"id": 1,
					"first": "john",
					"last": "doe"
				};
				var user2 = {
					"id": 2,
					"first": "jane",
					"last": "smith"
				};
				var fixtures = [
					{
						"table": "users",
						"data": user1
					},
					{
						"table": "users",
						"data": user2
					}
				];
				return loader.loadFixtures(fixtures)
				.then(function () {
					return connection
					.select("*")
					.from("users");
				})
				.then(function (data) {
					expect(data).to.be.a("array");
					expect(data.length).to.equal(2);
					expect(data[0]).to.deep.equal(user1);
					expect(data[1]).to.deep.equal(user2);
				});
			});
		});
	});

	describe("integration", function () {

		it("loadFixture should throw when provided insufficient arguments", function() {
			var fn = lib.loadFixture;
			expect(fn).to.throw(Error);
		});

		it("loadFixtures should throw when provided insufficient arguments", function() {
			var fn = lib.loadFixtures ;
			expect(fn).to.throw(Error);
		});

		it("loadFile should throw when provided insufficient arguments", function() {
			var fn = lib.loadFile;
			expect(fn).to.throw(Error);
		});

		it("loadFiles should throw when provided insufficient arguments", function() {
			var fn = lib.loadFiles;
			expect(fn).to.throw(Error);
		});

		describe("loadFixture", function () {

			it("persists a fixure", function () {
				var user = {
					"id": 2,
					"first": "jane",
					"last": "smith"
				};
				var fixture = {
					"table": "users",
					"data": user
				};
				return lib.loadFixture(fixture, connection)
				.then(function () {
					return connection
					.select("*")
					.from("users");
				})
				.then(function (data) {
					expect(data).to.be.a("array");
					expect(data.length).to.equal(1);
					expect(data[0]).to.deep.equal(user);
				});
			});
		});

		describe("loadFixtures", function () {

			it("persists a fixure", function () {
				var fixture1 = {
					"table": "users",
					"data": {
						"id": 1,
						"first": "john",
						"last": "doe"
					}
				};
				var fixture2 = {
					"table": "users",
					"data": {
						"id": 2,
						"first": "jane",
						"last": "smith"
					}
				};
				var fixtures = [fixture1, fixture2];
				return lib.loadFixtures(fixtures, connection)
				.then(function () {
					return connection
					.select("*")
					.from("users");
				})
				.then(function (data) {
					expect(data).to.be.a("array");
					expect(data.length).to.equal(2);
					expect(data[0]).to.deep.equal(fixture1.data);
					expect(data[1]).to.deep.equal(fixture2.data);
				});
			});
		});

		describe("loadFile", function () {

			it("persists fixtures from a file", function () {
				var fixture1 = {
					"id": 1,
					"first": "john",
					"last": "doe"
				};
				return lib.loadFile("tests/fixtures/user-fixture1.json", connection)
				.then(function () {
					return connection
					.select("*")
					.from("users");
				})
				.then(function (data) {
					expect(data).to.be.a("array");
					expect(data.length).to.equal(1);
					expect(data[0]).to.deep.equal(fixture1);
				});
			});
		});

		describe("loadFiles", function () {

			it("persists fixtures from a array", function () {
				var fixture1 = {
					"id": 1,
					"first": "john",
					"last": "doe"
				};
				var fixture2 = {
					"id": 2,
					"first": "jane",
					"last": "smith"
				};
				return lib.loadFiles([
					"tests/fixtures/user-fixture1.json", 
					"tests/fixtures/user-fixture2.json"
				], connection)
				.then(function () {
					return connection
					.select("*")
					.from("users");
				})
				.then(function (data) {
					expect(data).to.be.a("array");
					expect(data.length).to.equal(2);
					expect(data[0]).to.deep.equal(fixture1);
					expect(data[1]).to.deep.equal(fixture2);
				});
			});

			it("persists fixtures from a glob", function () {
				var fixture1 = {
					"id": 1,
					"first": "john",
					"last": "doe"
				};
				var fixture2 = {
					"id": 2,
					"first": "jane",
					"last": "smith"
				};
				return lib.loadFiles("tests/fixtures/user-fixture[1-2].json", connection)
				.then(function () {
					return connection
					.select("*")
					.from("users");
				})
				.then(function (data) {
					expect(data).to.be.a("array");
					expect(data.length).to.equal(2);
					expect(data[0]).to.deep.equal(fixture1);
					expect(data[1]).to.deep.equal(fixture2);
				});
			});
		});
	});
});