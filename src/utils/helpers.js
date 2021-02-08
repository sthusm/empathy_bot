const genderMap = {
  'Male': '👦',
  'Female': '👩',
}

const requestTextGenerator = (message, data) => {
  return `${data.reqType}. ${genderMap[data.user.gender]} ${message} ${data.private ? '' : `от @${data.user.username}`}`
}

module.exports = {
  genderMap,
  requestTextGenerator,
}
