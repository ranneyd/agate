"use strict";

require("../error.js");

var error = new Error();

var scanner = require("../scanner.js");
var parser  = require("../parser.js");

var assert = require('assert');
describe('Scanner', function() {
  describe('literals', function () {
    it('should recognize intlits', function () {
        let out = scanner("5", error);
        assert.deepStrictEqual("intlit", out[0].type);
        assert.deepStrictEqual("5", out[0].text);
        
        out = scanner("-5", error);
        assert.deepStrictEqual("minus", out[0].type);
        assert.deepStrictEqual("intlit", out[1].type);
        assert.deepStrictEqual("5", out[1].text);
    });
    it('should recognize floatlits', function () {
        let out = scanner("3.14", error);
        assert.deepStrictEqual("floatlit", out[0].type);
        assert.deepStrictEqual("3.14", out[0].text);
        
        out = scanner("-3.14", error);
        assert.deepStrictEqual("minus", out[0].type);
        assert.deepStrictEqual("floatlit", out[1].type);
        assert.deepStrictEqual("3.14", out[1].text);
    });
  });
});
