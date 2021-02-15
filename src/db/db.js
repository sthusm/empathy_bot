const knex = require('knex')
const { dbConfig } = require('../config.js')

const db = knex(process.env.DATABASE_URL || dbConfig)

module.exports = db
