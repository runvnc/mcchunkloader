if window?
  require = window.require
  exports = window.exports

SCALE = 5

chunks = require 'chunk'
ChunkView = require('chunkview').ChunkView
blockInfo = require('blockinfo').blockInfo

delay = (ms, func) ->
  setTimeout func, ms

class RegionRenderer
  constructor: (@region) ->          
    @mouseX = 0
    @mouseY = 0

    @windowHalfX = window.innerWidth / 2;
    @windowHalfY = window.innerHeight / 2;

    @init()
    @animate()
    @load()

  loadChunk: (chunk, chunkX, chunkZ) =>
    options =
      nbt: chunk
      pos:
        x: chunkX
        z: chunkZ
    view = new ChunkView(options)    
    view.extractChunk()
    triangles = view.indices.length / 3
    vertexIndexArray = new Uint16Array(view.indices.length)
    for i in [0...view.indices.length]
      vertexIndexArray[i] = view.indices[i]

    #vertexPositionArray contains 3 values per vertex, for the x, y and z coordinates.
    #Then 9 values (3 vertices) will be 1 face/triangle.
    vertexPositionArray = new Float32Array(view.vertices.length)
    for i in [0...view.vertices.length]
      vertexPositionArray[i] = view.vertices[i]

    uvArray = new Float32Array(view.textcoords.length)
    for i in [0...view.textcoords.length]
      uvArray[i] = view.textcoords[i]

    #colorArray = new Float32Array(view.colors.length)
    #for i in [0...view.colors.length]
    #  colorArray[i] = view.colors[i]

    # The attributes object contains information about how to treat the indexes, positions, normals arrays etc.
    # For example, indexes have an itemSize of 1, in other words, 1 array value per vertex index.
    # Position has 3 array values per vertex, hence, itemSize: 3.
    # array and numItems simply contain the typed array and its length.
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

    #console.log attributes
    # Create the BufferGeometry, and assign attributes to the instance.
    geometry = new THREE.BufferGeometry()
    geometry.attributes = attributes
        
    # Not completely sure how this would be in any setup, but we set it to start from the beginning of the arrays
    # And last for as long as there are enough vertex indexes to work with.
    geometry.offsets = [{
      start: 0
      count: vertexIndexArray.length
      index: 0
    }]
      
    # These are strictly not needed, but they're available, like on any normal Geometry.
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
    geometry.computeVertexNormals()

    # Create the mesh and material
    #material = new THREE.MeshPhongMaterial
    #  color: 0xffffff
    material = @loadTexture('/terrain.png')
    mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = 700.0
    mesh.position.y = 0.0
    mesh.position.z = 700.0
    @scene.add mesh

    centerX = mesh.position.x + 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x )
    centerY = mesh.position.y + 0.5 * ( geometry.boundingBox.max.y - geometry.boundingBox.min.y )
    centerZ = mesh.position.z + 0.5 * ( geometry.boundingBox.max.z - geometry.boundingBox.min.z )
    @camera.position.x = centerX
    @camera.position.y = centerY
    @camera.position.z = centerZ
    @camera.lookAt new THREE.Vector3(centerX, centerY, centerZ)
    #console.log mesh
    return null

  loadTexture: (path) =>
    image = new Image()
    image.onload = -> texture.needsUpdate = true
    image.src = path
    texture  = new THREE.Texture( image,  new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.LinearMipMapLinearFilter )    

    return new THREE.MeshPhongMaterial( { map: texture } )

  load: =>
    @colors = []    
    @geometry = new THREE.Geometry()
    @geometry.colors = @colors
    @material = new THREE.ParticleBasicMaterial( { size: 5, vertexColors: true } )
    @material.color.setHSV 200, 200, 200
    particles = new THREE.ParticleSystem( @geometry, @material )
    particles.rotation.x = 0
    particles.rotation.y = Math.random() * 6
    particles.rotation.z = 0
    #@scene.add particles
    start = new Date().getTime()
    for x in [0..6]
      for z in [0..6]
        region = @region
        if true or @region.hasChunk x,z
          try
            chunk = region.getChunk x,z
            if chunk?
              @loadChunk chunk, x, z
          catch e
            console.log e.message
            console.log e.stack

    total = new Date().getTime() - start
    seconds = total / 1000.0
    console.log "processed chunks into #{@geometry.vertices.length} vertices in #{seconds} seconds"


  showProgress: (ratio) =>
    $('#proginner').width 300*ratio

  init: =>
    container = document.createElement 'div'
    document.body.appendChild container 

    @clock = new THREE.Clock()

    @camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 2300 )
    @camera.position.z = 50
    @camera.position.y = 25
    
    @scene = new THREE.Scene()

    @scene.add new THREE.AmbientLight(0x444444)
    directionalLight = new THREE.DirectionalLight( 0xcccccc )
    directionalLight.position.set( 9, 30, 300 )
    @scene.add directionalLight

    #@pointLight = new THREE.PointLight(0xddcccc, 1, 500)
    #@pointLight.position.set(0,0,0)
    #@scene.add @pointLight

    @renderer = new THREE.WebGLRenderer()
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
    #@camera.position.x += ( @mouseX - @camera.position.x ) * 0.05
    #@camera.position.y += ( - @mouseY - @camera.position.y ) * 0.05
    @controls.update @clock.getDelta()
    #@pointLight.position.set @camera.position.x, @camera.position.y, @camera.position.z
    #@camera.lookAt @scene.position
    #for i in [0..@scene.children.length-1]
    ##  object = @scene.children[ i ]
    #  if object instanceof THREE.ParticleSystem
    #    object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) )
    @renderer.render @scene, @camera


exports.RegionRenderer = RegionRenderer

