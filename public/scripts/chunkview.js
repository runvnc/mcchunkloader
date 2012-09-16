(function() {
  var ChunkSizeX, ChunkSizeY, ChunkSizeZ, ChunkView, blockInfo, cubeCount, exports, require,
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

  ChunkView = (function() {

    function ChunkView(options, indices, vertices) {
      this.indices = indices;
      this.vertices = vertices;
      this.addFaces = __bind(this.addFaces, this);
      this.typeToCoords = __bind(this.typeToCoords, this);
      this.addCubePoint = __bind(this.addCubePoint, this);
      this.addTexturedBlock = __bind(this.addTexturedBlock, this);
      this.hasNeighbor = __bind(this.hasNeighbor, this);
      this.getColor = __bind(this.getColor, this);
      this.getBlockInfo = __bind(this.getBlockInfo, this);
      this.getBlockType = __bind(this.getBlockType, this);
      this.renderPoints = __bind(this.renderPoints, this);
      this.calcPoint = __bind(this.calcPoint, this);
      this.addBlock = __bind(this.addBlock, this);
      this.extractChunk = __bind(this.extractChunk, this);
      this.transNeighbors = __bind(this.transNeighbors, this);
      this.getBlockAt = __bind(this.getBlockAt, this);
      this.nbt = options.nbt;
      this.pos = options.pos;
      this.rotcent = true;
      this.filled = [];
      this.ymin = 50;
      if (options.ymin != null) this.ymin = options.ymin;
    }

    ChunkView.prototype.getBlockAt = function(x, y, z) {
      var blockpos, offset, section, sectionnum, _i, _len, _ref;
      if (!(this.nbt.root.Level.Sections != null)) return -1;
      sectionnum = Math.floor(y / 16);
      offset = ((y % 16) * 256) + (z * 16) + x;
      blockpos = offset;
      _ref = this.nbt.root.Level.Sections;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        section = _ref[_i];
        if ((section != null) && section.Y === sectionnum) {
          return section.Blocks[blockpos];
        }
      }
      return -1;
    };

    ChunkView.prototype.transNeighbors = function(x, y, z) {
      var blockID, i, j, k, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      for (i = _ref = x - 1, _ref2 = x + 1; _ref <= _ref2 ? i <= _ref2 : i >= _ref2; _ref <= _ref2 ? i++ : i--) {
        if (i >= ChunkSizeX) continue;
        for (j = _ref3 = y - 1, _ref4 = y + 1; _ref3 <= _ref4 ? j <= _ref4 : j >= _ref4; _ref3 <= _ref4 ? j++ : j--) {
          for (k = _ref5 = z - 1, _ref6 = z + 1; _ref5 <= _ref6 ? k <= _ref6 : k >= _ref6; _ref5 <= _ref6 ? k++ : k--) {
            if (k >= ChunkSizeZ) continue;
            if (!(i === x && j === y && k === z)) {
              blockID = this.getBlockAt(x, y, z);
              if (blockID === 0 || blockID === -1) return true;
            }
          }
        }
      }
      return false;
    };

    ChunkView.prototype.extractChunk = function() {
      var blockID, blockType, show, x, y, z, _ref, _ref2, _ref3;
      this.vertices = [];
      this.colors = [];
      this.indices = [];
      this.textcoords = [];
      this.filled = [];
      this.cubeCount = 0;
      for (x = 0, _ref = ChunkSizeX - 1; 0 <= _ref ? x <= _ref : x >= _ref; 0 <= _ref ? x++ : x--) {
        for (z = 0, _ref2 = ChunkSizeZ - 1; 0 <= _ref2 ? z <= _ref2 : z >= _ref2; 0 <= _ref2 ? z++ : z--) {
          for (y = _ref3 = this.ymin; _ref3 <= 255 ? y <= 255 : y >= 255; _ref3 <= 255 ? y++ : y--) {
            blockID = this.getBlockAt(x, y, z);
            if (!(blockID != null)) blockID = 0;
            blockType = blockInfo['_-1'];
            blockID = '_' + blockID.toString();
            if (blockInfo[blockID] != null) {
              blockType = blockInfo[blockID];
            } else {
              blockType = blockInfo['_-1'];
            }
            show = false;
            show = blockType.id > 0;
            if (show) this.addBlock([x, y, z]);
          }
        }
      }
      return this.renderPoints();
    };

    ChunkView.prototype.addBlock = function(position) {
      var verts;
      verts = [position[0], position[1], position[2]];
      return this.filled.push(verts);
    };

    ChunkView.prototype.calcPoint = function(pos) {
      var verts, xmod, zmod;
      verts = [];
      if (this.rotcent) {
        xmod = 15 * ChunkSizeX;
        zmod = 15 * ChunkSizeZ;
      } else {
        xmod = (this.sminx + (this.smaxx - this.sminx) / 2.0) * ChunkSizeX;
        zmod = (this.sminz + (this.smaxz - this.sminz) / 2.0) * ChunkSizeZ;
      }
      verts.push((-1 * xmod) + pos[0] + this.pos.x * ChunkSizeX * 1.00000);
      verts.push((pos[1] + 1) * 1.0);
      verts.push((-1 * zmod) + pos[2] + this.pos.z * ChunkSizeZ * 1.00000);
      return verts;
    };

    ChunkView.prototype.renderPoints = function() {
      var i, verts, _results;
      i = 0;
      _results = [];
      while (i < this.filled.length) {
        verts = this.filled[i];
        this.addTexturedBlock(verts);
        _results.push(i++);
      }
      return _results;
    };

    ChunkView.prototype.getBlockType = function(x, y, z) {
      var blockID, blockType, id;
      blockType = blockInfo["_-1"];
      id = this.getBlockAt(x, y, z);
      blockID = "_-1";
      if (id != null) blockID = "_" + id.toString();
      if (blockInfo[blockID] != null) blockType = blockInfo[blockID];
      return blockType;
    };

    ChunkView.prototype.getBlockInfo = function(p) {
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

    ChunkView.prototype.getColor = function(pos) {
      var t;
      t = this.getBlockType(pos[0], pos[1], pos[2]);
      return t.rgba;
    };

    ChunkView.prototype.hasNeighbor = function(p, offset0, offset1, offset2) {
      var info, n;
      n = [p[0] + offset0, p[1] + offset1, p[2] + offset2];
      info = this.getBlockType(n[0], n[1], n[2]);
      return info.id > 0;
    };

    ChunkView.prototype.addTexturedBlock = function(p) {
      var a, block;
      a = p;
      block = this.getBlockInfo(p);
      this.addCubePoint(a, -1.0, -1.0, 1.0);
      this.addCubePoint(a, 1.0, -1.0, 1.0);
      this.addCubePoint(a, 1.0, 1.0, 1.0);
      this.addCubePoint(a, -1.0, 1.0, 1.0);
      this.addCubePoint(a, -1.0, -1.0, -1.0);
      this.addCubePoint(a, -1.0, 1.0, -1.0);
      this.addCubePoint(a, 1.0, 1.0, -1.0);
      this.addCubePoint(a, 1.0, -1.0, -1.0);
      this.addCubePoint(a, -1.0, 1.0, -1.0);
      this.addCubePoint(a, -1.0, 1.0, 1.0);
      this.addCubePoint(a, 1.0, 1.0, 1.0);
      this.addCubePoint(a, 1.0, 1.0, -1.0);
      this.addCubePoint(a, -1.0, -1.0, -1.0);
      this.addCubePoint(a, 1.0, -1.0, -1.0);
      this.addCubePoint(a, 1.0, -1.0, 1.0);
      this.addCubePoint(a, -1.0, -1.0, 1.0);
      this.addCubePoint(a, 1.0, -1.0, -1.0);
      this.addCubePoint(a, 1.0, 1.0, -1.0);
      this.addCubePoint(a, 1.0, 1.0, 1.0);
      this.addCubePoint(a, 1.0, -1.0, 1.0);
      this.addCubePoint(a, -1.0, -1.0, -1.0);
      this.addCubePoint(a, -1.0, -1.0, 1.0);
      this.addCubePoint(a, -1.0, 1.0, 1.0);
      this.addCubePoint(a, -1.0, 1.0, -1.0);
      this.addFaces(this.cubeCount * 24, block, p);
      return this.cubeCount++;
    };

    ChunkView.prototype.addCubePoint = function(a, xdelta, ydelta, zdelta) {
      var p2, p3;
      p2 = [a[0] + xdelta * 0.5, a[1] + ydelta * 0.5, a[2] + zdelta * 0.5];
      p3 = this.calcPoint(p2);
      this.vertices.push(p3[0]);
      this.vertices.push(p3[1]);
      return this.vertices.push(p3[2]);
    };

    ChunkView.prototype.typeToCoords = function(type) {
      var x, y;
      if (type.t != null) {
        x = type.t[0];
        y = 15 - type.t[1];
        return [x / 16.0, y / 16.0, (x + 1.0) / 16.0, y / 16.0, (x + 1.0) / 16.0, (y + 1.0) / 16.0, x / 16.0, (y + 1.0) / 16.0];
      } else {
        return [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
      }
    };

    ChunkView.prototype.addFaces = function(i, bl, p) {
      var clr, coords, show, totfaces;
      coords = this.typeToCoords(bl);
      show = {};
      show.front = !(this.hasNeighbor(p, 0, 0, 1));
      show.back = !(this.hasNeighbor(p, 0, 0, -1));
      show.top = !(this.hasNeighbor(p, 0, 1, 0));
      show.bottom = !(this.hasNeighbor(p, 0, -1, 0));
      show.left = !(this.hasNeighbor(p, -1, 0, 0));
      show.right = !(this.hasNeighbor(p, 1, 0, 0));
      totfaces = 0;
      if (show.front) totfaces++;
      if (show.back) totfaces++;
      if (show.top) totfaces++;
      if (show.bottom) totfaces++;
      if (show.left) totfaces++;
      if (show.right) totfaces++;
      if (show.front) {
        this.indices.push.apply(this.indices, [i + 0, i + 1, i + 2, i + 0, i + 2, i + 3]);
      }
      if (show.back) {
        this.indices.push.apply(this.indices, [i + 4, i + 5, i + 6, i + 4, i + 6, i + 7]);
      }
      if (show.top) {
        this.indices.push.apply(this.indices, [i + 8, i + 9, i + 10, i + 8, i + 10, i + 11]);
      }
      if (show.bottom) {
        this.indices.push.apply(this.indices, [i + 12, i + 13, i + 14, i + 12, i + 14, i + 15]);
      }
      if (show.right) {
        this.indices.push.apply(this.indices, [i + 16, i + 17, i + 18, i + 16, i + 18, i + 19]);
      }
      if (show.left) {
        this.indices.push.apply(this.indices, [i + 20, i + 21, i + 22, i + 20, i + 22, i + 23]);
      }
      this.textcoords.push.apply(this.textcoords, coords);
      this.textcoords.push.apply(this.textcoords, coords);
      this.textcoords.push.apply(this.textcoords, coords);
      this.textcoords.push.apply(this.textcoords, coords);
      this.textcoords.push.apply(this.textcoords, coords);
      this.textcoords.push.apply(this.textcoords, coords);
      clr = [bl.rgba[0], bl.rgba[1], bl.rgba[2]];
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      this.colors.push.apply(this.colors, clr);
      return this.colors.push.apply(this.colors, clr);
    };

    return ChunkView;

  })();

  exports.ChunkView = ChunkView;

}).call(this);
