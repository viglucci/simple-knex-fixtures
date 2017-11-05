const lib = require("../index");
const chai = require("chai");
const pchai = require("chai-as-promised");
const del = require("del");

chai.use(pchai);

const { expect } = chai;

const Reader = require("../lib/reader.js");
const Loader = require("../lib/loader.js");

const knex = require("knex");

const dbConfig = {
    client: "sqlite",
    connection: {
        filename: "./testdb.sqlite"
    },
    useNullAsDefault: true
};

let connection = {};

describe("knex-fixtures", () => {
    beforeEach(() => {
        return del(dbConfig.connection.filename).then(() => {
            connection = knex(dbConfig);
            return connection.migrate.latest();
        });
    });

    afterEach(() => {
        connection.destroy();
        connection = null;
    });

    describe("reader", () => {
        describe("configuration", () => {
            it("encoding defaults to utf8", () => {
                const reader = new Reader();
                expect(reader.options.encoding).to.equal("utf8");
            });

            it("encoding can be configured", () => {
                const expected = "US-ASCII";
                const reader = new Reader({ encoding: expected });
                expect(reader.options.encoding).to.equal(expected);
            });
        });


        describe("readFile", () => {
            it("throws an error when no filename is provided", () => {
                const reader = new Reader();
                const fn = reader.readFile;
                return expect(fn())
                .to.eventually
                .be.rejectedWith("filename cannot be null")
                .and.be.an.instanceOf(Error);
            });

            it("throws an error for unsupported file extensions", () => {
                const reader = new Reader();
                const fn = reader.readFile;
                return expect(fn("file.txt"))
                .to.eventually
                .be.rejectedWith("unknown file type: .txt")
                .and.be.an.instanceOf(Error);
            });

            it("parses js files", () => {
                const reader = new Reader();
                return reader.readFile("tests/fixtures/user-fixture1.js")
                .then((data) => {
                    expect(data).to.be.a("array");
                    expect(data[0]).to.deep.equal({
                        table: "users",
                        data: {
                            id: 1,
                            first: "john",
                            last: "doe"
                        }
                    });
                });
            });

            it("parses json files", () => {
                const reader = new Reader();
                return reader.readFile("tests/fixtures/user-fixture1.json")
                .then((data) => {
                    expect(data).to.be.a("array");
                    expect(data[0]).to.deep.equal({
                        table: "users",
                        data: {
                            id: 1,
                            first: "john",
                            last: "doe"
                        }
                    });
                });
            });

            it("parses yaml files", () => {
                const reader = new Reader();
                return reader.readFile("tests/fixtures/user-fixture1.yml")
                .then((data) => {
                    expect(data).to.be.a("array");
                    expect(data[0]).to.deep.equal({
                        table: "users",
                        data: {
                            id: 1,
                            first: "john",
                            last: "doe"
                        }
                    });
                });
            });
        });

        describe("readFileGlob", () => {
            it("throws an error when no globpath is provided", () => {
                const reader = new Reader();
                const fn = reader.readFileGlob;
                return expect(fn())
                .to.eventually
                .be.rejectedWith("globpath cannot be null")
                .and.be.an.instanceOf(Error);
            });

            it("throws an error if no files match globpath", () => {
                const reader = new Reader();
                const fn = reader.readFileGlob;
                return expect(fn("file.txt"))
                .to.eventually
                .be.rejectedWith("no files matching 'file.txt' found")
                .and.be.an.instanceOf(Error);
            });

            it("parses js files", () => {
                const reader = new Reader();
                return reader.readFileGlob("tests/fixtures/user-fixture1.js")
                .then((data) => {
                    expect(data).to.be.a("array");
                    expect(data[0]).to.deep.equal({
                        table: "users",
                        data: {
                            id: 1,
                            first: "john",
                            last: "doe"
                        }
                    });
                });
            });

            it("parses json files", () => {
                const reader = new Reader();
                return reader.readFileGlob("tests/fixtures/user-fixture1.json")
                .then((data) => {
                    expect(data).to.be.a("array");
                    expect(data[0]).to.deep.equal({
                        table: "users",
                        data: {
                            id: 1,
                            first: "john",
                            last: "doe"
                        }
                    });
                });
            });

            it("parses yaml files", () => {
                const reader = new Reader();
                return reader.readFileGlob("tests/fixtures/user-fixture1.yml")
                .then((data) => {
                    expect(data).to.be.a("array");
                    expect(data[0]).to.deep.equal({
                        table: "users",
                        data: {
                            id: 1,
                            first: "john",
                            last: "doe"
                        }
                    });
                });
            });

            it("concatenates fixtures", () => {
                const reader = new Reader();
                return reader.readFileGlob("tests/fixtures/user-fixture[1-2].json")
                .then((data) => {
                    expect(data).to.be.a("array");
                    expect(data.length).to.equal(2);
                    expect(data[0]).to.deep.equal({
                        table: "users",
                        data: {
                            id: 1,
                            first: "john",
                            last: "doe"
                        }
                    });
                    expect(data[1]).to.deep.equal({
                        table: "users",
                        data: {
                            id: 2,
                            first: "jane",
                            last: "smith"
                        }
                    });
                });
            });
        });

        describe("readFiles", () => {
            it("throws an error when a non array is provided", () => {
                const reader = new Reader();
                const fn = reader.readFiles;
                return expect(fn("tests/fixtures/user-fixture1.js"))
                .to.eventually
                .be.rejectedWith("readFiles expects an array")
                .and.be.an.instanceOf(Error);
            });

            it("concatenates file results", () => {
                const reader = new Reader();
                return reader.readFiles([
                    "tests/fixtures/user-fixture1.json",
                    "tests/fixtures/user-fixture2.json"
                ])
                .then((data) => {
                    expect(data).to.be.a("array");
                    expect(data.length).to.equal(2);
                    expect(data[0]).to.deep.equal({
                        table: "users",
                        data: {
                            id: 1,
                            first: "john",
                            last: "doe"
                        }
                    });
                    expect(data[1]).to.deep.equal({
                        table: "users",
                        data: {
                            id: 2,
                            first: "jane",
                            last: "smith"
                        }
                    });
                });
            });
        });
    });

    describe("loader", () => {
        describe("configuration", () => {
            it("throws an error if connection is not provided", () => {
                expect(Loader).to.throw(Error);
            });

            it("sets connection", () => {
                const loader = new Loader(connection);
                expect(loader.connection).to.not.be.null;
            });
        });

        describe("loadFixture", () => {
            it("persists a fixure", () => {
                const loader = new Loader(connection);
                const user = {
                    id: 2,
                    first: "jane",
                    last: "smith"
                };
                return loader.loadFixture({
                    table: "users",
                    data: user
                })
                .then(() => {
                    return connection
                    .select("*")
                    .from("users");
                })
                .then((data) => {
                    expect(data).to.be.a("array");
                    expect(data.length).to.equal(1);
                    expect(data[0]).to.deep.equal(user);
                });
            });
        });

        describe("loadFixtures", () => {
            it("persists fixures", () => {
                const loader = new Loader(connection);
                const user1 = {
                    id: 1,
                    first: "john",
                    last: "doe"
                };
                const user2 = {
                    id: 2,
                    first: "jane",
                    last: "smith"
                };
                const fixtures = [
                    {
                        table: "users",
                        data: user1
                    },
                    {
                        table: "users",
                        data: user2
                    }
                ];
                return loader.loadFixtures(fixtures)
                .then(() => {
                    return connection
                    .select("*")
                    .from("users");
                })
                .then((data) => {
                    expect(data).to.be.a("array");
                    expect(data.length).to.equal(2);
                    expect(data[0]).to.deep.equal(user1);
                    expect(data[1]).to.deep.equal(user2);
                });
            });
        });
    });

    describe("integration", () => {
        it("loadFixture should throw when provided insufficient arguments", () => {
            const fn = lib.loadFixture;
            expect(fn).to.throw(Error);
        });

        it("loadFixtures should throw when provided insufficient arguments", () => {
            const fn = lib.loadFixtures;
            expect(fn).to.throw(Error);
        });

        it("loadFile should throw when provided insufficient arguments", () => {
            const fn = lib.loadFile;
            expect(fn).to.throw(Error);
        });

        it("loadFiles should throw when provided insufficient arguments", () => {
            const fn = lib.loadFiles;
            expect(fn).to.throw(Error);
        });

        describe("loadFixture", () => {
            it("persists a fixure", () => {
                const user = {
                    id: 2,
                    first: "jane",
                    last: "smith"
                };
                const fixture = {
                    table: "users",
                    data: user
                };
                return lib.loadFixture(fixture, connection)
                .then(() => {
                    return connection
                    .select("*")
                    .from("users");
                })
                .then((data) => {
                    expect(data).to.be.a("array");
                    expect(data.length).to.equal(1);
                    expect(data[0]).to.deep.equal(user);
                });
            });
        });

        describe("loadFixtures", () => {
            it("persists a fixure", () => {
                const fixture1 = {
                    table: "users",
                    data: {
                        id: 1,
                        first: "john",
                        last: "doe"
                    }
                };
                const fixture2 = {
                    table: "users",
                    data: {
                        id: 2,
                        first: "jane",
                        last: "smith"
                    }
                };
                const fixtures = [fixture1, fixture2];
                return lib.loadFixtures(fixtures, connection)
                .then(() => {
                    return connection
                    .select("*")
                    .from("users");
                })
                .then((data) => {
                    expect(data).to.be.a("array");
                    expect(data.length).to.equal(2);
                    expect(data[0]).to.deep.equal(fixture1.data);
                    expect(data[1]).to.deep.equal(fixture2.data);
                });
            });
        });

        describe("loadFile", () => {
            it("persists fixtures from a file", () => {
                const fixture1 = {
                    id: 1,
                    first: "john",
                    last: "doe"
                };
                return lib.loadFile("tests/fixtures/user-fixture1.json", connection)
                .then(() => {
                    return connection
                    .select("*")
                    .from("users");
                })
                .then((data) => {
                    expect(data).to.be.a("array");
                    expect(data.length).to.equal(1);
                    expect(data[0]).to.deep.equal(fixture1);
                });
            });
        });

        describe("loadFiles", () => {
            it("persists fixtures from a array", () => {
                const fixture1 = {
                    id: 1,
                    first: "john",
                    last: "doe"
                };
                const fixture2 = {
                    id: 2,
                    first: "jane",
                    last: "smith"
                };
                return lib.loadFiles([
                    "tests/fixtures/user-fixture1.json",
                    "tests/fixtures/user-fixture2.json"
                ], connection)
                .then(() => {
                    return connection
                    .select("*")
                    .from("users");
                })
                .then((data) => {
                    expect(data).to.be.a("array");
                    expect(data.length).to.equal(2);
                    expect(data[0]).to.deep.equal(fixture1);
                    expect(data[1]).to.deep.equal(fixture2);
                });
            });

            it("persists fixtures from a glob", () => {
                const fixture1 = {
                    id: 1,
                    first: "john",
                    last: "doe"
                };
                const fixture2 = {
                    id: 2,
                    first: "jane",
                    last: "smith"
                };
                return lib.loadFiles("tests/fixtures/user-fixture[1-2].json", connection)
                .then(() => {
                    return connection
                    .select("*")
                    .from("users");
                })
                .then((data) => {
                    expect(data).to.be.a("array");
                    expect(data.length).to.equal(2);
                    expect(data[0]).to.deep.equal(fixture1);
                    expect(data[1]).to.deep.equal(fixture2);
                });
            });
        });
    });
});
