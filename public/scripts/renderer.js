(function() {
  var ChunkView, RegionRenderer, SCALE, blockInfo, canvas, chunks, chunkview, controls, delay, exports, require, time,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (typeof window !== "undefined" && window !== null) {
    require = window.require;
    exports = window.exports;
  }

  SCALE = 5;

  controls = null;

  chunks = require('chunk');

  chunkview = require('chunkview');

  ChunkView = chunkview.ChunkView;

  blockInfo = require('blockinfo').blockInfo;

  Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
  };

  delay = function(ms, func) {
    return setTimeout(func, ms);
  };

  canvas = null;

  time = null;

  RegionRenderer = (function() {

    function RegionRenderer(region, options) {
      var blocker, element, havePointerLock, instructions, pointerlockchange, pointerlockerror,
        _this = this;
      this.region = region;
      this.options = options;
      this.render = __bind(this.render, this);
      this.animate = __bind(this.animate, this);
      this.onWindowResize = __bind(this.onWindowResize, this);
      this.init = __bind(this.init, this);
      this.showProgress = __bind(this.showProgress, this);
      this.load = __bind(this.load, this);
      this.loadTexture = __bind(this.loadTexture, this);
      this.loadChunk = __bind(this.loadChunk, this);
      this.mcCoordsToWorld = __bind(this.mcCoordsToWorld, this);
      this.addTorches = __bind(this.addTorches, this);
      if (this.options.y < 50) this.options.superflat = true;
      this.mouseX = 0;
      this.mouseY = 0;
      this.textures = {};
      this.windowHalfX = window.innerWidth / 2;
      this.windowHalfY = window.innerHeight / 2;
      blocker = document.getElementById("blocker");
      instructions = document.getElementById("instructions");
      havePointerLock = "pointerLockElement" in document || "mozPointerLockElement" in document || "webkitPointerLockElement" in document;
      if (havePointerLock) {
        console.log('havepointerlock');
        element = document.body;
        pointerlockchange = function(event) {
          if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
            controls.enabled = true;
            return blocker.style.display = "none";
          } else {
            controls.enabled = false;
            blocker.style.display = "-webkit-box";
            blocker.style.display = "-moz-box";
            blocker.style.display = "box";
            return instructions.style.display = "";
          }
        };
        pointerlockerror = function(event) {
          return instructions.style.display = "";
        };
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);
        document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
        document.addEventListener("pointerlockerror", pointerlockerror, false);
        document.addEventListener("mozpointerlockerror", pointerlockerror, false);
        document.addEventListener("webkitpointerlockerror", pointerlockerror, false);
        instructions.addEventListener("click", (function(event) {
          var fullscreenchange;
          instructions.style.display = "none";
          element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
          if (/Firefox/i.test(navigator.userAgent)) {
            fullscreenchange = function(event) {
              if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {
                document.removeEventListener("fullscreenchange", fullscreenchange);
                document.removeEventListener("mozfullscreenchange", fullscreenchange);
                return element.requestPointerLock();
              }
            };
            document.addEventListener("fullscreenchange", fullscreenchange, false);
            document.addEventListener("mozfullscreenchange", fullscreenchange, false);
            element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
            return element.requestFullscreen();
          } else {
            return element.requestPointerLock();
          }
        }), false);
      } else {
        instructions.innerHTML = "Your browser doesn't seem to support Pointer Lock API";
      }
      this.init();
      this.animate();
      this.load();
    }

    RegionRenderer.prototype.addTorches = function(view) {
      var coords, pointLight, _i, _len, _ref, _results;
      _ref = view.torches;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        coords = _ref[_i];
        pointLight = new THREE.PointLight(0xFFFFAA, 1.0, 15);
        pointLight.position.set(coords[0], coords[1], coords[2]);
        _results.push(this.scene.add(pointLight));
      }
      return _results;
    };

    RegionRenderer.prototype.mcCoordsToWorld = function(x, y, z) {
      var chunkX, chunkZ, posX, posZ, ret, verts;
      chunkX = (Math.floor(x / 16)).mod(32);
      chunkZ = (Math.floor(z / 16)).mod(32);
      posX = (x.mod(32 * 16)).mod(16);
      posZ = (z.mod(32 * 16)).mod(16);
      posX = Math.abs(posX);
      posZ = Math.abs(posZ);
      chunkX = Math.abs(chunkX);
      chunkZ = Math.abs(chunkZ);
      verts = chunkview.calcPoint([posX, y, posZ], {
        chunkX: chunkX,
        chunkZ: chunkZ
      });
      ret = {
        x: verts[0],
        y: verts[1],
        z: verts[2],
        chunkX: chunkX,
        chunkZ: chunkZ
      };
      return ret;
    };

    RegionRenderer.prototype.loadChunk = function(chunk, chunkX, chunkZ) {
      var attributes, centerX, centerY, centerZ, geometry, i, material, mesh, options, uvArray, vertexIndexArray, vertexPositionArray, view, _ref, _ref2, _ref3;
      options = {
        nbt: chunk,
        ymin: this.options.ymin,
        showstuff: this.options.showstuff,
        superflat: this.options.superflat,
        chunkX: chunkX,
        chunkZ: chunkZ
      };
      view = new ChunkView(options);
      try {
        view.extractChunk();
      } catch (e) {
        console.log("Error in extractChunk");
        console.log(e);
      }
      if (view.vertices.length === 0) {
        console.log("(" + chunkX + ", " + chunkZ + ") is blank. chunk is ");
        console.log(chunk);
        console.log('view is ');
        console.log(view);
      }
      this.addTorches(view);
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
      this.scene.add(mesh);
      this.objects.push(mesh);
      centerX = mesh.position.x + 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
      centerY = mesh.position.y + 0.5 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y);
      centerZ = mesh.position.z + 0.5 * (geometry.boundingBox.max.z - geometry.boundingBox.min.z);
      this.camera.lookAt(mesh.position);
      return null;
    };

    RegionRenderer.prototype.loadTexture = function(path) {
      var image, texture;
      if (this.textures[path]) return this.textures[path];
      image = new Image();
      image.onload = function() {
        return texture.needsUpdate = true;
      };
      image.src = path;
      texture = new THREE.Texture(image, new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter);
      this.textures[path] = new THREE.MeshLambertMaterial({
        map: texture,
        transparent: false
      });
      return this.textures[path];
    };

    RegionRenderer.prototype.load = function() {
      var camPos, chunk, maxx, maxz, minx, minz, region, size, startX, startZ, x, z, _results;
      startX = this.options.x * 1;
      startZ = this.options.z * 1;
      camPos = this.mcCoordsToWorld(startX, this.options.y * 1, startZ);
      size = this.options.size * 1;
      minx = camPos.chunkX - size;
      minz = camPos.chunkZ - size;
      maxx = camPos.chunkX + size;
      maxz = camPos.chunkZ + size;
      controls.getObject().position.x = camPos.x;
      controls.getObject().position.y = camPos.y;
      controls.getObject().position.z = camPos.z;
      console.log('minx is ' + minx + ' and minz is ' + minz);
      _results = [];
      for (x = minx; minx <= maxx ? x <= maxx : x >= maxx; minx <= maxx ? x++ : x--) {
        _results.push((function() {
          var _results2;
          _results2 = [];
          for (z = minz; minz <= maxz ? z <= maxz : z >= maxz; minz <= maxz ? z++ : z--) {
            region = this.region;
            if (true || this.region.hasChunk(x, z)) {
              try {
                chunk = region.getChunk(x, z);
                if (chunk != null) {
                  _results2.push(this.loadChunk(chunk, x, z));
                } else {
                  _results2.push(console.log('chunk at ' + x + ',' + z + ' is undefined'));
                }
              } catch (e) {
                console.log(e.message);
                _results2.push(console.log(e.stack));
              }
            } else {
              _results2.push(void 0);
            }
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };

    RegionRenderer.prototype.showProgress = function(ratio) {
      return $('#proginner').width(300 * ratio);
    };

    RegionRenderer.prototype.init = function() {
      var container, pointLight;
      container = document.createElement('div');
      document.body.appendChild(container);
      this.objects = [];
      this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1500);
      this.scene = new THREE.Scene();
      this.scene.add(new THREE.AmbientLight(0x333333));
      pointLight = new THREE.PointLight(0x332222);
      pointLight.position.set(400, 100, 600);
      this.scene.add(pointLight);
      this.renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      this.renderer.setClearColorHex(0x6D839C, 1);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(this.renderer.domElement);
      controls = new PointerLockControls(this.camera);
      this.scene.add(controls.getObject());
      this.ray = new THREE.Ray();
      this.ray.direction.set(0, -1, 0);
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
      return this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    RegionRenderer.prototype.animate = function() {
      requestAnimationFrame(this.animate);
      controls.isOnObject(true);
      this.render();
      return this.stats.update();
    };

    RegionRenderer.prototype.render = function() {
      controls.update(Date.now() - time);
      this.renderer.render(this.scene, this.camera);
      return time = Date.now();
    };

    return RegionRenderer;

  })();

  exports.RegionRenderer = RegionRenderer;

}).call(this);
