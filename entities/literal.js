'use strict';

module.exports = class NonStringLit{
    constructor( type, token ) {
        this.type = type;
        this.token = token;
        this.safe = true;
    }
    // No analysis necessary
    analyze( env ) {

    }
};