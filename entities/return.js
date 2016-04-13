'use strict';

let Entity = require("./entity.js");

module.exports = class Return extends Entity{
    constructor( token, val ) {
        super( token );
        this.val = val;
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [
            `value: ${this.val.toString(indentLevel + indent)}`
        ];
        return this.toStringArray(indentLevel, indent, strArr).join("\n"); 
    }
    analyze( env ) {
        this.val.analyze( env );
    }
};