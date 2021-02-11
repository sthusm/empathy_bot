const { env } = process

module.exports = Object.freeze({
  BOT_TOKEN: env.BOT_TOKEN || '1695219847:AAG5lHLyivcnaEm9jvfHxMczIlxcWWenwEc',
  EMPATHY_CHAT_ID: env.EMPATHY_CHAT_ID || '-383855057',
  MONGO_URL: env.MONGO_URL || 'mongodb+srv://golang:10241024@cluster0.obssk.mongodb.net/empathy_bot?retryWrites=true&w=majority',
})
