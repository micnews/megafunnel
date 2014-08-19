'use strict'

//create a server that accepts analytics data
//validates it and merges it into one stream into
//to the megafunnel.

var funnel    = require('funnel-stream')
var reconnect = require('reconnect-net')
var CSV       = require('csv-line')
var path      = require('path')
var fs        = require('fs')
var url       = require('url')
var http      = require('http')
var net       = require('net')

var script = fs.readFileSync(path.join(__dirname, 'tracker.js'))

module.exports = function (config) {

  var f = funnel(function (line) {
    //ensure that line lengths are reasonable.
    if(line.length > 2048) return

    var data = CSV.decode(line)
    //add timestamps
    data.unshift(Date.now())
    return CSV.encode(data) + '\n'
  })

  var megaUrl = url.format({
      hostname: config.megaHost,
      port    : config.megaPort,
      pathname: '/track',
      protocol: 'http'
    })

  console.log(megaUrl)

  reconnect(function (stream) {
    console.error('connected to megafunnel')
    stream.setNoDelay(true)
    f.createOutput().on('data', function (d) {
      console.log('>>', d.toString())
    }).pipe(stream)
  })
    .connect(config.megaNetPort, config.megaHost)
    .on('disconnect', function () {
      console.error('disconnected from megafunnel')
    })
    .on('connection', function () {
      console.log('connected')
    })
    .on('reconnect', function () {
      console.error('reconnect')
    })

  return http.createServer(function (req, res) {
    if(req.url == '/script.js') {
      res.setHeader('content-type', 'application/javascript')
      res.end(script)
    }
    else if(req.url == '/track')
      req
        .on('data', function (data) {
          console.log(data.toString())
        })
        .pipe(f.createInput())
    else {
      req.resume()
      res.setHeader('content-type', 'text/html')
      res.end(
        '<!DOCTYPE html>\n'+
        '<html><head><script src="/script.js"></script></head>\n'+
        '<body>MEGAFUNNEL</body></html>'
      )
    }
  })
    .listen(config.funnelPort)

}


if(!module.parent) {
  module.exports(require('./config'))
}
