'use strict';

Error = require("../error.js");

module.exports = class Label{
    constructor( token ) {
        this.type = "Label";
        this.name = token.text;
        this.token = token;
        this.error = new Error();
        this.safe = true;
    }
    toString(){
        if(this.type === block) {
            let str = "[";
            for(let stmt of this.statements){
                str += stmt.toString() + ',';
            }
            return str + "]";
        }
        return `{`
            + `"type":"label",`
            + `"token":${this.token.toString()},`
            + `}`;
    }
    analyze( env ) {
        let label = env.lookupLabel( this.token );
        if( label ) {
            this.type = "block";
            this.statements = label.body.statements;
            this.safe = label.safe;
        }
        else {
            this.error.undefined( "label", this.name, this.token, true );
            this.type = "comment";
            this.text = `//! Label ${this.name} undefined`;
        }
    }
};