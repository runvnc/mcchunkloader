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
      this.addSpecial = __bind(this.addSpecial, this);
      this.addPane = __bind(this.addPane, this);
      this.addDoor = __bind(this.addDoor, this);
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
      if (view.special['torch'] != null) {
        _ref = view.special.torch;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          coords = _ref[_i];
          pointLight = new THREE.PointLight(0xFFFFAA, 1.0, 15);
          pointLight.position.set(coords[0], coords[1], coords[2]);
          _results.push(this.scene.add(pointLight));
        }
        return _results;
      }
    };

    RegionRenderer.prototype.addDoor = function(coord, isTop) {
      var material, mesh, plane, uv, uvs;
      plane = new THREE.PlaneGeometry(1.0, 1.0, 1.0);
      if (!isTop) {
        uv = chunkview.typeToCoords(blockInfo['_64']);
      } else {
        uv = chunkview.typeToCoords(blockInfo['_64x']);
      }
      uvs = [];
      plane.faceVertexUvs = [[]];
      plane.faceVertexUvs[0].push([new THREE.UV(uv[6], uv[7]), new THREE.UV(uv[0], uv[1]), new THREE.UV(uv[2], uv[3]), new THREE.UV(uv[4], uv[5])]);
      material = this.loadTexture('/terrain.png');
      mesh = new THREE.Mesh(plane, material);
      mesh.position.set(coord[0], coord[1], coord[2]);
      return this.scene.add(mesh);
    };

    RegionRenderer.prototype.addPane = function(coord) {
      var cube, i, material, mesh, uv, uvs;
      cube = new THREE.CubeGeometry(1.0, 1.0, 1.0);
      uv = chunkview.typeToCoords(blockInfo['_20']);
      uvs = [];
      cube.faceVertexUvs = [[]];
      for (i = 0; i <= 5; i++) {
        cube.faceVertexUvs[0].push([new THREE.UV(uv[0], uv[1]), new THREE.UV(uv[2], uv[3]), new THREE.UV(uv[4], uv[5]), new THREE.UV(uv[6], uv[7])]);
      }
      material = this.loadTexture('/terrain.png');
      mesh = new THREE.Mesh(cube, material);
      mesh.position.set(coord[0], coord[1], coord[2]);
      return this.scene.add(mesh);
    };

    RegionRenderer.prototype.addSpecial = function(view) {
      var coords, _i, _j, _k, _l, _len, _len2, _len3, _len4, _ref, _ref2, _ref3, _ref4, _results;
      if (view.special['glasspane'] != null) {
        _ref = view.special.glasspane;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          coords = _ref[_i];
          this.addPane(coords);
        }
      }
      if (view.special['glass'] != null) {
        _ref2 = view.special.glass;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          coords = _ref2[_j];
          this.addPane(coords);
        }
      }
      if (view.special['woodendoortop'] != null) {
        _ref3 = view.special.woodendoortop;
        for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
          coords = _ref3[_k];
          this.addDoor(coords, true);
        }
      }
      if (view.special['woodendoorbottom'] != null) {
        _ref4 = view.special.woodendoorbottom;
        _results = [];
        for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
          coords = _ref4[_l];
          _results.push(this.addDoor(coords, false));
        }
        return _results;
      }
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
      var attributes, chunkSize, colorArray, count, geometry, i, index, indices, left, material, mesh, options, start, startedIndex, uvArray, vertexIndexArray, vertexPositionArray, view, _ref, _ref2, _ref3, _ref4, _ref5;
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
        console.log(e.message);
        console.log(e.stack);
      }
      console.log("" + chunkX + ", " + chunkZ);
      console.log(view);
      this.addSpecial(view);
      vertexIndexArray = new Uint16Array(view.indices.length);
      for (i = 0, _ref = view.indices.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        vertexIndexArray[i] = view.indices[i];
      }
      vertexPositionArray = new Float32Array(view.vertices.length);
      for (i = 0, _ref2 = view.vertices.length; 0 <= _ref2 ? i < _ref2 : i > _ref2; 0 <= _ref2 ? i++ : i--) {
        vertexPositionArray[i] = view.vertices[i];
      }
      colorArray = new Float32Array(view.colors.length);
      for (i = 0, _ref3 = view.colors.length; 0 <= _ref3 ? i < _ref3 : i > _ref3; 0 <= _ref3 ? i++ : i--) {
        colorArray[i] = view.colors[i];
      }
      uvArray = new Float32Array(view.textcoords.length);
      for (i = 0, _ref4 = view.textcoords.length; 0 <= _ref4 ? i < _ref4 : i > _ref4; 0 <= _ref4 ? i++ : i--) {
        uvArray[i] = view.textcoords[i];
      }
      chunkSize = 20000;
      startedIndex = vertexIndexArray.length;
      indices = vertexIndexArray;
      for (i = 0, _ref5 = indices.length - 1; 0 <= _ref5 ? i <= _ref5 : i >= _ref5; 0 <= _ref5 ? i++ : i--) {
        indices[i] = i % (3 * chunkSize);
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
        },
        color: {
          itemSize: 3,
          array: colorArray,
          numItems: colorArray.length / 3
        }
      };
      geometry = new THREE.BufferGeometry();
      geometry.offsets = [];
      left = startedIndex;
      start = 0;
      index = 0;
      while (true) {
        count = Math.min(chunkSize * 3, left);
        chunk = {
          start: start,
          count: count,
          index: index
        };
        geometry.offsets.push(chunk);
        start += count;
        index += chunkSize * 3;
        left -= count;
        if (left <= 0) break;
      }
      geometry.attributes = attributes;
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      geometry.computeVertexNormals();
      material = this.loadTexture('/terrain.png');
      mesh = new THREE.Mesh(geometry, material);
      mesh.doubleSided = true;
      this.scene.add(mesh);
      this.objects.push(mesh);
      this.centerX = mesh.position.x + 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
      this.centerY = mesh.position.y + 0.5 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y);
      this.centerZ = mesh.position.z + 0.5 * (geometry.boundingBox.max.z - geometry.boundingBox.min.z);
      this.camera.lookAt(mesh.position);
      return null;
    };

    RegionRenderer.prototype.loadTexture = function(path) {
      var texture;
      if (this.textures[path]) return this.textures[path];
      this.image = new Image();
      this.image.onload = function() {
        return texture.needsUpdate = true;
      };
      this.image.src = path;
      texture = new THREE.Texture(this.image, new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestMipMapNearestFilter);
      this.textures[path] = new THREE.MeshLambertMaterial({
        map: texture,
        transparent: true,
        perPixel: true,
        vertexColors: THREE.VertexColors
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
      this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1500);
      this.scene = new THREE.Scene();
      this.scene.add(new THREE.AmbientLight(0x444444));
      pointLight = new THREE.PointLight(0xccbbbb, 1, 2800);
      pointLight.position.set(400, 1400, 600);
      this.scene.add(pointLight);
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        clearAlpha: 0x6D839C,
        alpha: true
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
