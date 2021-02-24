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
          m.button('Отменить'),
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
          m.button('Отменить'),
        ])
        .resize()
        .oneTime()
    )
}

const inlineKeyboard = (text, hide = false) => {
  return Extra
    .markup(m =>
      m
        .keyboard([
          m.button(text, hide),
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
