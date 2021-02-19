const { EMPATHY_CHAT_ID } = require('../../config.js')
const Requests = require('../../db/dao/requests/requests.js')

// в 1 часе
const MILLISECOND = 3600000

const genderMap = {
  'male': '👦',
  'female': '👩',
}

const reqTypeMap = {
  'offer': '🦒 Предложение эмпатии',
  'ask': '🌿 Запрос на эмпатию',
  'communication': '💬 Ищу собеседника',
}

const userFullname = user => {
  let fullname = ''

  if (user.name) fullname += user.name
  if (user.surname) fullname +=  fullname.length ? ` ${user.surname}` : user.surname

  return fullname
}

const requestTextGenerator = (message, data) => {
  return `${reqTypeMap[data.reqType]}.

${message}

${genderMap[data.user.gender]} ${data.private ? 'Анонимно' : `${userFullname(data.user)} @${data.user.username}`}
`
}

const convertTime = (hours) => Number(hours) * MILLISECOND

const clearSession = ctx => {
  for (let prop in ctx.session) {
    if (prop === '__scenes') continue

    delete ctx.session[prop]
  }
}

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

  clearSession(ctx)
}

const formatAlterTableEnumSql = (
  tableName,
  columnName,
  enums
) => {
  const constraintName = `${tableName}_${columnName}_check`

  return [
    `ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${constraintName};`,
    `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} CHECK (${columnName} = ANY (ARRAY['${enums.join("'::text, '")}'::text]));`,
  ].join('\n')
}

module.exports = {
  genderMap,
  requestTextGenerator,
  convertTime,
  closeRequest,
  clearSession,
  formatAlterTableEnumSql,
}
