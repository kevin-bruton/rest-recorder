/* global describe it expect beforeAll afterAll */

const { fork } = require('child_process')
const axios = require('axios')
const path = require('path')
const fs = require('fs')
const vcr = require('../vcr')
const rimraf = require('rimraf')
const config = require('./testConfig.js')

describe('Making a request in RECORD MODE', () => {
  let restRecorderProcess
  let realResponse
  let resp
  beforeAll(async () => {
    const configFilePath = path.join(__dirname, './testConfig.js')
    restRecorderProcess = fork(path.join(__dirname, '..', '/index'), [`--configFile="${configFilePath}"`, '--mode=record'])
    realResponse = await axios.get(config.remoteUrl)
    resp = await axios.get('http://localhost:5555')
  })
  afterAll(() => {
    restRecorderProcess.kill()
    rimraf.sync(config.restRecordingsDir)
  })
  it('returns the data from the remote', async () => {
    expect(resp.data).toStrictEqual(realResponse.data)
  })
  it('saves the request and response in file', () => {
    const getRecordingFilePath = vcr.__get__('getRecordingFilePath')
    const filepath = getRecordingFilePath(config.restRecordingsDir, config.remoteUrl, '/', { method: 'GET', data: {} }, data => data)
    const recording = JSON.parse(fs.readFileSync(filepath, 'utf8'))
    expect(recording.request).toEqual({ method: 'GET', headers: {}, data: {}, url: config.remoteUrl })
    expect(recording.response).toEqual({ status: realResponse.status, statusText: realResponse.statusText, data: realResponse.data })
  })
})
