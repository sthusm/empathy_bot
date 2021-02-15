const Scene = require('telegraf/scenes/base')
const { EMPATHY_CHAT_ID } = require('./config.js')
const { 
  responseMenu,
  chooseGender,
  selectRequestType,
  selectPrivacy,
} = require('./core/utils/buttons.js')
const userQuery = require('./core/query_service/users/users_query.js')
const requestQuery = require('./core/query_service/requests/requests_query.js')
const { 
  requestTextGenerator,
  convertTime,
  closeRequest,
} = require('./core/utils/helpers.js')
const { 
  ASK_REPLY,
  OFFER_REPLY,
} = require('./core/utils/phrases.js')
class SceneGenerator {
  genHelpRequest () {
    const helpRequest = new Scene('helpRequest')

    helpRequest.enter(async ctx => {
      const req = await requestQuery.findUserActiveRequest(ctx.from.id)
      for (let pror in ctx.session) console.log('pr', pror === '__scenes')
      console.log('rrreeeqqq:', ctx.session)
      if (req || ctx.session.activeRequest) {
        ctx.session.activeRequest = true
        await ctx.scene.leave()
        return
      }
      ctx.session.enterScene = true
  
      const user = await userQuery.find(ctx.from.id)
      if (!user) return

      console.log(ctx.from)

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
    helpRequest.hears(['Предложить', 'Запросить'], async ctx => {
      if (ctx.session.activeRequest) {
        await ctx.scene.leave()
        return
      }

      if (!ctx.session.reqTypeChoosing) return

      let messageText
      if (ctx.match === 'Предложить') {
        ctx.session.private = false
        ctx.session.reqType = 'offer'
        messageText = OFFER_REPLY
      } else {
        ctx.session.reqType = 'ask'
        messageText = ASK_REPLY
      }
      
      await ctx.reply(messageText, { parse_mode: 'HTML' })
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

      await ctx.reply('Укажите время действия вашего запроса в минутах (но не больше 60 минут).')
    })
    helpRequest.hears(/^[-]?\d+$/, async ctx => {
      if (ctx.session.activeRequest) {
        await ctx.scene.leave()
        return
      }

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

      const req = await requestQuery.create({
        messageId: mes.message_id,
        type: ctx.session.reqType,
        authorId: ctx.session.user.telegramId,
        private: ctx.session.private,
        duration,
      })

      ctx.session.reqTimeout = setTimeout(closeRequest, convertTime(duration), ctx, req[0])

      ctx.session.activeRequest = true
      delete ctx.session.waitForTime

      await ctx.scene.leave()
    })
    helpRequest.on('text', async ctx => {
      if (
        !ctx.session.user || 
        !ctx.session.reqType || 
        ctx.session.waitForTime || 
        ctx.session.message
      ) return
  
      const messageText = String(ctx.message.text)

      if (messageText && messageText.length >= 15) {
        ctx.session.message = ctx.message

        if (ctx.session.private === false) {
          ctx.session.waitForTime = true
          await ctx.reply('Укажите время действия вашего запроса в минутах (но не больше 60 минут).')
        } else {
          await ctx.reply('Как разместить ваш запрос?', selectPrivacy())
        }
      } else {
        await ctx.reply('Слишком короткий запрос, необходимо ввести хотя бы 15 символов')
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
}

module.exports = SceneGenerator
