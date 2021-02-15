const moment = require('moment')
const Requests = require('../../../db/dao/requests/requests.js')
const {
  convertTime,
  closeRequest,
} = require('../../utils/helpers')

const formatInsertData = data => {
  return {
    message_id: data.messageId,
    type: data.type,
    status: data.status,
    author_id: data.authorId,
    duration: data.duration,
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

  async activatePendingRequests(ctx) {
    try {
      const activeReqs = await Requests.findAllActiveRequests()
      activeReqs.forEach(async req => {
        const expirationTime = moment(req.created_at).add(Number(req.duration), 'minutes')
        const now = moment()
  
        if (now.isBefore(expirationTime)) {
          const restOfMinutes = expirationTime.diff(now, 'minutes')

          setTimeout(
            closeRequest, 
            convertTime(restOfMinutes), 
            ctx, 
            req,
            'closed_by_time',
            true
          )
        } else {
          await closeRequest(ctx, req)
        }
      })
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = new RequestsQueryService
