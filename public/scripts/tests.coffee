if window?
  exports = window.exports
  require = window.require

data = undefined

binaryhttp = require 'binaryhttp'
region = require 'region'
nbt = require 'nbt'


whichChunks = (region) ->
  count = 0
  chunks = {}
  for x in [0..31]
    for z in [0..31]
      if region.hasChunk x,z
        nbtbytes = region.getChunk x,z
        nbtBuffer = new ArrayBuffer(nbtbytes.length)
        byteView = new Uint8Array(nbtBuffer)
        for i in [0..nbtbytes.length-1]
          byteView[i] = nbtbytes[i]
        nbtReader = new nbt.NBTReader(nbtBuffer)
        chunk = nbtReader.read()
        count++
  console.log "#{count} of max 1024 chunks"
  console.log chunks

onProgress = (evt) ->

done = (arraybuffer) ->
  data = arraybuffer
  console.log arraybuffer
  testregion = new region.Region(data)
  console.log testregion
  whichChunks testregion

exports.runTests = ->
  binaryhttp.loadBinary '/r.0.0.mca', onProgress, done
   
