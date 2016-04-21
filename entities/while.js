'use strict';

let Entity = require("./entity");

module.exports = class While extends Entity{
    constructor( token, exp, body ) {
        super(token);
        this.exp = exp;
        this.body = body;
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [
            `exp: ${this.exp.toString(indentLevel + indent, indent)}`,
            `body: ${this.body.toString(indentLevel + indent, indent)}`
        ];
        return this.toStringArray(indentLevel, indent, strArr).join("\n");
    }
    analyze( env ) {
    }
};