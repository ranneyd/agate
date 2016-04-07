'use strict';

module.exports = class Literal{
    constructor( type, token ) {
        this.type = type;
        this.text = `"${token.text}"`;
        this.token = token;
        this.safe = true;
    }
    toString(){
        return this.text;
    }
    // No analysis necessary
    analyze( env ) {

    }
};