(function() {
  var binaryhttp, data, done, exports, nbt, onProgress, region, require, whichChunks;

  if (typeof window !== "undefined" && window !== null) {
    exports = window.exports;
    require = window.require;
  }

  data = void 0;

  binaryhttp = require('binaryhttp');

  region = require('region');

  nbt = require('nbt');

  whichChunks = function(region) {
    var byteView, chunk, chunks, count, i, nbtBuffer, nbtReader, nbtbytes, x, z, _ref;
    count = 0;
    chunks = {};
    for (x = 0; x <= 31; x++) {
      for (z = 0; z <= 31; z++) {
        if (region.hasChunk(x, z)) {
          nbtbytes = region.getChunk(x, z);
          nbtBuffer = new ArrayBuffer(nbtbytes.length);
          byteView = new Uint8Array(nbtBuffer);
          for (i = 0, _ref = nbtbytes.length - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
            byteView[i] = nbtbytes[i];
          }
          nbtReader = new nbt.NBTReader(nbtBuffer);
          chunk = nbtReader.read();
          count++;
        }
      }
    }
    console.log("" + count + " of max 1024 chunks");
    return console.log(chunks);
  };

  onProgress = function(evt) {};

  done = function(arraybuffer) {
    var testregion;
    data = arraybuffer;
    console.log(arraybuffer);
    testregion = new region.Region(data);
    console.log(testregion);
    return whichChunks(testregion);
  };

  exports.runTests = function() {
    return binaryhttp.loadBinary('/r.0.0.mca', onProgress, done);
  };

}).call(this);
