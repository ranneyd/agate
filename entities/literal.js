'use strict';

const Entity = require("./entity.js");

module.exports = class Literal extends Entity{
    constructor( token ) {
        super( token );
        this.litType = token.type;
        this.text = token.text;
        this.token = token;
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        return " ".repeat(indentLevel) + this.text;
    }
    // No analysis necessary
    analyze( env ) {

    }
};