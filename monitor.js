

var monitor = module.exports = function (reduce, each, delay) {
  reduce = reduce || function (a, b) { return (a || 0) + b }
  each = each || console.log.bind(console)
  delay = delay || 1000
  var acc = null, _ts = 0
  return function (update) {
    acc = reduce(acc, update)
    var ts = Date.now()
    if(_ts + delay < ts) {
      _ts = ts; each(acc)
    }
  }
}

var perSecond = module.exports.perSecond = function () {
  var _ts = Date.now()
  return monitor(function (a, b) {
    var ts = Date.now()
    if(_ts + 1100 < ts) {
      _ts = ts;
      return 0
    }
    return (a || 0) + b
  }, function (m) {
    console.log((((m*1000) / (Date.now() - _ts))/1000000).toPrecision(3))
  })
}

if(!module.parent) {
  var ticks = perSecond()
  ;(function next () {
    //trivia: while(true) is 20x times faster than setImmediate(next)
    while(true) ticks(1); //setImmediate(next)
  })()
}
