const MessageState = require('../../models/MessageState.js')

async function createOrUpdate (telegramId, params) {
  try {
    let ms = await MessageState.findOne({ telegramId })

    if (ms) {
      await MessageState.updateMany(
        { telegramId },
        { $set: params }
      )
    } else {
      ms = new MessageState({ 
        telegramId,
        ...params,
      })
      await ms.save()
    }
  } catch (err) {
    console.log(err)
  }
}

async function find (telegramId) {
  return await MessageState.findOne({ telegramId })
}

module.exports = {
  find,
  createOrUpdate,
}
