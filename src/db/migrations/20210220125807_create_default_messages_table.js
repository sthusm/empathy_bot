exports.up = async function (knex) {
  await knex.schema.createTable('default_messages', table => {
    table
      .increments('id')
      .primary()
      .index()
    table
      .text('text')
      .notNullable()
    table
      .enu('type', ['welcome_msg'])
      .index()
      .notNullable()
    table
      .enu('status', ['active', 'disabled'])
      .index()
      .notNullable()
  })
}
  
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('default_messages')
}
