const db = require('../../db.js')
const table = 'responses'

async function create(data, transaction) {
  return (
    await (transaction || db)
      .insert(data)
      .into(table)
  )
}

async function update(id, changes, transaction) {
  const result = await
    (transaction || db)
      .table(table)
      .whereRaw('responses.id = ?', id)
      .update(changes)

  return result[0]
}

async function findReply(userId, requestId) {
  const result = await
    db
      .table(table)
      .where({
        responser_id: userId,
        request_id: requestId,
      })
  
  return result[0]
}

module.exports = {
  create,
  update,
  findReply,
}
