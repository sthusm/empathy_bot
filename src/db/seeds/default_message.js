
exports.seed = async function (knex) {
  await knex('default_messages').del()
  await knex('default_messages').insert([
    { text: 'Привет!', type: 'welcome_msg', status: 'active' },
  ])
}
