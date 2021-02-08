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
} = require('./utils/buttons.js')
const bot = new Telegraf(BOT_TOKEN)
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

  await ctx.reply(HELP_COMMAND, responseMenu('Начать'))
})
bot.on('text', async ctx => {
  if (ctx.message.chat.id !== ctx.from.id) return

  await ctx.reply('Если тебе нужно найти того, кому можно высказаться, нажми на кнопку ниже', responseMenu('Начать'))
})
bot.command('reqHelp', async ctx => {
  if (ctx.message.chat.id !== ctx.from.id) return

  await ctx.scene.enter('helpRequest')
})
bot.on('callback_query', async ctx => {
  // отвечаем телеграму что получили от него запрос
  ctx.answerCbQuery()

  const keyboard = ctx.callbackQuery.message.reply_markup.inline_keyboard[0][0]

  // пересланное сообщение из чата
  if (String(ctx.callbackQuery.message.chat.id) === EMPATHY_CHAT_ID) {
    let chatWhereHelpWasRequested = keyboard.callback_data
    let { username } = ctx.from

    if (!username) {
      ctx.telegram.sendMessage(
        ctx.from.id,
        'Для того, чтобы человек мог с Вами связаться, пожалуйста, заполните в настройках аккаунта Telegram поле username'
      )
      return
    }

    await ctx.telegram.sendCopy(chatWhereHelpWasRequested, {
      id: ctx.callbackQuery.message.message_id,
      text: `@${username} откликнулся на Ваше сообщение`,
    })

    // ctx.scene.enter('helpReqHandler', {
    //   chatWhereHelpWasRequested,
    //   from: ctx.from,
    //   message: ctx.callbackQuery.message
    // })
  } else {
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
