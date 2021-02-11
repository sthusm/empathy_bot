/// в 1 минуте
const MILLISECOND = 60000

const genderMap = {
  'Male': '👦',
  'Female': '👩',
}

const requestTextGenerator = (message, data) => {
  return `${data.reqType}.

${message}

${genderMap[data.user.gender]} ${data.private ? 'Анонимно' : `${data.user.name} @${data.user.username}`}
`
}

const convertTime = (minutes) => Number(minutes) * MILLISECOND

module.exports = {
  genderMap,
  requestTextGenerator,
  convertTime,
}
