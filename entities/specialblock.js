'use strict';

let Block = require("./block");

module.exports = class SpecialBlock extends Block{
    // Type should be "js" or "css"
    constructor(token, statements, type) {
        super(token, statements);
        this.specialType = type;
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [];

        for(let stmt of this.statements) {
            if(stmt.type === this.specialType){
                strArr.push(stmt.text);
            }
            else{
                strArr.push(stmt.toString(indentLevel + indent, indent));
            }
        }
        return this.toStringArray(indentLevel, indent, strArr).join("\n");
    }
    analyze( env ) {
    }
};