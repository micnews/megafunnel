var fs      = require('fs')
var request = require('hyperquest')
var config  = require('./config')
var path    = require('path')
var url     = require('url')
var pull    = require('pull-stream')
var paramap = require('pull-paramap')

var data = fs.readFileSync(path.join(__dirname, 'example.csv'), 'utf8')

var monitor = require('./monitor').perSecond()

data = data.split('\n').map(function (line) {
  //remove the timestamp from the start.
  return line.replace(/[^,]*,/, '')
}).join('\n') + '\n'

var o = 0, n = 0

pull(
  pull.count(100000),
  paramap(function (_, cb) {
    o ++
    n ++
    var u = url.format({hostname:config.funnelHost, port: config.funnelPort, protocol: 'http', pathname: '/track'})
    var stream = request({uri:u, method: 'post'})
    stream.on('response', function () {
      o--
      if(!(n%100))
        console.log(n, o)
      stream.end()
      cb()
    }).on('error', cb)
    var s = ''
    for(var i = 0; i < 100; i++) {
      s += data
    }
    monitor(s.length)
    stream.write(s)
    stream.end()
  }, 100),
  pull.drain(null, function (err) {
    console.log('exit', err)
    if(err) throw err
  })
)

console.log('?')
