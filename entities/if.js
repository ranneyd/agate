'use strict';

let Entity = require("./entity");
let Block = require("./block");

module.exports = class If extends Block{
    // Conditions is an array of objects, each with a "condition" and
    // "body". If the last one does not have a condition, it's the else case
    constructor( token, conditionals ) {
        super(token);
        this.conditionals = conditionals;
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [];

        for(let stmt of this.conditionals) {
            strArr.push("{");
            if(stmt.condition) {
                strArr.push(" ".repeat(indent) + `condition: ${stmt.condition.toString(indentLevel + indent * 2, indent)}`)
            }
            strArr.push(" ".repeat(indent) + `body: ${stmt.body.toString(indentLevel + indent * 2, indent)}`)
            strArr.push("}");
        }

        return this.toStringArray(indentLevel, indent, strArr).join("\n");
    }
    analyze( env ) {

    }
    generateJS(g){
        let first = this.conditionals[0];

        g.pushScripts("if(");

        let b = g.branch();
        first.condition.generateJS(b);
        b.wrapClosure();
        g.merge(b, ") {");
        g.pushScripts("AYY");
        g.pushScripts("}");

    }
};