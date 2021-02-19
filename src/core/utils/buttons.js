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
          m.button('👦 Мужчина'),
          m.button('👩 Женщина'),
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
          m.button('Предложить'),
          m.button('Запросить'),
          m.button('Просто пообщаться'),
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
          m.button('Анонимно'),
          m.button('Не анонимно'),
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
