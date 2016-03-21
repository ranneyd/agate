"use strict";


var scanner = require("../scanner.js");
var parser  = require("../parser.js");

var assert = require('assert');
describe('Scanner Basics', function() {
  describe('literals', function () {
    it('should recognize intlits', function () {
        let out = scanner("5", null);
        assert.deepStrictEqual("intlit", out[0].type);
        assert.deepStrictEqual("5", out[0].text);
        
        out = scanner("-5", null);
        assert.deepStrictEqual("minus", out[0].type);
        assert.deepStrictEqual("intlit", out[1].type);
        assert.deepStrictEqual("5", out[1].text);
    });
    it('should recognize floatlits', function () {
        let out = scanner("3.14", null);
        assert.deepStrictEqual("floatlit", out[0].type);
        assert.deepStrictEqual("3.14", out[0].text);
        
        out = scanner("-3.14", null);
        assert.deepStrictEqual("minus", out[0].type);
        assert.deepStrictEqual("floatlit", out[1].type);
        assert.deepStrictEqual("3.14", out[1].text);
    });
  });
});
describe('Function', function() {
  describe('Basic', function () {
    it('should be able to handle a simple function', function () {
        let tokens = scanner("def basic()\n\treturn 5", null);

        assert.deepStrictEqual("def", tokens[0].type);
        assert.deepStrictEqual("bareword", tokens[1].type);
        assert.deepStrictEqual("basic", tokens[1].text);
        assert.deepStrictEqual("openParen", tokens[2].type);
        assert.deepStrictEqual("closeParen", tokens[3].type);
        assert.deepStrictEqual("newline", tokens[4].type);
        assert.deepStrictEqual("indent", tokens[5].type);
        assert.deepStrictEqual("return", tokens[6].type);
        assert.deepStrictEqual("intlit", tokens[7].type);
        assert.deepStrictEqual("5", tokens[7].text);

        let tree = parser(tokens, null);

        let def = tree.block[0];
        assert.deepStrictEqual("definition", def.type);
        assert.deepStrictEqual("bareword", def.name.type);
        assert.deepStrictEqual("basic", def.name.text);

        let ret = def.body[0];
        assert.deepStrictEqual("return", ret.type);
        assert.deepStrictEqual("intlit", ret.value.type);
        assert.deepStrictEqual("5", ret.value.text);
    });
  });
});
