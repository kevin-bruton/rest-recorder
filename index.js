const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const vcr = require('./vcr')
const config = require('./config-getter')
const { log } = require('./logger')

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(vcr(config))

const server = app.listen(config.restRecorderPort,
  () => log(`VCR is running on port ${config.restRecorderPort} in ${config.mode} mode...`))

module.exports = server
