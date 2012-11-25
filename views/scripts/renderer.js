(function() {
  var ChunkView, RegionRenderer, SCALE, blockInfo, canvas, chunks, chunkview, controls, delay, exports, require, time,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
      this.region = region;
      this.options = options;
      this.render = __bind(this.render, this);
      this.animate = __bind(this.animate, this);
      this.drawRay = __bind(this.drawRay, this);
      this.findIntersects = __bind(this.findIntersects, this);
      this.stopMovement = __bind(this.stopMovement, this);
      this.nearby = __bind(this.nearby, this);
      this.onWindowResize = __bind(this.onWindowResize, this);
      this.init = __bind(this.init, this);
      this.toggleRotation = __bind(this.toggleRotation, this);
      this.onDocumentKeyUp = __bind(this.onDocumentKeyUp, this);
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
      this.included = [];
      this.windowHalfX = window.innerWidth / 2;
      this.windowHalfY = window.innerHeight / 2;
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
      var attributes, clr, geometry, i, options, shaderMaterial, sphere, uniforms, values_color, values_size, vertex, vertices, view, _ref, _ref2;
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
      try {
        attributes = {
          size: {
            type: "f",
            value: []
          },
          customColor: {
            type: "c",
            value: []
          }
        };
        uniforms = {
          amplitude: {
            type: "f",
            value: 1.0
          },
          color: {
            type: "c",
            value: new THREE.Color(0xffffff)
          },
          texture: {
            type: "t",
            value: THREE.ImageUtils.loadTexture("spark1.png")
          }
        };
        shaderMaterial = new THREE.ShaderMaterial({
          uniforms: uniforms,
          attributes: attributes,
          vertexShader: document.getElementById("vertexshader").textContent,
          fragmentShader: document.getElementById("fragmentshader").textContent,
          blending: THREE.NoBlending,
          depthTest: true,
          transparent: false
        });
        geometry = new THREE.Geometry();
        for (i = 0, _ref = view.vertices.length - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
          vertex = new THREE.Vector3();
          vertex.x = view.vertices[i][0];
          vertex.y = view.vertices[i][1];
          vertex.z = view.vertices[i][2];
          geometry.vertices.push(vertex);
        }
        sphere = new THREE.ParticleSystem(geometry, shaderMaterial);
        vertices = sphere.geometry.vertices;
        values_size = attributes.size.value;
        values_color = attributes.customColor.value;
        attributes.size.needsUpdate = true;
        for (i = 0, _ref2 = view.vertices.length - 1; 0 <= _ref2 ? i <= _ref2 : i >= _ref2; 0 <= _ref2 ? i++ : i--) {
          values_size[i] = 10;
          values_color[i] = new THREE.Color(0xffaa00);
          clr = view.colors[i];
          values_color[i].setRGB(clr[0], clr[1], clr[2]);
        }
        this.spheres.push(sphere);
        this.scene.add(sphere);
      } catch (e) {
        console.log('Error in loadchunk ' + e.message);
        console.log('Line number ' + e.lineNumber);
        console.trace();
      }
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
      var camPos, maxx, maxz, minx, minz, size, startX, startZ, x, _results,
        _this = this;
      startX = this.options.x * 1;
      startZ = this.options.z * 1;
      camPos = this.mcCoordsToWorld(startX, this.options.y * 1, startZ);
      size = this.options.size * 1;
      minx = camPos.chunkX - size;
      minz = camPos.chunkZ - size;
      maxx = camPos.chunkX + size;
      maxz = camPos.chunkZ + size;
      minx = 0;
      maxx = 31;
      minz = 0;
      maxz = 31;
      this.rotate = false;
      console.log('minx is ' + minx + ' and minz is ' + minz);
      _results = [];
      for (x = minx; minx <= maxx ? x <= maxx : x >= maxx; minx <= maxx ? x++ : x--) {
        _results.push((function(x, minz, maxz) {
          return setTimeout((function() {
            var chunk, region, z, _results2;
            _results2 = [];
            for (z = minz; minz <= maxz ? z <= maxz : z >= maxz; minz <= maxz ? z++ : z--) {
              region = _this.region;
              if (_this.region.hasChunk(x, z)) {
                try {
                  chunk = region.getChunk(x, z);
                  if (chunk != null) {
                    _results2.push(_this.loadChunk(chunk, x, z));
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
          }), 10);
        })(x, minz, maxz));
      }
      return _results;
    };

    RegionRenderer.prototype.showProgress = function(ratio) {
      return $('#proginner').width(300 * ratio);
    };

    RegionRenderer.prototype.onDocumentKeyUp = function(ev) {
      switch (ev.keyCode) {
        case 82:
          return this.toggleRotation();
      }
    };

    RegionRenderer.prototype.toggleRotation = function() {
      return this.rotate = !this.rotate;
    };

    RegionRenderer.prototype.init = function() {
      var container, radius;
      container = document.createElement('div');
      document.body.appendChild(container);
      this.rotation = false;
      this.objects = [];
      this.collide = new THREE.Object3D();
      this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1500);
      this.scene = new THREE.Scene();
      this.scene.add(this.collide);
      this.scene.add(new THREE.AmbientLight(0x444444));
      this.renderer = new THREE.WebGLRenderer({
        clearColor: 0x000000,
        clearAlpha: 1,
        antialias: true
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(this.renderer.domElement);
      this.camera.position.z = 300;
      this.camera.position.y = 500;
      this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
      radius = 1;
      this.controls.rotateSpeed = 1.0;
      this.controls.zoomSpeed = 1.2;
      this.controls.panSpeed = 0.2;
      this.controls.noZoom = false;
      this.controls.noPan = false;
      this.controls.staticMoving = false;
      this.controls.dynamicDampingFactor = 0.3;
      this.controls.minDistance = radius * 1.1;
      this.controls.maxDistance = radius * 1000;
      this.controls.resetDistance = 1000.0;
      this.stats = new Stats();
      this.stats.domElement.style.position = 'absolute';
      this.stats.domElement.style.top = '290px';
      container.appendChild(this.stats.domElement);
      this.spheres = [];
      window.addEventListener('resize', this.onWindowResize, false);
      return document.addEventListener('keyup', this.onDocumentKeyUp, false);
    };

    RegionRenderer.prototype.onWindowResize = function() {
      this.windowHalfX = window.innerWidth / 2;
      this.windowHalfY = window.innerHeight / 2;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      return this.renderer.setSize(window.innerWidth * .95, window.innerHeight * .95);
    };

    RegionRenderer.prototype.nearby = function(position) {
      var obj, _i, _len, _ref, _results;
      _ref = this.objects;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        if (Math.abs(obj.position.x - position.x) < 2.2 && Math.abs(obj.position.z - position.z) < 2.2) {
          _results.push(obj);
        }
      }
      return _results;
    };

    RegionRenderer.prototype.stopMovement = function(position, translateFunc) {
      var controlObj, obj, _i, _len, _ref;
      controlObj = controls.getObject();
      this.forward.position.x = controlObj.position.x;
      this.forward.position.y = controlObj.position.y;
      this.forward.position.z = controlObj.position.z;
      this.forward.rotation.x = controlObj.rotation.x;
      this.forward.rotation.z = controlObj.rotation.z;
      this.forward.rotation.y = controlObj.rotation.y;
      this.forward[translateFunc](-0.25);
      _ref = this.objects;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        if (Math.abs(obj.position.y - this.forward.position.y) < 0.7 && Math.abs(obj.position.x - this.forward.position.x) < 0.7 && Math.abs(obj.position.z - this.forward.position.z) < 0.7) {
          return true;
        }
      }
      return false;
    };

    RegionRenderer.prototype.findIntersects = function(ray) {
      var d, intersections, near, obj, _i, _j, _len, _len2, _ref;
      if (this.objects.length > 0) {
        d = 0;
        near = this.nearby(ray.origin);
        _ref = this.included;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          obj = _ref[_i];
          if (!(__indexOf.call(near, obj) >= 0)) this.scene.remove(obj);
        }
        for (_j = 0, _len2 = near.length; _j < _len2; _j++) {
          obj = near[_j];
          if (!(__indexOf.call(this.included, obj) >= 0)) {
            this.scene.add(obj);
            this.included.push(obj);
          }
        }
        intersections = ray.intersectObjects(near);
        return intersections;
      }
      return [];
    };

    RegionRenderer.prototype.drawRay = function(ray) {
      var dd;
      try {
        this.scene.remove(this.line);
      } catch (e) {
        dd = 1;
      }
      this.forward.position.x = ray.origin.x;
      this.forward.position.y = ray.origin.y + 2.0;
      this.forward.position.z = ray.origin.z - 10.0;
      return null;
    };

    RegionRenderer.prototype.animate = function() {
      requestAnimationFrame(this.animate);
      this.render();
      return this.stats.update();
    };

    RegionRenderer.prototype.render = function() {
      var sphere, _i, _len, _ref;
      this.controls.update();
      if (this.rotate) {
        time = Date.now() * 0.005;
        _ref = this.spheres;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          sphere = _ref[_i];
          sphere.rotation.y = 0.05 * time;
        }
      }
      return this.renderer.render(this.scene, this.camera);
    };

    return RegionRenderer;

  })();

  exports.RegionRenderer = RegionRenderer;

}).call(this);
