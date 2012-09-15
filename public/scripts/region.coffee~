if window?
  exports = window.exports
  require = window.require

dataview = require 'dataview'
nbt = require 'nbt'
chunk = require 'chunk'

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
    @sectorFree = []
    for i in [0..nSectors-1]
      @sectorFree.push true
    @sectorFree[0] = false  # chunk offset table
    @sectorFree[1] = false  #for the last modified info
    @dataView.seek 0
    @offsets = new Int32Array(@buffer, 0, SECTOR_INTS)
    for i in [0..SECTOR_INTS]
      offset = @dataView.getInt32()          
      if offset != 0 && (offset >> 16) + ((offset>>8) & 0xFF) <= @sectorFree.length
        for sectorNum in [0..((offset>>8) & 0xFF)-1]
           @sectorFree[(offset >> 16) + sectorNum] = false

  getChunk: (x, z) =>
    try 
      if @outOfBounds x, z
        return null

      offset = @getOffset x, z
      if offset is 0          
        return null    

      sectorNumber = new Int32Array(1)
      numSectors = new Uint8Array(1)
      offset = @getOffset(x,z)
      sectorNumber = offset >> 16     #sectorNumber    
      numSectors = (offset >> 8) & 0xFF    #numSectors
      if numSectors is 0 then return null
      if sectorNumber + numSectors > @sectorFree.length
        return null      

      @dataView.seek sectorNumber * SECTOR_BYTES
      length = @dataView.getInt32()

      if length > SECTOR_BYTES * numSectors
        return null      

      version = @dataView.getUint8()
      data = new Uint8Array(@buffer, @dataView.tell(), length)
      retvalbytes = new Zlib.Inflate(data).decompress()
      nbtReader = new nbt.NBTReader(retvalbytes)
      retval = new chunk.Chunk(nbtReader.read())
      return retval
    catch e
    return null

  outOfBounds: (x, z) =>
    x < 0 or x >= 32 or z < 0 or z >= 32

  getOffset: (x, z) =>
    @offsets[x + z * 32]

  hasChunk: (x, z) =>
    offset = @getOffset(x, z)
    return (offset isnt 0)


exports.Region = Region
