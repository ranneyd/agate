'use strict';

// Entities
let Assignment = require("../entities/assignment");
let Block = require("../entities/block");
let For = require("../entities/for");
let If = require("../entities/if");
let Return = require("../entities/return");
let Token = require("../entities/token");
let While = require("../entities/while");

// Parse Functions
let parseDef = require("./def");
let parseExp = require("./exp");
let parseChildBlock = require("./childBlock");

let parseStatement = p => {
    if( p.at("comment") ) {
        return new Token( p.match("comment") );
    }
    else if ( p.at('template') ) {
        // TODO
        //return template();
    }
    else if( p.at(p.controlTypes) ) {
        return parseControl();
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
                        p.parseExp(), // b
                        new Token(op) // op
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
                        p.parseExp(), // b
                        new Token(op) // op
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
                        p.parseExp(), // b
                        new Token(op) // op
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
        return parseIf();
    }
    else if( p.at("for") ) {
        return parseFor();
    }
    // while
    else{
        return parseWhile();
    }
}
let parseIf = p =>{
    let conditionals = [];

    let ifToken = p.match("if");

    conditionals.push({
        condition: parseExp(),
        body: parseChildBlock()
    });

    while( at("else-if") ) {
        match("else-if");

        conditionals.push({
            condition: parseExp(),
            body: parseChildBlock()
        });
    }

    if( at("else") ) {
        match("else");

        conditionals.push({
            body: parseChildBlock()
        });
    }
    return new If( ifToken, conditionals );
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

        let stmt = this.parseStatement( p );
        
        // They can put as many blank lines as they'd like, but that
        // doesn't mean we have to pay attention to them
        if(stmt !== "blank"){
            statements.push( stmt );
        }

        // child blocks are special cases. Since dedents come after the
        // newlines, the ChildBlock pattern needs to consume the newline.
        if(p.lastToken.type !== "dedent" && !p.at("EOF")){
            do{
                p.match("newline");
            } while( p.at("newline") );
        }
    }

    return new Block( token, statements );
};