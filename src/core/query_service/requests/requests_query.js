const Requests = require('../../../db/dao/requests/requests.js')

const formatInsertData = data => {
  return {
    message_id: data.messageId,
    type: data.type,
    status: data.status,
    author_id: data.authorId,
    private: data.private,
  }
}

class RequestsQueryService {
  async create(data) {
    return await Requests.create(formatInsertData(data))
  }

  async update(id, changes) {
    return await Requests.update(id, formatInsertData(changes))
  }

  async find(messageId) {
    return await Requests.findByMessage(messageId)
  }

  async findUserActiveRequest(userId) {
    return await Requests.findUserActiveRequest(userId)
  }
}

module.exports = new RequestsQueryService
