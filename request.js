const axios = require('axios')
const { log } = require('./logger')

module.exports = async function (config) {
  const { method, url, headers, data } = config
  log('\nMAKING A REAL request:')
  log('URL:', url)
  log('method:', method)
  log('headers:', headers)
  log('data:', data)
  try {
    const resp = await axios({ method, url, headers, data })
    return resp
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      const info = { error: err.code, address: err.address, port: err.port }
      return { status: 500, statusText: err.code, data: info }
    }
    if (err.response) { // Server responded with status code
      return err.response
    } else if (err.request) { // The request was made but no response was received
      return err.request
    }
    // Something happened in setting up the request that triggered an Error
    return {
      status: 500,
      statusText: 'Error setting up request',
      message: err.message
    }
  }
}
