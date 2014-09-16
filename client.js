
var url = require('url')

//ie8 polyfil
require('document.currentscript')

var src = (document.currentScript || document._currentScript).src

var obj = url.parse(src)

delete obj.pathname
delete obj.href

obj.pathname = '/track'

console.log(url.format(obj))

require('condor/xhr')({
  uri: url.format(obj)
})
