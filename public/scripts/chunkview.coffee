if window?
  require = window.require
  exports = window.exports

blockInfo = require('blockinfo').blockInfo

ChunkSizeY = 256
ChunkSizeZ = 16
ChunkSizeX = 16

cubeCount = 0

calcOpts = {}

times = 0

calcPoint = (pos, opts) ->
  verts = []
  verts.push pos[0] + opts.chunkX * 16 * 1.00000
  verts.push (pos[1] + 1) * 1.0
  verts.push pos[2] + opts.chunkZ * 16 * 1.00000
  verts

typeToCoords = (type) ->
  if type.t?
    x = type.t[0]
    y = 15 - type.t[1]
    s = 0.000000000 # -0.0001
    return [x / 16.0+s, y / 16.0+s, (x + 1.0) / 16.0-s, y / 16.0+s, (x + 1.0) / 16.0-s, (y + 1.0) / 16.0-s, x / 16.0+s, (y + 1.0) / 16.0-s]
  else
    return [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

typeToCoords2 = (type) ->
  if type.t?
    x = type.t[0]
    y = 15 - type.t[1]
    s = 0.000000000 # -0.0001
    return [x / 16.0, y / 16.0, (x + 1.0) / 16.0, y / 16.0, (x + 1.0) / 16.0, (y + 1.0) / 16.0,
            x / 16.0, y / 16.0, (x + 1.0) / 16.0, (y + 1.0) / 16.0, x / 16.0, (y + 1.0) / 16.0]
  else
    return [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]


class ChunkView
  constructor: (@options, @indices, @vertices) -> 
    @index = 0
    @nbt = options.nbt
    @pos = options.pos
    @torches = []
    @unknown = []
    @notexture = []
    @rotcent = true
    @filled = []
    @nomatch = {}
    @special = {}
   
    if @options.ymin? then @ymin = @options.ymin else @ymin = 60
    if @options.superflat? is 'true' then @options.superflat = true
    if @options.superflat? then @superflat = @options.superflat else @superflat = false
    if @options.showstuff? then @showStuff = @options.showstuff else @showStuff = 'diamondsmoss'    
    
    if options.ymin? then @ymin = options.ymin
  
  getBlockAt: (x, y, z) =>
    if @nbt.root.Level.Sections?
      sections = @nbt.root.Level.Sections
    else
      sections = @nbt.root.Sections
    if not sections then return -1

    sectionnum = Math.floor( (y / 16) )
    offset = ((y%16)*256) + (z * 16) + x
    blockpos = offset
    for section in sections
      if section isnt undefined and section.Y * 1 is sectionnum * 1   
        return section.Blocks[blockpos]
    return -1

  getLightAt: (x, y, z) =>
    if @nbt.root.Level.Sections?
      sections = @nbt.root.Level.Sections
    else
      sections = @nbt.root.Sections
    if not sections then return -1

    sectionnum = Math.floor( (y / 16) )
    offset = ((y%16)*256) + (z * 16) + x

    for section in sections
      if section isnt undefined and section.Y * 1 is sectionnum * 1   
        if offset % 2 == 0          
          return section.BlockLight[Math.floor(offset/2)] & 0x0F
        else          
          return (section.BlockLight[Math.floor(offset/2)] >> 4 ) & 0x0F
    return -1


  transNeighbors: (x, y, z) =>
    for i in [x-1..x+1] 
      if i >= ChunkSizeX then continue
      for j in [y-1..y+1] 
        for k in [z-1..z+1]
          if k >= ChunkSizeZ then continue
          if not (i is x and j is y and k is z)
            blockID = @getBlockAt i, j, k
            if blockID is 0 or blockID is -1 #or blockID is -10              
              return true

    return false


  extractChunk: =>
    @vertices = []
    @colors = []
    @indices = []
    @textcoords = []
    @filled = []
    @cubeCount = 0
    
    if @nbt.root.Level.Sections?
      sections = @nbt.root.Level.Sections
    else
      sections = @nbt.root.Sections
    if not sections then return    
    for section in sections
      if section isnt undefined #and (section.Y*1)*16 >= @ymin           
        Y = section.Y * 1
        for y in [Y*16..Y*16+15]
          for x in [0..ChunkSizeX-1]
            for z in [0..ChunkSizeZ-1]
              if y < @ymin then continue     
              offset = ((y%16)*256) + (z * 16) + x
              id = section.Blocks[offset]               
              #id = @getBlockAt x, y, z
              blockType = blockInfo['_'+id]             
              if not blockType?
                id = -1
                #id = 1
              if not blockType?.t?
                id = -1
                #if not (id in @notexture) then @notexture.push id
                #id = -1
                #id = 1

              show = false
              show = (id > 0)
              
              if not @superflat and y<60 and @showStuff is 'diamondsmoss'
                show = ( id is 48 or id is 56 or id is 4 or id is 52 )
              else
                if id isnt 0 and id isnt -1 and id isnt -10
                  show = @transNeighbors x, y, z
                else
                  show = false
              
              if show
                @addBlock [x,y,z]
              else
                blah = 1
    @renderPoints()

  addBlock: (position) =>
    verts = [position[0], position[1], position[2]]
    @filled.push verts

  renderPoints: =>
    i = 0

    while i < @filled.length
      verts = @filled[i]
      @addTexturedBlock verts
      i++

  getBlockType: (x, y, z) =>
    blockType = blockInfo["_-1"]
    id = @getBlockAt x, y, z
    blockID = "_-1"
    if id? then blockID = "_" + id.toString()  
    if blockInfo[blockID]? then blockType = blockInfo[blockID]  
    blockType

  getBlockInfo: (p) =>
    blockType = blockInfo["_-1"]
    id = @getBlockAt p[0], p[1], p[2]
    blockID = "_-1"
    if id? then blockID = "_" + id.toString()
    if blockInfo[blockID]?
      return blockInfo[blockID]
    else
      return blockInfo["_-1"]

  getColor: (pos) =>
    t = @getBlockType pos[0], pos[1], pos[2]
    t.rgba

  hasNeighbor: (bl, p, offset0, offset1, offset2) =>
    if @showStuff is 'diamondsmoss' and p[1] < 62 then return false
    if p[0] is 0 or p[0] is 15 or p[2] is 0 or p[2] is 15
      return false
    n = [p[0] + offset0, p[1] + offset1, p[2] + offset2]   
    id = @getBlockAt n[0], n[1], n[2]
    #if id is 1 or id is 2 then return true else return false
    #if not id? or id? < 1
    #  return false
    #if not (id in [1, 2, 3, 4, 5]) then return false
    info = @getBlockType(n[0], n[1], n[2])
    if info.id in [0, 37, 38, 50] then return false
    return (info? and info?.id > 0 and info.t? and info.t[0]?) # and not (info.id in [37, 38]) ) #or (info?.t? is 8 or info?.t? is 9)


  addTexturedBlock: (p) =>
    a = p
    block = @getBlockInfo(p)
    blockType = block.type
    if block?.s?
      if block.type.indexOf('woodendoor') >= 0 or block.type.indexOf('irondoor') >= 0
        blockAbove = @getBlockInfo [ p[0], p[1]+1, p[2] ] 
        if blockAbove?.s? and blockAbove.type is block.type
          blockType = block.type + 'bottom'
        else
          blockType = block.type + 'top'
      if not @special[blockType]?
        @special[blockType] = []
      @special[blockType].push calcPoint(p, this.options)
      console.log @special
    else      
      for side in ['front','back','top','bottom','right','left']
        @index = @addFace @index, a, block, p, side      
    
      show = @showBlock block, p
     

  showBlock: (bl, p) =>
    show = {}
    if bl.id in [37, 38]
      show =
        front: true #false
        back: true #false
        top: true #false
        bottom: true #false
        left: true #false
        right: true #false
    else      
      show.front = not (@hasNeighbor(bl, p, 0, 0, 1))
      show.back = not (@hasNeighbor(bl, p, 0, 0, -1))
      show.top = not (@hasNeighbor(bl, p, 0, 1, 0))
      show.bottom = not (@hasNeighbor(bl, p, 0, -1, 0))
      show.left = not (@hasNeighbor(bl, p, -1, 0, 0))
      show.right = not (@hasNeighbor(bl, p, 1, 0, 0))
    show

  addCubePoint: (a, xdelta, ydelta, zdelta) =>
    s = 0.0000000 #xdelta * 0.001
    p2 = [a[0] + xdelta * 0.5 + s, a[1] + ydelta * 0.5 + s, a[2] + zdelta * 0.5 + s]
    p3 = calcPoint(p2, this.options)
    
    @vertices.push p3[0]
    @vertices.push p3[1]
    @vertices.push p3[2]   

  addFace: (i, a, bl, p, side) =>
    try
      coords = typeToCoords2(bl)
      dirtgrass = blockInfo['_2x']      
      facecoords = typeToCoords2(dirtgrass) 
      show = @showBlock bl, p   
      if show[side]               
        switch side
          when 'front'
            if bl.id is 2
              coords = facecoords
            @addCubePoint a, -1.0, -1.0, 1.0
            @addCubePoint a, 1.0, -1.0, 1.0
            @addCubePoint a, 1.0, 1.0, 1.0
            @addCubePoint a, -1.0, -1.0, 1.0
            @addCubePoint a, 1.0, 1.0, 1.0
            @addCubePoint a, -1.0, 1.0, 1.0
          when 'back'
            if bl.id is 2
              coords = facecoords
            @addCubePoint a, 1.0, -1.0, -1.0
            @addCubePoint a, -1.0, -1.0, -1.0
            @addCubePoint a, -1.0, 1.0, -1.0
            @addCubePoint a, 1.0, -1.0, -1.0
            @addCubePoint a, -1.0, 1.0, -1.0
            @addCubePoint a, 1.0, 1.0, -1.0
          when 'top'      
            @addCubePoint a, -1.0, 1.0, -1.0
            @addCubePoint a, -1.0, 1.0, 1.0
            @addCubePoint a, 1.0, 1.0, 1.0
            @addCubePoint a, -1.0, 1.0, -1.0
            @addCubePoint a, 1.0, 1.0, 1.0
            @addCubePoint a, 1.0, 1.0, -1.0
          when 'bottom'      
            if bl.id is 2
              coords = facecoords
            @addCubePoint a, -1.0, -1.0, -1.0
            @addCubePoint a, 1.0, -1.0, -1.0
            @addCubePoint a, 1.0, -1.0, 1.0
            @addCubePoint a, -1.0, -1.0, -1.0
            @addCubePoint a, 1.0, -1.0, 1.0
            @addCubePoint a, -1.0, -1.0, 1.0
          when 'right'
            if bl.id is 2
              coords = facecoords
            @addCubePoint a, 1.0, -1.0, 1.0
            @addCubePoint a, 1.0, -1.0, -1.0     
            @addCubePoint a, 1.0, 1.0, -1.0
            @addCubePoint a, 1.0, -1.0, 1.0
            @addCubePoint a, 1.0, 1.0, -1.0     
            @addCubePoint a, 1.0, 1.0, 1.0
          when 'left'   
            if bl.id is 2
              coords = facecoords
            @addCubePoint a, -1.0, -1.0, -1.0
            @addCubePoint a, -1.0, -1.0, 1.0
            @addCubePoint a, -1.0, 1.0, 1.0
            @addCubePoint a, -1.0, -1.0, -1.0
            @addCubePoint a, -1.0, 1.0, 1.0
            @addCubePoint a, -1.0, 1.0, -1.0

        @indices.push.apply @indices, [i + 0, i + 1, i + 2, i + 3, i + 4, i + 5]
          
        @textcoords.push.apply @textcoords, coords

        clr = [ 1.0, 1.0, 1.0 ]    

        @colors.push.apply @colors, clr
        @colors.push.apply @colors, clr
        @colors.push.apply @colors, clr
        @colors.push.apply @colors, clr   
        @colors.push.apply @colors, clr   
        @colors.push.apply @colors, clr   

    catch e
      console.log e
    finally
      if show[side] then return i+6 else return i

  
exports.ChunkView = ChunkView
exports.calcPoint = calcPoint
exports.typeToCoords = typeToCoords

