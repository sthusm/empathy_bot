const db = require('../../db.js')
const table = 'users'

const COMMON_SELECT_FIELDS = Object.freeze([
  'users.telegram_id',
  'users.name',
  'users.surname',
  'users.gender',
  'users.status',
])

async function create(data, transaction) {
  return (
    await (transaction || db)
      .insert(data)
      .into(table)
  )
}

async function find(telegramId) {
  return (
    await db.select(COMMON_SELECT_FIELDS)
            .from(table)
            .whereRaw('users.telegram_id = ?', telegramId)
            .first()
  )
}

async function update(telegramId, changes, transaction) {
  const result = await
    (transaction || db)
      .table(table)
      .whereRaw('users.telegram_id = ?', telegramId)
      .update(changes, ['status'])

  return result[0]
}

module.exports = {
  create,
  find,
  update,
}
