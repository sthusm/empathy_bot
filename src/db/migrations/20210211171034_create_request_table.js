exports.up = async function (knex) {
  await knex.schema.createTable('requests', table => {
    table
      .increments('id')
      .primary()
      .index()
    table
      .integer('message_id')
      .notNullable()
      .index()
    table
      .enu('type', ['offer', 'ask'])
      .index()
      .notNullable()
    table
      .enu('status', ['active', 'closed_by_reply', 'closed_by_author', 'closed_by_time'])
      .index()
      .notNullable()
      .defaultTo('active')
    table
      .boolean('private')
    table
      .timestamp('created_at', { useTz: false })
      .defaultTo(knex.fn.now())

    // foreign keys
    table
      .integer('author_id')
      .references('telegram_id')
      .inTable('users')
      .onDelete('SET NULL')
      .onUpdate('CASCADE')
  })
}
    
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('requests')
}
