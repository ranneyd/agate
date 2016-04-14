'use strict';

// Entities
let Selector = require("../entities/selector");


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