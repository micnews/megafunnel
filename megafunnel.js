'use strict'

// take the aggregated streams and write them out to disk

var http = require('http')
var CSV = require('csv-line')
var logStream = require('log-rotation-stream')
var logQuery = require('log-range-query')
var funnel = require('funnel-stream')

var script = fs.readFileSync(path.join(__dirname, 'tracker.js'))


module.exports = function (config) {

  var GB = 1024 * 1024 * 1024

  var log = logStream(config.logDir, config.maxSize || GB)

  //THIS IS NOT READY YET
  var lrq = logQuery(config.logDir, function (line, opts) {
    var data = CSV.decode(line)
    var ts = data[0]
    //************************
  })

  var f = funnel()

  f.createOutput().pipe(log)

  http.createServer(function (req, res) {
    console.log(req.url)
    if(req.url == '/track')
      req.pipe(f.createInput())
    else if(req.url == '/script.js') {
      res.setHeader('content-type', 'application/js')
      res.end(script)
    }
    else if(req.url == '/query') {
      //TODO
      
    }
  })
    .listen(config.megaPort)

}
