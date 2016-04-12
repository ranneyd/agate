'use strict';

const Entity = require("./entity.js");

module.exports = class Label extends Entity{
    constructor( token ) {
        super(token);
        this.name = token.text;
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [
            `name: ${this.name.toString(indentLevel + indent, indent)}`,
        ];
        return this.toStringArray(indentLevel, indent, strArr).join("\n"); 
    }
    analyze( env ) {

    }
};