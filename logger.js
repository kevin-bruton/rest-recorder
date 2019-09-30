const fs = require('fs')
const path = require('path')
let logOn = false
let logToFile = false

module.exports = {
  setLogOn: log => (logOn = log),
  setLogToFile: toFile => (logToFile = toFile),
  log: data => {
    if (logOn) {
      console.log(data)
      if (logToFile) {
        const filepath = path.join(process.cwd(), 'log.txt')
        fs.writeFileSync(filepath, data)
      }
    }
  }
}
