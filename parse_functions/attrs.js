'use strict';

// Entities
let Attr = require("../entities/attr");
let Block = require("../entities/block");

let parseAttr = p => {
    let parseExp = require("./exp");

    let key;
    let value;
    p.error.hint = "Did you use a reserved word as an index, like 'if', or did you forget an @ symbol?";

    if(p.at("stringlit")) {
        let str = p.match("stringlit");
        // Is it an empty string?
        if(!str.text.length){
            p.error.parse("HashMap key can't be empty", str);
        }
        key = str.text;
    }
    // Built-ins can be attrs, sure
    else if( p.at(p.builtins)){
        key = p.pop().type;
    }
    else {
        key = p.match("bareword").text;
    }
    p.error.hint = "";
    let token;
    if(p.at("equals")) {
        token = p.match("equals");
    }
    else {
        token = p.match("colon");
    }
    value = parseExp( p );

    return new Attr(token, key, value);
};

// Returns array, not block object
module.exports = ( p ) => {
    // Circular dependency issues
    let parseAttr = require("./exp");
    let parseChildBlock = require("./childblock");

    p.matchLog(`Matching Attrs`);

    let attrStarts = ["stringlit", ...p.builtins, "bareword"];

    if( p.atBlock() ){
        // We expect only an array, not a block
        p.match("newline");
        p.match("indent");

        let attrs = [];

        while( !p.at("dedent") ) {
            attrs.push(parseAttr( p ));
            p.match("newline");
        }

        return attrs;
    }
    else if ( p.at(attrStarts) ){
        let attrs = [ parseAttr( p ) ];
        while( p.at(attrStarts) ) {
            attrs.push( parseAttr( p ) );
        }
        return attrs;
    }
    else{
        return [];
    }
};