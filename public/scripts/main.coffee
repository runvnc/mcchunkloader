if window?
  exports = window.exports
  require = window.require

tests = require 'tests'

tests.runTests()



