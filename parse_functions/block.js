'use strict';

// Entities
let Assignment = require("../entities/assignment");
let BinaryExp = require("../entities/binaryExp");
let Block = require("../entities/block");
let For = require("../entities/for");
let Id = require("../entities/id");
let If = require("../entities/if");
let Iterable = require("../entities/iterable");
let Return = require("../entities/return");
let Token = require("../entities/token");
let While = require("../entities/while");


let parseStatement = p => {
    let parseExp = require("./exp");
    let parseDef = require("./def");
    let parseInclude = require("./include");
    let parseTemplate = require("./template");

    if( p.at("comment") ) {
        return new Token( p.match("comment") );
    }
    else if ( p.at('template') ) {
        return parseTemplate( p );
    }
    else if ( p.at('include') ) {
        return parseInclude( p );
    }
    else if( p.at(p.controlTypes) ) {
        return parseControl( p );
    }
    else if( p.at("def") ) {
        return parseDef( p );
    }
    else if( p.at("return") ) {
        return new Return( p.match("return"), parseExp( p ) );
    }
    else if( p.atExp() ){
        let exp = parseExp( p );
        // Checking for assignment
        if( p.at("equals") ){
            return new Assignment(p.match("equals"), exp, parseExp( p ));
        }
        // Looking for += etc, -=, *=, /=, %=,
        else if(p.atSequential([p.binAssignOps, "equals"])){
            // and= and or= (boolean ops are cool)
            if( p.at("boolop") ) {
                // Tokens for our objects
                let op = p.match("boolop");

                return new Assignment(
                    p.match("equals"), // token
                    exp,    // lhs
                    new BinaryExp( //rhs
                        op, // token
                        exp, // a
                        parseExp( p ), // b
                        op // op
                    )
                );
            }
            // *= and /=
            if( p.at("multop") ) {
                // Tokens for our objects
                let op = p.match("multop");

                return new Assignment(
                    p.match("equals"), // token
                    exp,    // lhs
                    new BinaryExp( //rhs
                        op, // token
                        exp, // a
                        parseExp( p ), // b
                        op // op
                    )
                );
            }
            // += and -=
            else {
                // Could have just been an error all along, so give them the hint
                p.error.hint = "You have 'id *something*= *stuff*' and we're trying to figure out"
                           + "what the *something* means. We're looking for stuff like +=, -= etc";
                let op = (p.at("minus") ? p.match("minus") : p.match("plus") );
                return new Assignment(
                    p.match("equals"), // token
                    exp,    // lhs
                    new BinaryExp( //rhs
                        op, // token
                        exp, // a
                        parseExp( p ), // b
                        op // op
                    )
                );
            }
        }
        // No assignment of any kind?
        else {
            return exp;
        }
    }
    else {
        p.error.hint = "Did you put a blank line without indentation?";
        p.error.expected("some kind of statement", p.pop());
        p.error.hint = "";
    }
}
let parseControl = p =>{
    if( p.at("if")) {
        return parseIf( p );
    }
    else if( p.at("for") ) {
        return parseFor( p );
    }
    // while
    else{
        return parseWhile( p );
    }
}
let parseIf = p =>{
    let parseExp = require("./exp");
    let parseChildBlock = require("./childBlock");

    let conditionals = [];

    let ifToken = p.match("if");

    conditionals.push({
        condition: parseExp( p ),
        body: parseChildBlock( p )
    });

    while( p.at("else-if") ) {
        p.match("else-if");

        conditionals.push({
            condition: parseExp( p ),
            body: parseChildBlock( p )
        });
    }

    if( p.at("else") ) {
        p.match("else");

        conditionals.push({
            body: parseChildBlock( p )
        });
    }
    return new If( ifToken, conditionals );
}
let parseFor = p =>{
    let parseExp = require("./exp");
    let parseChildBlock = require("./childBlock");


    let forToken = p.match('for');

    let id = new Id(p.match("id"));
    p.match("in");

    return new For(
        forToken, // token
        id, // id
        new Iterable(p.next, parseExp( p ) ), // iterable
        parseChildBlock( p ) //body
    );
}
let parseWhile = p =>{
    let parseExp = require("./exp");
    let parseChildBlock = require("./childBlock");

    let whileToken = p.match('while');

    let exp = parseExp( p );

    return new While(
        whileToken, // token
        exp, // exp
        parseChildBlock( p ) //body
    );
}
module.exports = ( p ) => {
    p.matchLog(`Matching Block`);

    // Save the first token
    let token = p.next;
    let statements = [];

    // If we get a dedent or an EOF, we have no more block
    while(!p.at("dedent") && !p.at("EOF")){
        while( p.at("newline") ) {
            p.match("newline");
        }

        let stmt = parseStatement( p );

        // Make sure the statement didn't come back with nothing
        if(stmt){
            statements.push( stmt );
        }
        else{
            // If it came back with nothing it's probably an include or template thing. So just
            // restart
            continue;
        }
        // Since a lot of things use block, and some of them are JSON related, we'll allow commas
        if(p.at("comma")) {
            p.match("comma");
        }
        // There should be at least one, or an EOF or a dedent
        while(p.at("newline")) {
            p.match("newline");
        }

        // If we're at the end of the file or a dedent, our work is done
        if(p.at("EOF") || p.at("dedent")){
            break;
        }
    }

    return new Block( token, statements );
};