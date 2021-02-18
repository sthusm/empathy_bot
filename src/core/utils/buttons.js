const Extra = require('telegraf/extra')

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

const inlineKeyboard = (text) => {
  return Extra
    .markup(m =>
      m
        .keyboard([
          m.button(text),
        ])
        .resize()
        .oneTime()
    )
}

module.exports = {
  responseMenu,
  chooseGender,
  selectRequestType,
  selectPrivacy,
  inlineKeyboard,
}
