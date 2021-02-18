const db = require('../../db.js')
const table = 'requests'

const COMMON_SELECT_FIELDS = Object.freeze([
  'requests.id',
  'requests.message_id',
  'requests.type',
  'requests.duration',
  'requests.status',
  'requests.author_id',
])

async function create(data, transaction) {
  return (
    await (transaction || db)
      .insert(data, ['*'])
      .into(table)
  )
}

async function findByMessage(messageId) {
  return (
    await db.select(COMMON_SELECT_FIELDS)
            .from(table)
            .whereRaw('requests.message_id = ?', messageId)
            .first()
  )
}

async function update(id, changes, transaction) {
  const result = await
    (transaction || db)
      .table(table)
      .whereRaw('requests.id = ?', id)
      .update(changes)

  return result[0]
}

async function findUserActiveRequest(userId) {
  return (
    await db.select(COMMON_SELECT_FIELDS)
            .from(table)
            .where({
              author_id: userId,
              status: 'active',
            })
            .first()
  )
}

async function findAllActiveRequests(transaction) {
  return (
    await (db || transaction)
      .select([
        'id',
        'status',
        'message_id',
        'duration',
        'created_at',
        'author_id',
      ])
      .from(table)
      .where({ status: 'active' })
  )
}

module.exports = {
  create,
  findByMessage,
  update,
  findUserActiveRequest,
  findAllActiveRequests,
}
