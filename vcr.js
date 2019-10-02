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
    
    const filepath = getRecordingFilePath(config.restRecordingsDir, requestData, config.getRecordingDirectoryArray, config.getRecordingFilename)

    if (config.mode === RECORD) {
      log(`\nRECORD MODE. REQUESTING... ${requestData.method} ${requestData.url}`)
      const responseData = await makeRequest(requestData)
      save(config.dontSaveResponsesWithStatus, filepath, requestData, responseData)
      sendResponse(responseData, res)
    } else {
      const recording = getRecording(filepath)
      if (recording) {
        log(`${config.mode.toUpperCase()} MODE; HIT. RETURNING RECORDING... ${requestData.method} ${requestData.url}`)
        sendResponse(recording.response, res)
      } else if (config.mode === PLAYBACK) {
        log(`PLAYBACK MODE; MISS. RETURNING 404... ${requestData.method} ${requestData.url}`)
        res.sendStatus(404)
      } else {
        log(`CACHE MODE; MISS. REQUESTING... ${requestData.method} ${requestData.url}`)
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
    log(`\nRECORDING FOUND at ${filepath}`)
    return JSON.parse(fileContent)
  } catch (err) {
    log(`\nRECORDING NOT FOUND at ${filepath}`)
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
  const date = new Date();
  const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getMilliseconds()}`;
  const toSave = { recordedOn: dateStr, request, response }
  function ensureDirExists (filePath) {
    var dirname = path.dirname(filePath)
    if (fs.existsSync(dirname)) {
      return true
    }
    ensureDirExists(dirname)
    fs.mkdirSync(dirname)
  }
  ensureDirExists(filepath)
  fs.writeFileSync(filepath, JSON.stringify(toSave, null, 2))
  log(`REQUEST SAVED`)
}

function getRecordingFilePath (recordingsDir, origRequestData, getRecordingDirectory, getRecordingFilename) {
  const request = {}
  const urlWithoutProtocol = origRequestData.url.replace('https://', '').replace('http://', '')
  const pathStartIdx = urlWithoutProtocol.indexOf('/')
  request.domain = urlWithoutProtocol.substring(0, pathStartIdx)
  const urlPath = urlWithoutProtocol.substring(pathStartIdx + 1)
  request.pathSegments = (urlPath.endsWith('/') ? urlPath.substring(0, urlPath.length - 1): urlPath).split('/')
  request.data = {...origRequestData.data}
  request.headers = {...origRequestData.headers}
  request.method = origRequestData.method
  
  const dirArray = getRecordingDirectory(request)
  const dir = path.join(recordingsDir, ...dirArray)
  const filename = getRecordingFilename(request, hash) + '.json'
  return path.join(dir, filename)
}
