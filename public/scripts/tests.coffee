if window?
  exports = window.exports
  require = window.require

data = undefined

binaryhttp = require 'binaryhttp'
region = require 'region'
chunkdata = require 'chunkdata'
render = require 'render'
nbt = require 'nbt'

whichChunks = (region) ->
  count = 0
  chunks = {}

onProgress = (evt) ->
  $('#proginner').width $('#progouter').width() * (evt.position/evt.total)

delay = (ms, func) ->
  setTimeout func, ms

done = (arraybuffer) ->
  delay 150, ->
    start = new Date().getTime()
    data = arraybuffer
    console.log arraybuffer
    testregion = new region.Region(data)
    console.log testregion
    whichChunks testregion
    renderer = new render.RegionRenderer(testregion)
    total = new Date().getTime() - start
    seconds = total / 1000.0
    console.log "loaded in #{seconds} seconds"

exports.runTests = ->
  binaryhttp.loadBinary '/r.0.0.mca', onProgress, done
   
