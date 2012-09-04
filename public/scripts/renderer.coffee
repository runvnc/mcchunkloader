if window?
  require = window.require
  exports = window.exports

SCALE = 5

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
    @showProgress (x*z) / (32*32)
    for x in [0..15]
      for y in [0..255]
        for z in [0..15]
          id = chunk.getBlockAt x, y, z
          if id? and id is 3
            vertex = new THREE.Vector3()
            vertex.x = (chunkX*16 + x) * SCALE
            vertex.y = y * SCALE
            vertex.z = (chunkZ*16 + z) * SCALE
            @geometry.vertices.push vertex    
    return null


  load: =>
    @material = new THREE.ParticleBasicMaterial( { size: 5 } )
    @material.color.setHSV 200, 200, 200
    particles = new THREE.ParticleSystem( @geometry, @material )
    particles.rotation.x = 0
    particles.rotation.y = Math.random() * 6
    particles.rotation.z = 0

    @scene.add particles     

    for x in [0..31]
      for z in [0..31]
        region = @region
        if @region.hasChunk x,z
          console.log 'has it'
          console.log 'running it now'
          chunk = region.getChunk x,z
          if chunk?
            @loadChunk chunk, x, z
    console.log 'loop done'


  showProgress: (ratio) =>
    $('#proginner').width 300*ratio

  init: =>
    container = document.createElement 'div'
    document.body.appendChild container 

    @camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3200 )
    @camera.position.z = 1500

    @scene = new THREE.Scene()

    @geometry = new THREE.Geometry()

    @renderer = new THREE.WebGLRenderer()
    @renderer.setSize window.innerWidth, window.innerHeight
    container.appendChild @renderer.domElement

    @stats = new Stats()
    @stats.domElement.style.position = 'absolute'
    @stats.domElement.style.top = '0px'
    container.appendChild @stats.domElement

    document.addEventListener 'mousemove', @onDocumentMouseMove, false
    document.addEventListener 'touchstart', @onDocumentTouchStart, false
    document.addEventListener 'touchmove', @onDocumentTouchMove, false

    window.addEventListener 'resize', @onWindowResize, false

  onWindowResize: =>
    @windowHalfX = window.innerWidth / 2
    @windowHalfY = window.innerHeight / 2

    @camera.aspect = window.innerWidth / window.innerHeight
    @camera.updateProjectionMatrix()

    @renderer.setSize window.innerWidth, window.innerHeight

  onDocumentMouseMove: (event) =>
    @mouseX = event.clientX - @windowHalfX
    @mouseY = event.clientY - @windowHalfY

  onDocumentTouchStart: (event) =>
    if event.touches.length is 1
      event.preventDefault()
      @mouseX = event.touches[ 0 ].pageX - @windowHalfX
      @mouseY = event.touches[ 0 ].pageY - @windowHalfY

  onDocumentTouchMove: (event) =>
    if event.touches.length is 1
      event.preventDefault()
      @mouseX = event.touches[ 0 ].pageX - @windowHalfX
      @mouseY = event.touches[ 0 ].pageY - @windowHalfY

  animate: =>
    requestAnimationFrame @animate
    @render()
    @stats.update()

  render: =>
    time = Date.now() * 0.00005
    @camera.position.x += ( @mouseX - @camera.position.x ) * 0.05
    @camera.position.y += ( - @mouseY - @camera.position.y ) * 0.05
    @camera.lookAt @scene.position
    for i in [0..@scene.children.length-1]
      object = @scene.children[ i ]
      if object instanceof THREE.ParticleSystem
        object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) )
    @renderer.render @scene, @camera

  #draw the whole region
  #for each chunk
  #add all vertices that 
  #are not blank
  #draw the chunk
 

exports.RegionRenderer = RegionRenderer

