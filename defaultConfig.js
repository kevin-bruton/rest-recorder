const { CACHE } = require('./mode')
const path = require('path')

module.exports = {
  remoteUrl: 'https://reqres.in',
  restRecorderPort: '5500',
  restRecordingsDir: 'rest-recordings',
  mode: CACHE,
  configFile: path.join(process.cwd(), 'rest-recorder.config.js'),
  uniqueRecordingOn: request => request,
  log: true
}
