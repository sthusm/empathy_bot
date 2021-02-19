const Telegraf = require('telegraf')
const auth = require('./core/middlewares/auth')
const {
  Stage,
  session,
} = Telegraf
const { 
  BOT_TOKEN,
  EMPATHY_CHAT_ID,
} = require('./config')
const { 
  responseMenu,
  chooseGender,
} = require('./core/utils/buttons')
const { 
  START_PHRASE,
  HELP_PHRASE, 
} = require('./core/utils/phrases')
const { closeRequest } = require('./core/utils/helpers')
const bot = new Telegraf(BOT_TOKEN)
const userQuery = require('./core/query_service/users/users_query')
const requestQuery = require('./core/query_service/requests/requests_query')
const responseQuery = require('./core/query_service/responses/responses_query')
const SceneGenerator = require('./scenes')
const sg = new SceneGenerator()

const helpRequest = sg.genHelpRequest

const stage = new Stage([helpRequest()])

bot.use(session())
bot.use(stage.middleware())
bot.use(auth)

bot.start(async ctx => {
  const telegramId = ctx.from.id
  if (ctx.message.chat.id !== telegramId) return

  const tgUser = await userQuery.find(telegramId)
  if (!tgUser) await userQuery.create({
    telegramId,
    name: ctx.from.first_name,
    surname: ctx.from.last_name,
  })

  await ctx.reply(START_PHRASE, responseMenu('Начать', 'reqSceneStart'))
})
bot.help(async ctx => {
  if (ctx.message.chat.id !== ctx.from.id) return

  await ctx.reply(HELP_PHRASE)
})
bot.command('updateProfile', async ctx => {
  if (ctx.message.chat.id !== ctx.from.id) return

  await userQuery.update(ctx.from.id, {
    name: ctx.from.first_name || null,
    surname: ctx.from.last_name || null,
  })

  await ctx.reply('Ваш профиль успешно обновлён!')
})
bot.command('changeGender', async ctx => {
  if (ctx.message.chat.id !== ctx.from.id) return

  await ctx.reply('Укажите Ваш пол', chooseGender())
})
bot.hears(['👦 Мужчина', '👩 Женщина'], async ctx => {
  if (ctx.message.chat.id !== ctx.from.id) return

  let gender
  if (ctx.match === '👦 Мужчина') gender = 'male'
  else gender = 'female'

  await userQuery.update(ctx.update.message.from.id, { gender })
  await ctx.reply('Настройки успешно изменены!')
})
bot.hears('ban!', async ctx => {
  if (String(ctx.chat.id) !== EMPATHY_CHAT_ID) return
  const user = await ctx.telegram.getChatMember(EMPATHY_CHAT_ID, ctx.from.id)

  if (user.status !== 'creator' || user.status !== 'administrator') return

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
})
bot.hears('unban!', async ctx => {
  if (String(ctx.chat.id) !== EMPATHY_CHAT_ID) return

  const user = await ctx.telegram.getChatMember(EMPATHY_CHAT_ID, ctx.from.id)

  if (user.status !== 'creator' || user.status !== 'administrator') return

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
})
bot.on('text', async ctx => {
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
})
bot.on('callback_query', async ctx => {
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
        'Для того, чтобы человек мог с Вами связаться, пожалуйста, заполните в настройках аккаунта Telegram поле username',
        true
      )

      return
    }

    // в buttonValue лежит id юзера, который отправлял запрос
    const req = await requestQuery.findUserActiveRequest(Number(buttonValue))

    if (!req) return

    const userAlreadyReplyed = await responseQuery.findUserReply(ctx.from.id, req.id)

    if (userAlreadyReplyed) {
      message = 'Вы уже откликнулись на этот запрос!'
    } else {
      await ctx.telegram.sendMessage(
        buttonValue, 
        `@${username} откликнулся на Ваше сообщение`, 
        responseMenu('🤝 Принять запрос', `helpReqCancel @${username}`)
      )
      await responseQuery.create({
        requestId: req.id,
        responserId: ctx.from.id,
      })
      message = 'Спасибо! Ваш отклик успешно отправлен!'
    }

    await ctx.answerCbQuery(message, true)
  } else if (buttonValue.includes('helpReqCancel')) {
    const req = await requestQuery.findUserActiveRequest(ctx.callbackQuery.from.id)
    const additionalInfo = buttonValue.replace('helpReqCancel ', '')
    let status = ''

    if (!req || req.status !== 'active') {
      await ctx.answerCbQuery('Запрос уже закрыт 😊', true)
      return
    } else if (additionalInfo.startsWith('@')) {
      await ctx.answerCbQuery(
        `Вы приняли отклик от ${additionalInfo}. Напишите ему/ей в личные сообщения.`,
        true
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
})

async function start() {
  try {
    await bot.launch()
    await requestQuery.activatePendingRequests(bot)
    console.log('The bot was successfully launched')
  } catch (e) {
    console.log('Server Error', e.message)
    process.exit(1)
  }
}

start()
