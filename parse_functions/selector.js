'use strict';

// Entities
let Def = require("../entities/def");
let Id = require("../entities/id");
let Token = require("../entities/token");


module.exports = ( p ) => {

    p.matchLog(`Matching Selector`);

    if( p.at("dot") ){
        let token = p.match("dot");
        let word = p.match("bareword");
        // Because of the .
        word.column--;
        return new Selector(token, "class", word);
    }
    else {
        let token = p.match("hash");
        let word = p.match("bareword");
        // Because of the #
        word.column--;
        return new Selector(token, "HtmlId", word);
    }
};