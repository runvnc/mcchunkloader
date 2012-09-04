if window?
  exports = window.exports
  require = window.require

class Chunk
  constructor: (@nbt) ->
    for name, property of @nbt
      @[name] = property
    
  getBlockAt: (x, y, z) =>   
    if not @root.Level.Sections? then return
    sectionnum = Math.floor (y / 16)
    blockpos = y*16*16 + z*16 + x 
    section = @root.Level.Sections[sectionnum]
    if not section? or (not section?.Blocks?)
      return -1
    else
      return section.Blocks[blockpos]

exports.Chunk = Chunk

