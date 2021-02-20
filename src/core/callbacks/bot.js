// const { EMPATHY_CHAT_ID } = require('../../config')

// const welcomeMessage = async ctx => {
//   if (String(ctx.chat.id) === EMPATHY_CHAT_ID) return

//   const user = await ctx.telegram.getChatMember(EMPATHY_CHAT_ID, ctx.from.id)
  
//   if (user.status === 'creator' || user.status === 'administrator') {
//     const text = ctx.message.text.replace('/welcome_msg ', '')

//     if (text.startsWith('/welcome_msg')) {
//       await ctx.reply(WELCOME_MSG_REPLY)
      
//       return
//     }

//     if (text === 'disable') {
//       await dmQuery.updateBy({ type: 'welcome_msg' }, { status: 'disabled' })
//       await ctx.reply('Приветственное сообщение успешно отключено!')
      
//       return
//     }

//     if (text === 'enable') {
//       await dmQuery.updateBy({ type: 'welcome_msg' }, { status: 'active' })
//       await ctx.reply('Приветственное сообщение успешно включено!')
      
//       return
//     }

//     await dmQuery.updateBy({ type: 'welcome_msg' }, { text })
//     await ctx.reply('Приветственное сообщение успешно обновлено!')
//   }
// }