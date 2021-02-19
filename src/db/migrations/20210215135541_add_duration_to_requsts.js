
exports.up = async function (knex) {  
  await knex.schema.alterTable('requests', table => {
    table
      .integer('duration')
      .notNullable()
      .unsigned()
      .defaultTo(0)
  })
}

exports.down = async function (knex) {
  await knex.schema.alterTable('requests', table => {
    table
      .dropColumn('duration')
  })
}
