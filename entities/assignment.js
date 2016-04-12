'use strict';

const Entity = require("./entity.js");

module.exports = class Assignment extends Entity{
    constructor( token, lhs, rhs ) {
        super(token);
        this.lhs = lhs;
        this.rhs = rhs;
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [
            `lhs: ${this.lhs.toString(indentLevel + indent, indent)}`,
            `rhs: ${this.rhs.toString(indentLevel + indent, indent)}`
        ];
        return this.toStringArray(indentLevel, indent, strArr).join("\n"); 
    }
    analyze( env ) {
        this.rhs.analyze( env );
        
        env.addVar(this.lhs, this.rhs);

        this.safe = this.safe && this.rhs.safe;
    }
};