'use strict';

let Entity = require("./entity");
let Block = require("./block");
let Call = require("./call");

module.exports = class ElemFunc extends Call{
    constructor( token, elem, func, args ) {
        super(token, func, new Block( token, []), args);
        this.elem = elem;
    }
    get func(){
        return this.name;
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [
            `elem: ${this.elem.toString(indentLevel + indent, indent)}`,
            `func: ${this.func.toString(indentLevel + indent, indent)}`,
        ];
        if(this.args) {
            strArr.push(`args: ${this.args.toString(indentLevel + indent, indent)}`);
        }
        return this.toStringArray(indentLevel, indent, strArr).join("\n");
    }
};