var path = require('path')

module.exports = require('rc')('megafunnel', {
  megaPort: 4000,
  megaNetPort: 4002,
  //this is only so that it works by default in dev.
  //this is the first thing you will override in production.
  megaHost: 'localhost',
  funnelPort: 4001,
  maxSize: 1024*1024*1024,
  logDir: path.join(process.env.HOME, '.megafunnel')
})
