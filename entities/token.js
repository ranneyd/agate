'use strict';

module.exports = class Token{
    constructor( token ) {
        this.type = token.type;
        this.text = token.text;
        this.line = token.line;
        this.column = token.column;
        this.safe = true;
    }
    // No analysis necessary
    analyze( env ) {

    }
};