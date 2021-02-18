const usersQuery = require('../query_service/users/users_query')
const { EMPATHY_CHAT_ID } = require('../../config')

module.exports = async (ctx, next) => {
  if (String(ctx.chat.id) === EMPATHY_CHAT_ID) return await next()

  try {
    const user = await usersQuery.find(ctx.from.id)

    if (user && user.status === 'blocked') {
      await ctx.reply('Вам запрещён доступ к боту!')
      return
    }

    await next()
  } catch (e) {
    console.log(e)
  }
}