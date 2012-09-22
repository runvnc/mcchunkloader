(function() {
  var binaryhttp, chunkdata, data, delay, done, exports, nbt, onProgress, region, render, require, whichChunks;

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

  onProgress = function(evt) {
    return $('#proginner').width($('#progouter').width() * (evt.position / evt.total));
  };

  delay = function(ms, func) {
    return setTimeout(func, ms);
  };

  done = function(arraybuffer) {
    return delay(150, function() {
      var renderer, seconds, start, testregion, total;
      start = new Date().getTime();
      data = arraybuffer;
      console.log(arraybuffer);
      testregion = new region.Region(data);
      console.log(testregion);
      whichChunks(testregion);
      renderer = new render.RegionRenderer(testregion);
      total = new Date().getTime() - start;
      seconds = total / 1000.0;
      return console.log("loaded in " + seconds + " seconds");
    });
  };

  exports.runTests = function() {
    return binaryhttp.loadBinary('/r.0.0.mca', onProgress, done);
  };

}).call(this);
