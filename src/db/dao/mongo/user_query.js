const User = require('../../models/User.js')

async function findOrCreate (params) {
  let user = await User.findOne({ telegramId: params.telegramId })

  if (!user) {
    user = new User(params)
    await user.save()
  }

  return user
}

async function update (telegramId, updateParams) {
  try {
    await User.updateMany(
      { telegramId },
      { $set: updateParams }
    )
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  findOrCreate,
  update,
}
