'use strict';

let Entity = require("./entity.js");

module.exports = class UnaryExp extends Entity{
    constructor( token, a, op ) {
        super(token);
        this.a = a;
        if(op.text) {
            this.op = op.text;
        }
        else if(op.type) {
            this.op = op.type
        }
        else{
            this.op = op;
        }
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [
            `a: ${this.a.toString(indentLevel + indent, indent)}`,
            `op: ${this.op}`
        ];
        return this.toStringArray(indentLevel, indent, strArr).join("\n");
    }
    analyze( env ) {
    }
};