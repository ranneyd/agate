'use strict';

// Entities
let Block = require("../entities/block");
let SpecialBlock = require("../entities/specialblock");


let parseJSBlock = p => {
    let parseExp = require("./exp");

    let token = p.next;

    let statements = [];
    if( p.atExp() ){
        statements.push( parseExp( p ) );
    }
    do {
        statements.push( p.match("js") );
        if( p.atExp() ){
            statements.push( parseExp( p ) );
        }
        // If they put newlines in their JS, more power to them
        while( p.at("newline") ){
            p.match("newline");
        }
    } while( p.at("js") );

    return new SpecialBlock( token, statements, "js" );
};
let parseCSSBlock = p => {
    let parseExp = require("./exp");

    let token = p.next;

    let statements = [];
    if( p.atExp() ){
        statements.push( parseExp( p ) );
    }
    do {
        statements.push( p.match("css") );
        if( p.atExp() ){
            statements.push( parseExp( p ) );
        }
        // If they put newlines in their CSS, more power to them
        while( p.at("newline") ){
            p.match("newline");
        }
    } while( p.at("css") );

    return new SpecialBlock( token, statements, "css" );
};

module.exports = ( p ) => {
    let parseBlock = require("./block");

    p.matchLog(`Matching ChildBlock`);

    p.match("newline");
    p.match("indent");

    let block;

    if( p.at("js") ){
        block = parseJSBlock( p );
    }
    else if( p.at("css") ){
        block = parseCSSBlock( p );
    }
    else {
        block = parseBlock( p );
    }

    if( !p.at("EOF")){
        p.match("dedent");
    }
    return block;
};