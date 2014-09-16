#! /usr/bin/env node
'use strict'

// take the aggregated streams and write them out to disk

var http      = require('http')
var CSV       = require('csv-line')
var logStream = require('log-rotation-stream')
var logQuery  = require('log-range-query')
var funnel    = require('funnel-stream')
var fs        = require('fs')
var path      = require('path')
var url       = require('url')
var qs        = require('querystring')
var net       = require('net')

var pull      = require('pull-stream')
var toPull    = require('stream-to-pull-stream')
var rebuffer  = require('pull-rebuffer')

var script = fs.readFileSync(path.join(__dirname, 'tracker.js'))

var monitor = require('./monitor').perSecond()

module.exports = function (config) {

  var GB = 1024 * 1024 * 1024

  var log = logStream(config.logDir, config.maxSize || GB)

  function createQueryStream (opts) {
    return logQuery({
      dir: config.logDir,
      gt: opts.gt,
      lt: opts.lt
    })
  }

  var f = funnel()

  f.createOutput().pipe(log)

  net.createServer(function (stream) {
    stream.on('data', function (d) {
      monitor(d.length)
    })
    stream.pipe(f.createInput())
  }).listen(config.megaNetPort)

  http.createServer(function (req, res) {
    var q = url.parse(req.url)
    var opts = qs.parse(q.query)
    var pathname = q.pathname

    if(pathname == '/track') {
      req
        .on('end', function () {
          res.end()
        })
        .pipe(f.createInput())
    }
    else if(pathname == '/script.js') {
      res.setHeader('content-type', 'application/javascript')
      res.end(script)
    }

    else if(pathname == '/query') {
      pull(
        createQueryStream(opts),
        rebuffer(40*1024),
        toPull(res)
      )
      req.resume()
    }
  })
    .listen(config.megaPort, function () {
      console.error('megafunnel listening on:' + config.megaPort)
    })

}

if(!module.parent) {
  module.exports(require('./config'))
}
