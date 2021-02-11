const Telegraf = require('telegraf')
const {
  Stage,
  session,
} = Telegraf
const { 
  BOT_TOKEN, 
  EMPATHY_CHAT_ID,
  MONGO_URL,
} = require('./config.js')
const { 
  HELP_COMMAND,
  responseMenu,
  chooseGender,
} = require('./utils/buttons.js')
const bot = new Telegraf(BOT_TOKEN)
const User = require('./db/dao/user_query.js')
const MessageState = require('./db/dao/messageState_query.js')
const mongoose = require('mongoose')
const SceneGenerator = require('./scenes.js')
const sg = new SceneGenerator()

const helpRequest = sg.genHelpRequest
// const helpRequestHandler = sg.helpRequestHandler
//bot.use(Telegraf.log())

const stage = new Stage([helpRequest()])

bot.use(session())
bot.use(stage.middleware())

bot.start(async ctx => {
  if (ctx.message.chat.id !== ctx.from.id) return

  await ctx.reply(HELP_COMMAND, responseMenu('Начать', 'reqSceneStart'))
})
bot.command('changeGender', async ctx => {
  if (ctx.message.chat.id !== ctx.from.id) return

  await ctx.reply('Укажите Ваш пол', chooseGender())
})
bot.hears(['👦 Мужчина', '👩 Женщина'], async ctx => {
  if (ctx.message.chat.id !== ctx.from.id) return

  let gender
  if (ctx.match === '👦 Мужчина') gender = 'Male'
  else gender = 'Female'

  await User.update(ctx.update.message.from.id, { gender })
  await ctx.reply('Настройки успешно изменены!')
})
bot.on('text', async ctx => {
  if (ctx.message.chat.id !== ctx.from.id) return

  await ctx.reply(
    'Если тебе нужно найти того, кому можно высказаться, нажми на кнопку ниже', 
    responseMenu('Начать', 'reqSceneStart')
  )
})
bot.on('callback_query', async ctx => {
  const buttonValue = ctx.callbackQuery.message.reply_markup.inline_keyboard[0][0]?.callback_data

  // пересланное сообщение из чата
  if (String(ctx.callbackQuery.message.chat.id) === EMPATHY_CHAT_ID) {
    await ctx.answerCbQuery('Спасибо! Ваш отклик успешно отправлен!', true)
    const { username } = ctx.from

    if (!username) {
      await ctx.telegram.sendMessage(
        ctx.from.id,
        'Для того, чтобы человек мог с Вами связаться, пожалуйста, заполните в настройках аккаунта Telegram поле username'
      )
      return
    }

    // в buttonValue лежит id чата юзера, который отправил запрос
    await ctx.telegram.sendMessage(
      buttonValue, 
      `@${username} откликнулся на Ваше сообщение`, 
      responseMenu('🤝 Принять запрос', `helpReqCancel @${username}`)
    )
  } else if (buttonValue.includes('helpReqCancel')) {
    const ms = await MessageState.find(ctx.callbackQuery.from.id)
    const additionalInfo = buttonValue.replace('helpReqCancel ', '')

    if (!ms.messageId) {
      await ctx.answerCbQuery('Запрос уже и так закрыт =)', true)
      return
    } else if (additionalInfo.startsWith('@')) {
      ctx.answerCbQuery(
        `Вы приняли отклик от ${additionalInfo}. Напишите ему/ей в личные сообщения.`,
        true
      )
    } else {
      await ctx.answerCbQuery('Запрос закрыт!', true)
    }

    clearTimeout(ctx.session.reqTimeout)
    await ctx.telegram.sendMessage(
      EMPATHY_CHAT_ID,
      'Закрыто.',
      { reply_to_message_id: Number(ms.messageId) }
    )
    await ctx.telegram.editMessageReplyMarkup(EMPATHY_CHAT_ID, Number(ms.messageId))

    ctx.session.activeRequest = false
    await MessageState.createOrUpdate(ctx.callbackQuery.from.id, { messageId: null })
  } else if (buttonValue === 'reqSceneStart') {
    ctx.answerCbQuery()
    await ctx.scene.enter('helpRequest')
  }
})

async function start() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    bot.launch()
    console.log('The bot was successfully launched')
  } catch (e) {
    console.log('Server Error', e.message)
    process.exit(1)
  }
}

start()
