(function() {
  var ChunkSizeX, ChunkSizeY, ChunkSizeZ, RegionView, blockInfo, calcOpts, calcPoint, cubeCount, exports, require, times, typeToCoords, typeToCoords2,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (typeof window !== "undefined" && window !== null) {
    require = window.require;
    exports = window.exports;
  }

  blockInfo = require('blockinfo').blockInfo;

  ChunkSizeY = 256;

  ChunkSizeZ = 16;

  ChunkSizeX = 16;

  cubeCount = 0;

  calcOpts = {};

  times = 0;

  calcPoint = function(pos, opts) {
    var verts;
    verts = [];
    verts.push(pos[0] + opts.chunkX * 16 * 1.00000);
    verts.push((pos[1] + 1) * 1.0);
    verts.push(pos[2] + opts.chunkZ * 16 * 1.00000);
    return verts;
  };

  typeToCoords = function(type) {
    var s, x, y;
    if (type.t != null) {
      x = type.t[0];
      y = 15 - type.t[1];
      s = 0.0085;
      return [x / 16.0 + s, y / 16.0 + s, (x + 1.0) / 16.0 - s, y / 16.0 + s, (x + 1.0) / 16.0 - s, (y + 1.0) / 16.0 - s, x / 16.0 + s, (y + 1.0) / 16.0 - s];
    } else {
      return [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    }
  };

  typeToCoords2 = function(type) {
    var s, x, y;
    if (type.t != null) {
      x = type.t[0];
      y = 15 - type.t[1];
      s = 0.0085;
      return [x / 16.0 + s, y / 16.0 + s, (x + 1.0) / 16.0 - s, y / 16.0 + s, (x + 1.0) / 16.0 - s, (y + 1.0) / 16.0 - s, x / 16.0 + s, y / 16.0 + s, (x + 1.0) / 16.0 - s, (y + 1.0) / 16.0 - s, x / 16.0 + s, (y + 1.0) / 16.0 - s];
    } else {
      return [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    }
  };

  RegionView = (function() {

    function RegionView(options, indices, vertices) {
      var n, _ref;
      this.options = options;
      this.indices = indices;
      this.vertices = vertices;
      this.addFace = __bind(this.addFace, this);
      this.addCubePoint = __bind(this.addCubePoint, this);
      this.showBlock = __bind(this.showBlock, this);
      this.lightBlock = __bind(this.lightBlock, this);
      this.addTexturedBlock = __bind(this.addTexturedBlock, this);
      this.hasNeighbor = __bind(this.hasNeighbor, this);
      this.getColor = __bind(this.getColor, this);
      this.getBlockInfo = __bind(this.getBlockInfo, this);
      this.getBlockType = __bind(this.getBlockType, this);
      this.renderPoints = __bind(this.renderPoints, this);
      this.addBlock = __bind(this.addBlock, this);
      this.extractChunk = __bind(this.extractChunk, this);
      this.getSections = __bind(this.getSections, this);
      this.transNeighbors = __bind(this.transNeighbors, this);
      this.getLightAt = __bind(this.getLightAt, this);
      this.getBlockAt = __bind(this.getBlockAt, this);
      this.blockBuffer = new ArrayBuffer(16 * 16 * 256 * 32 * 32 * 2);
      this.blocks = new Int16Array(this.blockBuffer);
      for (n = 0, _ref = this.blocks.length; 0 <= _ref ? n <= _ref : n >= _ref; 0 <= _ref ? n++ : n--) {
        this.blocks[n] = -12;
      }
      this.index = 0;
      this.region = options.region;
      this.pos = options.pos;
      this.torches = [];
      this.unknown = [];
      this.notexture = [];
      this.rotcent = true;
      this.filled = [];
      this.nomatch = {};
      this.special = {};
      if (this.options.ymin != null) {
        this.ymin = this.options.ymin;
      } else {
        this.ymin = 60;
      }
      if ((this.options.superflat != null) === 'true') {
        this.options.superflat = true;
      }
      if (this.options.superflat != null) {
        this.superflat = this.options.superflat;
      } else {
        this.superflat = false;
      }
      if (this.options.showstuff != null) {
        this.showStuff = this.options.showstuff;
      } else {
        this.showStuff = 'diamondsmoss';
      }
      if (options.ymin != null) this.ymin = options.ymin;
    }

    RegionView.prototype.getBlockAt = function(x, y, z) {
      var blockID, blockpos, chunkX, chunkZ, newx, newz, offset, posX, posZ, section, sectionnum, sections, _i, _len;
      sections = getSections(x, z);
      if (!sections) return -1;
      blockID = this.blocks[x + z * 16 + y * 256];
      if (blockID !== 0) return this.blocks[x + y * 256 + z * 16];
      chunkX = (Math.floor(x / 16)).mod(32);
      chunkZ = (Math.floor(z / 16)).mod(32);
      posX = (x.mod(32 * 16)).mod(16);
      posZ = (z.mod(32 * 16)).mod(16);
      newx = Math.abs(posX);
      newz = Math.abs(posZ);
      chunkX = Math.abs(chunkX);
      chunkZ = Math.abs(chunkZ);
      sectionnum = Math.floor(y / 16);
      offset = ((y % 16) * 256) + (newz * 16) + newx;
      blockpos = offset;
      for (_i = 0, _len = sections.length; _i < _len; _i++) {
        section = sections[_i];
        if (section !== void 0 && section.Y * 1 === sectionnum * 1) {
          this.blocks[x + y * 256 + z * 16] = section.Blocks[blockpos];
          return section.Blocks[blockpos];
        }
      }
      this.blocks[x + y * 256 + z * 16] = -1;
      return -1;
    };

    RegionView.prototype.getLightAt = function(x, y, z) {
      var offset, section, sectionnum, sections, _i, _len;
      if (this.nbt.root.Level.Sections != null) {
        sections = this.nbt.root.Level.Sections;
      } else {
        sections = this.nbt.root.Sections;
      }
      if (!sections) return -1;
      sectionnum = Math.floor(y / 16);
      offset = ((y % 16) * 256) + (z * 16) + x;
      for (_i = 0, _len = sections.length; _i < _len; _i++) {
        section = sections[_i];
        if (section !== void 0 && section.Y * 1 === sectionnum * 1) {
          if (offset % 2 === 0) {
            return section.BlockLight[Math.floor(offset / 2)] & 0x0F;
          } else {
            return (section.BlockLight[Math.floor(offset / 2)] >> 4) & 0x0F;
          }
        }
      }
      return -1;
    };

    RegionView.prototype.transNeighbors = function(x, y, z) {
      var blockID, i, j, k, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      for (i = _ref = x - 1, _ref2 = x + 1; _ref <= _ref2 ? i <= _ref2 : i >= _ref2; _ref <= _ref2 ? i++ : i--) {
        if (i >= ChunkSizeX) continue;
        for (j = _ref3 = y - 1, _ref4 = y + 1; _ref3 <= _ref4 ? j <= _ref4 : j >= _ref4; _ref3 <= _ref4 ? j++ : j--) {
          for (k = _ref5 = z - 1, _ref6 = z + 1; _ref5 <= _ref6 ? k <= _ref6 : k >= _ref6; _ref5 <= _ref6 ? k++ : k--) {
            if (k >= ChunkSizeZ) continue;
            if (!(i === x && j === y && k === z)) {
              blockID = this.getBlockAt(i, j, k);
              if (blockID === 0 || blockID === -1) return true;
            }
          }
        }
      }
      return false;
    };

    RegionView.prototype.getSections = function(x, z) {
      var nbt, sections;
      x = Math.floor(x / 16);
      z = Math.floor(z / 16);
      nbt = region.getChunk(x, z);
      if (!(nbt != null)) return;
      if (nbt.root.Level.Sections != null) {
        return sections = nbt.root.Level.Sections;
      } else {
        return sections = nbt.root.Sections;
      }
    };

    RegionView.prototype.extractChunk = function(chunkX, chunkZ) {
      var Y, blah, blockType, id, offset, section, sections, show, x, y, z, _i, _len, _results;
      this.vertices = [];
      this.colors = [];
      this.indices = [];
      this.textcoords = [];
      this.filled = [];
      this.cubeCount = 0;
      sections = getSections(chunkX * 16, chunkZ * 16);
      if (!sections) return;
      _results = [];
      for (_i = 0, _len = sections.length; _i < _len; _i++) {
        section = sections[_i];
        if (section !== void 0) {
          Y = section.Y * 1;
          _results.push((function() {
            var _ref, _ref2, _results2;
            _results2 = [];
            for (y = _ref = Y * 16, _ref2 = Y * 16 + 15; _ref <= _ref2 ? y <= _ref2 : y >= _ref2; _ref <= _ref2 ? y++ : y--) {
              _results2.push((function() {
                var _ref3, _results3;
                _results3 = [];
                for (x = 0, _ref3 = ChunkSizeX - 1; 0 <= _ref3 ? x <= _ref3 : x >= _ref3; 0 <= _ref3 ? x++ : x--) {
                  _results3.push((function() {
                    var _ref4, _results4;
                    _results4 = [];
                    for (z = 0, _ref4 = ChunkSizeZ - 1; 0 <= _ref4 ? z <= _ref4 : z >= _ref4; 0 <= _ref4 ? z++ : z--) {
                      if (y < this.ymin) continue;
                      offset = ((y % 16) * 256) + (z * 16) + x;
                      id = section.Blocks[offset];
                      blockType = blockInfo['_' + id];
                      if (!(blockType != null)) id = -1;
                      if (!((blockType != null ? blockType.t : void 0) != null)) {
                        id = -1;
                      }
                      show = false;
                      show = id > 0;
                      if (!this.superflat && y < 60 && this.showStuff === 'diamondsmoss') {
                        show = id === 48 || id === 56 || id === 4 || id === 52;
                      } else {
                        if (id !== 0 && id !== -1 && id !== -10) {
                          show = this.transNeighbors(x + chunkX * 16, y, z + chunkZ * 16);
                        } else {
                          show = false;
                        }
                      }
                      if (show) {
                        _results4.push(this.addBlock([x + chunkX * 16, y, z + chunkZ * 16]));
                      } else {
                        _results4.push(blah = 1);
                      }
                    }
                    return _results4;
                  }).call(this));
                }
                return _results3;
              }).call(this));
            }
            return _results2;
          }).call(this));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    RegionView.prototype.addBlock = function(position) {
      var verts;
      verts = [position[0], position[1], position[2]];
      return this.filled.push(verts);
    };

    RegionView.prototype.renderPoints = function() {
      var i, verts, _results;
      i = 0;
      if (this.filled.length === 0) {
        console.log('empty chunk');
        console.log(this.nbt);
      }
      try {
        _results = [];
        while (i < this.filled.length && i < 1000) {
          verts = this.filled[i];
          this.addTexturedBlock(verts);
          _results.push(i++);
        }
        return _results;
      } catch (e) {
        return console.log(e);
      }
    };

    RegionView.prototype.getBlockType = function(x, y, z) {
      var blockID, blockType, id;
      blockType = blockInfo["_-1"];
      id = this.getBlockAt(x, y, z);
      blockID = "_-1";
      if (id != null) blockID = "_" + id.toString();
      if (blockInfo[blockID] != null) blockType = blockInfo[blockID];
      return blockType;
    };

    RegionView.prototype.getBlockInfo = function(p) {
      var blockID, blockType, id;
      blockType = blockInfo["_-1"];
      id = this.getBlockAt(p[0], p[1], p[2]);
      blockID = "_-1";
      if (id != null) blockID = "_" + id.toString();
      if (blockInfo[blockID] != null) {
        return blockInfo[blockID];
      } else {
        return blockInfo["_-1"];
      }
    };

    RegionView.prototype.getColor = function(pos) {
      var t;
      t = this.getBlockType(pos[0], pos[1], pos[2]);
      return t.rgba;
    };

    RegionView.prototype.hasNeighbor = function(bl, p, offset0, offset1, offset2) {
      var id, info, n, _ref;
      if (this.showStuff === 'diamondsmoss' && p[1] < 62) return false;
      if (p[0] === 0 || p[0] === 15 || p[2] === 0 || p[2] === 15) return false;
      n = [p[0] + offset0, p[1] + offset1, p[2] + offset2];
      id = this.getBlockAt(n[0], n[1], n[2]);
      info = this.getBlockType(n[0], n[1], n[2]);
      if ((_ref = info.id) === 0 || _ref === 37 || _ref === 38 || _ref === 50) {
        return false;
      }
      return (info != null) && (info != null ? info.id : void 0) > 0 && (info.t != null) && (info.t[0] != null);
    };

    RegionView.prototype.addTexturedBlock = function(p) {
      var a, block, blockAbove, blockType, show, side, _i, _len, _ref;
      a = p;
      block = this.getBlockInfo(p);
      blockType = block.type;
      if ((block != null ? block.s : void 0) != null) {
        if (block.type.indexOf('woodendoor') >= 0 || block.type.indexOf('irondoor') >= 0) {
          blockAbove = this.getBlockInfo([p[0], p[1] + 1, p[2]]);
          if (((blockAbove != null ? blockAbove.s : void 0) != null) && blockAbove.type === block.type) {
            blockType = block.type + 'bottom';
          } else {
            blockType = block.type + 'top';
          }
        }
        if (!(this.special[blockType] != null)) this.special[blockType] = [];
        return this.special[blockType].push(calcPoint(p, this.options));
      } else {
        _ref = ['front', 'back', 'top', 'bottom', 'right', 'left'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          side = _ref[_i];
          this.index = this.addFace(this.index, a, block, p, side);
        }
        return show = this.showBlock(block, p);
      }
    };

    RegionView.prototype.lightBlock = function(p) {
      var nearbyTransparents, _i, _len, _results;
      if (doneLighting[p[0]][p[1]][p[2]] === 1) {} else {
        light[p[0]][p[1]][p[2]] = brightestNeighbor(p) - 1;
        doneLighting[p[0]][p[1]][p[2]] = 1;
        if (light[p[0]][p[1]][p[2]] > 0) {
          nearbyTransparents = getLightTransparent(p);
          _results = [];
          for (_i = 0, _len = nearbyTransparents.length; _i < _len; _i++) {
            p = nearbyTransparents[_i];
            _results.push(lightBlock(p));
          }
          return _results;
        }
      }
    };

    RegionView.prototype.showBlock = function(bl, p) {
      var show, _ref;
      show = {};
      if ((_ref = bl.id) === 37 || _ref === 38) {
        show = {
          front: true,
          back: true,
          top: true,
          bottom: true,
          left: true,
          right: true
        };
      } else {
        show.front = !(this.hasNeighbor(bl, p, 0, 0, 1));
        show.back = !(this.hasNeighbor(bl, p, 0, 0, -1));
        show.top = !(this.hasNeighbor(bl, p, 0, 1, 0));
        show.bottom = !(this.hasNeighbor(bl, p, 0, -1, 0));
        show.left = !(this.hasNeighbor(bl, p, -1, 0, 0));
        show.right = !(this.hasNeighbor(bl, p, 1, 0, 0));
      }
      return show;
    };

    RegionView.prototype.addCubePoint = function(a, xdelta, ydelta, zdelta) {
      var p2, p3, s;
      s = 0.0000000;
      p2 = [a[0] + xdelta * 0.5 + s, a[1] + ydelta * 0.5 + s, a[2] + zdelta * 0.5 + s];
      p3 = calcPoint(p2, this.options);
      this.vertices.push(p3[0]);
      this.vertices.push(p3[1]);
      return this.vertices.push(p3[2]);
    };

    RegionView.prototype.addFace = function(i, a, bl, p, side) {
      var clr, coords, dirtgrass, facecoords, show;
      try {
        coords = typeToCoords2(bl);
        dirtgrass = blockInfo['_2x'];
        facecoords = typeToCoords2(dirtgrass);
        show = this.showBlock(bl, p);
        if (show[side]) {
          switch (side) {
            case 'front':
              if (bl.id === 2) coords = facecoords;
              this.addCubePoint(a, -1.0, -1.0, 1.0);
              this.addCubePoint(a, 1.0, -1.0, 1.0);
              this.addCubePoint(a, 1.0, 1.0, 1.0);
              this.addCubePoint(a, -1.0, -1.0, 1.0);
              this.addCubePoint(a, 1.0, 1.0, 1.0);
              this.addCubePoint(a, -1.0, 1.0, 1.0);
              break;
            case 'back':
              if (bl.id === 2) coords = facecoords;
              this.addCubePoint(a, 1.0, -1.0, -1.0);
              this.addCubePoint(a, -1.0, -1.0, -1.0);
              this.addCubePoint(a, -1.0, 1.0, -1.0);
              this.addCubePoint(a, 1.0, -1.0, -1.0);
              this.addCubePoint(a, -1.0, 1.0, -1.0);
              this.addCubePoint(a, 1.0, 1.0, -1.0);
              break;
            case 'top':
              this.addCubePoint(a, -1.0, 1.0, -1.0);
              this.addCubePoint(a, -1.0, 1.0, 1.0);
              this.addCubePoint(a, 1.0, 1.0, 1.0);
              this.addCubePoint(a, -1.0, 1.0, -1.0);
              this.addCubePoint(a, 1.0, 1.0, 1.0);
              this.addCubePoint(a, 1.0, 1.0, -1.0);
              break;
            case 'bottom':
              if (bl.id === 2) coords = facecoords;
              this.addCubePoint(a, -1.0, -1.0, -1.0);
              this.addCubePoint(a, 1.0, -1.0, -1.0);
              this.addCubePoint(a, 1.0, -1.0, 1.0);
              this.addCubePoint(a, -1.0, -1.0, -1.0);
              this.addCubePoint(a, 1.0, -1.0, 1.0);
              this.addCubePoint(a, -1.0, -1.0, 1.0);
              break;
            case 'right':
              if (bl.id === 2) coords = facecoords;
              this.addCubePoint(a, 1.0, -1.0, 1.0);
              this.addCubePoint(a, 1.0, -1.0, -1.0);
              this.addCubePoint(a, 1.0, 1.0, -1.0);
              this.addCubePoint(a, 1.0, -1.0, 1.0);
              this.addCubePoint(a, 1.0, 1.0, -1.0);
              this.addCubePoint(a, 1.0, 1.0, 1.0);
              break;
            case 'left':
              if (bl.id === 2) coords = facecoords;
              this.addCubePoint(a, -1.0, -1.0, -1.0);
              this.addCubePoint(a, -1.0, -1.0, 1.0);
              this.addCubePoint(a, -1.0, 1.0, 1.0);
              this.addCubePoint(a, -1.0, -1.0, -1.0);
              this.addCubePoint(a, -1.0, 1.0, 1.0);
              this.addCubePoint(a, -1.0, 1.0, -1.0);
          }
          this.indices.push.apply(this.indices, [i + 0, i + 1, i + 2, i + 3, i + 4, i + 5]);
          this.textcoords.push.apply(this.textcoords, coords);
          clr = [1.0, 1.0, 1.0];
          this.colors.push.apply(this.colors, clr);
          this.colors.push.apply(this.colors, clr);
          this.colors.push.apply(this.colors, clr);
          this.colors.push.apply(this.colors, clr);
          this.colors.push.apply(this.colors, clr);
          return this.colors.push.apply(this.colors, clr);
        }
      } catch (e) {
        return console.log(e);
      } finally {
        if (show[side]) {
          return i + 6;
        } else {
          return i;
        }
      }
    };

    return RegionView;

  })();

  exports.ChunkView = ChunkView;

  exports.calcPoint = calcPoint;

  exports.typeToCoords = typeToCoords;

}).call(this);
