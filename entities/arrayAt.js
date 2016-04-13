'use strict';

let Entity = require("./entity.js");

module.exports = class ArrayAt extends Entity{
    constructor( token, array, index ) {
        super(token);
        this.array = array;
        this.index = index;
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;
        
        let strArr = [
            `array: ${this.array.toString(indentLevel + 3, indent)}`,
            `index: ${this.index.toString(indentLevel + 3, indent)}`
        ];
        return this.toStringArray(indentLevel, indent, strArr).join("\n"); 
    }
    analyze( env ) {
        // TODO: analyze?
        // this.array = env.lookupVar( this.array );
        // this.safe = this.safe && this.array.safe;
        
        // this.index.analyze( env );
        // this.safe = this.safe && this.index.safe;
    }
};