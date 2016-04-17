'use strict';

// Entities
let ArrayAt = require("../entities/arrayAt");
let BinaryExp = require("../entities/binaryExp");
let ElemFunc = require("../entities/elemFunc");
let Id = require("../entities/id");
let If = require("../entities/if");
let Literal = require("../entities/literal");
let This = require("../entities/this");
let Token = require("../entities/token");
let UnaryExp = require("../entities/unaryExp");

let parseTernary = p => {
    let exp = parseBool( p );
    // TODO: this does not work
    if( p.at("question") ) {

        let qToken = p.match("question");

        let ifstmt = {
            condition: exp,
            body: parseBool( p )
        };

        p.match("colon");

        let elsestmt = {
            body: parseBool( p )
        };

        return new If( qToken, [ifstmt, elsestmt] );
    }

    return exp;
};

let parseBool = p => {
    let exp = parseRel( p );
    // While at a boolop, but not at an assignment of some kind
    while( p.at("boolop") && !p.atAhead("equals", 1) ) {
        let op = p.match("boolop");
        exp = new BinaryExp( op, exp, parseRel( p ), op );
    }
    return exp;
};

let parseRel = p => {
    let exp = parseAdd( p );
    // While at a relop, but not at an assignment of some kind
    while( p.at("relop") && !p.atAhead("equals", 1)) {
        let op = p.match("relop");
        exp =  new BinaryExp( op, exp, parseAdd( p ), op );
    }
    return exp;
};

let parseAdd = p => {
    let exp = parseMult( p );
    // While at a relop, but not at an assignment of some kind
    while( p.at(["plus", "minus"]) && !p.atAhead("equals", 1) ) {
        let op = (p.at("plus") ? p.match("plus") : p.match("minus"));
        exp =  new BinaryExp( op, exp, parseMult( p ), op );
    }
    return exp;
};

let parseMult = p => {
    let exp = parsePostfix( p );
    // While at a multop, but not at an assignment of some kind
    while( p.at("multop") && !p.atAhead("equals", 1) ) {
        let op = p.match("multop");
        exp =  new BinaryExp( op, exp, parsePostfix( p ), op );
    }
    return exp;
};

let parsePostfix = p => {
    let exp = parseElemFunc( p );
    // While at a boolop, but not at an assignment of some kind
    if( p.at("postfixop")) {
        let op = p.match("postfixop");
        return new UnaryExp( op, exp, op );
    }
    return exp;
}

let parseElemFunc = p => {
    let parseArgs = require("./args");

    let exp = parseArrayElem( p );

    while( p.at("tilde") ) {
        let tilde = p.match("tilde");

        let func = new Token( p.match("bareword") );

        let args = [];
        p.error.hint = "The ~ operator is for member functions only. Thus, if you don't put parens after, we're going to gobble up as many potential arguments as we can";

        if( p.atArgs() ){
            args = parseArgs( p );
        }
        p.error.hint = "";

        exp =  new ElemFunc(tilde, exp, func, args);
    }
    return exp;
};

let parseArrayElem = p => {
    let exp = parseMisc( p );

    while( p.at("openSquare") ) {
        let open = p.match("openSquare");
        let index;
        // barewords can be array keys
        if( p.atSequential(["bareword", "closeSquare"]) ) {
            index = new Token(p.match("bareword"));
        }
        else {
            index = parseExp( p );
        }
        exp = new ArrayAt(open, exp, index);

        p.match("closeSquare");
    }
    return exp;
};

let parseMisc = p => {
    let parseArray = require("./array");
    let parseHashMap = require("./hashmap");
    let parseSelector = require("./selector");
    let parseCall = require("./call");

    if( p.at(p.lits) ) {
        return parseLit( p );
    }
    else if( p.at("openSquare") ){
        return parseArray( p );
    }
    else if( p.at("openCurly") ) {
        return parseHashMap( p );
    }
    else if( p.at("id") ) {
        return new Id( p.match("id") );
    }
    else if( p.at("this") ) {
        return new This( p.match("this") );
    }
    else if( p.at(["dot", "hash"]) ) {
        return parseSelector( p );
    }
    else if( p.at("openParen") ) {
        p.match("openParen");
        let exp = parseExp( p );
        p.match("closeParen");
        return exp;
    }
    else if( p.at(["prefixop", "minus"]) ) {
        let op = (p.at("prefixop") ? p.match("prefixop") : p.match("minus"));
        return new UnaryExp( op, parseExp( p ), op );
    }
    else if( p.at(["bareword", ...p.builtins])){
        return parseCall( p );
    }
    else{
        p.error.expected( 'some kind of expression', p.pop() );
    }
};

let parseLit = p => {
    for( let lit of p.lits ) {
        if( p.at(lit) ) {
            if( p.at("stringlit") ) {
                return parseString( p );
            }
            else {
                return new Literal(p.match(lit));
            }
        }
    }
};

let parseString = p => {
    let str = new Literal(p.match("stringlit"));

    while( p.at("interpolate") ) {
        let interp = p.match("interpolate");
        // cheating. We want to keep the line/column but we want it to be the right op
        interp.type = "plus";

        let stringAndInter = new BinaryExp(interp, str, parseExp( p ), interp );
        interp = p.match("/interpolate");
        // more cheating
        interp.type = "plus";

        str = new BinaryExp(
            interp, // token
            stringAndInter, // a
            new Literal(p.match("stringlit")), // b
            interp // op
        );
    }
    return str;
};

let parseExp = p =>{
    let parseInclude = require("./include");
    let parseLabel = require("./label");

    if( p.at("include") ) {
        parseInclude( p );
    }
    if( p.atLabel() ) {
        parseLabel( p );
    }
    return parseTernary( p );
}

module.exports = ( p ) => {
    p.matchLog(`Matching Exp`);

    return parseExp( p );
};