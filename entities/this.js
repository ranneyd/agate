'use strict';

let Entity = require("./entity.js");

module.exports = class This extends Entity{
    constructor( token ) {
        super( token );
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        return "this";
    }
    analyze( env ) {
        this.val.analyze( env );
    }
};