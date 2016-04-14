'use strict';

// Entities
let Program = require("../entities/program");


module.exports = ( parser ) => {
    // Parse Functions
    let parseBlock = require("./block");
    parser.matchLog(`Matching Program`);
    
    let first = parser.next;

    let body = parseBlock( parser );
    parser.match("EOF");

    return new Program( first, body );
};