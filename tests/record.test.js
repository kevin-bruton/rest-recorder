/* global describe it expect beforeAll afterAll */
const axios = require('axios')
const path = require('path')
const fs = require('fs')
const vcr = require('../vcr')
const rimraf = require('rimraf')
const config = require('./testConfig.js')

describe('Making a request in RECORD MODE', () => {
  let realResponse
  let resp
  let server
  const pathUrl = '/api/users/2'
  beforeAll(async () => {
    process.argv.push(`--configFile=${process.cwd()}/tests/testConfig.js`)
    process.argv.push(`--mode=record`)
    server = require('../index')
    realResponse = await axios.get(config.remoteUrl + pathUrl)
    resp = await axios.get('http://localhost:5555' + pathUrl)
  })
  afterAll(() => {
    server.close()
    rimraf.sync(config.restRecordingsDir)
  })
  it('returns the data from the remote', async () => {
    expect(resp.data).toStrictEqual(realResponse.data)
  })
  it('saves the request and response in file', () => {
    const requestData = {
      method: 'GET',
      headers: {
        accept: 'application/json, text/plain, */*',
        'user-agent': 'axios/0.19.0',
        connection: 'close'
      },
      data: {},
      url: config.remoteUrl + pathUrl
    }
    const getRecordingFilePath = vcr.__get__('getRecordingFilePath')
    const filepath = getRecordingFilePath(config.restRecordingsDir, config.remoteUrl, pathUrl, requestData, data => data)
    const recording = JSON.parse(fs.readFileSync(filepath, 'utf8'))
    expect(recording.request).toEqual(requestData)
    expect(recording.response).toEqual({ status: realResponse.status, statusText: realResponse.statusText, data: realResponse.data })
  })
})
