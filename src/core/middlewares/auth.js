const usersQuery = require('../query_service/users/users_query')
const { EMPATHY_CHAT_ID } = require('../../config')
const { NOT_MEMBER_REPLY } = require('../utils/phrases')
const { logger } = require('../utils/pino')

module.exports = async (ctx, next) => {
  if (String(ctx.chat.id) === EMPATHY_CHAT_ID) return await next()

  try {
    const user = await usersQuery.find(ctx.from.id)

    if (user && user.status === 'blocked') {
      await ctx.reply('Вам запрещён доступ к боту!')
      return
    }
    
    const memberOfChat = await ctx.telegram.getChatMember(EMPATHY_CHAT_ID, ctx.from.id)

    if (memberOfChat?.status === 'left') {
      await ctx.reply(NOT_MEMBER_REPLY)
      return
    }

    await next()
  } catch (e) {
    logger.fatal(e)
    if (e.description === 'Bad Request: user not found') {
      await ctx.reply(NOT_MEMBER_REPLY)
    }
  }
}
