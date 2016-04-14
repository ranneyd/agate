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

// Parse Functions
let parseBlock = require("./block");
let parseArgs = require("./args");
let parseLabel = require("./label");
let parseInclude = require("./include");
let parseArray = require("./array");
let parseHashMap = require("./hashmap");
let parseSelector = require("./selector");
let parseCall = require("./call");


let parseTernary = p => {
    let exp = parseBool( p );
    
    if( p.at("question") ) {
        
        let qToken = match("question");

        let ifstmt = {
            condition: exp,
            body: parseBool( p )
        };

        match("colon");

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
    while( p.at("boolop") && !p.atSequential(["boolop", "equals"])) {
        let op = p.match("boolop");
        return new BinaryExp( op, exp, parseRel( p ), new Token( op ) );
    }
    return exp;
};

let parseRel = p => {
    let exp = parseMult( p );
    // While at a relop, but not at an assignment of some kind
    while( p.at("relop") && !p.atSequential(["relop", "equals"])) {
        let op = p.match("relop");
        return new BinaryExp( op, exp, parseMult( p ), new Token( op ) );
    }
    return exp;
};

let parseMult = p => {
    let exp = parsePostfix( p );
    // While at a multop, but not at an assignment of some kind
    while( p.at("multop") && !p.atSequential(["multop", "equals"])) {
        let op = p.match("multop");
        return new BinaryExp( op, exp, parsePostfix( p ), new Token( op ) );
    }
    return exp;
};

let parsePostfix = p => {
    let exp = parseElemFunc( p );
    // While at a boolop, but not at an assignment of some kind
    if( p.at("postfixop")) {
        let op = p.match("postfixop");
        return new UnaryExp( op, exp, new Token( op ) );
    }
    return exp;
}

let parseElemFunc = p => {
    let exp = parseArrayElem( p );

    while( p.at("tilde") ) {
        let tilde = p.match("tilde");

        let func = new Token( p.match("bareword") );

        let args;
        p.error.hint = "The ~ operator is for member functions only. Thus, if you don't put parens after, we're going to gobble up as many potential arguments as we can";

        if( p.atArgs() ){
            args = parseArgs( p );
        }
        p.error.hint = "";

        return new ElemFunc(tilde, exp, func, args);
    }
    return exp;
};

let parseArrayElem = p => {
    let exp = parseMisc();

    while( p.at("openSquare") ) {
        let open = p.match("openSquare");
        let index;
        // barewords can be array keys
        if( p.atSequential(["bareword", "closeSquare"]) ) {
            index = new Token(match("bareword"));
        }
        else {
            index = parseTernary( p );
        }
        exp = new ArrayAt(open, exp, index);

        p.match("closeSquare");
    }
    return exp;
};

let parseMisc = p => {
    if( p.at(p.lits) ) {
        return parseLit( p );
    }
    else if( p.atSequential(["openCurly", "bareword", "closeCurly"]) ) {
        return parseLabel( p );
    }
    else if( p.at("include") ) {
        return parseInclude( p );
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
        return new UnaryExp( op, parseExp( p ), new Token(op) );
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
                return parseString();
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

        let stringAndInter = new BinaryExp(interp, str, parseExp( p ), new Token(interp) );
        interp = p.match("/interpolate");
        // more cheating
        interp.type = "plus";

        str = new BinaryExp(
            interp, // token
            stringAndInter, // a
            new Literal(p.match("stringlit")), // b
            new Token(interp) // op
        );
    }
    return str;
};

module.exports = ( p ) => {
    p.matchLog(`Matching Exp`);
    
    return parseTernary( p );
};