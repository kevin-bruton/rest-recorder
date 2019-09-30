const path = require('path')

module.exports = {
  remoteUrl: 'https://reqres.in',
  restRecorderPort: '5555',
  restRecordingsDir: path.join(__dirname, 'testRecordings'),
  log: false
}
