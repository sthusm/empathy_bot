const Scene = require('telegraf/scenes/base')
const { EMPATHY_CHAT_ID } = require('./config.js')
const { 
  responseMenu,
  chooseGender,
  selectRequestType,
  selectPrivacy,
} = require('./utils/buttons.js')
const User = require('./db/dao/user_query.js')
const MessageState = require('./db/dao/messageState_query.js')
const { 
  requestTextGenerator,
  convertTime,
} = require('./utils/helpers.js')

class SceneGenerator {
  genHelpRequest () {
    const helpRequest = new Scene('helpRequest')

    helpRequest.enter(async ctx => {
      if (ctx.session.activeRequest) {
        await ctx.scene.leave()
        return
      }
      ctx.session.enterScene = true
  
      const user = await User.findOrCreate({
        telegramId: ctx.from.id,
        name: ctx.from.first_name,
      })

      console.log(ctx.from)

      ctx.session.user = {
        username: ctx.from.username,
        ...user._doc,
      }

      if (!user.gender) {
        await ctx.reply('Укажите Ваш пол', chooseGender())
      } else await ctx.reply('Вы хотите предложить эмпатию или запросить?', selectRequestType())
    })
    helpRequest.hears(['👦 Мужчина', '👩 Женщина'], async ctx => {
      let gender
      if (ctx.match === '👦 Мужчина') gender = 'Male'
      else gender = 'Female'

      await User.update(ctx.session.user.telegramId, { gender })

      ctx.session.user.gender = gender
      await ctx.reply('Вы хотите предложить эмпатию или запросить?', selectRequestType())
    })
    helpRequest.hears(['Предложить', 'Запросить'], async ctx => {
      if (ctx.match === 'Предложить') {
        ctx.session.private = false
        ctx.session.reqType = '🦒 Предложение эмпатии'
      } else {
        ctx.session.reqType = '🌿 Запрос на эмпатию'
      }
      
      await ctx.reply('Введите наименование вашего запроса')
    })
    helpRequest.hears(['Анонимно', 'Не анонимно'], async ctx => {
      ctx.session.private = ctx.match === 'Анонимно'
      ctx.session.waitForTime = true

      await ctx.reply('Укажите время действия вашего запроса в минутах (но не больше 60 минут).')
    })
    helpRequest.hears(/^[-]?\d+$/, async ctx => {
      if (!ctx.session.waitForTime) return
      const duration = Number(ctx.message.text)
      if (duration > 60 || duration < 0) {
        await ctx.reply('Вы ввели не корректное число =)')
        return
      }

      const mes = await ctx.telegram.sendMessage(
        EMPATHY_CHAT_ID,
        requestTextGenerator(ctx.session.message.text, ctx.session),
        responseMenu('👋 Откликнуться', ctx.session.message.chat.id)
      )

      await MessageState.createOrUpdate(
        ctx.session.user.telegramId, 
        { messageId: mes.message_id }
      )

      ctx.session.reqTimeout = setTimeout(async () => {
        await ctx.telegram.sendMessage(
          EMPATHY_CHAT_ID,
          'Закрыто.', 
          { reply_to_message_id: Number(mes.message_id) }
        )
        await ctx.telegram.editMessageReplyMarkup(EMPATHY_CHAT_ID, Number(mes.message_id))
      }, convertTime(duration))

      ctx.session.activeRequest = true
      delete ctx.session.waitForTime

      await ctx.scene.leave()
    })
    helpRequest.on('text', async ctx => {
      if (!ctx.session.user || !ctx.session.reqType || ctx.session.waitForTime) return
  
      const messageText = String(ctx.message.text)

      if (messageText && messageText.length >= 5) {
        ctx.session.message = ctx.message

        if (ctx.session.private === false) {
          ctx.session.waitForTime = true
          await ctx.reply('Укажите время действия вашего запроса в минутах (но не больше 60 минут).')
        } else {
          await ctx.reply('Как разместить ваш запрос?', selectPrivacy())
        }
      } else {
        await ctx.reply('Слишком короткий запрос, необходимо ввести хотя бы 5 символов')
      }
    })
    helpRequest.on('message', async ctx => ctx.reply('Пока что я понимаю только текст =)'))
    helpRequest.leave(async ctx => {
      if (ctx.session.activeRequest && !ctx.session.enterScene) {
        await ctx.reply(
          'У вас есть действующий запрос на эмпатию. Закройте его, либо выберите человека, откликнувшегося на Ваш запрос.',
          responseMenu('Закрыть запрос', 'helpReqCancel')
        )
      } else {
        await ctx.reply('Спасибо! Ваш запрос отправлен. Ожидайте пока кто-нибудь откликнется на него!')
      }
  
      ctx.session.enterScene = false
    })

    return helpRequest
  }

  helpRequestHandler () {
    const helpReqHandler = new Scene('helpReqHandler')

    helpReqHandler.enter(async ctx => {
      await ctx.telegram.sendCopy(ctx.scene.state.chatWhereHelpWasRequested, {
        id: ctx.scene.state.message.message_id,
        text: `@${ctx.scene.state.from.username} откликнулся на Ваше сообщение`,
      }, responseMenu('Принять запрос', 'helpReqCancel'))
    })

    helpReqHandler.on('callback_query', async ctx => {
      ctx.answerCbQuery()
    })
    helpReqHandler.on('text', async ctx => ctx.reply('text'))

    return helpReqHandler
  }
}

module.exports = SceneGenerator
