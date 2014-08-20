

var config = require('./config')

if(!module.parent) {

  var cmd = config._[0]

  if(cmd == 'megafunnel') {
    require('./megafunnel')(config)
  }
  else if(cmd == 'funnel') {
    require('./funnel')(config)
  }

}
