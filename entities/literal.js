'use strict';

const Entity = require("./entity.js");

module.exports = class Literal extends Entity{
    constructor( token ) {
        super( token );
        this.litType = token.type;
        this.text = token.text;
        this.token = token;
    }
    toString(){
        return "" + this.text;
    }
    // No analysis necessary
    analyze( env ) {

    }
};