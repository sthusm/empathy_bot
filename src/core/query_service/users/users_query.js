const db = require('../../../db/db.js')
const User = require('../../../db/dao/users/users.js')
const requestQuery = require('../requests/requests_query.js')

const formatInsertData = async data => {
  return {
    telegram_id: data.telegramId,
    name: data.name,
    surname: data.surname,
    gender: data.gender,
    status: data.status,
  }
}

const formatUser = data => {
  return {
    telegramId: data.telegram_id,
    name: data.name,
    surname: data.surname,
    gender: data.gender,
    status: data.status,
  }
}

class UsersQueryService {
  async create(data) {
    const formattedData = await formatInsertData(data)

    return await User.create(formattedData)
  }

  async update(telegramId, changes) {
    const formattedData = await formatInsertData(changes)

    return await User.update(telegramId, formattedData)
  }

  async find(telegramId) {
    const result = await User.find(telegramId)

    return result ? formatUser(result) : result
  }

  async ban(messageId) {
    const req = await requestQuery.find(messageId)

    if (!req) return false

    const user = await User.find(Number(req.author_id))

    if (user.status === 'blocked') return false

    try {
      db.transaction(async trx => {
        await requestQuery.update(req.id, { status: 'closed_by_reply' }, trx)
        await User.update(req.author_id, { status: 'blocked' }, trx)
      })
    } catch (e) {
      throw new Error(e.message)
    }

    return req
  }

  async unban(messageId) {
    const req = await requestQuery.find(messageId)

    if (!req) return false

    const authorId = Number(req.author_id)
    const user = await User.find(authorId)

    if (user.status === 'active') return false

    await User.update(authorId, { status: 'active' })

    return req
  }
}

module.exports = new UsersQueryService
