
exports.up = function up(knex) {
    return knex.schema.createTable("users", (table) => {
        table.increments("id");
        table.string("first");
        table.string("last");
    });
};

exports.down = function down(knex) {
    return knex.schema.dropTableIfExists("users");
};
