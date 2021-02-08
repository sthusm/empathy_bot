const Scene = require('telegraf/scenes/base')
const { EMPATHY_CHAT_ID } = require('./config.js')
const { 
  responseMenu,
  chooseGender,
  selectRequestType,
  selectPrivacy,
} = require('./utils/buttons.js')
const User = require('./db/dao/user_query.js')
const { requestTextGenerator } = require('./utils/helpers.js')

class SceneGenerator {
  genHelpRequest () {
    const helpRequest = new Scene('helpRequest')

    helpRequest.enter(async ctx => {
      const telegramId = ctx.from.id

      const user = await User.findOrCreate(telegramId)

      
      ctx.session.user = {
        username: ctx.from.username,
        ...user._doc,
      }

      if (!user.gender) {
        await ctx.reply('Укажите Ваш пол', chooseGender())
      } else await ctx.reply('Вы хотите предложить эмпатию или запросить?', selectRequestType())

      // await ctx.reply('Как разместить ваш запрос?', selectPrivacy())
    })
    helpRequest.on('text', async ctx => {
      const messageText = String(ctx.message.text)

      if (messageText && messageText.length > 5) {
        if (ctx.session.private === false) {
          await ctx.telegram.sendCopy(EMPATHY_CHAT_ID, {
            id: ctx.message.message_id,
            text: requestTextGenerator(messageText, ctx.session),
          }, responseMenu('Откликнуться', ctx.message.chat.id))
          await ctx.scene.leave()
        } else {
          ctx.session.message = ctx.message
          await ctx.reply('Как разместить ваш запрос?', selectPrivacy())
        }
      } else {
        await ctx.reply('Слишком короткий запрос, необходимо ввести хотя бы 5 символов')
      }
    })
    helpRequest.on('message', async ctx => ctx.reply('Пока что я понимаю только текст =)'))
    helpRequest.action(['Male', 'Female'], async ctx => {
      const gender = ctx.match

      await User.update(ctx.session.user.telegramId, { gender })

      ctx.session.user.gender = gender
      await ctx.reply('Вы хотите предложить эмпатию или запросить?', selectRequestType())
    })
    helpRequest.action(['Offer', 'Ask'], async ctx => {
      if (ctx.match === 'Offer') {
        ctx.session.private = false
        ctx.session.reqType = 'Предложение эмпатии'
      } else {
        ctx.session.reqType = 'Запрос на эмпатию'
      }
      
      await ctx.reply('Введите наименование вашего запроса')
    })
    helpRequest.action(['Private', 'Public'], async ctx => {
      ctx.session.private = ctx.match === 'Private'

      await ctx.telegram.sendCopy(EMPATHY_CHAT_ID, {
        id: ctx.session.message.message_id,
        text: requestTextGenerator(ctx.session.message.text, ctx.session),
      }, responseMenu('Откликнуться', ctx.session.message.chat.id))
      await ctx.scene.leave()
    })
    helpRequest.leave(ctx => ctx.reply('Спасибо! Ваш запрос отправлен. Ожидайте пока кто-нибудь откликнется на него!'))

    return helpRequest
  }

  helpRequestHandler () {
    const helpReqHandler = new Scene('helpReqHandler')

    helpReqHandler.enter(async ctx => {
      await ctx.telegram.sendCopy(ctx.scene.state.chatWhereHelpWasRequested, {
        id: ctx.scene.state.message.message_id,
        text: `@${ctx.scene.state.from.username} откликнулся на Ваше сообщение`,
      }, responseMenu('Принять запрос'))
    })

    helpReqHandler.on('callback_query', async ctx => {
      ctx.answerCbQuery()

      console.log(ctx.scene.state)
    })
    helpReqHandler.on('text', async ctx => ctx.reply('text'))

    return helpReqHandler
  }
}

module.exports = SceneGenerator
