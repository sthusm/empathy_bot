const Scene = require('telegraf/scenes/base')
const { EMPATHY_CHAT_ID } = require('./config.js')
const { 
  responseMenu,
  chooseGender,
  selectRequestType,
  selectPrivacy,
  inlineKeyboard,
} = require('./core/utils/buttons.js')
const { 
  requestTextGenerator,
  convertTime,
  closeRequest,
  clearSession,
} = require('./core/utils/helpers.js')
const { 
  ASK_REPLY,
  OFFER_REPLY,
  COMMUNICATION_REPLY,
} = require('./core/utils/phrases.js')
const userQuery = require('./core/query_service/users/users_query.js')
const requestQuery = require('./core/query_service/requests/requests_query.js')

class SceneGenerator {
  genHelpRequest () {
    const helpRequest = new Scene('helpRequest')

    helpRequest.enter(async ctx => {
      const req = await requestQuery.findUserActiveRequest(ctx.from.id)
      if (req) {
        ctx.session.activeRequest = true
        await ctx.scene.leave()
        return
      }
  
      const user = await userQuery.find(ctx.from.id)
      if (!user) return

      ctx.session.user = {
        username: ctx.from.username,
        ...user,
      }

      if (!user.gender) {
        ctx.session.genderChoosing = true
        await ctx.reply('Укажите Ваш пол', chooseGender())
      } else {
        await ctx.reply('Вы хотите предложить эмпатию или запросить?', selectRequestType())
        ctx.session.reqTypeChoosing = true
      }
    })
    helpRequest.hears(['👦 Мужчина', '👩 Женщина'], async ctx => {
      if (!ctx.session.genderChoosing) return

      let gender
      if (ctx.match === '👦 Мужчина') gender = 'male'
      else gender = 'female'

      await userQuery.update(ctx.session.user.telegramId, { gender })

      ctx.session.user.gender = gender
      await ctx.reply('Вы хотите предложить эмпатию или запросить?', selectRequestType())
      ctx.session.reqTypeChoosing = true
      delete ctx.session.genderChoosing
    })
    helpRequest.hears(['Предложить', 'Запросить', 'Просто пообщаться'], async ctx => {
      if (ctx.session.activeRequest) {
        await ctx.scene.leave()
        return
      }

      if (!ctx.session.reqTypeChoosing) return

      let messageText
      switch (ctx.match) {
        case 'Предложить':
          ctx.session.private = false
          ctx.session.reqType = 'offer'
          messageText = OFFER_REPLY
          break
        case 'Запросить':
          ctx.session.reqType = 'ask'
          messageText = ASK_REPLY
          break
        case 'Просто пообщаться':
          ctx.session.reqType = 'communication'
          messageText = COMMUNICATION_REPLY
          break
      }
      
      await ctx.reply(messageText, inlineKeyboard('Отменить'))

      delete ctx.session.reqTypeChoosing
    })
    helpRequest.hears(['Анонимно', 'Не анонимно'], async ctx => {
      if (ctx.session.activeRequest) {
        await ctx.scene.leave()
        return
      }

      if (!ctx.session.reqType || !ctx.session.message) return

      ctx.session.private = ctx.match === 'Анонимно'
      ctx.session.waitForTime = true

      await ctx.reply('Укажите время действия вашего запроса в часах (от 1 до 24).', inlineKeyboard('Отменить'))
    })
    helpRequest.hears('Отменить', async ctx => {
      if (ctx.session.activeRequest) return

      clearSession(ctx)

      ctx.session.forceExit = true

      await ctx.scene.leave()
    })
    helpRequest.hears(/^[-]?\d+$/, async ctx => {
      if (ctx.session.activeRequest) {
        await ctx.scene.leave()
        return
      }

      if (!ctx.session.waitForTime) return

      const duration = parseInt(ctx.message.text)
      if (duration > 24 || duration < 1) {
        await ctx.reply('Вы ввели некорректное число 😊')
        return
      }

      const mes = await ctx.telegram.sendMessage(
        EMPATHY_CHAT_ID,
        requestTextGenerator(ctx.session.message.text, ctx.session),
        responseMenu('👋 Откликнуться', ctx.session.message.chat.id)
      )

      const req = await requestQuery.create({
        messageId: mes.message_id,
        type: ctx.session.reqType,
        authorId: ctx.session.user.telegramId,
        private: ctx.session.private,
        duration,
      })

      clearSession(ctx)

      ctx.session.reqTimeout = setTimeout(
        closeRequest, 
        convertTime(duration), 
        ctx, 
        req[0],
        'closed_by_time',
        true
      )

      await ctx.scene.leave()
    })
    helpRequest.on('text', async ctx => {
      if (ctx.session.waitForTime) {
        await ctx.reply('Вы ввели некорректное значение 😊')
        return
      }

      if (
        !ctx.session.user || 
        !ctx.session.reqType || 
        ctx.session.message
      ) return
  
      const messageText = String(ctx.message.text)

      if (messageText && messageText.length >= 15) {
        ctx.session.message = ctx.message

        if (ctx.session.private === false) {
          ctx.session.waitForTime = true
          await ctx.reply('Укажите время действия вашего запроса в часах (от 1 до 24).', inlineKeyboard('Отменить'))
        } else {
          await ctx.reply('Как разместить ваш запрос?', selectPrivacy())
        }
      } else {
        await ctx.reply('Слишком короткий запрос, необходимо ввести хотя бы 15 символов')
      }
    })
    helpRequest.on('message', async ctx => ctx.reply('Пока что я понимаю только текст 😊'))
    helpRequest.leave(async ctx => {
      if (ctx.session.activeRequest) {
        await ctx.reply(
          'У вас есть действующий запрос на эмпатию. Закройте его, либо выберите человека, откликнувшегося на Ваш запрос.',
          responseMenu('Закрыть запрос', 'helpReqCancel')
        )
      } else if (ctx.session.forceExit) {
        await ctx.reply('Запрос отменён', inlineKeyboard('Начать заново'))
        delete ctx.session.forceExit
      } else {
        await ctx.reply(
          'Спасибо! Ваш запрос отправлен. Ожидайте пока кто-нибудь откликнется на него!',
          inlineKeyboard('Закрыть запрос')
        )
      }
    })

    return helpRequest
  }
}

module.exports = SceneGenerator
