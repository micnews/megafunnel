
var url = require('url')

var obj = url.parse(document.currentScript.src)

delete obj.pathname
delete obj.href

obj.pathname = '/track'

console.log(url.format(obj))

require('condor/xhr')({
  uri: url.format(obj)
})
