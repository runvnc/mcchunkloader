(function() {
  var binaryhttp, data, done, exports, onProgress, region, require, whichChunks;

  if (typeof window !== "undefined" && window !== null) {
    exports = window.exports;
    require = window.require;
  }

  data = void 0;

  binaryhttp = require('binaryhttp');

  region = require('region');

  whichChunks = function(region) {
    var chunks, count, x, z;
    count = 0;
    chunks = {};
    for (x = 0; x <= 31; x++) {
      for (z = 0; z <= 31; z++) {
        if (region.hasChunk(x, z)) {
          chunks[x + ',' + z] = region.getChunk(x, z);
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
