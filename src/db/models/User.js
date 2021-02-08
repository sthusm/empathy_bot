const { 
  Schema,
  model,
} = require('mongoose')

const schema = new Schema({
  telegramId: { type: Number, required: true, unique: true },
  gender: { type: String },
})

module.exports = model('User', schema)
