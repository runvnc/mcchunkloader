(function() {
  var ChunkView, RegionRenderer, SCALE, blockInfo, chunks, delay, exports, require,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (typeof window !== "undefined" && window !== null) {
    require = window.require;
    exports = window.exports;
  }

  SCALE = 5;

  chunks = require('chunk');

  ChunkView = require('chunkview').ChunkView;

  blockInfo = require('blockinfo').blockInfo;

  delay = function(ms, func) {
    return setTimeout(func, ms);
  };

  RegionRenderer = (function() {

    function RegionRenderer(region) {
      this.region = region;
      this.render = __bind(this.render, this);
      this.animate = __bind(this.animate, this);
      this.onWindowResize = __bind(this.onWindowResize, this);
      this.init = __bind(this.init, this);
      this.showProgress = __bind(this.showProgress, this);
      this.load = __bind(this.load, this);
      this.loadTexture = __bind(this.loadTexture, this);
      this.loadChunk = __bind(this.loadChunk, this);
      this.getBlockAt = __bind(this.getBlockAt, this);
      this.mouseX = 0;
      this.mouseY = 0;
      this.windowHalfX = window.innerWidth / 2;
      this.windowHalfY = window.innerHeight / 2;
      this.init();
      this.animate();
      this.load();
    }

    RegionRenderer.prototype.getBlockAt = function(chunk, x, y, z) {
      var blockpos, offset, section, sectionnum, _i, _len, _ref;
      if (!(chunk.root.Level.Sections != null)) return -1;
      sectionnum = Math.floor(y / 16);
      offset = ((y % 16) * 256) + (z * 16) + x;
      blockpos = offset / 2;
      _ref = chunk.root.Level.Sections;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        section = _ref[_i];
        if ((section != null) && section.Y === sectionnum) {
          return section.Blocks[blockpos];
        }
      }
      return -1;
    };

    /*
      loadChunk: (chunk, chunkX, chunkZ) =>
        #@showProgress (x*z) / (32*32)
        for x in [0..15]
          for y in [0..255]
            for z in [0..15]           
               id = @getBlockAt chunk, x, y, z
               if id? and id > 0
                 block = blockInfo['_'+id.toString()]
                 if block?
                   vertex = new THREE.Vector3()
                   vertex.x = (chunkX*16 + x) * SCALE
                   vertex.y = y * SCALE
                   vertex.z = (chunkZ*16 + z) * SCALE
                   @geometry.vertices.push vertex    
                   color = new THREE.Color(0xffffff)
                   color.setRGB block.rgba[0], block.rgba[1], block.rgba[2]
                   @colors.push color
              
        return null
    */

    RegionRenderer.prototype.loadChunk = function(chunk, chunkX, chunkZ) {
      var attributes, centerX, centerY, centerZ, geometry, i, material, mesh, options, triangles, uvArray, vertexIndexArray, vertexPositionArray, view, _ref, _ref2, _ref3;
      options = {
        nbt: chunk,
        pos: {
          x: chunkX,
          z: chunkZ
        }
      };
      view = new ChunkView(options);
      view.extractChunk();
      triangles = view.indices.length / 3;
      vertexIndexArray = new Uint16Array(view.indices.length);
      for (i = 0, _ref = view.indices.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        vertexIndexArray[i] = view.indices[i];
      }
      vertexPositionArray = new Float32Array(view.vertices.length);
      for (i = 0, _ref2 = view.vertices.length; 0 <= _ref2 ? i < _ref2 : i > _ref2; 0 <= _ref2 ? i++ : i--) {
        vertexPositionArray[i] = view.vertices[i];
      }
      uvArray = new Float32Array(view.textcoords.length);
      for (i = 0, _ref3 = view.textcoords.length; 0 <= _ref3 ? i < _ref3 : i > _ref3; 0 <= _ref3 ? i++ : i--) {
        uvArray[i] = view.textcoords[i];
      }
      attributes = {
        index: {
          itemSize: 1,
          array: vertexIndexArray,
          numItems: vertexIndexArray.length
        },
        position: {
          itemSize: 3,
          array: vertexPositionArray,
          numItems: vertexPositionArray.length / 3
        },
        uv: {
          itemSize: 2,
          array: uvArray,
          numItems: uvArray.length / 2
        }
      };
      geometry = new THREE.BufferGeometry();
      geometry.attributes = attributes;
      geometry.offsets = [
        {
          start: 0,
          count: vertexIndexArray.length,
          index: 0
        }
      ];
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      geometry.computeVertexNormals();
      material = this.loadTexture('/terrain.png');
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = 700.0;
      mesh.position.y = 0.0;
      mesh.position.z = 700.0;
      this.scene.add(mesh);
      centerX = mesh.position.x + 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
      centerY = mesh.position.y + 0.5 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y);
      centerZ = mesh.position.z + 0.5 * (geometry.boundingBox.max.z - geometry.boundingBox.min.z);
      this.camera.position.x = centerX;
      this.camera.position.y = centerY;
      this.camera.position.z = centerZ;
      this.camera.lookAt(new THREE.Vector3(centerX, centerY, centerZ));
      return null;
    };

    RegionRenderer.prototype.loadTexture = function(path) {
      var image, texture;
      image = new Image();
      image.onload = function() {
        return texture.needsUpdate = true;
      };
      image.src = path;
      texture = new THREE.Texture(image, new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.LinearMipMapLinearFilter);
      return new THREE.MeshLambertMaterial({
        map: texture
      });
    };

    RegionRenderer.prototype.load = function() {
      var chunk, particles, region, seconds, start, total, x, z;
      this.colors = [];
      this.geometry = new THREE.Geometry();
      this.geometry.colors = this.colors;
      this.material = new THREE.ParticleBasicMaterial({
        size: 5,
        vertexColors: true
      });
      this.material.color.setHSV(200, 200, 200);
      particles = new THREE.ParticleSystem(this.geometry, this.material);
      particles.rotation.x = 0;
      particles.rotation.y = Math.random() * 6;
      particles.rotation.z = 0;
      start = new Date().getTime();
      for (x = 10; x <= 15; x++) {
        for (z = 10; z <= 15; z++) {
          region = this.region;
          if (true || this.region.hasChunk(x, z)) {
            try {
              chunk = region.getChunk(x, z);
              if (chunk != null) this.loadChunk(chunk, x, z);
            } catch (e) {
              console.log(e.message);
              console.log(e.stack);
            }
          }
        }
      }
      total = new Date().getTime() - start;
      seconds = total / 1000.0;
      return console.log("processed chunks into " + this.geometry.vertices.length + " vertices in " + seconds + " seconds");
    };

    RegionRenderer.prototype.showProgress = function(ratio) {
      return $('#proginner').width(300 * ratio);
    };

    RegionRenderer.prototype.init = function() {
      var container, directionalLight;
      container = document.createElement('div');
      document.body.appendChild(container);
      this.clock = new THREE.Clock();
      this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2300);
      this.camera.position.z = 50;
      this.camera.position.y = 25;
      this.scene = new THREE.Scene();
      directionalLight = new THREE.DirectionalLight(0xcccccc);
      directionalLight.position.set(9, 30, 300);
      this.scene.add(directionalLight);
      this.pointLight = new THREE.PointLight(0xddcccc, 1, 500);
      this.pointLight.position.set(0, 0, 0);
      this.scene.add(this.pointLight);
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(this.renderer.domElement);
      this.controls = new THREE.FirstPersonControls(this.camera);
      this.controls.movementSpeed = 20;
      this.controls.lookSpeed = 0.125;
      this.controls.lookVertical = true;
      this.stats = new Stats();
      this.stats.domElement.style.position = 'absolute';
      this.stats.domElement.style.top = '0px';
      container.appendChild(this.stats.domElement);
      return window.addEventListener('resize', this.onWindowResize, false);
    };

    RegionRenderer.prototype.onWindowResize = function() {
      this.windowHalfX = window.innerWidth / 2;
      this.windowHalfY = window.innerHeight / 2;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.controls.handleResize();
      return this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    RegionRenderer.prototype.animate = function() {
      requestAnimationFrame(this.animate);
      this.render();
      return this.stats.update();
    };

    RegionRenderer.prototype.render = function() {
      var time;
      time = Date.now() * 0.00005;
      this.controls.update(this.clock.getDelta());
      this.pointLight.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
      return this.renderer.render(this.scene, this.camera);
    };

    return RegionRenderer;

  })();

  exports.RegionRenderer = RegionRenderer;

}).call(this);
