const { EMPATHY_CHAT_ID } = require('../../config.js')
const Requests = require('../../db/dao/requests/requests.js')
// в 1 минуте
const MILLISECOND = 60000

const genderMap = {
  'male': '👦',
  'female': '👩',
}

const reqTypeMap = {
  'offer': '🦒 Предложение эмпатии',
  'ask': '🌿 Запрос на эмпатию',
}

const requestTextGenerator = (message, data) => {
  return `${reqTypeMap[data.reqType]}.

${message}

${genderMap[data.user.gender]} ${data.private ? 'Анонимно' : `${data.user.name} @${data.user.username}`}
`
}

const convertTime = (minutes) => Number(minutes) * MILLISECOND

const closeRequest = async (ctx, req, status = 'closed_by_time', calledByTimeout) => {
  if (calledByTimeout) {
    const exist = await Requests.findUserActiveRequest(Number(req.author_id))

    if (!exist) return
  }

  await ctx.telegram.sendMessage(
    EMPATHY_CHAT_ID,
    'Закрыто.', 
    { reply_to_message_id: Number(req.message_id) }
  )
  await ctx.telegram.editMessageReplyMarkup(EMPATHY_CHAT_ID, Number(req.message_id))
  
  await Requests.update(req.id, { status })

  for (let prop in ctx.session) {
    if (prop === '__scenes') return

    delete ctx.session[prop]
  }
}

module.exports = {
  genderMap,
  requestTextGenerator,
  convertTime,
  closeRequest,
}
