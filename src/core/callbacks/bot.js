const { EMPATHY_CHAT_ID } = require('../../config')
const { WELCOME_MSG_REPLY } = require('../utils/phrases')
const dmQuery = require('../query_service/default_messages/dm_query')
const userQuery = require('../query_service/users/users_query')
const responseQuery = require('../query_service/responses/responses_query')
const requestQuery = require('../query_service/requests/requests_query')
const redisClient = require('../redis/client')
const { 
  NEW_USER_JOINED_DELAY,
  closeRequest,
  userFullname,
} = require('../utils/helpers') 
const { 
  responseMenu,
  inlineKeyboard,
} = require('../utils/buttons')

const welcomeMessage = async ctx => {
  if (String(ctx.chat.id) === EMPATHY_CHAT_ID) return

  const user = await ctx.telegram.getChatMember(EMPATHY_CHAT_ID, ctx.from.id)
  
  if (user.status === 'creator' || user.status === 'administrator') {
    const text = ctx.message.text.replace('/welcome_msg ', '')

    if (text.startsWith('/welcome_msg')) {
      await ctx.reply(WELCOME_MSG_REPLY)
      
      return
    }

    if (text === 'disable') {
      await dmQuery.updateBy({ type: 'welcome_msg' }, { status: 'disabled' })
      await ctx.reply('Приветственное сообщение успешно отключено!')
      
      return
    }

    if (text === 'enable') {
      await dmQuery.updateBy({ type: 'welcome_msg' }, { status: 'active' })
      await ctx.reply('Приветственное сообщение успешно включено!')
      
      return
    }

    await dmQuery.updateBy({ type: 'welcome_msg' }, { text })
    await ctx.reply('Приветственное сообщение успешно обновлено!')
  }
}

const ban = async ctx => {
  if (String(ctx.chat.id) !== EMPATHY_CHAT_ID) return
  const user = await ctx.telegram.getChatMember(EMPATHY_CHAT_ID, ctx.from.id)

  if (user.status === 'creator' || user.status === 'administrator') {
    const messageId = ctx.message?.reply_to_message?.message_id
  
    if (messageId) {
      const res = await userQuery.ban(messageId)
  
      if (res) {
        await ctx.telegram.kickChatMember(EMPATHY_CHAT_ID, Number(res.author_id))
        await ctx.telegram.sendMessage(
          EMPATHY_CHAT_ID,
          'Автору запроса запрещён доступ к боту Мотя и чату Эмпатии.', 
          { reply_to_message_id: Number(messageId) }
        )
  
        if (res.status === 'active') {
          await ctx.telegram.editMessageReplyMarkup(EMPATHY_CHAT_ID, Number(messageId))
        }
      }
    }
  }
}

const unban = async ctx => {
  if (String(ctx.chat.id) !== EMPATHY_CHAT_ID) return

  const user = await ctx.telegram.getChatMember(EMPATHY_CHAT_ID, ctx.from.id)

  if (user.status === 'creator' || user.status === 'administrator') {
    const messageId = ctx.message?.reply_to_message?.message_id
  
    if (messageId) {
      const res = await userQuery.unban(messageId)
  
      if (res) {
        await ctx.telegram.unbanChatMember(EMPATHY_CHAT_ID, Number(res.author_id))
        await ctx.telegram.sendMessage(
          EMPATHY_CHAT_ID,
          'Автору запроса восстановлен доступ к боту Мотя и чату Эмпатии.', 
          { reply_to_message_id: Number(messageId) }
        )
      }
    }
  }
}

const textHandler = async ctx => {
  if (ctx.message.chat.id !== ctx.from.id) return
  
  const activeReq = await requestQuery.findUserActiveRequest(ctx.from.id)

  if (activeReq) {
    await ctx.scene.enter('helpRequest')

    return
  }

  await ctx.reply(
    'Если тебе нужно найти того, кому можно высказаться, нажми на кнопку ниже', 
    responseMenu('Начать', 'reqSceneStart')
  )
}

const messageHandler = async ctx => {
  if (String(ctx.chat.id) !== EMPATHY_CHAT_ID) return
  
  const newUser = ctx.message?.new_chat_member

  if (newUser) {
    const userDelayActive = await redisClient.getAsync('delay')
    if (userDelayActive) return

    const welcomeMes = await dmQuery.findBy({ type: 'welcome_msg' })
    if (!welcomeMes) return

    const mes = await ctx.telegram.sendMessage(
      EMPATHY_CHAT_ID,
      welcomeMes.text
    )

    redisClient.set('delay', 'true')
    redisClient.expire('delay', (NEW_USER_JOINED_DELAY / 1000))

    setTimeout(async (ctx, mes) => {
      await ctx.telegram.deleteMessage(EMPATHY_CHAT_ID, mes.message_id)
    }, NEW_USER_JOINED_DELAY, ctx, mes)
  }
}

const cbQueryHandler = async ctx => {
  const buttonValue = ctx.callbackQuery.message.reply_markup.inline_keyboard[0][0]?.callback_data

  // пересланное сообщение из чата
  if (String(ctx.callbackQuery.message.chat.id) === EMPATHY_CHAT_ID) {
    const user = await userQuery.find(ctx.from.id)
    if (!user) {
      await ctx.answerCbQuery(
        'Для того, чтобы откликаться на сообщения, напиши /start в чат с ботом Мотя 😊',
        true
      )

      return
    }

    const { username } = ctx.from
    let message = ''

    if (!username) {
      await ctx.answerCbQuery(
        'Для того, чтобы человек мог с тобой связаться, пожалуйста, заполни в настройках аккаунта Telegram поле username',
        true
      )

      return
    }

    // в buttonValue лежит id юзера, который отправлял запрос
    const req = await requestQuery.findUserActiveRequest(Number(buttonValue))

    if (!req) return

    const userAlreadyReplyed = await responseQuery.findUserReply(ctx.from.id, req.id)

    if (userAlreadyReplyed) {
      message = 'Ты уже откликнулся на этот запрос!'
    } else {
      await ctx.telegram.sendMessage(
        buttonValue, 
        `@${username} откликнулся/откликнулась на твоё сообщение`, 
        responseMenu('🤝 Принять запрос', `helpReqCancel userdata: ${userFullname(ctx.from)} @${username}`)
      )
      await responseQuery.create({
        requestId: req.id,
        responserId: ctx.from.id,
      })
      message = 'Спасибо! Твой отклик успешно отправлен!'
    }

    await ctx.answerCbQuery(message, true)
  } else if (buttonValue.includes('helpReqCancel')) {
    const req = await requestQuery.findUserActiveRequest(ctx.callbackQuery.from.id)
    const additionalInfo = buttonValue.replace('helpReqCancel ', '')
    let status = ''

    if (!req || req.status !== 'active') {
      await ctx.answerCbQuery('Запрос уже закрыт 😊', true)
      return
    } else if (additionalInfo.startsWith('userdata:')) {
      await ctx.answerCbQuery()
      const userInfo = additionalInfo.replace('userdata: ', '')

      await ctx.reply(
        `Твой запрос закрыт. Ты принял(а) отклик от ${userInfo}. Напиши ему/ей личное сообщение.`,
        inlineKeyboard('Начать')
      )
      status = 'closed_by_reply'
    } else {
      status = 'closed_by_author'
      await ctx.answerCbQuery('Запрос закрыт!', true)
    }

    clearTimeout(ctx.session.reqTimeout)

    await closeRequest(ctx, req, status)
  } else if (buttonValue === 'reqSceneStart') {
    await ctx.answerCbQuery()
    await ctx.scene.enter('helpRequest')
  }
}

module.exports = {
  welcomeMessage,
  ban,
  unban,
  messageHandler,
  cbQueryHandler,
  textHandler,
}