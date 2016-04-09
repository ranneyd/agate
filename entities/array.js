'use strict';

const Entity = require("./entity.js");

module.exports = class ArrayDef extends Entity{
    constructor( token, elems ) {
        super( token );
        this.elems = elems;
    }
    toString(indentLevel, indent){
        let strArr = [
            `elems: ${this.elems.toString(indentLevel, indent)}`
        ];
        return this.toStringArray(indentLevel, indent, strArr).join("\n");  
    }
    analyze( env ) {
        for(let elem of this.elems) {
            elem.parse( env );

            this.safe = this.safe && elem.safe;  
        }
    }
};