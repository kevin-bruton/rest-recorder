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
log(`getRecordingDirectoryArray: ${config.getRecordingDirectoryArray.toString()}\n`)
log(`getRecordingFilename: ${config.getRecordingFilename.toString()}\n`)

process.title = 'rest-recorder'

const server = app.listen(config.restRecorderPort,
  () => {
    console.log(`================================================================`)
    console.log(`  REST-RECORDER IS RUNNING ON PORT ${config.restRecorderPort} IN "${config.mode.toUpperCase()}" MODE...`)
    console.log(`================================================================`)
  })

module.exports = server
