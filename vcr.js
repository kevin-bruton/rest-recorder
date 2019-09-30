const makeRequest = require('./request')
const path = require('path')
const hash = require('object-hash')
const fs = require('fs')
const { RECORD, PLAYBACK } = require('./mode')
const { log } = require('./logger')

module.exports = config => {
  return async function (req, res, next) {
    const stripEndingForwardSlash = url => {
      url.endsWith('/') && (url = url.substring(0, url.length - 1))
      return url
    }
    const requestData = {
      method: req.method,
      headers: getRequestHeaders(req),
      data: req.body,
      url: stripEndingForwardSlash(config.remoteUrl) + req.originalUrl
    }

    const filepath = getRecordingFilePath(config.restRecordingsDir, config.remoteUrl, req.originalUrl, requestData, config.uniqueRecordingOn)

    if (config.mode === RECORD) {
      log(`\n${requestData.method} ${requestData.url}: RECORD MODE. REQUESTING...`)
      const responseData = await makeRequest(requestData)
      save(config.dontSaveResponsesWithStatus, filepath, requestData, responseData)
      sendResponse(responseData, res)
    } else {
      const recording = getRecording(filepath)
      if (recording) {
        log(`\n${requestData.url} ${requestData.method}: ${config.mode} MODE; HIT`)
        sendResponse(recording.response, res)
      } else if (config.mode === PLAYBACK) {
        log(`\n${requestData.method} ${requestData.url}: PLAYBACK MODE; NO HIT. RETURNING 404...`)
        res.sendStatus(404)
      } else {
        log(`\n${requestData.method} ${requestData.url}: CACHE MODE; NO HIT. REQUESTING...`)
        const responseData = await makeRequest(requestData)
        save(config.dontSaveResponsesWithStatus, filepath, requestData, responseData)
        sendResponse(responseData, res)
      }
    }
    next()
  }
}

function getRecording (filepath) {
  try {
    const fileContent = fs.readFileSync(filepath)
    return JSON.parse(fileContent)
  } catch (err) {
    log(`Could not read file: ${err}`)
    return false
  }
}

function sendResponse (response, res) {
  res.status(response.status).send(response.data)
}

function getRequestHeaders (req) {
  const headersToExclude = ['host']
  return Object.keys(req.headers).reduce((headers, headerName) => {
    const headerVal = req.get(headerName)
    if (headerVal && !headersToExclude.includes(headerName)) {
      headers[headerName] = headerVal
    }
    return headers
  }, {})
}

function save (dontSaveResponseStatus, filepath, request, response) {
  if (dontSaveResponseStatus.includes(response.status)) {
    log(`Received response with status ${response.status}. Not saving.`)
    return
  }
  const toSave = { request, response }
  function ensureDirExists (filePath) {
    var dirname = path.dirname(filePath)
    if (fs.existsSync(dirname)) {
      return true
    }
    ensureDirExists(dirname)
    fs.mkdirSync(dirname)
  }
  ensureDirExists(filepath)
  log(`\nSaving request to ${filepath}`)
  fs.writeFileSync(filepath, JSON.stringify(toSave, null, 2))
}

function getRecordingFilePath (recordingsDir, remoteUrl, urlPath = '/', requestData, uniqueRecordingOn) {
  urlPath.startsWith('/') && (urlPath = urlPath.substring(1))
  remoteUrl.endsWith('/') && (remoteUrl = remoteUrl.substring(0, remoteUrl.length - 1))
  const remoteUrlArr = remoteUrl.replace('https://', '').replace('http://', '').replace(':', '-').split('/')
  const filteredPath = uniqueRecordingOn({ path: urlPath})
  let dir = path.join(recordingsDir, ...remoteUrlArr, requestData.method)
  filteredPath.path && (dir = path.join(dir, ...filteredPath.path.split('/'))) // Add directories for each path segment
  dir = dir.substring(0, dir.indexOf('?') === -1 ? dir.length : dir.indexOf('?')) // Remove get params if there
  const filename = hashOnData({url: remoteUrl, headers: requestData.headers, path: filteredPath.path.replace('/', '-'), data: requestData.data}, uniqueRecordingOn) + '.json' // Generate filename
  return path.join(dir, filename)
}

function hashOnData (data, uniqueRecordingOn) {
  const newData = uniqueRecordingOn(data)
  return hash(newData)
}
