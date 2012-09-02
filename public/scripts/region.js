(function() {
  var CHUNK_HEADER_SIZE, Region, SECTOR_BYTES, SECTOR_INTS, dataview, emptySector, emptySectorBuffer, exports, require, sizeDelta,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (typeof window !== "undefined" && window !== null) {
    exports = window.exports;
    require = window.require;
  }

  dataview = require('dataview');

  SECTOR_BYTES = 4096;

  SECTOR_INTS = SECTOR_BYTES / 4;

  CHUNK_HEADER_SIZE = 5;

  emptySectorBuffer = new ArrayBuffer(4096);

  emptySector = new Uint8Array(emptySectorBuffer);

  sizeDelta = 0;

  Region = (function() {

    function Region(buffer, x, z) {
      var i, nSectors, offset, sectorNum, _ref, _ref2;
      this.buffer = buffer;
      this.x = x;
      this.z = z;
      this.hasChunk = __bind(this.hasChunk, this);
      this.getOffset = __bind(this.getOffset, this);
      this.outOfBounds = __bind(this.outOfBounds, this);
      this.getChunk = __bind(this.getChunk, this);
      this.dataView = new dataview.jDataView(this.buffer);
      sizeDelta = 0;
      nSectors = this.buffer.byteLength / SECTOR_BYTES;
      console.log('nSectors is ' + nSectors);
      this.sectorFree = [];
      for (i = 0, _ref = nSectors - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        this.sectorFree.push(true);
      }
      this.sectorFree[0] = false;
      this.sectorFree[1] = false;
      this.dataView.seek(0);
      this.offsets = new Int32Array(this.buffer, 0, SECTOR_INTS);
      console.log('@offsets follows');
      console.log(this.offsets);
      for (i = 0; 0 <= SECTOR_INTS ? i <= SECTOR_INTS : i >= SECTOR_INTS; 0 <= SECTOR_INTS ? i++ : i--) {
        offset = this.dataView.getInt32();
        if (offset !== 0 && (offset >> 16) + ((offset >> 8) & 0xFF) <= this.sectorFree.length) {
          for (sectorNum = 0, _ref2 = ((offset >> 8) & 0xFF) - 1; 0 <= _ref2 ? sectorNum <= _ref2 : sectorNum >= _ref2; 0 <= _ref2 ? sectorNum++ : sectorNum--) {
            this.sectorFree[(offset >> 16) + sectorNum] = false;
          }
        }
      }
    }

    Region.prototype.getChunk = function(x, z) {
      var data, length, numSectors, offset, retval, sectorNumber, version;
      if (this.outOfBounds(x, z)) {
        console.log("READ " + x + z(" out of bounds"));
        return null;
      }
      offset = this.getOffset(x, z);
      if (offset === 0) return null;
      sectorNumber = new Int32Array(1);
      numSectors = new Uint8Array(1);
      offset = this.getOffset(x, z);
      sectorNumber = offset >> 16;
      numSectors = (offset >> 8) & 0xFF;
      if (sectorNumber + numSectors > this.sectorFree.length) {
        console.log("READ " + x + z + " invalid sector");
        console.log('length of sectorFree is ' + this.sectorFree.length + ' sectorNumber is ' + sectorNumber + ' numSectors is ' + numSectors);
        return null;
      }
      this.dataView.seek(sectorNumber * SECTOR_BYTES);
      length = this.dataView.getInt32();
      console.log('LENGTH IS ' + length);
      if (length > SECTOR_BYTES * numSectors) {
        console.log("READ" + x + z + " invalid length: " + length + " > 4096 * " + numSectors);
        return null;
      }
      version = this.dataView.getUint8();
      console.log('COMPRESSION VERSION IS ' + version);
      data = new Uint8Array(this.buffer, this.dataView.tell(), length);
      console.log("got byte array length " + data.length);
      retval = new Zlib.Inflate(data).decompress();
      console.log('retval is ');
      console.log(retval);
      console.log('after retval');
      return retval;
    };

    Region.prototype.outOfBounds = function(x, z) {
      return x < 0 || x >= 32 || z < 0 || z >= 32;
    };

    Region.prototype.getOffset = function(x, z) {
      return this.offsets[x + z * 32];
    };

    Region.prototype.hasChunk = function(x, z) {
      var offset;
      offset = this.getOffset(x, z);
      console.log('haschunk ' + x + ', ' + z + ' offset is ' + offset + ' returning ' + (offset !== 0));
      return offset !== 0;
    };

    return Region;

  })();

  exports.Region = Region;

}).call(this);
