'use strict';

// Entities
let Block = require("../entities/block");

// Parse Functions
let parseBlock = require("./block");

let parseJSBlock = p => {
    // TODO
};
let parseCSSBlock = p => {
    // TODO
};

module.exports = ( parser ) => {
    parser.matchLog(`Matching ChildBlock`);
    
    parser.match("newline");
    parser.match("indent");

    let token = parser.next();
    let block;

    if( parser.at("js") ){
        ourBlock = parseJSBlock();
    }
    else if( parser.at("css") ){
        ourBlock = parseCSSBlock();
    }
    else {
        ourBlock = parseBlock();
    }

    if( !at("EOF")){
        match("dedent");
    }
    return ourBlock;
};