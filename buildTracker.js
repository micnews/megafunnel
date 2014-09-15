var fs    = require('fs')
var getIP = require('external-ip')()
var bs    = require('browserify-string')
var path  = require('path')

var script = fs.readFileSync(path.join(__dirname, 'condor.template'), 'utf8')

var condor = module.exports = {}

getIP(function (err, ip) {
  if (err) {
    console.log(err)
    ip = "' + location.hostname + '"
    return
  }

  script = script.replace(/{{HOST}}/g, ip)

  browserify(script)

});

function browserify(moduleString) {
  bs(moduleString).bundle(function (err, src) {
    if (err) {
      console.log(err)
      condor.script = ''
      return
    }
    condor.script = src
  });
}