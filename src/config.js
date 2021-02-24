const { env } = process

module.exports = Object.freeze({
  BOT_TOKEN: env.BOT_TOKEN || '1534973205:AAG6yLoLvU0L9URwATOeU7Ik_Lq-Vml85Ns',
  EMPATHY_CHAT_ID: env.EMPATHY_CHAT_ID || '-1001155303624',
  REDIS_PORT: env.REDIS_PORT || 6379,
  REDIS_HOST: env.REDIS_HOST || '127.0.0.1',
  REDIS_PASSWORD: env.REDIS_PASSWORD || '',
  dbConfig: {
    client: 'pg',
    connection: {
      port: env.PG_PORT || 5432,
      user: env.PG_USER || 'postgres',
      host: env.PG_HOST || 'localhost',
      database: env.PG_DATABASE || 'empathy_bot_dev',
      password: env.PG_PASSWORD || '10241024',
      timezone: env.PG_TZ || 'UTC',
    },
  },
})
