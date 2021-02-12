const Responses = require('../../../db/dao/responses/responses.js')

const formatInsertData = data => {
  return {
    request_id: data.requestId,
    responser_id: data.responserId,
  }
}

class ResponsesQueryService {
  async create(data) {
    return await Responses.create(formatInsertData(data))
  }

  async update(id, changes) {
    return await Responses.update(id, formatInsertData(changes))
  }

  async findUserReply(userId, reqId) {
    return await Responses.findReply(userId, reqId)
  }
}

module.exports = new ResponsesQueryService
