"use strict";


const Entity = require("../entities/entity");
const Env = require("../entities/env");


const Attr = require("../entities/attr");
const Literal = require("../entities/literal");
const Return = require("../entities/return");
const This = require("../entities/this");
const Token = require("../entities/token");

var assert = require('assert');

describe('Env', function() {
  describe('constructor', function () {
    it('should construct', function () {
        let env1 = new Env();
        let env2 = new Env(env1);
        assert.deepStrictEqual(env1.parent, undefined, "null parent");
        assert.deepStrictEqual(env2.parent, env1, "correct parent");
        assert.deepStrictEqual(env2.error, env1.error, "correct error");

    });
  });
  describe('markUnsafe', function () {
    it('should make unsafe', function () {
        let env = new Env();
        env.markUnsafe();
        assert.deepStrictEqual(env.safe, false, "correct error");

    });
  });
  describe('makeChild', function () {
    it('should make child', function () {
        let env = new Env();
        assert.deepStrictEqual(env.makeChild().parent, env, "correct parent");
    });
  });
  // TODO: needs way more testing
});
describe('Entity', function() {
  describe('constructor', function () {
    it('should construct', function () {
        let practiceToken = {
            type: "intlit",
            text: 42,
            line: 1,
            column: 2
        };
        let entity = new Entity(practiceToken);
        assert.deepStrictEqual(entity.line, 1, "line");
        assert.deepStrictEqual(entity.column, 2, "column");
    });
  });
  describe('toString', function () {
    it('should make the string', function () {
        let practiceToken = {
            type: "intlit",
            text: 42,
            line: 1,
            column: 2
        };
        let entity = new Entity(practiceToken);
        let expectedString = [
            "{",
            "   type: Entity",
            "}"
        ].join("\n");        
        assert.deepStrictEqual(entity.toString(), expectedString, "defaults");
        
        expectedString = [
            "{",
            "      type: Entity",
            "   }"
        ].join("\n"); 
        assert.deepStrictEqual(entity.toString(3), expectedString, "indent level 3");

        expectedString = [
            "{",
            "    type: Entity",
            "}"
        ].join("\n"); 
        assert.deepStrictEqual(entity.toString(0, 4), expectedString, "indent level 0, indent amount 4");
        
        expectedString = [
            "{",
            "       type: Entity",
            "   }"
        ].join("\n"); 
        assert.deepStrictEqual(entity.toString(3, 4), expectedString, "indent level 3, indent amount 4");

    });
  });
});
describe('Token', function() {
  describe('constructor', function () {
    it('should construct', function () {
        let practiceToken = {
            type: "intlit",
            text: 42,
            line: 1,
            column: 2
        };
        let token = new Token(practiceToken);
        assert.deepStrictEqual(token.line, 1, "line");
        assert.deepStrictEqual(token.column, 2, "column");
        assert.deepStrictEqual(token.token ,practiceToken, "token");
    });
  });
  describe('toString', function () {
    it('should make the string', function () {
        let practiceToken = {
            type: "intlit",
            text: 42,
            line: 1,
            column: 2
        };
        let entity = new Token(practiceToken);
        let expectedString = [
            "{",
            "   type: Token",
            "   tokenType: intlit",
            "   text: 42",
            "}"
        ].join("\n");
        assert.deepStrictEqual(entity.toString(), expectedString, "defaults");
    });
  });
});
describe('Literal', function() {
  describe('constructor', function () {
    it('should construct', function () {
        let practiceToken = {
            type: "intlit",
            text: 42,
            line: 1,
            column: 2
        };
        let literal = new Literal(practiceToken);
        assert.deepStrictEqual(literal.line, 1, "line");
        assert.deepStrictEqual(literal.column, 2, "column");
        assert.deepStrictEqual(literal.token , practiceToken, "token");
        assert.deepStrictEqual(literal.litType , "intlit", "type");
        assert.deepStrictEqual(literal.text , 42, "text");
    });
  });
  describe('toString', function () {
    it('should make the string', function () {
        let practiceToken = {
            type: "intlit",
            text: 42,
            line: 1,
            column: 2
        };
        let literal = new Literal(practiceToken);
        assert.deepStrictEqual(literal.toString(), "42", "defaults");
        assert.deepStrictEqual(literal.toString(3), "   42", "indentation");
    });
  });
});
describe('Return', function() {
  describe('constructor', function () {
    it('should construct', function () {
        let practiceReturn = {
            type: "return",
            line: 1,
            column: 1
        };
        let practiceToken = {
            type: "intlit",
            text: 42,
            line: 1,
            column: 7
        };
        let ret = new Return(practiceReturn, new Token(practiceToken));
        assert.deepStrictEqual(ret.line, practiceReturn.line, "line");
        assert.deepStrictEqual(ret.val.token, practiceToken, "value");
    });
  });
  describe('toString', function () {
    it('should make the string', function () {
        let practiceReturn = {
            type: "return",
            line: 1,
            column: 1
        };
        let practiceToken = {
            type: "intlit",
            text: 42,
            line: 1,
            column: 7
        };
        let ret = new Return(practiceReturn, new Token(practiceToken));

        let expectedString = [
            "{",
            "   type: Return",
            "   val: {",
            "      type: Token",
            "      tokenType: intlit",
            "      text: 42",
            "   }",
            "}"
        ].join("\n");

        assert.deepStrictEqual(ret.toString(), expectedString, "defaults");

        expectedString = [
            "{",
            "      type: Return",
            "      val: {",
            "         type: Token",
            "         tokenType: intlit",
            "         text: 42",
            "      }",
            "   }"
        ].join("\n");
        assert.deepStrictEqual(ret.toString(3), expectedString, "indentation");
    });
  });
  describe('analyze', function () {
    it('should properly analyze', function () {
        let practiceReturn = {
            type: "return",
            line: 1,
            column: 1
        };
        let practiceToken = {
            type: "intlit",
            text: 42,
            line: 1,
            column: 7
        };
        let ret = new Return(practiceReturn, new Token(practiceToken));

        let env = new Env()

        ret.analyze(env);

        // TODO: more complex return value analysis
    });
  });
});

describe('This', function() {
  describe('constructor', function () {
    it('should construct', function () {
        let practiceToken = {
            type: "this",
            line: 1,
            column: 2
        };
        let thisObj = new This(practiceToken);
        assert.deepStrictEqual(thisObj.line, 1, "line");
    });
  });
  describe('toString', function () {
    it('should make the string', function () {
        let practiceToken = {
            type: "this",
            line: 1,
            column: 2
        };
        let thisObj = new This(practiceToken);
        assert.deepStrictEqual(thisObj.toString(), "this", "defaults");
        assert.deepStrictEqual(thisObj.toString(3), "   this", "indentation");
    });
  });
});

describe('Attr', function() {
  describe('constructor', function () {
    it('should construct', function () {
        let practiceValue = {
            type: "intlit",
            text: 42,
            line: 1,
            column: 7
        };
        let practiceBracket = {
            type: "openSquare",
            line: 1,
            column: 1
        };
        let attr = new Attr(practiceBracket, "test", new Token(practiceValue));
        assert.deepStrictEqual(attr.key, "test", "line");
        assert.deepStrictEqual(attr.value.token, practiceValue, "value");
    });
  });
  describe('toString', function () {
    it('should make the string', function () {
        let practiceValue = {
            type: "intlit",
            text: 42,
            line: 1,
            column: 7
        };
        let practiceBracket = {
            type: "openSquare",
            line: 1,
            column: 1
        };
        let attr = new Attr(practiceBracket, "test", new Token(practiceValue));

        let expectedString = [
            "{",
            "   type: Attr",
            "   key: test",
            "   value: {",
            "      type: Token",
            "      tokenType: intlit",
            "      text: 42",
            "   }",
            "}"
        ].join("\n");

        assert.deepStrictEqual(attr.toString(), expectedString, "defaults");

        expectedString = [
            "{",
            "      type: Attr",
            "      key: test",
            "      value: {",
            "         type: Token",
            "         tokenType: intlit",
            "         text: 42",
            "      }",
            "   }"
        ].join("\n");
        assert.deepStrictEqual(attr.toString(3), expectedString, "indentation");
    });
  });
  describe('analyze', function () {
    it('should properly analyze', function () {
        let practiceValue = {
            type: "intlit",
            text: 42,
            line: 1,
            column: 7
        };
        let practiceBracket = {
            type: "openSquare",
            line: 1,
            column: 1
        };
        let attr = new Attr(practiceBracket, "test", new Literal(practiceValue));

        let env = new Env()

        attr.analyze(env);

        // TODO: more complex return value analysis
    });
  });
});