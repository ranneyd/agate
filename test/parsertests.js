"use strict";

const Parser = require("../parser");
const AgateError = require("../error.js");

var error = new AgateError();
var tokens = [
    {
        "type": "bareword",
        "line": 1,
        "column": 1,
        "text": "head"
    },
    {
        "type": "newline",
        "line": 1,
        "column": 5
    },
    {
        "type": "indent",
        "line": 2,
        "column": 1
    },
]

var assert = require('assert');

describe('Parser', function() {
    let parser = new Parser(tokens, error, false);

    it('should construct', function () {
        assert.deepStrictEqual(parser.tokens, tokens, "tokens");
        assert.deepStrictEqual(parser.index, 0, "index");
        assert.deepStrictEqual(parser.error, error, "error");
        assert.deepStrictEqual(parser.verbose, false, "verbose");
        assert.deepStrictEqual(parser.lastToken, null, "last");
    });
    it('should have next()', function () {
        assert.deepStrictEqual(parser.next, tokens[0], "next");
    });
    it('should have get() ', function () {
        assert.deepStrictEqual(parser.get(0), tokens[0], "0");
        assert.deepStrictEqual(parser.get(1), tokens[1], "1");
        assert.deepStrictEqual(parser.get(2), tokens[2], "2");
    });
    it('should have pop, tokensLeft, and empty', function () {
        assert.deepStrictEqual(parser.pop(), tokens[0], "pop 0");
        assert.deepStrictEqual(parser.tokensLeft, 2, "tokens left 0");
        assert.deepStrictEqual(parser.empty, false, "empty 0");

        assert.deepStrictEqual(parser.pop(), tokens[1], "pop 1");
        assert.deepStrictEqual(parser.tokensLeft, 1, "tokens left 1");
        assert.deepStrictEqual(parser.empty, false, "empty 1");

        assert.deepStrictEqual(parser.pop(), tokens[2], "pop 2");
        assert.deepStrictEqual(parser.tokensLeft, 0, "tokens left 2");
        assert.deepStrictEqual(parser.empty, true, "empty 2");
    });
});