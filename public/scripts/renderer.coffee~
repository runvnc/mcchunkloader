if window?
  require = window.require
  exports = window.exports

SCALE = 5

chunks = require 'chunk'
chunkview = require('chunkview')
ChunkView = chunkview.ChunkView
blockInfo = require('blockinfo').blockInfo

Number.prototype.mod = (n) ->
  ((this % n) + n) % n



delay = (ms, func) ->
  setTimeout func, ms

class RegionRenderer
  constructor: (@region, @options) ->          
    if @options.y < 50
      @options.superflat = true
    @mouseX = 0
    @mouseY = 0
    @textures = {}

    @windowHalfX = window.innerWidth / 2;
    @windowHalfY = window.innerHeight / 2;

    @init()
    @animate()
    @load()

  addTorches: (view) =>
    for coords in view.torches
      pointLight = new THREE.PointLight(0xFFFFAA, 1.0, 15)
      pointLight.position.set coords[0],coords[1],coords[2]
      @scene.add pointLight

  mcCoordsToWorld: (x, y, z) =>
    chunkX = (Math.floor(x/16)).mod(32)
    chunkZ = (Math.floor(z/16)).mod(32)
    #if x < 0 then chunkX = 32 - chunkX
    #if z < 0 then chunkZ = 32 - chunkZ
    posX = (x.mod(32 * 16)).mod(16)
    posZ = (z.mod(32 * 16)).mod(16)
    #if x > 0
    #  posX -= chunkX * 16
    #else
    #  posX += chunkX * 16
    #if z > 0
    #  posZ -= chunkZ * 16
    #else
    #  posZ += chunkZ * 16
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
      console.log e
    if view.vertices.length is 0
      console.log "(#{chunkX}, #{chunkZ}) is blank. chunk is "
      console.log chunk
      console.log 'view is '
      console.log view
    @addTorches view
    vertexIndexArray = new Uint16Array(view.indices.length)
    for i in [0...view.indices.length]
      vertexIndexArray[i] = view.indices[i]

    vertexPositionArray = new Float32Array(view.vertices.length)
    for i in [0...view.vertices.length]
      vertexPositionArray[i] = view.vertices[i]

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
    mesh.doubleSided = false
    @scene.add mesh
    #@camera.position.x = view.vertices[0]
    #@camera.position.y = view.vertices[1]
    #@camera.position.z = view.vertices[2]
    
    centerX = mesh.position.x + 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x )
    centerY = mesh.position.y + 0.5 * ( geometry.boundingBox.max.y - geometry.boundingBox.min.y )
    centerZ = mesh.position.z + 0.5 * ( geometry.boundingBox.max.z - geometry.boundingBox.min.z )
    @camera.lookAt mesh.position
    return null

  loadTexture: (path) =>
    if @textures[path] then return @textures[path]
    image = new Image()
    image.onload = -> texture.needsUpdate = true
    image.src = path
    texture  = new THREE.Texture( image,  new THREE.UVMapping(), THREE.ClampToEdgeWrapping , THREE.ClampToEdgeWrapping , THREE.NearestFilter, THREE.NearestFilter )    
    @textures[path] = new THREE.MeshLambertMaterial( { map: texture, transparent: true } )
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
    @camera.position.x = camPos.x
    @camera.position.y = camPos.y
    @camera.position.z = camPos.z
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

    @clock = new THREE.Clock()

    #@camera = new THREE.OrthographicCamera(-1000, 1000, -1000, 1000, -1000, 1000)
    @camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1500 )
   
    #@camera.position.z = 50
    #@camera.position.y = 25
    
    @scene = new THREE.Scene()

    @scene.add new THREE.AmbientLight(0x333333)
    pointLight = new THREE.PointLight(0x332222)
    pointLight.position.set( 400, 100, 600 ) 
    @scene.add pointLight

    #@pointLight = new THREE.PointLight(0xddcccc, 1, 1500)
    #@pointLight.position.set(0,250,0)
    #@scene.add @pointLight

    @renderer = new THREE.WebGLRenderer({  antialias	: true })
 
    @renderer.setClearColorHex( 0x6D839C, 1 )
    @renderer.setSize window.innerWidth, window.innerHeight
    container.appendChild @renderer.domElement

    @controls = new THREE.FirstPersonControls( @camera )
    @controls.movementSpeed = 20
    @controls.lookSpeed = 0.125
    @controls.lookVertical = true

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
  
    @controls.handleResize()

    @renderer.setSize window.innerWidth, window.innerHeight

  animate: =>
    requestAnimationFrame @animate
    @render()
    @stats.update()

  render: =>
    time = Date.now() * 0.00005
    @controls.update @clock.getDelta()
    #@pointLight.position.set @camera.position.x, @camera.position.y, @camera.position.z
    #@camera.lookAt @scene.position
    #for i in [0..@scene.children.length-1]
    ##  object = @scene.children[ i ]
    #  if object instanceof THREE.ParticleSystem
    #    object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) )
    @renderer.render @scene, @camera


exports.RegionRenderer = RegionRenderer

