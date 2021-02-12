// const db = require('../../../db/db.js')
const User = require('../../../db/dao/users/users.js')

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
}

module.exports = new UsersQueryService
