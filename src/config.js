const { env } = process

module.exports = Object.freeze({
  BOT_TOKEN: env.BOT_TOKEN || '1695219847:AAG5lHLyivcnaEm9jvfHxMczIlxcWWenwEc',
  EMPATHY_CHAT_ID: env.EMPATHY_CHAT_ID || '-1001155303624',
  REDIS_PORT: env.REDIS_PORT || 6379,
  REDIS_HOST: env.REDIS_HOST || '127.0.0.1',
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
