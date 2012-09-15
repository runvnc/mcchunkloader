(function() {
  var ChunkSizeX, ChunkSizeY, ChunkSizeZ, ChunkView, cubeCount,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ChunkSizeY = 256;

  ChunkSizeZ = 16;

  ChunkSizeX = 16;

  cubeCount = 0;

  ChunkView = (function() {

    function ChunkView(options) {
      this.extractChunk = __bind(this.extractChunk, this);
      this.transNeighbors = __bind(this.transNeighbors, this);
      this.getBlockAt = __bind(this.getBlockAt, this);      this.nbt = options.nbt;
      this.rotcent = true;
      this.filled = [];
      this.sminx = options.sminx;
      this.sminz = options.sminz;
      this.smaxx = options.smaxx;
      this.smaxz = options.smaxz;
    }

    ChunkView.prototype.getBlockAt = function(x, y, z) {
      var blockpos, section, sectionnum;
      if (!(this.nbt.root.Level.Sections != null)) return;
      sectionnum = Math.floor(y / 16);
      blockpos = y * 16 * 16 + z * 16 + x;
      section = this.nbt.root.Level.Sections[sectionnum];
      if (!(section != null) || (!((section != null ? section.Blocks : void 0) != null))) {
        return -1;
      } else {
        return section.Blocks[blockpos];
      }
    };

    ChunkView.prototype.transNeighbors = function(x, y, z) {
      var blockID, i, j, k, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      for (i = _ref = x - 1, _ref2 = x + 1; _ref <= _ref2 ? i <= _ref2 : i >= _ref2; _ref <= _ref2 ? i++ : i--) {
        if (i >= ChunkSizeX) continue;
        for (j = _ref3 = y - 1, _ref4 = y + 1; _ref3 <= _ref4 ? j <= _ref4 : j >= _ref4; _ref3 <= _ref4 ? j++ : j--) {
          for (k = _ref5 = z - 1, _ref6 = z + 1; _ref5 <= _ref6 ? k <= _ref6 : k >= _ref6; _ref5 <= _ref6 ? k++ : k--) {
            if (k >= ChunkSizeZ) continue;
            if (!(i === x && j === y && k === z)) {
              blockID = getBlockAt(x, y, z);
              if (blockID === 0) return true;
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
      for (x = 0, _ref = ChunkSizeX - 1; 0 <= _ref ? x <= _ref : x >= _ref; 0 <= _ref ? x++ : x--) {
        for (z = 0, _ref2 = ChunkSizeZ - 1; 0 <= _ref2 ? z <= _ref2 : z >= _ref2; 0 <= _ref2 ? z++ : z--) {
          for (y = _ref3 = this.ymin; _ref3 <= 255 ? y <= 255 : y >= 255; _ref3 <= 255 ? y++ : y--) {
            blockID = getBlockAt(x, y, z);
            if (!(blockID != null)) blockID = 0;
            blockType = blockInfo['_-1'];
            blockID = '_' + blockID.toString();
            if (blockInfo[blockID] != null) {
              blockType = blockInfo[blockID];
            } else {
              blockType = blockInfo['_-1'];
            }
            show = false;
            if (y < 60 && this.showStuff === 'diamondsmoss') {
              show = blockType.id === 48 || blockType.id === 56 || blockType.id === 4;
            } else if (blockType.id !== 0) {
              show = this.transNeighbors(x, y, z);
            }
            if (show) this.addBlock([x, y, z]);
          }
        }
      }
      return this.renderPoints();
    };

    ChunkView.addBlock = function(position) {
      var verts;
      verts = [position[0], position[1], position[2]];
      return ChunkView.filled.push(verts);
    };

    ChunkView.calcPoint = function(pos) {
      var verts, xmod, zmod;
      verts = [];
      if (ChunkView.rotcent) {
        xmod = 15 * ChunkSizeX;
        zmod = 15 * ChunkSizeZ;
      } else {
        xmod = (ChunkView.sminx + (ChunkView.smaxx - ChunkView.sminx) / 2.0) * ChunkSizeX;
        zmod = (ChunkView.sminz + (ChunkView.smaxz - ChunkView.sminz) / 2.0) * ChunkSizeZ;
      }
      verts.push(((-1 * xmod) + pos[0] + ChunkView.pos.x * ChunkSizeX * 1.00000) / 40.00);
      verts.push(((pos[1] + 1) * 1.0) / 40.0);
      verts.push(((-1 * zmod) + pos[2] + ChunkView.pos.z * ChunkSizeZ * 1.00000) / 40.00);
      return verts;
    };

    ChunkView.renderPoints = function() {
      var i, verts, _results;
      i = 0;
      _results = [];
      while (i < ChunkView.filled.length) {
        verts = ChunkView.filled[i];
        ChunkView.addTexturedBlock(verts);
        _results.push(i++);
      }
      return _results;
    };

    ChunkView.getBlockType = function(x, y, z) {
      var blockID, blockType, id;
      blockType = blockInfo["_-1"];
      id = getBlockAt(x, y, z);
      blockID = "_-1";
      if (id != null) blockID = "_" + id.toString();
      if (blockInfo[blockID] != null) blockType = blockInfo[blockID];
      return blockType;
    };

    ChunkView.getBlockInfo = function(p) {
      var blockID, blockType, id;
      blockType = blockInfo["_-1"];
      id = getBlockAt(x, y, z);
      blockID = "_-1";
      if (id != null) blockID = "_" + id.toString();
      if (blockInfo[blockID]) {
        return blockInfo[blockID];
      } else {
        return blockInfo["_-1"];
      }
    };

    ChunkView.getColor = function(pos) {
      var t;
      t = ChunkView.getBlockType(pos[0], pos[1], pos[2]);
      return t.rgba;
    };

    ChunkView.hasNeighbor = function(p, offset0, offset1, offset2) {
      var info, n;
      n = [p[0] + offset0, p[1] + offset1, p[2] + offset2];
      info = ChunkView.getBlockType(n[0], n[1], n[2]);
      return info.id > 0;
    };

    ChunkView.addTexturedBlock = function(p) {
      var a, blockInfo;
      a = p;
      blockInfo = ChunkView.getBlockInfo(p);
      ChunkView.addCubePoint(a, -1.0, -1.0, 1.0);
      ChunkView.addCubePoint(a, 1.0, -1.0, 1.0);
      ChunkView.addCubePoint(a, 1.0, 1.0, 1.0);
      ChunkView.addCubePoint(a, -1.0, 1.0, 1.0);
      ChunkView.addCubePoint(a, -1.0, -1.0, -1.0);
      ChunkView.addCubePoint(a, -1.0, 1.0, -1.0);
      ChunkView.addCubePoint(a, 1.0, 1.0, -1.0);
      ChunkView.addCubePoint(a, 1.0, -1.0, -1.0);
      ChunkView.addCubePoint(a, -1.0, 1.0, -1.0);
      ChunkView.addCubePoint(a, -1.0, 1.0, 1.0);
      ChunkView.addCubePoint(a, 1.0, 1.0, 1.0);
      ChunkView.addCubePoint(a, 1.0, 1.0, -1.0);
      ChunkView.addCubePoint(a, -1.0, -1.0, -1.0);
      ChunkView.addCubePoint(a, 1.0, -1.0, -1.0);
      ChunkView.addCubePoint(a, 1.0, -1.0, 1.0);
      ChunkView.addCubePoint(a, -1.0, -1.0, 1.0);
      ChunkView.addCubePoint(a, 1.0, -1.0, -1.0);
      ChunkView.addCubePoint(a, 1.0, 1.0, -1.0);
      ChunkView.addCubePoint(a, 1.0, 1.0, 1.0);
      ChunkView.addCubePoint(a, 1.0, -1.0, 1.0);
      ChunkView.addCubePoint(a, -1.0, -1.0, -1.0);
      ChunkView.addCubePoint(a, -1.0, -1.0, 1.0);
      ChunkView.addCubePoint(a, -1.0, 1.0, 1.0);
      ChunkView.addCubePoint(a, -1.0, 1.0, -1.0);
      ChunkView.addFaces(ChunkView.cubeCount * 24, blockInfo, p);
      return ChunkView.cubeCount++;
    };

    ChunkView.addCubePoint = function(a, xdelta, ydelta, zdelta) {
      var p2, p3;
      p2 = [a[0] + xdelta * 0.5, a[1] + ydelta * 0.5, a[2] + zdelta * 0.5];
      p3 = ChunkView.calcPoint(p2);
      ChunkView.vertices.push(p3[0]);
      ChunkView.vertices.push(p3[1]);
      return ChunkView.vertices.push(p3[2]);
    };

    ChunkView.typeToCoords = function(type) {
      var x, y;
      if (type.t) {
        x = type.t[0];
        y = type.t[1];
        return [x / 16.0, y / 16.0, (x + 1.0) / 16.0, y / 16.0, (x + 1.0) / 16.0, (y + 1.0) / 16.0, x / 16.0, (y + 1.0) / 16.0];
      } else {
        return [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
      }
    };

    ChunkView.addFaces = function(i, blockInfo, p) {
      var coords, show, totfaces;
      coords = ChunkView.typeToCoords(blockInfo);
      show = {};
      show.front = !(ChunkView.hasNeighbor(p, 0, 0, 1));
      show.back = !(ChunkView.hasNeighbor(p, 0, 0, -1));
      show.top = !(ChunkView.hasNeighbor(p, 0, 1, 0));
      show.bottom = !(ChunkView.hasNeighbor(p, 0, -1, 0));
      show.left = !(ChunkView.hasNeighbor(p, -1, 0, 0));
      show.right = !(ChunkView.hasNeighbor(p, 1, 0, 0));
      totfaces = 0;
      if (show.front) totfaces++;
      if (show.back) totfaces++;
      if (show.top) totfaces++;
      if (show.bottom) totfaces++;
      if (show.left) totfaces++;
      if (show.right) totfaces++;
      if (show.front) {
        ChunkView.indices.push.apply(ChunkView.indices, [i + 0, i + 1, i + 2, i + 0, i + 2, i + 3]);
      }
      if (show.back) {
        ChunkView.indices.push.apply(ChunkView.indices, [i + 4, i + 5, i + 6, i + 4, i + 6, i + 7]);
      }
      if (show.top) {
        ChunkView.indices.push.apply(ChunkView.indices, [i + 8, i + 9, i + 10, i + 8, i + 10, i + 11]);
      }
      if (show.bottom) {
        ChunkView.indices.push.apply(ChunkView.indices, [i + 12, i + 13, i + 14, i + 12, i + 14, i + 15]);
      }
      if (show.right) {
        ChunkView.indices.push.apply(ChunkView.indices, [i + 16, i + 17, i + 18, i + 16, i + 18, i + 19]);
      }
      if (show.left) {
        ChunkView.indices.push.apply(ChunkView.indices, [i + 20, i + 21, i + 22, i + 20, i + 22, i + 23]);
      }
      ChunkView.textcoords.push.apply(ChunkView.textcoords, coords);
      ChunkView.textcoords.push.apply(ChunkView.textcoords, coords);
      ChunkView.textcoords.push.apply(ChunkView.textcoords, coords);
      ChunkView.textcoords.push.apply(ChunkView.textcoords, coords);
      ChunkView.textcoords.push.apply(ChunkView.textcoords, coords);
      return ChunkView.textcoords.push.apply(ChunkView.textcoords, coords);
    };

    convertColors();

    return ChunkView;

  }).call(this);

}).call(this);
