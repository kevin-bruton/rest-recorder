const fs = require('fs')
let config = require('./defaultConfig')
const { argv } = require('yargs')
const logger = require('./logger')

// Get config settings from the default location and apply them over the defaults
if (fs.existsSync(config.configFile)) {
  const configFile = config.configFile
  const configFileConfig = require(configFile)
  config = { ...config, ...configFileConfig }
}

// Get config settings from the configFile set in argument and apply them over defaults
if (argv.configFile) {
  const configFile = argv.configFile
  const configFileConfig = require(configFile)
  config = { ...config, ...configFileConfig }
}

// All other setting received from arguments override all configFile settings
if (argv.mode) config.mode = argv.mode
if (argv.remoteUrl) config.remoteUrl = argv.remoteUrl
if (argv.restRecorderPort) config.restRecorderPort = argv.restRecorderPort
if (argv.recordingsDir) config.recordingsDir = argv.recordingsDir
if (argv.log) config.log = argv.log

logger.setLogOn(config.log)

module.exports = config
