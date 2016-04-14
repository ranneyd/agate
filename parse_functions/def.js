'use strict';

// Entities
let Def = require("../entities/def");
let Id = require("../entities/id");
let Token = require("../entities/token");


module.exports = ( p ) => {
    let parseChildBlock = require("./childblock");

    p.matchLog(`Matching Def`);
    
    let def = p.match("def");

    let name = new Token(p.match("bareword"));
    
    p.match("openParen");
    
    let params = [];
    while( p.at("id") ) {
        params.push( new Id( p.match("id") ) );
        if( p.at("comma") ) {
            p.match("comma");
        }
    }
    
    p.match("closeParen");

    return new Def( def, name, params, parseChildBlock( p ) );
};