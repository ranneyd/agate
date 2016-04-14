'use strict';

// Entities
let Block = require("../entities/block");

// Returns array, not block object
module.exports = ( p ) => {
    // Circular dependency issues
    let parseExp = require("./exp");
    let parseChildBlock = require("./childblock");

    p.matchLog(`Matching Args`);

    if( p.at("openParen") ){
        let open = p.match("openParen");

        let args = [];
        // We have to do this one time first because commas
        if( !p.at("closeParen") ) {
            args.push( parseExp( p ) );
        }
        while( !p.at("closeParen") ) {
            // commas optional
            if( p.at("comma") ) {
                p.match("comma");
            }
            args.push( parseExp( p ) );
        }
        p.match("closeParen");
        return args;
    }
    else if( p.atBlock() ){
        // We expect only an array, not a block
        return parseChildBlock( p ).statements;
    }
    else if( p.atExp()){
        p.error.hint = "If you don't use parens or commas, we're going to try to gobble up as many expressions as we can as arguments.";
        let args = [ parseExp( p ) ];
        while( p.at("comma") || p.atExp() ) {
            if( p.at("comma") ) {
                p.match("comma");
            }
            args.push( parseExp( p ) );
        }
        p.error.hint = "";
        return args;
    }
    else{
        // No args
        return [];
    }
};