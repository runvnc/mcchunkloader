(function() {
  var RegionRenderer, SCALE, delay, exports, require,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (typeof window !== "undefined" && window !== null) {
    require = window.require;
    exports = window.exports;
  }

  SCALE = 5;

  delay = function(ms, func) {
    return setTimeout(func, ms);
  };

  RegionRenderer = (function() {

    function RegionRenderer(region) {
      this.region = region;
      this.render = __bind(this.render, this);
      this.animate = __bind(this.animate, this);
      this.onDocumentTouchMove = __bind(this.onDocumentTouchMove, this);
      this.onDocumentTouchStart = __bind(this.onDocumentTouchStart, this);
      this.onDocumentMouseMove = __bind(this.onDocumentMouseMove, this);
      this.onWindowResize = __bind(this.onWindowResize, this);
      this.init = __bind(this.init, this);
      this.showProgress = __bind(this.showProgress, this);
      this.load = __bind(this.load, this);
      this.loadChunk = __bind(this.loadChunk, this);
      this.mouseX = 0;
      this.mouseY = 0;
      this.windowHalfX = window.innerWidth / 2;
      this.windowHalfY = window.innerHeight / 2;
      this.init();
      this.animate();
      this.load();
    }

    RegionRenderer.prototype.loadChunk = function(chunk, chunkX, chunkZ) {
      var id, vertex, x, y, z;
      this.showProgress((x * z) / (32 * 32));
      for (x = 0; x <= 15; x++) {
        for (y = 0; y <= 255; y++) {
          for (z = 0; z <= 15; z++) {
            id = chunk.getBlockAt(x, y, z);
            if ((id != null) && id === 3) {
              vertex = new THREE.Vector3();
              vertex.x = (chunkX * 16 + x) * SCALE;
              vertex.y = y * SCALE;
              vertex.z = (chunkZ * 16 + z) * SCALE;
              this.geometry.vertices.push(vertex);
            }
          }
        }
      }
      return null;
    };

    RegionRenderer.prototype.load = function() {
      var chunk, particles, region, x, z;
      this.material = new THREE.ParticleBasicMaterial({
        size: 5
      });
      this.material.color.setHSV(200, 200, 200);
      particles = new THREE.ParticleSystem(this.geometry, this.material);
      particles.rotation.x = 0;
      particles.rotation.y = Math.random() * 6;
      particles.rotation.z = 0;
      this.scene.add(particles);
      for (x = 0; x <= 31; x++) {
        for (z = 0; z <= 31; z++) {
          region = this.region;
          if (this.region.hasChunk(x, z)) {
            console.log('has it');
            console.log('running it now');
            chunk = region.getChunk(x, z);
            if (chunk != null) this.loadChunk(chunk, x, z);
          }
        }
      }
      return console.log('loop done');
    };

    RegionRenderer.prototype.showProgress = function(ratio) {
      return $('#proginner').width(300 * ratio);
    };

    RegionRenderer.prototype.init = function() {
      var container;
      container = document.createElement('div');
      document.body.appendChild(container);
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3200);
      this.camera.position.z = 1500;
      this.scene = new THREE.Scene();
      this.geometry = new THREE.Geometry();
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(this.renderer.domElement);
      this.stats = new Stats();
      this.stats.domElement.style.position = 'absolute';
      this.stats.domElement.style.top = '0px';
      container.appendChild(this.stats.domElement);
      document.addEventListener('mousemove', this.onDocumentMouseMove, false);
      document.addEventListener('touchstart', this.onDocumentTouchStart, false);
      document.addEventListener('touchmove', this.onDocumentTouchMove, false);
      return window.addEventListener('resize', this.onWindowResize, false);
    };

    RegionRenderer.prototype.onWindowResize = function() {
      this.windowHalfX = window.innerWidth / 2;
      this.windowHalfY = window.innerHeight / 2;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      return this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    RegionRenderer.prototype.onDocumentMouseMove = function(event) {
      this.mouseX = event.clientX - this.windowHalfX;
      return this.mouseY = event.clientY - this.windowHalfY;
    };

    RegionRenderer.prototype.onDocumentTouchStart = function(event) {
      if (event.touches.length === 1) {
        event.preventDefault();
        this.mouseX = event.touches[0].pageX - this.windowHalfX;
        return this.mouseY = event.touches[0].pageY - this.windowHalfY;
      }
    };

    RegionRenderer.prototype.onDocumentTouchMove = function(event) {
      if (event.touches.length === 1) {
        event.preventDefault();
        this.mouseX = event.touches[0].pageX - this.windowHalfX;
        return this.mouseY = event.touches[0].pageY - this.windowHalfY;
      }
    };

    RegionRenderer.prototype.animate = function() {
      requestAnimationFrame(this.animate);
      this.render();
      return this.stats.update();
    };

    RegionRenderer.prototype.render = function() {
      var i, object, time, _ref, _ref2;
      time = Date.now() * 0.00005;
      this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
      this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;
      this.camera.lookAt(this.scene.position);
      for (i = 0, _ref = this.scene.children.length - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        object = this.scene.children[i];
        if (object instanceof THREE.ParticleSystem) {
          object.rotation.y = time * ((_ref2 = i < 4) != null ? _ref2 : i + {
            1: -(i + 1)
          });
        }
      }
      return this.renderer.render(this.scene, this.camera);
    };

    return RegionRenderer;

  })();

  exports.RegionRenderer = RegionRenderer;

}).call(this);
