const Promise = require("bluebird");

const Loader = function Loader(connection) {
    if (!connection) {
        throw new Error("Loader expects a supplied knex connection");
    }
    this.connection = connection;
};

Loader.prototype.loadFixtures = function loadFixtures(fixtures) {
    return Promise.each(fixtures, (fixture) => {
        return this.loadFixture(fixture);
    })
    .then(() => {
        return Promise.resolve(this.saved);
    });
};

Loader.prototype.loadFixture = function loadFixture(fixture) {
    return this.connection(fixture.table).insert(fixture.data);
};

module.exports = Loader;
