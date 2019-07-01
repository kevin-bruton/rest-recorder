const path = require('path')

module.exports = {
  remoteUrl: 'https://reqres.in/api/users/2',
  restRecorderPort: '5555',
  restRecordingsDir: path.join(__dirname, 'testRecordings'),
  log: false
}
