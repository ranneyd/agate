'use strict';

const Entity = require("./entity");
const Call = require("./Call");

module.exports = class ElemFunc extends Call{
    constructor( token, elem, func, args ) {
        super(token, func, [], args);
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