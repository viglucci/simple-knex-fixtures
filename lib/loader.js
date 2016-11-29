var Promise = require("bluebird");

var Loader = function(connection) {
	if (!connection) { throw new Error("Loader expects a supplied knex connection") }
	this.connection = connection;
};

Loader.prototype.loadFixtures = function (fixtures) {
	return Promise.each(fixtures, function (fixture) {
		return this.loadFixture(fixture);
	}.bind(this)).then(function () {
		return Promise.resolve(this.saved);
	}.bind(this));
};

Loader.prototype.loadFixture = function (fixture) {
	return this.connection(fixture.table).insert(fixture.data);
};

module.exports = Loader;