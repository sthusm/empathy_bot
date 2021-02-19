const { env } = process

module.exports = Object.freeze({
  BOT_TOKEN: env.BOT_TOKEN || '1695219847:AAG5lHLyivcnaEm9jvfHxMczIlxcWWenwEc',
  EMPATHY_CHAT_ID: env.EMPATHY_CHAT_ID || '-1001155303624',
  MONGO_URL: env.MONGO_URL || 'mongodb+srv://golang:10241024@cluster0.obssk.mongodb.net/empathy_bot?retryWrites=true&w=majority',
  dbConfig: {
    client: 'pg',
    connection: {
      port: env.dbPort || 5432,
      user: env.dbUser || 'postgres',
      host: env.dbHost || 'localhost',
      database: env.database || 'empathy_bot',
      password: env.dbPassword || '10241024',
      timezone: env.TZ || 'UTC',
    },
  },
})
