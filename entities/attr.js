'use strict';

let Entity = require("./entity.js");

module.exports = class Attr extends Entity{
    constructor( token, key, value ) {
        super( token );
        // not entity
        if(key.text) {
            this.key = key.text;
        }
        else if(key.type) {
            this.key = key.type
        }
        else{
            this.key = key;
        }
        this.value = value; // entity
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [
            `key: ${this.key}`,
            `value: ${this.value.toString(indentLevel + indent, indent )}`
        ];
        return this.toStringArray(indentLevel, indent, strArr).join("\n"); 
    }
    analyze( env ) {     
        this.value.analyze( env );
        this.safe = this.safe && this.value.safe;
    }
};