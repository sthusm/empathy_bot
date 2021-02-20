const db = require('../../db.js')
const table = 'default_messages'

const COMMON_SELECT_FIELDS = Object.freeze([
  'default_messages.id',
  'default_messages.text',
  'default_messages.type',
])

async function create(data, transaction) {
  return (
    await (transaction || db)
      .insert(data)
      .into(table)
  )
}

async function findBy(row) {
  return (
    await db.select(COMMON_SELECT_FIELDS)
            .from(table)
            .where({
              ...row,
              status: 'active',
            })
            .first()
  )
}

async function updateBy(row, changes, transaction) {
  const result = await
    (transaction || db)
      .table(table)
      .where(row)
      .update(changes, ['id'])

  return result[0]
}

module.exports = {
  create,
  findBy,
  updateBy,
}
