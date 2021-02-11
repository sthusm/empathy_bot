const { 
    Schema,
    model,
  } = require('mongoose')
  
  const schema = new Schema({
    telegramId: { type: Number, required: true, unique: true },
    messageId: { type: Number },
  })
  
  module.exports = model('MessageState', schema)
  