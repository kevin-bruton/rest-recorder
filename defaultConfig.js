const { CACHE } = require('./mode')
const path = require('path')

module.exports = {
  remoteUrl: 'https://reqres.in',
  restRecorderPort: '5500',
  restRecordingsDir: 'rest-recordings',
  mode: CACHE,
  configFile: path.join(process.cwd(), 'rest-recorder.config.js'),
  dontSaveResponsesWithStatus: [401, 403, 404, 500],
  getRecordingDirectoryArray: request => [request.domain, ...request.pathSegments, request.method],
  getRecordingFilename: (request, hash) => hash(request.data),
  log: true
}
