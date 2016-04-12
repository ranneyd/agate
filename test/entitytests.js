"use strict";


const Entity = require("../entities/entity");
const Env = require("../entities/env");

const ArrayAt = require("../entities/arrayAt");
const ArrayLit = require("../entities/arraylit");
const Assignment = require("../entities/assignment");
const Attr = require("../entities/attr");
const BinaryExp = require("../entities/binaryExp");
const Block = require("../entities/block");
const Call = require("../entities/call");
const Def = require("../entities/def");
const ElemFunc = require("../entities/elemFunc");
const Id = require("../entities/id");
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
describe('Id', function() {
    let practiceId = {
        type: "id",
        text: "test",
        line: 1,
        column: 2
    };
    describe('constructor', function () {
        it('should construct', function () {
            let id = new Id(practiceId);
            assert.deepStrictEqual(id.line, 1, "line");
            assert.deepStrictEqual(id.column, 2, "column");
            assert.deepStrictEqual(id.id, practiceId.text, "id");
        });
    });
    describe('toString', function () {
        it('should make the string', function () {
            let id = new Id(practiceId);
            let expectedString = [
                "@test"
            ].join("\n");
            assert.deepStrictEqual(id.toString(), expectedString, "defaults");
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
    let practiceValue = new Token({
        type: "intlit",
        text: 42,
        line: 1,
        column: 7
    });
    let practiceBracket = {
        type: "openSquare",
        line: 1,
        column: 1
    };
    let practiceKey = {
        type: "stringlit",
        text: "test",
        line: 1,
        column: 2
    };
    describe('constructor', function () {
        it('should construct', function () {
            let attr = new Attr(practiceBracket, "test", practiceValue);
            assert.deepStrictEqual(attr.key, "test", "key");
            assert.deepStrictEqual(attr.value, practiceValue, "value");

            attr = new Attr(practiceBracket, practiceKey, practiceValue);
            assert.deepStrictEqual(attr.key, "test", "key (alt)");
            assert.deepStrictEqual(attr.value, practiceValue, "value (alt)");
        });
    });
    describe('toString', function () {
        it('should make the string', function () {
            let attr = new Attr(practiceBracket, "test", practiceValue);

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
                "   value: {",
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
                "      value: {",
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
    let practiceId = new Id({
        type: "id",
        text: "test",
        line: 1,
        column: 1
    });
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
                "   lhs: @test",
                "   rhs: 42",
                "}"
            ].join("\n");

            assert.deepStrictEqual(assign.toString(), expectedString, "defaults");

            expectedString = [
                "{",
                "      type: Assignment",
                "      lhs: @test",
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
    let dummyToken = {
        type: "indent",
        line: 1,
        column:1
    };

    let practiceId = new Id({
        type: "id",
        text: "test",
        line: 1,
        column: 1
    });
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

            let emptyBlock = new Block(dummyToken, []);
            assert.deepStrictEqual(emptyBlock.line, dummyToken.line, "empty line");
            assert.deepStrictEqual(emptyBlock.statements, [], "empty statements");
        });
    });
    describe('toString', function () {
        it('should make the string', function () {
            let block = new Block(practiceId, [practiceAssign, practiceLit, practiceReturnStmt]);

            let expectedString = [
                "[",
                "   {",
                "      type: Assignment",
                "      lhs: @test",
                "      rhs: 42",
                "   }",
                "   42",
                "   {",
                "      type: Return",
                "      value: test",
                "   }",
                "]"
            ].join("\n");

            assert.deepStrictEqual(block.toString(), expectedString, "defaults");

            expectedString = [
                "[",
                "      {",
                "         type: Assignment",
                "         lhs: @test",
                "         rhs: 42",
                "      }",
                "      42",
                "      {",
                "         type: Return",
                "         value: test",
                "      }",
                "   ]"
            ].join("\n");
            assert.deepStrictEqual(block.toString(3), expectedString, "indentation");

            let emptyBlock = new Block(dummyToken, []);
            expectedString = [
                "[",
                "]"
            ].join("\n");
            assert.deepStrictEqual(emptyBlock.toString(), expectedString, "empty");

            expectedString = [
                "[",
                "   ]"
            ].join("\n");
            assert.deepStrictEqual(emptyBlock.toString(3), expectedString, "empty indented");
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

    let practiceId = new Id({
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
                "   array: @test",
                "   index: 42",
                "}"
            ].join("\n");

            assert.deepStrictEqual(arrayAt.toString(), expectedString, "defaults");

            expectedString = [
                "{",
                "      type: ArrayAt",
                "      array: @test",
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

describe('Binary Exp', function() {
    let practiceValue = new Literal({
        type: "intlit",
        text: 42,
        line: 1,
        column: 1
    });
    let practiceOp = {
        type: "minus",
        line: 1,
        column: 3
    };
    let practiceOp2 = {
        type: "plus",
        line: 1,
        column: 3
    };
    let practiceValue2 = new Literal({
        type: "intlit",
        text: 1024,
        line: 1,
        column: 4
    });
    describe('constructor', function () {
        it('should construct', function () {
            let exp = new BinaryExp(practiceOp, practiceValue, practiceValue2, practiceOp.type);
            assert.deepStrictEqual(exp.a, practiceValue, "a");
            assert.deepStrictEqual(exp.b, practiceValue2, "b");
            assert.deepStrictEqual(exp.op, "minus", "op1");

            exp = new BinaryExp(practiceOp, practiceValue, practiceValue2, practiceOp);
            assert.deepStrictEqual(exp.a, practiceValue, "a");
            assert.deepStrictEqual(exp.b, practiceValue2, "b");
            assert.deepStrictEqual(exp.op, "minus", "op1 (alt)");

            let exp2 = new BinaryExp(practiceOp2, practiceValue, practiceValue2, practiceOp2);
            assert.deepStrictEqual(exp2.op, "plus", "op2 (alt)");

            let exp3 = new BinaryExp(practiceOp, practiceValue, exp, practiceOp);
            assert.deepStrictEqual(exp3.a, practiceValue, "a composite");
            assert.deepStrictEqual(exp3.b, exp, "b composite");
        });
    });
    describe('toString', function () {
        it('should make the string', function () {

            let exp = new BinaryExp(practiceOp, practiceValue, practiceValue2, practiceOp.type);

            let expectedString = [
                "{",
                "   type: BinaryExp",
                "   a: 42",
                "   b: 1024",
                "   op: minus",
                "}"
            ].join("\n");

            assert.deepStrictEqual(exp.toString(), expectedString, "defaults");

            expectedString = [
                "{",
                "      type: BinaryExp",
                "      a: 42",
                "      b: 1024",
                "      op: minus",
                "   }"
            ].join("\n");
            assert.deepStrictEqual(exp.toString(3), expectedString, "indentation");


            let expAlt = new BinaryExp(practiceOp, practiceValue, exp, practiceOp);

            expectedString = [
                "{",
                "   type: BinaryExp",
                "   a: 42",
                "   b: {",
                "      type: BinaryExp",
                "      a: 42",
                "      b: 1024",
                "      op: minus",
                "   }",
                "   op: minus",
                "}"
            ].join("\n");

            assert.deepStrictEqual(expAlt.toString(), expectedString, "defaults (alt)");

            expectedString = [
                "{",
                "      type: BinaryExp",
                "      a: 42",
                "      b: {",
                "         type: BinaryExp",
                "         a: 42",
                "         b: 1024",
                "         op: minus",
                "      }",
                "      op: minus",
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

describe('Call', function() {
    let name = new Token({
        type: "bareword",
        text: "test",
        line: 1,
        column: 1
    });
    let openBracket = new Token({
        type: "openBracket",
        line: 1,
        column: 5
    });
    let lit1 = new Literal({
        type: "stringlit",
        text: "foo",
        line: 1,
        column: 1
    });
    let lit2 = new Literal({
        type: "stringlit",
        text: "bar",
        line: 1,
        column: 1
    });
    let lit3 = new Literal({
        type: "stringlit",
        text: "baz",
        line: 1,
        column: 1
    });
    let id = new Id({
        type: "id",
        text: "param",
        line: 1,
        column: 1
    });
    let attrs = [
        new Attr(openBracket, "fizz", lit1),
        new Attr(openBracket, "buzz", lit2)
    ];
    let args = [
        lit3,
        id
    ];
    describe('constructor', function () {
        it('should construct', function () {
            let call = new Call(name.token, name, attrs, args);
            assert.deepStrictEqual(call.name, name, "name");
            assert.deepStrictEqual(call.attrs.statements[1], attrs[1], "attrs");
            assert.deepStrictEqual(call.args.statements[1], id, "args");

            call = new Call(name.token, name, [], []);
            assert.deepStrictEqual(call.name, name, "name (alt)");
            assert.deepStrictEqual(call.attrs, undefined, "attrs (alt)");
            assert.deepStrictEqual(call.args, undefined, "args (alt)");
        });
    });
    describe('toString', function () {
        it('should make the string', function () {
            let call = new Call(name.token, name, attrs, args);

            let expectedString = [
                "{",
                "   type: Call",
                "   name: {",
                "      type: Token",
                "      tokenType: bareword",
                "      text: test",
                "   }",
                "   attrs: [",
                "      {",
                "         type: Attr",
                "         key: fizz",
                "         value: foo",
                "      }",
                "      {",
                "         type: Attr",
                "         key: buzz",
                "         value: bar",
                "      }",
                "   ]",
                "   args: [",
                "      baz",
                "      @param",
                "   ]",
                "}"
            ].join("\n");

            assert.deepStrictEqual(call.toString(), expectedString, "defaults");

            expectedString = [
                "{",
                "      type: Call",
                "      name: {",
                "         type: Token",
                "         tokenType: bareword",
                "         text: test",
                "      }",
                "      attrs: [",
                "         {",
                "            type: Attr",
                "            key: fizz",
                "            value: foo",
                "         }",
                "         {",
                "            type: Attr",
                "            key: buzz",
                "            value: bar",
                "         }",
                "      ]",
                "      args: [",
                "         baz",
                "         @param",
                "      ]",
                "   }"
            ].join("\n");
            assert.deepStrictEqual(call.toString(3), expectedString, "indentation");

            call = new Call(name.token, name, [], []);

            expectedString = [
                "{",
                "   type: Call",
                "   name: {",
                "      type: Token",
                "      tokenType: bareword",
                "      text: test",
                "   }",
                "}"
            ].join("\n");

            assert.deepStrictEqual(call.toString(), expectedString, "defaults (alt)");

            expectedString = [
                "{",
                "      type: Call",
                "      name: {",
                "         type: Token",
                "         tokenType: bareword",
                "         text: test",
                "      }",
                "   }"
            ].join("\n");

            assert.deepStrictEqual(call.toString(3), expectedString, "indentation (alt)");
        });
    });
    describe('analyze', function () {
        it('should properly analyze', function () {
            let call = new Call(name.token, name, attrs, args);

            let env = new Env()

            call.analyze(env);

            // TODO: more complex analysis
        });
    });
});
describe('Def', function() {
    let defToken = {
        type: "def",
        line: 1,
        column: 1
    };
    let name = new Token({
        type: "bareword",
        text: "test",
        line: 1,
        column: 1
    });
    let id1 = new Id({
        type: "id",
        text: "luke",
        line: 1,
        column: 1
    });
    let id2 = new Id({
        type: "id",
        text: "vader",
        line: 1,
        column: 1
    });
    let lit1 = new Literal({
        type: "stringlit",
        text: "foo",
        line: 1,
        column: 1
    });
    let lit2 = new Literal({
        type: "stringlit",
        text: "bar",
        line: 1,
        column: 1
    });
    let lit3 = new Literal({
        type: "stringlit",
        text: "baz",
        line: 1,
        column: 1
    });
    let returnToken = {
        type: "return",
        line: 1,
        column: 1
    };

    let args = [
        id1,
        id2
    ];

    let equals = {
        type:"equals",
        line:1,
        column:1
    };
    let plus = {
        type:"plus",
        line:1,
        column:1
    };
    let concat = new BinaryExp(plus, id2, lit1, plus);
    let assign = new Assignment(equals, id1, concat);
    let concat2 = new BinaryExp(plus, id1, lit2, plus);
    let returnStmt = new Return(returnToken, concat2);
    let body = new Block(id1, [assign, returnStmt]);

    let returnAlt = new Return(returnToken, lit3);
    let bodyAlt = new Block(returnToken, [returnAlt]);

    describe('constructor', function () {
        it('should construct', function () {
            let def = new Def(defToken, name, args, body);
            assert.deepStrictEqual(def.name, name, "name");
            assert.deepStrictEqual(def.args.statements[1], args[1], "args");
            assert.deepStrictEqual(def.body, body, "body");

            def = new Def(defToken, name, [], bodyAlt);
            assert.deepStrictEqual(def.name, name, "name (alt)");
            assert.deepStrictEqual(def.args, undefined, "args (alt)");
            assert.deepStrictEqual(def.body, bodyAlt, "body (alt)");
        });
    });
    describe('toString', function () {
        it('should make the string', function () {
            let def = new Def(defToken, name, args, body);

            let expectedString = [
                "{",
                "   type: Def",
                "   name: {",
                "      type: Token",
                "      tokenType: bareword",
                "      text: test",
                "   }",
                "   args: [",
                "      @luke",
                "      @vader",
                "   ]",
                "   body: [",
                "      {",
                "         type: Assignment",
                "         lhs: @luke",
                "         rhs: {",
                "            type: BinaryExp",
                "            a: @vader",
                "            b: foo",
                "            op: plus",
                "         }",
                "      }",
                "      {",
                "         type: Return",
                "         value: {",
                "            type: BinaryExp",
                "            a: @luke",
                "            b: bar",
                "            op: plus",
                "         }",
                "      }",
                "   ]",
                "}"
            ].join("\n");

            assert.deepStrictEqual(def.toString(), expectedString, "defaults");
            expectedString = [
                "{",
                "      type: Def",
                "      name: {",
                "         type: Token",
                "         tokenType: bareword",
                "         text: test",
                "      }",
                "      args: [",
                "         @luke",
                "         @vader",
                "      ]",
                "      body: [",
                "         {",
                "            type: Assignment",
                "            lhs: @luke",
                "            rhs: {",
                "               type: BinaryExp",
                "               a: @vader",
                "               b: foo",
                "               op: plus",
                "            }",
                "         }",
                "         {",
                "            type: Return",
                "            value: {",
                "               type: BinaryExp",
                "               a: @luke",
                "               b: bar",
                "               op: plus",
                "            }",
                "         }",
                "      ]",
                "   }"
            ].join("\n");

            assert.deepStrictEqual(def.toString(3), expectedString, "indentation");

            def = new Def(defToken, name, [], bodyAlt);
            expectedString = [
                "{",
                "      type: Def",
                "      name: {",
                "         type: Token",
                "         tokenType: bareword",
                "         text: test",
                "      }",
                "      body: [",
                "         {",
                "            type: Return",
                "            value: baz",
                "         }",
                "      ]",
                "   }"
            ].join("\n");

            assert.deepStrictEqual(def.toString(3), expectedString, "indentation (alt)");

        });
    });
    describe('analyze', function () {
        it('should properly analyze', function () {
            let def = new Def(defToken, name, args, body);

            let env = new Env()

            def.analyze(env);

            // TODO: more complex analysis
        });
    });
});

describe('ElemFunc', function() {
    let elem = new Id({
        type: "id",
        text: "test",
        line: 1,
        column: 1
    });
    let tilde = {
        type: "tilde",
        line: 1,
        column: 1
    };
    let func = new Token({
        type: "bareword",
        text: "foo",
        line: 1,
        column: 1
    });
    let lit = new Literal({
        type: "stringlit",
        text: "bar",
        line: 1,
        column: 1
    });
    let id = new Id({
        type: "id",
        text: "param",
        line: 1,
        column: 1
    });
    let args = [
        lit,
        id
    ];
    describe('constructor', function () {
        it('should construct', function () {
            let elemFunc = new ElemFunc(tilde, elem, func, args);
            assert.deepStrictEqual(elemFunc.elem, elem, "elem");
            assert.deepStrictEqual(elemFunc.func, func, "func");
            assert.deepStrictEqual(elemFunc.args.statements[1], id, "args");

            elemFunc = new ElemFunc(tilde, elem, func, []);
            assert.deepStrictEqual(elemFunc.elem, elem, "elem (alt)");
            assert.deepStrictEqual(elemFunc.func, func, "func (alt)");
            assert.deepStrictEqual(elemFunc.args, undefined, "args (alt)");
        });
    });
    describe('toString', function () {
        it('should make the string', function () {
            let elemFunc = new ElemFunc(tilde, elem, func, args);

            let expectedString = [
                "{",
                "   type: ElemFunc",
                "   elem: @test",
                "   func: {",
                "      type: Token",
                "      tokenType: bareword",
                "      text: foo",
                "   }",
                "   args: [",
                "      bar",
                "      @param",
                "   ]",
                "}"
            ].join("\n");

            assert.deepStrictEqual(elemFunc.toString(), expectedString, "defaults");

            expectedString = [
                "{",
                "      type: ElemFunc",
                "      elem: @test",
                "      func: {",
                "         type: Token",
                "         tokenType: bareword",
                "         text: foo",
                "      }",
                "      args: [",
                "         bar",
                "         @param",
                "      ]",
                "   }"
            ].join("\n");
            assert.deepStrictEqual(elemFunc.toString(3), expectedString, "indentation");

            elemFunc = new ElemFunc(tilde, elem, func, []);

            expectedString = [
                "{",
                "   type: ElemFunc",
                "   elem: @test",
                "   func: {",
                "      type: Token",
                "      tokenType: bareword",
                "      text: foo",
                "   }",
                "}"
            ].join("\n");

            assert.deepStrictEqual(elemFunc.toString(), expectedString, "defaults (alt)");

            expectedString = [
                "{",
                "      type: ElemFunc",
                "      elem: @test",
                "      func: {",
                "         type: Token",
                "         tokenType: bareword",
                "         text: foo",
                "      }",
                "   }"
            ].join("\n");
            assert.deepStrictEqual(elemFunc.toString(3), expectedString, "indentation (alt)");
        });
    });
    describe('analyze', function () {
        it('should properly analyze', function () {
            let elemFunc = new ElemFunc(tilde, elem, func, args);

            let env = new Env()

            elemFunc.analyze(env);

            // TODO: more complex analysis
        });
    });
});