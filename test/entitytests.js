"use strict";


const Entity = require("../entities/entity");
const Env = require("../entities/env");

const ArrayAt = require("../entities/arrayAt");
const ArrayLit = require("../entities/arraylit");
const Assignment = require("../entities/assignment");
const Attr = require("../entities/attr");
const Block = require("../entities/block");
const Literal = require("../entities/literal");
const Return = require("../entities/return");
const This = require("../entities/this");
const Token = require("../entities/token");
const UnaryExp = require("../entities/unaryExp");

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
    let practiceToken = {
        type: "intlit",
        text: 42,
        line: 1,
        column: 2
    };
    describe('constructor', function () {
        it('should construct', function () {
        
            let entity = new Entity(practiceToken);
            assert.deepStrictEqual(entity.line, 1, "line");
            assert.deepStrictEqual(entity.column, 2, "column");
        });
    });
    describe('toString', function () {
        it('should make the string', function () {
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
    let practiceToken = {
        type: "intlit",
        text: 42,
        line: 1,
        column: 2
    };
    describe('constructor', function () {
        it('should construct', function () {
            let token = new Token(practiceToken);
            assert.deepStrictEqual(token.line, 1, "line");
            assert.deepStrictEqual(token.column, 2, "column");
            assert.deepStrictEqual(token.token ,practiceToken, "token");
        });
    });
    describe('toString', function () {
        it('should make the string', function () {
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
    let practiceToken = {
        type: "intlit",
        text: 42,
        line: 1,
        column: 2
    };
    describe('constructor', function () {
        it('should construct', function () {

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
            let literal = new Literal(practiceToken);
            assert.deepStrictEqual(literal.toString(), "42", "defaults");
        });
    });
});

describe('This', function() {
    let practiceToken = {
        type: "this",
        line: 1,
        column: 2
    };
    describe('constructor', function () {
        it('should construct', function () {

            let thisObj = new This(practiceToken);
            assert.deepStrictEqual(thisObj.line, 1, "line");
        });
    });
    describe('toString', function () {
        it('should make the string', function () {
            let thisObj = new This(practiceToken);
            assert.deepStrictEqual(thisObj.toString(), "this", "defaults");
            assert.deepStrictEqual(thisObj.toString(3), "   this", "indentation");
        });
    });
});

describe('Attr', function() {
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
    describe('constructor', function () {
        it('should construct', function () {

            let attr = new Attr(practiceBracket, "test", new Token(practiceValue));
            assert.deepStrictEqual(attr.key, "test", "line");
            assert.deepStrictEqual(attr.value.token, practiceValue, "value");
        });
    });
    describe('toString', function () {
        it('should make the string', function () {
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
            let attr = new Attr(practiceBracket, "test", new Literal(practiceValue));

            let env = new Env()

            attr.analyze(env);

            // TODO: more complex analysis
        });
    });
});

describe('Unary Exp', function() {
    let practiceValue = new Token({
        type: "intlit",
        text: 42,
        line: 1,
        column: 2
    });
    let practiceOp = {
        type: "minus",
        line: 1,
        column: 1
    };
    let practiceOp2 = {
        type: "prefixop",
        text: "!",
        line: 1,
        column: 1
    };
    describe('constructor', function () {
        it('should construct', function () {
            let exp = new UnaryExp(practiceOp, practiceValue, practiceOp.type);
            assert.deepStrictEqual(exp.a, practiceValue, "a");
            assert.deepStrictEqual(exp.op, "minus", "op1");

            exp = new UnaryExp(practiceOp, practiceValue, practiceOp);
            assert.deepStrictEqual(exp.op, "minus", "op1 (alt)");

            let exp2 = new UnaryExp(practiceOp2, practiceValue, practiceOp2);
            assert.deepStrictEqual(exp2.op, "!", "op2 (alt)");

            let exp3 = new UnaryExp(practiceOp, exp, practiceOp);
            assert.deepStrictEqual(exp3.a, exp, "a composite");
        });
    });
    describe('toString', function () {
        it('should make the string', function () {

            let exp = new UnaryExp(practiceOp, practiceValue, practiceOp.type);

            let expectedString = [
                "{",
                "   type: UnaryExp",
                "   a: {",
                "      type: Token",
                "      tokenType: intlit",
                "      text: 42",
                "   }",
                "   op: minus",
                "}"
            ].join("\n");

            assert.deepStrictEqual(exp.toString(), expectedString, "defaults");

            expectedString = [
                "{",
                "      type: UnaryExp",
                "      a: {",
                "         type: Token",
                "         tokenType: intlit",
                "         text: 42",
                "      }",
                "      op: minus",
                "   }"
            ].join("\n");
            assert.deepStrictEqual(exp.toString(3), expectedString, "indentation");


            let expAlt = new UnaryExp(practiceOp2, exp, practiceOp2);

            expectedString = [
                "{",
                "   type: UnaryExp",
                "   a: {",
                "      type: UnaryExp",
                "      a: {",
                "         type: Token",
                "         tokenType: intlit",
                "         text: 42",
                "      }",
                "      op: minus",
                "   }",
                "   op: !",
                "}"
            ].join("\n");

            assert.deepStrictEqual(expAlt.toString(), expectedString, "defaults (alt)");

            expectedString = [
                "{",
                "      type: UnaryExp",
                "      a: {",
                "         type: UnaryExp",
                "         a: {",
                "            type: Token",
                "            tokenType: intlit",
                "            text: 42",
                "         }",
                "         op: minus",
                "      }",
                "      op: !",
                "   }"
            ].join("\n");

            assert.deepStrictEqual(expAlt.toString(3), expectedString, "indentation (alt)");

        });
    });
    describe('analyze', function () {
        it('should properly analyze', function () {
            let exp = new UnaryExp(practiceOp, practiceValue, practiceOp.type);

            let env = new Env()

            exp.analyze(env);

            // TODO: more complex analysis
        });
    });
});

describe('Return', function() {
    let practiceReturn = {
        type: "return",
        line: 1,
        column: 1
    };
    let practiceLit = new Literal({
        type: "intlit",
        text: 42,
        line: 1,
        column: 8
    });
    let practiceOp = {
        type: "minus",
        line: 1,
        column: 7
    };

    let practiceUnary = new UnaryExp(practiceOp, practiceLit, practiceOp);
    describe('constructor', function () {
        it('should construct', function () {
            let ret = new Return(practiceReturn, practiceUnary);
            assert.deepStrictEqual(ret.line, practiceReturn.line, "line");
            assert.deepStrictEqual(ret.val, practiceUnary, "value");
        });
    });
    describe('toString', function () {
        it('should make the string', function () {
            let ret = new Return(practiceReturn, practiceUnary);

            let expectedString = [
                "{",
                "   type: Return",
                "   val: {",
                "      type: UnaryExp",
                "      a: 42",
                "      op: minus",
                "   }",
                "}"
            ].join("\n");

            assert.deepStrictEqual(ret.toString(), expectedString, "defaults");

            expectedString = [
                "{",
                "      type: Return",
                "      val: {",
                "         type: UnaryExp",
                "         a: 42",
                "         op: minus",
                "      }",
                "   }"
            ].join("\n");
            assert.deepStrictEqual(ret.toString(3), expectedString, "indentation");
        });
    });
    describe('analyze', function () {
        it('should properly analyze', function () {
            let ret = new Return(practiceReturn, practiceUnary);

            let env = new Env()

            ret.analyze(env);

            // TODO: more complex analysis
        });
    });
});
describe('Assignment', function() {
    let practiceId = {
        type: "id",
        text: "test",
        line: 1,
        column: 1
    };
    let practiceEquals = {
        type: "equals",
        text: "test",
        line: 1,
        column: 6
    };
    let practiceLit = new Literal({
        type: "intlit",
        text: 42,
        line: 1,
        column: 7
    });

    describe('constructor', function () {
        it('should construct', function () {
            let assign = new Assignment(practiceEquals, practiceId, practiceLit);
            assert.deepStrictEqual(assign.line, practiceEquals.line, "line");
            assert.deepStrictEqual(assign.lhs, practiceId, "lhs");
            assert.deepStrictEqual(assign.rhs, practiceLit, "rhs");
        });
    });
    describe('toString', function () {
        it('should make the string', function () {
            let assign = new Assignment(practiceEquals, practiceId, practiceLit);

            let expectedString = [
                "{",
                "   type: Assignment",
                "   lhs: test",
                "   rhs: 42",
                "}"
            ].join("\n");

            assert.deepStrictEqual(assign.toString(), expectedString, "defaults");

            expectedString = [
                "{",
                "      type: Assignment",
                "      lhs: test",
                "      rhs: 42",
                "   }"
            ].join("\n");
            assert.deepStrictEqual(assign.toString(3), expectedString, "indentation");
        });
    });
    describe('analyze', function () {
        it('should properly analyze', function () {
            let assign = new Assignment(practiceEquals, practiceId, practiceLit);

            let env = new Env()

            assign.analyze(env);

            // TODO: more complex analysis
        });
    });
});
describe('Block', function() {

    let practiceId = {
        type: "id",
        text: "test",
        line: 1,
        column: 1
    };
    let practiceEquals = {
        type: "equals",
        text: "test",
        line: 1,
        column: 6
    };
    let practiceLit = new Literal({
        type: "intlit",
        text: 42,
        line: 1,
        column: 7
    });

    let practiceAssign = new Assignment(practiceEquals, practiceId, practiceLit);

    let practiceReturn = {
        type: "return",
        line: 2,
        column: 1
    };
    let practiceLit2 = new Literal({
        type: "stringlit",
        text: "test",
        line: 2,
        column: 8
    });

    let practiceReturnStmt = new Return(practiceReturn, practiceLit2);

    describe('constructor', function () {
        it('should construct', function () {
            let block = new Block(practiceId, [practiceAssign, practiceReturnStmt]);
            assert.deepStrictEqual(block.line, practiceId.line, "line");
            assert.deepStrictEqual(block.statements[0], practiceAssign, "1st");
            assert.deepStrictEqual(block.statements[1], practiceReturnStmt, "2nd");
        });
    });
    describe('toString', function () {
        it('should make the string', function () {
            let block = new Block(practiceId, [practiceAssign, practiceLit, practiceReturnStmt]);

            let expectedString = [
                "[",
                "   {",
                "      type: Assignment",
                "      lhs: test",
                "      rhs: 42",
                "   }",
                "   42",
                "   {",
                "      type: Return",
                "      val: test",
                "   }",
                "]"
            ].join("\n");

            assert.deepStrictEqual(block.toString(), expectedString, "defaults");

            expectedString = [
                "[",
                "      {",
                "         type: Assignment",
                "         lhs: test",
                "         rhs: 42",
                "      }",
                "      42",
                "      {",
                "         type: Return",
                "         val: test",
                "      }",
                "   ]"
            ].join("\n");
            assert.deepStrictEqual(block.toString(3), expectedString, "indentation");
        });
    });
    describe('analyze', function () {
        it('should properly analyze', function () {
            let block = new Block(practiceId, [practiceAssign, practiceReturnStmt]);

            let env = new Env()

            block.analyze(env);

            // TODO: more complex analysis
        });
    });
});
describe('Arraylit', function() {

    let practiceOpenBracket = {
        type: "openSquare",
        line: 1,
        column: 1
    };

    let practiceLit = new Literal({
        type: "intlit",
        text: 42,
        line: 1,
        column: 2
    });

    let practiceLit2 = new Literal({
        type: "stringlit",
        text: "test",
        line: 2,
        column: 5
    });

    let practiceCloseSquare = {
        type: "closeSquare",
        line: 1,
        column: 11
    };

    describe('constructor', function () {
        it('should construct', function () {
            let arraylit = new ArrayLit(practiceOpenBracket, [practiceLit, practiceLit2]);
            assert.deepStrictEqual(arraylit.line, practiceOpenBracket.line, "line");
            assert.deepStrictEqual(arraylit.elems[0], practiceLit, "1st");
            assert.deepStrictEqual(arraylit.elems[1], practiceLit2, "2nd");
        });
    });
    describe('toString', function () {
        it('should make the string', function () {
            let arraylit = new ArrayLit(practiceOpenBracket, [practiceLit, practiceLit2]);

            let expectedString = [
                "[",
                "   42",
                "   test",
                "]"
            ].join("\n");

            assert.deepStrictEqual(arraylit.toString(), expectedString, "defaults");

            expectedString = [
                "[",
                "      42",
                "      test",
                "   ]"
            ].join("\n");
            assert.deepStrictEqual(arraylit.toString(3), expectedString, "indentation");
        });
    });
    describe('analyze', function () {
        it('should properly analyze', function () {
            let arraylit = new ArrayLit(practiceOpenBracket, [practiceLit, practiceLit2]);

            let env = new Env()

            arraylit.analyze(env);

            // TODO: more complex analysis
        });
    });
});
describe('ArrayAt', function() {

    let practiceId = new Token({
        type: "id",
        text: "test",
        line: 1,
        column: 1
    });
    let practiceOpenBracket = {
        type: "openSquare",
        line: 1,
        column: 6
    };
    let practiceLit = new Literal({
        type: "intlit",
        text: 42,
        line: 1,
        column: 7
    });
    let practiceCloseSquare = {
        type: "closeSquare",
        line: 1,
        column: 9
    };

    describe('constructor', function () {
        it('should construct', function () {
            let arrayAt = new ArrayAt(practiceOpenBracket, practiceId, practiceLit);
            assert.deepStrictEqual(arrayAt.line, practiceOpenBracket.line, "line");
            assert.deepStrictEqual(arrayAt.array, practiceId, "array");
            assert.deepStrictEqual(arrayAt.index, practiceLit, "index");
        });
    });
    describe('toString', function () {
        it('should make the string', function () {
            let arrayAt = new ArrayAt(practiceOpenBracket, practiceId, practiceLit);

            let expectedString = [
                "{",
                "   type: ArrayAt",
                "   array: {",
                "      type: Token",
                "      tokenType: id",
                "      text: test",
                "   }",
                "   index: 42",
                "}"
            ].join("\n");

            assert.deepStrictEqual(arrayAt.toString(), expectedString, "defaults");

            expectedString = [
                "{",
                "      type: ArrayAt",
                "      array: {",
                "         type: Token",
                "         tokenType: id",
                "         text: test",
                "      }",
                "      index: 42",
                "   }"
            ].join("\n");
            assert.deepStrictEqual(arrayAt.toString(3), expectedString, "indentation");
        });
    });
    describe('analyze', function () {
        it('should properly analyze', function () {
            let arrayAt = new ArrayAt(practiceOpenBracket, practiceId, practiceLit);

            let env = new Env(null);

            arrayAt.analyze(env);

            // TODO: more complex analysis
        });
    });
});