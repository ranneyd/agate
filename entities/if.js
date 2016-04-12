'use strict';

const Entity = require("./entity");
const Block = require("./block");

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
        // let tempSafe = this.safe;  
        // for( let i = 0; i < this.conditions.length - 1; ++i) {
        //     let ifstmt = this.conditions[i];

        //     let localEnv = env.makeChild();
        //     // If not the else case
        //     if( ifstmt.conditional ) {
        //         ifstmt.conditional.analyze( env );
        //         localEnv.safe = localEnv.safe && this.safe && ifstmt.conditional.safe;
        //         tempSafe = tempSafe && ifstmt.conditional.safe;
        //     }
        //     ifstmt.body.analyze( localEnv );
        //     tempSafe = tempSafe && ifstmt.body.safe;
        // }
        // this.safe = tempSafe;
    }
};