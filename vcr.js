const request = require('./request')
const path = require('path')
const hash = require('object-hash')
const fs = require('fs')
const { RECORD, PLAYBACK } = require('./mode')
const { log } = require('./logger')

module.exports = config => {
  return async function (req, res, next) {
    const stripEndingForwardSlash = url => {
      url.endsWith('/') && (url = url.substring(0, url.length - 1))
      url.endsWith('/') && (url = url.substring(0, url.length - 1))
      return url
    }
    const requestData = {
      method: req.method,
      headers: getRequestHeaders(req),
      data: req.body,
      url: stripEndingForwardSlash(config.remoteUrl + req.originalUrl)
    }

    const filepath = getRecordingFilePath(config.restRecordingsDir, config.remoteUrl, req.originalUrl, requestData, config.uniqueRecordingOn)

    if (config.mode === RECORD) {
      log(`${requestData.method} ${requestData.url}: RECORD MODE. REQUESTING...`)
      await makeAndSaveRequest(filepath, requestData)
      returnSavedRecording(filepath, res)
    } else {
      if (recordingExists(filepath)) {
        log(`${requestData.url} ${requestData.method}: ${config.mode} MODE; HIT`)
        returnSavedRecording(filepath, res)
      } else if (config.mode === PLAYBACK) {
        log(`${requestData.method} ${requestData.url}: PLAYBACK MODE; NO HIT. RETURNING 404...`)
        res.sendStatus(404)
      } else {
        log(`${requestData.method} ${requestData.url}: CACHE MODE; NO HIT. REQUESTING...`)
        await makeAndSaveRequest(filepath, requestData)
        returnSavedRecording(filepath, res)
      }
    }
    next()
  }
}

async function makeAndSaveRequest (filepath, requestData) {
  const responseData = await makeRequest(requestData)
  save(filepath, requestData, responseData)
}

function returnSavedRecording (filepath, res) {
  const recording = getRecording(filepath)
  sendResponse(recording.response, res)
}

function getRecording (filepath) {
  try {
    const fileContent = fs.readFileSync(filepath)
    return JSON.parse(fileContent)
  } catch (err) {
    log(`Could not read file ${filepath}: ${err}`)
    return { response: { status: 410, statusText: 'Gone', data: 'Could not get recording' } }
  }
}

function recordingExists (filepath) {
  return fs.existsSync(filepath)
}

function sendResponse (response, res) {
  log(response.status)
  res.status(response.status).send(response.data)
}

async function makeRequest (requestData) {
  return request(requestData)
}

function getRequestHeaders (req) {
  const headersTitles = ['Content-Type', 'Authorization']
  return headersTitles.reduce((headers, title) => {
    req.get(title) && (headers[title] = req.get(title))
    return headers
  }, {})
}

function save (filepath, requestData, resp) {
  const response = { status: resp.status, statusText: resp.statusText, data: resp.data }
  function ensureDirExists (filePath) {
    var dirname = path.dirname(filePath)
    if (fs.existsSync(dirname)) {
      return true
    }
    ensureDirExists(dirname)
    fs.mkdirSync(dirname)
  }
  ensureDirExists(filepath)
  const toSave = { request: requestData, response }
  log(`Saving request to ${filepath}`)
  fs.writeFileSync(filepath, JSON.stringify(toSave, null, 2))
}

function getRecordingFilePath (recordingsDir, remoteUrl, urlPath = '/', requestData, dataFilter4FileHash) {
  urlPath.startsWith('/') && (urlPath = urlPath.substring(1))
  remoteUrl.endsWith('/') && (remoteUrl = remoteUrl.substring(0, remoteUrl.length - 1))
  const remoteUrlArr = remoteUrl.replace('https://', '').replace('http://', '').replace(':', '-').split('/')
  let dir = path.join(recordingsDir, ...remoteUrlArr, ...urlPath.split('/'), requestData.method)
  dir = dir.substring(0, dir.indexOf('?') === -1 ? dir.length : dir.indexOf('?'))
  return path.join(dir, hashOnData({url: remoteUrl, headers: requestData.headers, params: urlPath, data: requestData.data}, dataFilter4FileHash) + '.json')
}

function hashOnData (data, dataFilter4FileHash) {
  const newData = dataFilter4FileHash(data)
  return hash(newData)
}
