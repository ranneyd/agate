'use strict';

const Entity = require("./entity.js");

module.exports = class Attr extends Entity{
    constructor( token, key, value ) {
        super( token );
        this.key = key;     // not entity
        this.value = value; // entity
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [
            `key: ${this.key}`,
            `value: ${this.value.toString(indentLevel + 3, indent )}`
        ];
        return this.toStringArray(indentLevel, indent, strArr).join("\n"); 
    }
    analyze( env ) {     
        this.value.analyze( env );
        this.safe = this.safe && this.value.safe;
    }
};