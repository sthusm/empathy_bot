const Extra = require('telegraf/extra')

const HELP_COMMAND = `
  Привет! Я бот для эмпатии. Через меня можно отправить анонимный или не анонимный запрос на эмпатию или опубликовать предложение эмпатии. 
  Твое сообщение от имени бота появится в чате Кафе Эмпатии @empathycafe. 
  Сюда будут пересылаться сообщения всех, кто откликнулся и ты сможешь выбрать того, кто ближе твоему сердцу в данный момент никого при этом не обидев.
`

const responseMenu = (buttonText, buttonValue = '0') => {
  return Extra
    .markup(m =>
      m.inlineKeyboard([
        m.callbackButton(buttonText, String(buttonValue)),
      ])
    )
}

const chooseGender = () => {
  return Extra
    .markup(m => 
      m
        .keyboard([
          m.callbackButton('👦 Мужчина', 'Male'),
          m.callbackButton('👩 Женщина', 'Female'),
        ])
        .resize()
        .oneTime()
    )
}

const selectRequestType = () => {
  return Extra
    .markup(m =>
      m
        .keyboard([
          m.callbackButton('Предложить', 'Offer'),
          m.callbackButton('Запросить', 'Ask'),
        ])
        .resize()
        .oneTime()
    )
}

const selectPrivacy = () => {
  return Extra
    .markup(m =>
      m
        .keyboard([
          m.callbackButton('Анонимно', 'Private'),
          m.callbackButton('Не анонимно', 'Public'),
        ])
        .resize()
        .oneTime()
    )
}

module.exports = {
  HELP_COMMAND,
  responseMenu,
  chooseGender,
  selectRequestType,
  selectPrivacy,
}
