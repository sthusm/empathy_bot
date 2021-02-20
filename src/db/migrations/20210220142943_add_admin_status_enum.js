const { formatAlterTableEnumSql } = require('../../core/utils/helpers')

exports.up = async function up (knex) {
  await knex.raw(
    formatAlterTableEnumSql('users', 'status', [
      'active',
      'blocked',
      'admin',
    ])
  )
}

exports.down = async function down (knex) {
  await knex.raw(
    formatAlterTableEnumSql('users', 'status', [
      'active',
      'blocked',
    ])
  )
}
