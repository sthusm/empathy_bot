const DefaultMessages = require('../../../db/dao/default_messages/default_messages.js')

const formatInsertData = data => {
  return {
    text: data.text,
    type: data.type,
    status: data.status,
  }
}

class DefaultMessagesQueryService {
  async create(data) {
    return await DefaultMessages.create(formatInsertData(data))
  }

  async updateBy(row, changes) {
    return await DefaultMessages.updateBy(row, formatInsertData(changes))
  }

  async findBy(row) {
    return await DefaultMessages.findBy(row)
  }
}

module.exports = new DefaultMessagesQueryService
