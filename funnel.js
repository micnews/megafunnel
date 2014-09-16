#! /usr/bin/env node
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
var Monitor   = require('./monitor')


var script = fs.readFileSync(path.join(__dirname, 'tracker.js'))

module.exports = function (config) {
  var monitor = Monitor.perSecond()

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

  reconnect(function (stream) {
    console.error('connected to megafunnel')
    stream.setNoDelay(true)
    f.createOutput()
      .on('data', function (d) { monitor(d.length) })
      .pipe(stream)
  })
    .connect(config.megaNetPort, config.megaHost)
    .on('disconnect', function () {
      console.error('disconnected')
    })
    .on('connection', function () {
      console.log('connected')
    })

  return http.createServer(function (req, res) {
    if(req.url == '/script.js') {
      res.setHeader('content-type', 'application/javascript')
      res.end(script)
    }
    else if(req.url == '/track') {
      req
        .pipe(f.createInput())
      req.on('end', function () {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.writeHead(200)
        res.end('{"okay": true}\n')
      })
    }
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
    .listen(config.funnelPort, function () {
      console.error('megafunnel/funnel listening on:'
        + config.funnelPort
      )
    })

}


if(!module.parent) {
  module.exports(require('./config'))
}
