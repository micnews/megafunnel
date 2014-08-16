(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var debounce = require('debounce')
  , xhr = require('xhr')
  , track = require('../track')()

  , noop = function () {}
  , data = []

    // save all events happening within a second and send them in one POST
    //  request
  , batchPost = debounce(function () {
      var body = data.join('\n')
      data = []

      xhr({
          method: 'POST'
        , body: body
        , uri: '/track'
      }, noop)
    }, 1000)

track.onevent = function (csv) {
  data.push(csv)
  batchPost()
}

// this gets called by beforeunload - so anything in here must be synchronous
track.onend = function (csv) {
  data.push(csv)

  // this will be an end-event - meaning that the visit on the page has ended
  xhr({
      method: 'POST'
    , body: data.join('\n')
    , uri: '/track'
    , sync: true
  }, noop)
}
},{"../track":13,"debounce":6,"xhr":10}],2:[function(require,module,exports){
addEventListener.removeEventListener = removeEventListener
addEventListener.addEventListener = addEventListener

module.exports = addEventListener

var Events = null

function addEventListener(el, eventName, listener, useCapture) {
  Events = Events || (
    document.addEventListener ?
    {add: stdAttach, rm: stdDetach} :
    {add: oldIEAttach, rm: oldIEDetach}
  )
  
  return Events.add(el, eventName, listener, useCapture)
}

function removeEventListener(el, eventName, listener, useCapture) {
  Events = Events || (
    document.addEventListener ?
    {add: stdAttach, rm: stdDetach} :
    {add: oldIEAttach, rm: oldIEDetach}
  )
  
  return Events.rm(el, eventName, listener, useCapture)
}

function stdAttach(el, eventName, listener, useCapture) {
  el.addEventListener(eventName, listener, useCapture)
}

function stdDetach(el, eventName, listener, useCapture) {
  el.removeEventListener(eventName, listener, useCapture)
}

function oldIEAttach(el, eventName, listener, useCapture) {
  if(useCapture) {
    throw new Error('cannot useCapture in oldIE')
  }

  el.attachEvent('on' + eventName, listener)
}

function oldIEDetach(el, eventName, listener, useCapture) {
  el.detachEvent('on' + eventName, listener)
}

},{}],3:[function(require,module,exports){
var trim = require('trim')

  , classSelector = function (className) {
      console.log('1')
      var selectors = className.split(/\s/g)
        , array = []

      for (var i = 0; i < selectors.length; ++i) {
        if (selectors[i].length > 0) {
          array.push('.' + selectors[i])
        }
      }

      console.log('2')
      return array.join('')
    }

  , nthChild = function (elm) {
      var childNumber = 0
        , childNodes = elm.parentNode.childNodes
        , index = 0

      for(; index < childNodes.length; ++index) {
        if (childNodes[index].nodeType === 1)
          ++childNumber

        if (childNodes[index] === elm)
          return childNumber
      }
    }

  , path = function (elm, rootNode, list) {

      var tag = elm.tagName.toLowerCase()
        , selector = [ tag ]
        , className = elm.getAttribute('class')
        , id = elm.getAttribute('id')

      if (id) {
        list.unshift(tag + '#' + trim(id))
        return list
      }

      if (className)
        selector.push( classSelector(className) )

      if (tag !== 'html' && tag !== 'body' && elm.parentNode) {
        selector.push(':nth-child(' + nthChild(elm) + ')')
      }

      list.unshift(selector.join(''))

      if (elm.parentNode && elm.parentNode !== rootNode && elm.parentNode.tagName) {
        path(elm.parentNode, rootNode, list)
      }

      return list
    }

module.exports = function (elm, rootNode) {
  return path(elm, rootNode, []).join(' > ')
}
},{"trim":4}],4:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],5:[function(require,module,exports){
var map = function (input, fn) {
      var result = Array(input.length)

      for(var i = 0; i < input.length; ++i) {
        result[i] = fn(input[i])
      }

      return result
    }

module.exports = function (options) {
  var separator = options && options.separator ? options.separator : ','
    , escapeNewlines = options && options.escapeNewlines === true
    , regexp = new RegExp('[' + separator + '\r\n"]')
    , escape = function (cell) {

        if (typeof(cell) === 'string') {
          if (escapeNewlines) {
            cell = cell.replace(/\n/g, '\\n')
          }

          cell = regexp.test(cell) ? '"' + cell.replace(/"/g, '""') + '"' : cell
        }

        return cell
      }

  return function (array) {
    return map(array, escape).join(separator)
  }
}
},{}],6:[function(require,module,exports){

/**
 * Module dependencies.
 */

var now = require('date-now');

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

module.exports = function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function debounced() {
    context = this;
    args = arguments;
    timestamp = now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
};

},{"date-now":7}],7:[function(require,module,exports){
module.exports = Date.now || now

function now() {
    return new Date().getTime()
}

},{}],8:[function(require,module,exports){
module.exports=require(2)
},{}],9:[function(require,module,exports){
(function (process){
var addEventListener = require('add-event-listener')
  , removeEventListener = require('add-event-listener').removeEventListener

  , isBoolean = function (val) { return typeof(val) === 'boolean' }

  , polyfill = function (_callback) {
      var called = false
        , callback = function (visible) {
            if (called) return
            called = true
            removeEventListener(document, 'mousemove', onmousemove)
            _callback(visible)
          }
        , onmousemove = function () {
          callback(true)
        }

      addEventListener(document, 'mousemove', onmousemove)

      setTimeout(function () {
        callback(false)
      }, 500)
    }

module.exports = function (callback) {

  var hidden = isBoolean(document.hidden) ?
    document.hidden :
    isBoolean(document.webkitHidden) ?
    document.webkitHidden : document.mozHidden

  // if we have access to html5-visibility api use that
  if (typeof(hidden) === 'boolean') {
    return process.nextTick(function () { callback(!hidden) })
  } else {
    // otherwise use a polyfill (based on moving the mouse)
    polyfill(callback)
  }
}
}).call(this,require('_process'))
},{"_process":14,"add-event-listener":8}],10:[function(require,module,exports){
var window = require("global/window")
var once = require("once")

var messages = {
    "0": "Internal XMLHttpRequest Error",
    "4": "4xx Client Error",
    "5": "5xx Server Error"
}

var XHR = window.XMLHttpRequest || noop
var XDR = "withCredentials" in (new XHR()) ? XHR : window.XDomainRequest

module.exports = createXHR

function createXHR(options, callback) {
    if (typeof options === "string") {
        options = { uri: options }
    }

    options = options || {}
    callback = once(callback)

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new XDR()
        }else{
            xhr = new XHR()
        }
    }

    var uri = xhr.url = options.uri || options.url;
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var key

    if ("json" in options) {
        isJson = true
        headers["Accept"] = "application/json"
        if (method !== "GET" && method !== "HEAD") {
            headers["Content-Type"] = "application/json"
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = load
    xhr.onerror = error
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    // hate IE
    xhr.ontimeout = noop
    xhr.open(method, uri, !sync)
                                    //backward compatibility
    if (options.withCredentials || (options.cors && options.withCredentials !== false)) {
        xhr.withCredentials = true
    }

    // Cannot set timeout with sync request
    if (!sync) {
        xhr.timeout = "timeout" in options ? options.timeout : 5000
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers) {
        throw new Error("Headers cannot be set on an XDomainRequest object");
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }
    
    if ("beforeSend" in options && 
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr

    function readystatechange() {
        if (xhr.readyState === 4) {
            load()
        }
    }

    function load() {
        var error = null
        var status = xhr.statusCode = xhr.status
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = null

        if (xhr.response) {
            body = xhr.body = xhr.response
        } else if (xhr.responseType === 'text' || !xhr.responseType) {
            body = xhr.body = xhr.responseText || xhr.responseXML
        }

        if (status === 1223) {
            status = 204
        }

        if (status === 0 || (status >= 400 && status < 600)) {
            var message = (typeof body === "string" ? body : false) ||
                messages[String(status).charAt(0)]
            error = new Error(message)
            error.statusCode = status
        }
        
        xhr.status = xhr.statusCode = status;

        if (isJson) {
            try {
                body = xhr.body = JSON.parse(body)
            } catch (e) {}
        }

        callback(error, xhr, body)
    }

    function error(evt) {
        callback(evt, xhr)
    }
}


function noop() {}

},{"global/window":11,"once":12}],11:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window
} else if (typeof global !== "undefined") {
    module.exports = global
} else {
    module.exports = {}
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}

},{}],13:[function(require,module,exports){
var addEventListener = require('add-event-listener')
  , debounce = require('debounce')
  , pageVisibility = require('page-visibility')
  , getCssPath = require('css-path')
  , toCsv = require('csv-line')({ escapeNewlines: true })

  , slice = Array.prototype.slice

  , Track = function (options) {
      if (!(this instanceof Track))
        return new Track(options)

      options = options || {}

      this._startTime = Date.now()
      this._windowWidth = []
      this._windowHeight = []
      this._scrollOffset = 0
      this._resizeOffset = 0
      this.onevent = null
      this.onend = null

      this._debounceTime = typeof(options.debounceTime) === 'number' ?
        options.debounceTime : 500

      this._startTracking()
    }
  , isTrackable = function (elm) {
      return elm.getAttribute('data-trackable-type') && elm.getAttribute('data-trackable-value')
    }
  , findTrackable = function (elm) {
      var trackable = []

      for(; !!elm.tagName; elm = elm.parentNode) {
        if (isTrackable(elm))
          trackable.push(elm)
      }

      return trackable
    }
  , findAllTrackable = function () {
      return slice.call(document.querySelectorAll('[data-trackable-type][data-trackable-value]'))
    }

Track.prototype._toCsv = function (eventType, extra, offset) {
  offset = typeof(offset) === 'number' ? offset : Date.now() - this._startTime

  extra = extra || {}

  var array = [
          eventType
        , window.innerWidth
        , window.innerHeight
        , window.scrollX
        , window.scrollY
        , window.location.toString()
        , offset
        , document.referrer
        , extra.path
        , extra.clickX
        , extra.clickY
        , extra.href
        , extra.target
        , extra.visibility
        , extra.name
        , extra.trackableType
        , extra.trackableValue
      ]

  return toCsv(array)
}

Track.prototype._startTracking = function () {
  var self = this
    , track = function (eventType, extra, offset) {
        var csv = self._toCsv(eventType, extra, offset)

        if (self.onevent)
          self.onevent(csv)
      }
    , trackScroll = debounce(track.bind(null, 'scroll'), this._debounceTime)
    , trackResize = debounce(track.bind(null, 'resize'), this._debounceTime)
    , trackTrackable = function (eventType, elm) {
        track(
            eventType
          , {
                trackableValue: elm.getAttribute('data-trackable-value')
              , trackableType: elm.getAttribute('data-trackable-type')
              , path: getCssPath(elm)
            }
        )
      }
    , trackVisibleTrackingElements = function () {
        findAllTrackable().forEach(function (elm) {
          if (elm.getBoundingClientRect().top < window.innerHeight && !elm.trackedVisibility) {
            elm.trackedVisibility = true
            trackTrackable('trackable-visible', elm)
          }
        })
      }

  addEventListener(window, 'resize', function () {
    // must do this cause IE9 is stupid
    // ... and I'm also seeing some weirdness when tracking in Chrome without it
    if (window.innerWidth !== self._windowWidth || window.innerHeight !== self._windowHeight) {
      self._windowWidth = window.innerWidth
      self._windowHeight = window.innerHeight
      self._resizeOffset = Date.now() - self._startTime
      trackResize()
    }
  })

  addEventListener(window, 'scroll', function () {
    self._scrollOffset = Date.now() - self._startTime

    trackVisibleTrackingElements()

    trackScroll()
  })

  pageVisibility(function (visible) {
    // getting the visibility make take some time, but the  offset should be 0
    // - it's the visibiltiy that existed when the page was loaded
    track('visibility', { visibility: visible ? 'visible' : 'hidden' }, 0 )
  })

  addEventListener(window, 'load', function () {
    track('load')

    findAllTrackable().forEach(function (elm) {
      trackTrackable('trackable-load', elm)
    })

    trackVisibleTrackingElements()
  })

  addEventListener(window, 'focus', function () {
    track('visibility', { visibility: 'visible' })
  })
  addEventListener(window, 'blur', function () {
    track('visibility', { visibility: 'hidden' })
  })

  addEventListener(document, 'change', function (event) {
    var elm = event.target
      , path = elm ? getCssPath(elm, document.body) : undefined
      , name = elm ? elm.getAttribute('name') : undefined

    track('change', { path: path, name: name })
  })

  addEventListener(window, 'beforeunload', function (event) {
    self.onend(self._toCsv('end'))
  })

  addEventListener(document, 'click', function (event) {
    var elm = event.target
      , path = elm ? getCssPath(elm, document.body) : undefined
        // href & target is useful for a-element
        // if we're in a subelement, see if there's a parentNode that's
        // an a-element
      , aElm = (function (aElm) {
          for(aElm = aElm; aElm.tagName; aElm = aElm.parentNode ) {
            if (aElm.tagName === 'A')
              return aElm
          }
        })(elm)
      , href = aElm ? aElm.getAttribute('href') : undefined
      , target = aElm ? aElm.getAttribute('target') : undefined
      , extra = {
            path: path
          , clickX: event.pageX
          , clickY: event.pageY
          , href: href
          , target: target
        }

    track('click', extra)

    findTrackable(elm).forEach(function (trackElm) {
      trackTrackable('trackable-click', trackElm)
    })
  })

  addEventListener(document, 'mouseover', function (event) {
    var elm = event.target

    findTrackable(elm).forEach(function (trackElm) {
      trackTrackable('trackable-hover', trackElm)
    })
  })
}

module.exports = Track

},{"add-event-listener":2,"css-path":3,"csv-line":5,"debounce":6,"page-visibility":9}],14:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}]},{},[1]);
