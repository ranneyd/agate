'use strict';

Error = require("../error.js");

module.exports = class SpecialBlock{
    // Type should be "js" or "css"
    constructor(statements, type) {
        this.type = `${type.toUpperCase()} Block`;
        this.statements = statements;
        this.error = new Error();
        this.safe = true;
    }
    toString(){
        let str = `{"type":'${this.type}', "statements":[`;
        for(let stmt of statements){
            if(stmt.toString){
                str += stmt.toString() + ", ";
            }
            else{
                str += `'unanalyzed', `;
            }
        }
        return str.slice(0,-2) + "]}";
    }
    analyze( env ) {
        // We don't need a new environment because there are no assignments in
        // these blocks

        let stmts = [];
        let code = "";
        for( let i = 0; i < this.statements.length; ++i) {
            let stmt = this.statements[i];

            // If this is js/css, we can just string them together with newlines
            if( stmt.type === this.type ) {
                currentCode += `${stmt.text}\n`
            }
            // Otherwise, we have some kind of expression
            else{
                // Save the js/css we've been working on
                stmts.push(code);
                code = "";

                stmt.analyze( env );
                this.safe = this.safe && stmt.safe;
                stmts.push(stmt);
            }
        }
        if( code.length > 0 ) {
            stmts.push( code );
        }
        this.statements = stmts;        
    }
};