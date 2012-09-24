(function() {
  var exports, require, tests;

  if (typeof window !== "undefined" && window !== null) {
    exports = window.exports;
    require = window.require;
  }

  tests = require('tests');

  tests.runTests();

}).call(this);
