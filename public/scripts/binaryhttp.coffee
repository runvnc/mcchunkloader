if window?
  exports = window.exports
  require = window.require

exports.loadBinary = (url, progresscallback, donecallback) ->
  xmlhttp = new XMLHttpRequest()
  xmlhttp.open "GET", url, true
  if xmlhttp.responseType?
    xmlhttp.responseType = "arraybuffer"
  xmlhttp.addEventListener 'progress', progresscallback, false

  xmlhttp.onload = ->
     #XHR_buffer buffer = xmlhttp.mozResponseArrayBuffer || xmlhttp.response;
     #if not buffer?
     #  buffer = xmlhttp.response 
     buffer = xmlhttp.response
     if buffer?
       donecallback buffer
  xmlhttp.send()


