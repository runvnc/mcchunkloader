if window?
  require = window.require
  exports = window.exports

SCALE = 5

controls = null

chunks = require 'chunk'
chunkview = require('chunkview')
ChunkView = chunkview.ChunkView
blockInfo = require('blockinfo').blockInfo

Number.prototype.mod = (n) ->
  ((this % n) + n) % n


delay = (ms, func) ->
  setTimeout func, ms

canvas = null
time = null

class RegionRenderer
  constructor: (@region, @options) ->          
    if @options.y < 50
      @options.superflat = true
    @mouseX = 0
    @mouseY = 0
    @textures = {}

    @windowHalfX = window.innerWidth / 2;
    @windowHalfY = window.innerHeight / 2;
   
    blocker = document.getElementById("blocker")
    instructions = document.getElementById("instructions")

    # http://www.html5rocks.com/en/tutorials/pointerlock/intro/
    havePointerLock = "pointerLockElement" of document or "mozPointerLockElement" of document or "webkitPointerLockElement" of document
    if havePointerLock
      console.log 'havepointerlock'
      element = document.body
      pointerlockchange = (event) =>
        if document.pointerLockElement is element or document.mozPointerLockElement is element or document.webkitPointerLockElement is element
          controls.enabled = true
          blocker.style.display = "none"
        else
          controls.enabled = false
          blocker.style.display = "-webkit-box"
          blocker.style.display = "-moz-box"
          blocker.style.display = "box"
          instructions.style.display = ""

      pointerlockerror = (event) ->
        instructions.style.display = ""

      # Hook pointer lock state change events
      document.addEventListener "pointerlockchange", pointerlockchange, false
      document.addEventListener "mozpointerlockchange", pointerlockchange, false
      document.addEventListener "webkitpointerlockchange", pointerlockchange, false
      document.addEventListener "pointerlockerror", pointerlockerror, false
      document.addEventListener "mozpointerlockerror", pointerlockerror, false
      document.addEventListener "webkitpointerlockerror", pointerlockerror, false
      instructions.addEventListener "click", ((event) ->
        instructions.style.display = "none"
        
        # Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock or element.mozRequestPointerLock or element.webkitRequestPointerLock
        if /Firefox/i.test(navigator.userAgent)
          fullscreenchange = (event) ->
            if document.fullscreenElement is element or document.mozFullscreenElement is element or document.mozFullScreenElement is element
              document.removeEventListener "fullscreenchange", fullscreenchange
              document.removeEventListener "mozfullscreenchange", fullscreenchange
              element.requestPointerLock()

          document.addEventListener "fullscreenchange", fullscreenchange, false
          document.addEventListener "mozfullscreenchange", fullscreenchange, false
          element.requestFullscreen = element.requestFullscreen or element.mozRequestFullscreen or element.mozRequestFullScreen or element.webkitRequestFullscreen
          element.requestFullscreen()
        else
          element.requestPointerLock()
      ), false
    else
      instructions.innerHTML = "Your browser doesn't seem to support Pointer Lock API"
    
    @init()
    @animate()
    @load()
 
    
  addTorches: (view) =>
    if view.special['torch']?
      for coords in view.special.torch        
        pointLight = new THREE.PointLight(0xFFFFAA, 1.0, 15)
        pointLight.position.set coords[0],coords[1],coords[2]
        @scene.add pointLight

  addDoor: (coord, isTop) =>
    plane = new THREE.PlaneGeometry(1.0,1.0,1.0)
    if not isTop
      uv = chunkview.typeToCoords blockInfo['_64']
    else
      uv = chunkview.typeToCoords blockInfo['_64x']
    uvs = []
    plane.faceVertexUvs = [ [] ]
    plane.faceVertexUvs[0].push [
      new THREE.UV( uv[6], uv[7] )
      new THREE.UV( uv[0], uv[1] )
      new THREE.UV( uv[2], uv[3] )
      new THREE.UV( uv[4], uv[5] )
    ]
    material = @loadTexture '/terrain.png'
    mesh = new THREE.Mesh(plane, material)
    mesh.position.set coord[0], coord[1], coord[2]
    @scene.add mesh

  addPane: (coord) =>
    cube = new THREE.CubeGeometry(1.0, 1.0, 1.0)
    uv = chunkview.typeToCoords blockInfo['_20']
    uvs = []
    cube.faceVertexUvs = [ [] ]
    for i in [0..5]
      cube.faceVertexUvs[0].push [
        new THREE.UV( uv[0], uv[1] )
        new THREE.UV( uv[2], uv[3] )
        new THREE.UV( uv[4], uv[5] )
        new THREE.UV( uv[6], uv[7] )
      ]
    material = @loadTexture '/terrain.png'
    mesh = new THREE.Mesh(cube, material)
    mesh.position.set coord[0], coord[1], coord[2]
    @scene.add mesh

  addSpecial: (view) =>
    if view.special['glasspane']?
      console.log 'view special is '
      console.log view.special
      
      for coords in view.special.glasspane
        @addPane coords
    if view.special['glass']?
      for coords in view.special.glass
        @addPane coords
    if view.special['woodendoortop']?
      for coords in view.special.woodendoortop
        @addDoor coords, true
    if view.special['woodendoorbottom']?
      for coords in view.special.woodendoorbottom
        @addDoor coords, false

  mcCoordsToWorld: (x, y, z) =>
    chunkX = (Math.floor(x/16)).mod(32)
    chunkZ = (Math.floor(z/16)).mod(32)
    posX = (x.mod(32 * 16)).mod(16)
    posZ = (z.mod(32 * 16)).mod(16)

    posX = Math.abs(posX)
    posZ = Math.abs(posZ)
    chunkX = Math.abs(chunkX)
    chunkZ = Math.abs(chunkZ)

    verts = chunkview.calcPoint [posX, y, posZ], { chunkX, chunkZ }
    ret =
      x: verts[0]
      y: verts[1]
      z: verts[2]
      chunkX: chunkX
      chunkZ: chunkZ
    ret

  loadChunk: (chunk, chunkX, chunkZ) =>
    options =
      nbt: chunk
      ymin: @options.ymin
      showstuff: @options.showstuff
      superflat: @options.superflat
      chunkX: chunkX
      chunkZ: chunkZ
    view = new ChunkView(options)
    try
      view.extractChunk()
    catch e
      console.log "Error in extractChunk"
      console.log e.message
      console.log e.stack
    if view.vertices.length is 0
      console.log "(#{chunkX}, #{chunkZ}) is blank. chunk is "
      console.log chunk
      console.log 'view is '
      console.log view
    @addTorches view
    @addSpecial view    
    vertexIndexArray = new Uint16Array(view.indices.length)
    for i in [0...view.indices.length]
      vertexIndexArray[i] = view.indices[i]

    vertexPositionArray = new Float32Array(view.vertices.length)
    for i in [0...view.vertices.length]
      vertexPositionArray[i] = view.vertices[i]

    colorArray = new Float32Array(view.colors.length)
    for i in [0...view.colors.length]
      colorArray[i] = view.colors[i]

    uvArray = new Float32Array(view.textcoords.length)
    for i in [0...view.textcoords.length]
      uvArray[i] = view.textcoords[i]

    attributes =
      index:
        itemSize: 1
        array: vertexIndexArray
        numItems: vertexIndexArray.length 
      position:
        itemSize: 3
        array: vertexPositionArray
        numItems: vertexPositionArray.length / 3
      color:
        itemSize: 3
        array: colorArray
        numItems: colorArray / 3      
      uv:
        itemSize: 2
        array: uvArray
        numItems: uvArray.length / 2
      

    geometry = new THREE.BufferGeometry()
    geometry.attributes = attributes
        
    geometry.offsets = [{
      start: 0
      count: vertexIndexArray.length
      index: 0
    }]
      
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
    geometry.computeVertexNormals()

    material = @loadTexture('/terrain.png')
    mesh = new THREE.Mesh(geometry, material)
    #mesh.doubleSided = true
    @scene.add mesh
    @objects.push mesh
    @centerX = mesh.position.x + 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x )
    @centerY = mesh.position.y + 0.5 * ( geometry.boundingBox.max.y - geometry.boundingBox.min.y )
    @centerZ = mesh.position.z + 0.5 * ( geometry.boundingBox.max.z - geometry.boundingBox.min.z )
    @camera.lookAt mesh.position
    return null

  loadTexture: (path) =>
    if @textures[path] then return @textures[path]
    @image = new Image()
    @image.onload = -> texture.needsUpdate = true
    @image.src = path
    texture  = new THREE.Texture( @image,  new THREE.UVMapping(), THREE.ClampToEdgeWrapping , THREE.ClampToEdgeWrapping , THREE.NearestFilter, THREE.NearestMipMapNearestFilter )    
    @textures[path] = new THREE.MeshLambertMaterial( { map: texture, transparent: true, perPixel: true, vertexColors: THREE.VertexColors } )
    return @textures[path]

  load: =>
    startX = @options.x * 1
    startZ = @options.z * 1
    camPos = @mcCoordsToWorld(startX,@options.y * 1,startZ)
    size = @options.size * 1
    minx = camPos.chunkX - size
    minz = camPos.chunkZ - size
    maxx = camPos.chunkX + size
    maxz = camPos.chunkZ + size

    controls.getObject().position.x = camPos.x
    controls.getObject().position.y = camPos.y
    controls.getObject().position.z = camPos.z
    console.log 'minx is ' + minx + ' and minz is '+ minz
    for x in [minx..maxx]
      for z in [minz..maxz]
        region = @region
        if true or @region.hasChunk x,z
          try
            chunk = region.getChunk x,z
            if chunk?
              @loadChunk chunk, x, z
            else
              console.log 'chunk at ' + x + ',' + z + ' is undefined'
          catch e
            console.log e.message
            console.log e.stack

  showProgress: (ratio) =>
    $('#proginner').width 300*ratio

  init: =>
    container = document.createElement 'div'
    document.body.appendChild container 

    @objects = []

    @camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1500 )
      
    @scene = new THREE.Scene()

    @scene.add new THREE.AmbientLight(0x111111)
    pointLight = new THREE.PointLight(0xccbbbb, 1, 2800)
    pointLight.position.set( 400, 400, 600 ) 
    @scene.add pointLight

    #@pointLight = new THREE.PointLight(0x887777, 1, 18.0)
    #@pointLight.position.set(0,250,0)
    #@scene.add @pointLight

    @renderer = new THREE.WebGLRenderer({ antialias	: true, clearAlpha: 0x6D839C, alpha: true  })
 
    @renderer.setClearColorHex( 0x6D839C, 1 )
    @renderer.setSize window.innerWidth, window.innerHeight
    container.appendChild @renderer.domElement

    controls = new PointerLockControls( @camera )
    @scene.add controls.getObject()

    @ray = new THREE.Ray()
    @ray.direction.set( 0, -1, 0 )

    @stats = new Stats()
    @stats.domElement.style.position = 'absolute'
    @stats.domElement.style.top = '0px'
    container.appendChild @stats.domElement

    window.addEventListener 'resize', @onWindowResize, false

  onWindowResize: =>
    @windowHalfX = window.innerWidth / 2
    @windowHalfY = window.innerHeight / 2

    @camera.aspect = window.innerWidth / window.innerHeight
    @camera.updateProjectionMatrix()

    @renderer.setSize window.innerWidth, window.innerHeight

  animate: =>
    requestAnimationFrame @animate

    controls.isOnObject true
    #@ray.origin.copy controls.getObject().position
    #@ray.origin.y -= 0.01
    #if @objects.length > 0      
    #  d = 0
    #  intersections = @ray.intersectObjects(@objects)
    #if intersections?.length > 0
    #   d = 1
    ##  distance = intersections[0].distance
    #  controls.isOnObject true  if distance > 0 and distance < 1
    #@pointLight.position.set controls.getObject().position.x, controls.getObject().position.y, controls.getObject().position.z

    @render()
    @stats.update()

  render: =>     
    controls.update Date.now() - time
    @renderer.render @scene, @camera
    time = Date.now()


exports.RegionRenderer = RegionRenderer

