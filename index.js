

var config = require('./config')

if(!module.parent) {

  var cmd = config._[0]

  if(cmd == 'megafunnel') {
    require('./megafunnel')(config)
    if(config.accessKeyId)
      require('log-archive-s3')(config)
  }
  else if(cmd == 'funnel') {
    require('./funnel')(config)
  }

}
