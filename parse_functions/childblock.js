'use strict';

// Entities
let Block = require("../entities/block");


let parseJSBlock = p => {
    // TODO
};
let parseCSSBlock = p => {
    // TODO
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