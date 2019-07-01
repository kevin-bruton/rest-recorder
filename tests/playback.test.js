/* global describe it expect beforeAll afterAll */

const { fork } = require('child_process')
const axios = require('axios')
const path = require('path')
const fs = require('fs')
const vcr = require('../vcr')
const rimraf = require('rimraf')
const config = require('./testConfig.js')

describe('Making a request in PLAYBACK MODE', () => {
  let restRecorderProcess
  let resp
  beforeAll(async () => {
    const configFilePath = path.join(__dirname, './testConfig.js')
    restRecorderProcess = fork(path.join(__dirname, '..', '/index'), [`--configFile="${configFilePath}"`, 'mode=record'])
    await axios.get('http://localhost:5555')
    restRecorderProcess.kill()
    restRecorderProcess = fork(path.join(__dirname, '..', '/index'), [`--configFile="${configFilePath}"`, '--mode=playback'])
  })
  afterAll(() => {
    restRecorderProcess.kill()
    rimraf.sync(config.restRecordingsDir)
  })
  it('returns the response previously saved to file', async () => {
    resp = await axios.get('http://localhost:5555')
    const getRecordingFilePath = vcr.__get__('getRecordingFilePath')
    const filepath = getRecordingFilePath(config.restRecordingsDir, config.remoteUrl, '/', { method: 'GET', data: {} }, data => data)
    const recording = JSON.parse(fs.readFileSync(filepath, 'utf8'))
    expect(recording.response).toEqual({ status: resp.status, statusText: resp.statusText, data: resp.data })
  })
})
