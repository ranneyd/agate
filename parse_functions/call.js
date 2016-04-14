'use strict';

// Entities
let ArrayLit = require("../entities/arraylit");
let Attr = require("../entities/attr");
let Call = require("../entities/call");
let Token = require("../entities/token");


module.exports = ( p ) => {
    let parseSelector = require("./selector");
    let parseAttrs = require("./attrs");
    let parseArgs = require("./args");

    p.matchLog(`Matching Call`);
    
    let token;
    let name;
    let attrs = [];
    let args;

    if( p.at(p.builtins) ){
        token =  p.match(p.builtins);
    }
    else{
        token = p.match("bareword");
    }

    name = new Token( token );

    let classes = [];
    let dotToken;
    if( p.at("dot") ) {
        dotToken = p.next;
    }
    while( p.at("dot") ){
        classes.push( parseSelector( p ));
    }
    if(classes.length > 0){
        // ArrayLit is a convenient list entity
        attrs.push( new Attr( dotToken, "class", new ArrayLit( dotToken, classes ) ) );
    }

    if( p.at("hash") ) {
        let hashToken = p.next;
        attrs.push( new Attr( hashToken, "id", parseSelector( p ) ) );
    }

    if( p.at("openSquare") ) {
        attrs = attrs.concat( parseAttrs( p ) );
    }
    if( p.atArgs() ){
        args = parseArgs( p );
    }
    return new Call(token, name, attrs, args);
};