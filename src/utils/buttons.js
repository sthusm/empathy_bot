const Extra = require('telegraf/extra')

const HELP_COMMAND = `
  Привет! Я бот для эмпатии. Через меня можно отправить анонимный или не анонимный запрос на эмпатию или опубликовать предложение эмпатии. 
  Твое сообщение от имени бота появится в чате Кафе Эмпатии @empathycafe. 
  Сюда будут пересылаться сообщения всех, кто откликнулся и ты сможешь выбрать того, кто ближе твоему сердцу в данный момент никого при этом не обидев.
`

// const menu = () => {
//   return Extra
//     .markup((m) =>
//       m.inlineKeyboard([
//         m.callbackButton('Начать', '0')
//       ])
//     )
// }

const responseMenu = (buttonText, buttonValue = '0') => {
  return Extra
    .markup((m) =>
      m.inlineKeyboard([
        m.callbackButton(buttonText, String(buttonValue)),
      ])
    )
}

const chooseGender = () => {
  return Extra
    .markup((m) => 
      m.inlineKeyboard([
        m.callbackButton('👦 Мужчина', 'Male'),
        m.callbackButton('👩 Женщина', 'Female'),
      ])
    )
}

const selectRequestType = () => {
  return Extra
    .markup((m) =>
      m.inlineKeyboard([
        m.callbackButton('Предложить', 'Offer'),
        m.callbackButton('Запросить', 'Ask'),
      ])
    )
}

const selectPrivacy = () => {
  return Extra
    .markup((m) =>
      m.inlineKeyboard([
        m.callbackButton('Анонимно', 'Private'),
        m.callbackButton('Не анонимно', 'Public'),
      ])
    )
}

module.exports = {
  HELP_COMMAND,
  responseMenu,
  chooseGender,
  selectRequestType,
  selectPrivacy,
}
