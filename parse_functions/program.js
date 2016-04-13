'use strict';

// Entities
let Program = require("../entities/program");

// Parse Functions
let parseBlock = require("./block");

module.exports = ( parser ) => {
    parser.matchLog(`Matching Program`);
    
    let body = parseBlock( parser );
    parser.match("EOF");

    return new Program( parser.next(), body );
};