'use strict';

// Entities
let HashMap = require("../entities/hashMap");

module.exports = ( p ) => {
    let parseAttrs = require("./attrs");

    p.matchLog(`Matching HashMap`);

    let bracket = p.match("openCurly");

    let attrs = parseAttrs( p );

    p.match("closeCurly");

    return new HashMap(bracket, attrs);
};