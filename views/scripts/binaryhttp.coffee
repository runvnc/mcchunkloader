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
     buffer = xmlhttp.response
     if buffer?
       donecallback buffer
  xmlhttp.send()


exports.binaryFromFile = (file, progresscallback, donecallback) ->
  reader = new FileReader()
  reader.onload = (ev) ->
    donecallback ev.target.result
  reader.readAsArrayBuffer file

