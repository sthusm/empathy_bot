const knex = require('knex')
const { dbConfig } = require('../config.js')

const db = knex(dbConfig)

module.exports = db
