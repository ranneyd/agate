'use strict';

const Entity = require("./entity.js");

module.exports = class Selector extends Entity{
    constructor( token, type, selector ) {
        super(token);
        this.selectorType = type; // just a string
        // also just a string or token
        if(selector.text){ 
            this.selector = selector.text;
        }
        else{
            this.selector = selector; 
        }
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [
            `selectorType: ${this.selectorType}`,
            `selector: ${this.selector}`,
        ];
        return this.toStringArray(indentLevel, indent, strArr).join("\n"); 
    }
    analyze( env ) {

    }
};