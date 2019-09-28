#!/usr/bin/env node
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

log('\nSTARTING REST RECORDER WITH THE FOLLOWING CONFIG:')
log(JSON.stringify(config, null, 2), '\n')
log(`uniqueRecordingOn: ${config.uniqueRecordingOn.toString()}\n`)

process.title = 'rest-recorder'

const server = app.listen(config.restRecorderPort,
  () => console.log(`VCR is running on port ${config.restRecorderPort} in ${config.mode} mode...`))

module.exports = server
