
exports.up = function(knex, Promise) {
	var createTable = knex.schema.createTable("users", function (table) {
		table.increments("id");
		table.string("first");
		table.string("last");
	});

	return Promise.resolve(createTable);
};

exports.down = function(knex, Promise) {
	var dropTable = knex.schema.dropTableIfExists("users");

	return Promise.resolve(dropTable);
};