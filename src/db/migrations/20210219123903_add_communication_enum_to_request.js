const { formatAlterTableEnumSql } = require('../../core/utils/helpers')

exports.up = async function up (knex) {
  await knex.raw(
    formatAlterTableEnumSql('requests', 'type', [
      'offer',
      'ask',
      'communication',
    ])
  )
}

exports.down = async function down (knex) {
  await knex.raw(
    formatAlterTableEnumSql('requests', 'type', [
      'offer',
      'ask',
    ])
  )
}