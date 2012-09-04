(function() {
  var binaryhttp, chunkdata, data, done, exports, nbt, onProgress, region, render, require, whichChunks;

  if (typeof window !== "undefined" && window !== null) {
    exports = window.exports;
    require = window.require;
  }

  data = void 0;

  binaryhttp = require('binaryhttp');

  region = require('region');

  chunkdata = require('chunkdata');

  render = require('render');

  nbt = require('nbt');

  whichChunks = function(region) {
    var chunks, count;
    count = 0;
    return chunks = {};
  };

  onProgress = function(evt) {};

  done = function(arraybuffer) {
    var renderer, testregion;
    data = arraybuffer;
    console.log(arraybuffer);
    testregion = new region.Region(data);
    console.log(testregion);
    whichChunks(testregion);
    return renderer = new render.RegionRenderer(testregion);
  };

  exports.runTests = function() {
    return binaryhttp.loadBinary('/r.0.0.mca', onProgress, done);
  };

}).call(this);
