'use strict'

//create a server that accepts analytics data
//validates it and merges it into one stream into
//to the megafunnel.

var funnel = require('funnel-stream')
var reconnect = require('reconnect-http')
var through = require('through')
var CSV = require('csv-line')

module.exports = function (opts) {

  var f = funnel(function (line) {
    if(line.length > 2048) return
    var data = CSV.decode(line)
    //add timestamps
    data.unshift(Date.now())
    return CSV.encode(data)
  })

  reconnect(function (request) {
    f.createOutput().pipe(request)
  })
    .connect(opts.megaHost + '/write')

  return http.createServer(function (req) {
    if(req.url == '/script.js')
      
    req.pipe(f.createInput())
  })
    .listen(opts.funnelPort)

}

