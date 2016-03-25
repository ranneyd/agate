'use strict';

module.exports = class Token{
    constructor( token, safe ) {
        this.type = token.type;
        this.text = token.text;
        this.line = token.line;
        this.column = token.column;
        this.safe = safe;
    }
    // No analysis necessary
    analyze( ) {
        return true;
    }
};