const { CACHE } = require('./mode')
const path = require('path')

module.exports = {
  remoteUrl: 'https://reqres.in',
  restRecorderPort: '5555',
  restRecordingsDir: 'rest-recordings',
  mode: CACHE,
  configFile: path.join(__dirname, '..', '..', 'rest-recorder.config.js'),
  uniqueRecordingOn: request => request,
  log: false
}
