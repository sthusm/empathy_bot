const Telegraf = require('telegraf')
const { logger } = require('./core/utils/pino')
const auth = require('./core/middlewares/auth')
const {
  Stage,
  session,
} = Telegraf
const { 
  BOT_TOKEN,
} = require('./config')
const { 
  responseMenu,
  chooseGender,
  inlineKeyboard,
} = require('./core/utils/buttons')
const { 
  START_PHRASE,
  HELP_PHRASE,
} = require('./core/utils/phrases')
const { 
  closeRequest,
} = require('./core/utils/helpers')
const bot = new Telegraf(BOT_TOKEN)
const userQuery = require('./core/query_service/users/users_query')
const requestQuery = require('./core/query_service/requests/requests_query')
const botCallbacks = require('./core/callbacks/bot')
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
bot.command('update_profile', async ctx => {
  if (ctx.message.chat.id !== ctx.from.id) return

  await userQuery.update(ctx.from.id, {
    name: ctx.from.first_name || null,
    surname: ctx.from.last_name || null,
  })

  await ctx.reply('Твой профиль успешно обновлён!')
})
bot.command('welcome_msg', botCallbacks.welcomeMessage)
bot.command('change_gender', async ctx => {
  if (ctx.message.chat.id !== ctx.from.id) return

  await ctx.reply('Укажи твой пол', chooseGender())
})
bot.hears(['👦 Мужчина', '👩 Женщина'], async ctx => {
  if (ctx.message.chat.id !== ctx.from.id) return

  let gender
  if (ctx.match === '👦 Мужчина') gender = 'male'
  else gender = 'female'

  await userQuery.update(ctx.update.message.from.id, { gender })
  await ctx.reply('Настройки успешно изменены!', inlineKeyboard('Начать'))
})
bot.hears('ban!', botCallbacks.ban)
bot.hears('unban!', botCallbacks.unban)
bot.hears(['Начать заново', 'Начать'], async ctx => {
  if (ctx.message.chat.id !== ctx.from.id) return

  await ctx.scene.enter('helpRequest')
})
bot.hears('Закрыть запрос', async ctx => {
  if (ctx.message.chat.id !== ctx.from.id) return

  const req = await requestQuery.findUserActiveRequest(ctx.from.id)

  if (!req || req.status !== 'active') {
    await ctx.reply('Запрос уже закрыт 😊', inlineKeyboard('Начать'))

    return
  }

  await ctx.reply('Запрос закрыт!', inlineKeyboard('Начать'))
  clearTimeout(ctx.session.reqTimeout)

  await closeRequest(ctx, req, 'closed_by_author')
})
bot.on('text', botCallbacks.textHandler)
bot.on('message', botCallbacks.messageHandler)
bot.on('callback_query', botCallbacks.cbQueryHandler)

async function start() {
  try {
    await bot.launch()
    await requestQuery.activatePendingRequests(bot)
    logger.info('The bot was successfully launched')
  } catch (e) {
    logger.fatal(e.message)
    process.exit(1)
  }
}

start()
