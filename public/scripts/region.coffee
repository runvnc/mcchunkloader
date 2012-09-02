if window?
  exports = window.exports
  require = window.require

dataview = require 'dataview'

SECTOR_BYTES = 4096
SECTOR_INTS = SECTOR_BYTES / 4
CHUNK_HEADER_SIZE = 5

emptySectorBuffer = new ArrayBuffer(4096)
emptySector = new Uint8Array(emptySectorBuffer)

sizeDelta = 0

class Region
  constructor: (@buffer, @x, @z) ->
    @dataView = new dataview.jDataView(@buffer)
    sizeDelta = 0
    #set up the available sector map
    nSectors = @buffer.byteLength / SECTOR_BYTES
    console.log 'nSectors is ' + nSectors
    @sectorFree = []
    for i in [0..nSectors-1]
      @sectorFree.push true
    @sectorFree[0] = false  # chunk offset table
    @sectorFree[1] = false  #for the last modified info
    @dataView.seek 0
    @offsets = new Int32Array(@buffer, 0, SECTOR_INTS)
    console.log '@offsets follows'
    console.log @offsets
    for i in [0..SECTOR_INTS]
      offset = @dataView.getInt32()          
      if offset != 0 && (offset >> 16) + ((offset>>8) & 0xFF) <= @sectorFree.length
        for sectorNum in [0..((offset>>8) & 0xFF)-1]
           @sectorFree[(offset >> 16) + sectorNum] = false

  getChunk: (x, z) =>
    
    if @outOfBounds x, z
      console.log "READ " + x +  z " out of bounds"
      return null

    offset = @getOffset x, z
    if offset is 0          
      return null    

    sectorNumber = new Int32Array(1)
    numSectors = new Uint8Array(1)
    offset = @getOffset(x,z)
    sectorNumber = offset >> 16     #sectorNumber    
    numSectors = (offset >> 8) & 0xFF    #numSectors

    if sectorNumber + numSectors > @sectorFree.length
      console.log "READ " + x + z + " invalid sector"
      console.log 'length of sectorFree is ' + @sectorFree.length + ' sectorNumber is ' + sectorNumber  + ' numSectors is ' + numSectors
      return null      

    @dataView.seek sectorNumber * SECTOR_BYTES
    length = @dataView.getInt32()
    console.log 'LENGTH IS ' + length

    if length > SECTOR_BYTES * numSectors
      console.log "READ" + x + z + " invalid length: " + length + " > 4096 * " + numSectors
      return null      

    version = @dataView.getUint8()
    console.log 'COMPRESSION VERSION IS ' + version
    data = new Uint8Array(@buffer, @dataView.tell(), length)
    console.log "got byte array length " + data.length
    retval = new Zlib.Inflate(data).decompress()
    return retval

  outOfBounds: (x, z) =>
    x < 0 or x >= 32 or z < 0 or z >= 32

  getOffset: (x, z) =>
    @offsets[x + z * 32]

  hasChunk: (x, z) =>
    offset = @getOffset(x, z)
    console.log 'haschunk ' + x + ', ' +z + ' offset is ' + offset + ' returning ' + (offset isnt 0)
    return (offset isnt 0)

exports.Region = Region
