let logOn = false

module.exports = {
  setLogOn: log => (logOn = log),
  log: data => logOn && console.log(data)
}
