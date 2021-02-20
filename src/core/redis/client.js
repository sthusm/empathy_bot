const bluebird = require('bluebird')
const redis = require('redis')
const { logger } = require('../utils/pino.js')
const {
  REDIS_PORT,
  REDIS_HOST,
} = require('../../config.js')

bluebird.promisifyAll(redis)

const client = redis.createClient(REDIS_PORT, REDIS_HOST)

client.on('connect', () => logger.info('Redis client connected'))
client.on('ready', () => logger.info('Redis server is ready'))
client.on('error', err => {
  logger.fatal(err.message)
  logger.trace(err.stack)
  setTimeout(() => process.exit(1), 3000)
})

module.exports = client
