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
    @included = []

    @windowHalfX = window.innerWidth / 2;
    @windowHalfY = window.innerHeight / 2;
    
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

    try
      attributes =
        size:
          type: "f"
          value: []

        customColor:
          type: "c"
          value: []

      uniforms =
        amplitude:
          type: "f"
          value: 1.0

        color:
          type: "c"
          value: new THREE.Color(0xffffff)

        texture:
          type: "t"
          value: THREE.ImageUtils.loadTexture("spark1.png")

      shaderMaterial = new THREE.ShaderMaterial(
        uniforms: uniforms
        attributes: attributes
        vertexShader: document.getElementById("vertexshader").textContent
        fragmentShader: document.getElementById("fragmentshader").textContent
        blending: THREE.NoBlending
        depthTest: true
        transparent: false
      )
      
      geometry = new THREE.Geometry()
      for i in [0..view.vertices.length-1]
        vertex = new THREE.Vector3()
        vertex.x = view.vertices[i][0]
        vertex.y = view.vertices[i][1]
        vertex.z = view.vertices[i][2]
        geometry.vertices.push vertex
      
      sphere = new THREE.ParticleSystem(geometry, shaderMaterial)
      #sphere.dynamic = true
      
      #sphere.sortParticles = true;
      vertices = sphere.geometry.vertices
      values_size = attributes.size.value
      values_color = attributes.customColor.value
      attributes.size.needsUpdate = true

      for i in [0..view.vertices.length-1]
        values_size[i] = 10
        values_color[i] = new THREE.Color(0xffaa00)        
        clr = view.colors[i]
        values_color[i].setRGB clr[0], clr[1], clr[2]
      @spheres.push sphere
      #sphere.position.x = -16*15
      #sphere.position.z = -16*15
      @scene.add sphere

    catch e
      console.log 'Error in loadchunk ' + e.message
      console.log 'Line number ' + e.lineNumber
      console.trace()

############
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
    minx = 0
    maxx = 31
    minz = 0
    maxz = 31
    @rotate = false
    console.log 'minx is ' + minx + ' and minz is '+ minz
    for x in [minx..maxx]
      do (x, minz, maxz) =>
        setTimeout ( =>
          for z in [minz..maxz]
            region = @region            
            if @region.hasChunk x,z
              try
                chunk = region.getChunk x,z
                if chunk?
                  @loadChunk chunk, x, z
                else
                  console.log 'chunk at ' + x + ',' + z + ' is undefined'
              catch e
                console.log e.message
                console.log e.stack
          
        ), 10       
    

  showProgress: (ratio) =>
    $('#proginner').width 300*ratio

  onDocumentKeyUp: (ev) =>
    switch ev.keyCode
      when 82 then @toggleRotation()

  toggleRotation: =>
    @rotate = not @rotate

  init: =>
    container = document.createElement 'div'
    document.body.appendChild container 

    @rotation = false
    @objects = [] 
    @collide = new THREE.Object3D()

    @camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1500 )    
      
    @scene = new THREE.Scene()
    @scene.add @collide
    
    @scene.add new THREE.AmbientLight(0x444444)
    #pointLight = new THREE.PointLight(0xccbbbb, 1, 2800)
    #pointLight.position.set( 400, 1400, 600 ) 
    #@scene.add pointLight

    #@pointLight = new THREE.PointLight(0x887777, 1, 18.0)
    #@pointLight.position.set(0,250,0)
    #@scene.add @pointLight

    @renderer = new THREE.WebGLRenderer({ clearColor: 0x000000, clearAlpha: 1, antialias: true })
 
    #@renderer.setClearColorHex( 0x6D839C, 1 )
    @renderer.setSize window.innerWidth, window.innerHeight
    container.appendChild @renderer.domElement

    @camera.position.z = 300
    @camera.position.y = 500

    @controls = new THREE.TrackballControls( @camera, @renderer.domElement )    

    radius = 1
    @controls.rotateSpeed = 1.0
    @controls.zoomSpeed = 1.2
    @controls.panSpeed = 0.2

    @controls.noZoom = false
    @controls.noPan = false

    @controls.staticMoving = false
    @controls.dynamicDampingFactor = 0.3

    @controls.minDistance = radius * 1.1
    @controls.maxDistance = radius * 1000
    @controls.resetDistance = 1000.0

    @stats = new Stats()
    @stats.domElement.style.position = 'absolute'
    @stats.domElement.style.top = '290px'
    container.appendChild @stats.domElement
    
    @spheres = []

    window.addEventListener 'resize', @onWindowResize, false
    document.addEventListener 'keyup', @onDocumentKeyUp, false

  onWindowResize: =>
    @windowHalfX = window.innerWidth / 2
    @windowHalfY = window.innerHeight / 2

    @camera.aspect = window.innerWidth / window.innerHeight
    @camera.updateProjectionMatrix()

    @renderer.setSize window.innerWidth * .95, window.innerHeight * .95

  nearby: (position) =>
    (obj for obj in @objects when Math.abs(obj.position.x - position.x) < 2.2 and
                                  Math.abs(obj.position.z - position.z ) < 2.2)

  stopMovement: (position, translateFunc) =>
    #@forward.rotation.set controls.getObject().rotation
    controlObj = controls.getObject()
    @forward.position.x = controlObj.position.x
    @forward.position.y = controlObj.position.y
    @forward.position.z = controlObj.position.z
    @forward.rotation.x = controlObj.rotation.x
    @forward.rotation.z = controlObj.rotation.z
    @forward.rotation.y = controlObj.rotation.y
    @forward[translateFunc](-0.25)
    for obj in @objects
      if Math.abs(obj.position.y - @forward.position.y) < 0.7 and
         Math.abs(obj.position.x - @forward.position.x) < 0.7 and
         Math.abs(obj.position.z - @forward.position.z) < 0.7
        return true
    return false


  findIntersects: (ray) =>
    if @objects.length > 0   
      d = 0
      near = @nearby(ray.origin)      
      for obj in @included
        if not (obj in near)
          @scene.remove obj
      for obj in near
        if not (obj in @included)
          @scene.add obj
          @included.push obj
        
      intersections = ray.intersectObjects near
      return intersections
    return [] 

  drawRay: (ray) =>
    try
      @scene.remove @line
    catch e
      dd=1  
    
    #material2 = new THREE.LineBasicMaterial({ color: 0xff0000 })
    #geometry2 = new THREE.Geometry()
    #geometry2.vertices.push(ray.origin)
    #geometry2.vertices.push(ray.origin.addSelf(ray.direction))
    #@line = new THREE.Line(geometry2, material2)
    #@scene.add @line
   
    @forward.position.x = ray.origin.x
    @forward.position.y = ray.origin.y + 2.0
    @forward.position.z = ray.origin.z - 10.0
  
    return null


  animate: =>
    requestAnimationFrame @animate
        
    #@pointLight.position.set controls.getObject().position.x, controls.getObject().position.y, controls.getObject().position.z

    @render()
    @stats.update()
    #@scene.remove @collide

  render: =>     
    @controls.update()
    if (@rotate) 
      time = Date.now() * 0.005
      for sphere in @spheres
        sphere.rotation.y = 0.05 * time;
    @renderer.render @scene, @camera


exports.RegionRenderer = RegionRenderer

