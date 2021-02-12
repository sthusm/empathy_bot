exports.up = async function (knex) {
  await knex.schema.createTable('responses', table => {
    table
      .increments('id')
      .primary()
      .index()
    table
      .timestamp('created_at', { useTz: false })
      .defaultTo(knex.fn.now())
  
    // foreign keys
    table
      .integer('request_id')
      .references('id')
      .inTable('requests')
      .onDelete('SET NULL')
      .onUpdate('CASCADE')
    table
      .integer('responser_id')
      .references('telegram_id')
      .inTable('users')
      .onDelete('SET NULL')
      .onUpdate('CASCADE')
  })
}
      
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('responses')
}
  