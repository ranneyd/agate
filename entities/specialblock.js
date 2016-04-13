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
        // // We don't need a new environment because there are no assignments in
        // // these blocks

        // let stmts = [];
        // let code = "";
        // for( let i = 0; i < this.statements.length; ++i) {
        //     let stmt = this.statements[i];

        //     // If this is js/css, we can just string them together with newlines
        //     if( stmt.type === this.type ) {
        //         currentCode += `${stmt.text}\n`
        //     }
        //     // Otherwise, we have some kind of expression
        //     else{
        //         // Save the js/css we've been working on
        //         stmts.push(code);
        //         code = "";

        //         stmt.analyze( env );
        //         this.safe = this.safe && stmt.safe;
        //         stmts.push(stmt);
        //     }
        // }
        // if( code.length > 0 ) {
        //     stmts.push( code );
        // }
        // this.statements = stmts;        
    }
};