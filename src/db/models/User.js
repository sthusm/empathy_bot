const { 
  Schema,
  model,
} = require('mongoose')

const schema = new Schema({
  telegramId: { type: Number, required: true, unique: true },
  name: { type: String },
  gender: { type: String },
})

module.exports = model('User', schema)
