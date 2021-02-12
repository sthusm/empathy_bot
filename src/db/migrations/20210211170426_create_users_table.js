exports.up = async function (knex) {
  await knex.schema.createTable('users', table => {
    table
      .integer('telegram_id')
      .primary()
      .notNullable()
      .index()
    table
      .string('name', 64)
    table
      .string('surname', 64)
    table
      .enu('gender', ['male', 'female'])
      .index()
    table
      .enu('status', ['active', 'blocked'])
      .index()
      .defaultTo('active')
    table
      .timestamp('created_at', { useTz: false })
      .defaultTo(knex.fn.now())
  })
}
  
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('users')
}
