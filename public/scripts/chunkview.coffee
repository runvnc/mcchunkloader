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


class ChunkView
  constructor: (@options, @indices, @vertices) -> 
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
    console.log 'superflat is ' + @superflat
    console.log 'showStuff is ' + @showStuff
    console.log 'ymin is ' + @ymin
    
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
    @nomatch[y] = true    
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
    return false
    n = [p[0] + offset0, p[1] + offset1, p[2] + offset2]   
    id = @getBlockAt n[0], n[1], n[2]
    if id is 1 or id is 2 then return true else return false
    if not id? or id? < 1
      return false
    if not (id in [1, 2, 3, 4, 5]) then return false
    info = @getBlockType(n[0], n[1], n[2])
    if info.id in [0, 37, 38, 50] then return false
    return (info? and info?.id > 0 and info.t? and info.t[0] and not (info.id in [37, 38]) ) #or (info?.t? is 8 or info?.t? is 9)

  addTexturedBlock: (p) =>
    a = p
    block = @getBlockInfo(p)
    if block?.s?
      if not @special[block.type]?
        @special[block.type] = []
      @special[block.type].push calcPoint(p, this.options)
      console.log 'added ' + block.type
      console.log @special
    else
      #front face
      @addCubePoint a, -1.0, -1.0, 1.0
      @addCubePoint a, 1.0, -1.0, 1.0
      @addCubePoint a, 1.0, 1.0, 1.0
      @addCubePoint a, -1.0, 1.0, 1.0
      
      #back face
      @addCubePoint a, 1.0, -1.0, -1.0
      @addCubePoint a, -1.0, -1.0, -1.0
      @addCubePoint a, -1.0, 1.0, -1.0
      @addCubePoint a, 1.0, 1.0, -1.0
      
      #top face
      @addCubePoint a, -1.0, 1.0, -1.0
      @addCubePoint a, -1.0, 1.0, 1.0
      @addCubePoint a, 1.0, 1.0, 1.0
      @addCubePoint a, 1.0, 1.0, -1.0
      
      #bottom face
      @addCubePoint a, -1.0, -1.0, -1.0
      @addCubePoint a, 1.0, -1.0, -1.0
      @addCubePoint a, 1.0, -1.0, 1.0
      @addCubePoint a, -1.0, -1.0, 1.0

      #right face
      @addCubePoint a, 1.0, -1.0, 1.0
      @addCubePoint a, 1.0, -1.0, -1.0     
      @addCubePoint a, 1.0, 1.0, -1.0     
      @addCubePoint a, 1.0, 1.0, 1.0
      
      #left face    
      @addCubePoint a, -1.0, -1.0, -1.0
      @addCubePoint a, -1.0, -1.0, 1.0
      @addCubePoint a, -1.0, 1.0, 1.0
      @addCubePoint a, -1.0, 1.0, -1.0
      @addFaces @cubeCount * 24, block, p #24
      @cubeCount++

  addCubePoint: (a, xdelta, ydelta, zdelta) =>
    s = 0.0000000 #xdelta * 0.001
    p2 = [a[0] + xdelta * 0.5 + s, a[1] + ydelta * 0.5 + s, a[2] + zdelta * 0.5 + s]
    p3 = calcPoint(p2, this.options)
    
    @vertices.push p3[0]
    @vertices.push p3[1]
    @vertices.push p3[2]   

  addFaces: (i, bl, p) =>
    coords = typeToCoords(bl)
    show = {}
    coordsfront = coords
    coordsback = coords
    coordsleft = coords
    coordsright = coords
    coordstop = coords
    coordsbottom = coords

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
    
    #if not bl.id in [37,38] and not (show.front or show.back or show.top or show.bottom or show.left or show.right)
    #  show = { front: true, back: true, top: true, bottom: true, left: true, right: true }

    if bl.id is 2
      dirtgrass = blockInfo['_2x']      
      coordsfront = typeToCoords(dirtgrass)
      coordsback = coordsfront
      coordsleft = coordsfront
      coordsright = coordsfront
      coordsbottom = coordsfront

    totfaces = 0
    totfaces++  if show.front
    totfaces++  if show.back
    totfaces++  if show.top
    totfaces++  if show.bottom
    totfaces++  if show.left
    totfaces++  if show.right

    #if totfaces > 1 or totfaces < 1
    #  show = { front: true, back: true, top: true, bottom: true, left: true, right: true }

    @indices.push.apply @indices, [i + 0, i + 1, i + 2, i + 0, i + 2, i + 3]  if show.front # Front face
    @indices.push.apply @indices, [i + 4, i + 5, i + 6, i + 4, i + 6, i + 7]  if show.back # Back face
    @indices.push.apply @indices, [i + 8, i + 9, i + 10, i + 8, i + 10, i + 11]  if show.top #,  // Top face
    @indices.push.apply @indices, [i + 12, i + 13, i + 14, i + 12, i + 14, i + 15]  if show.bottom # Bottom face
    @indices.push.apply @indices, [i + 16, i + 17, i + 18, i + 16, i + 18, i + 19]  if show.right # Right face    
    @indices.push.apply @indices, [i + 20, i + 21, i + 22, i + 20, i + 22, i + 23]  if show.left #y/ Left face
    
    
    #if show.front
    @textcoords.push.apply @textcoords, coordsfront
    
    #if show.back
    @textcoords.push.apply @textcoords, coordsback
    
    #if show.top
    @textcoords.push.apply @textcoords, coordstop
    
    #if show.bottom 
    @textcoords.push.apply @textcoords, coordsbottom
    
    #if show.right
    @textcoords.push.apply @textcoords, coordsright
    
    #if show.left
    @textcoords.push.apply @textcoords, coordsleft

    clr = [ bl.rgba[0], bl.rgba[1], bl.rgba[2]]

    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr

    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
  
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
  
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
    @colors.push.apply @colors, clr
 

  
exports.ChunkView = ChunkView
exports.calcPoint = calcPoint
exports.typeToCoords = typeToCoords

