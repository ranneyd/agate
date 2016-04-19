'use strict';

let Entity = require("./entity.js");

module.exports = class Token extends Entity{
    constructor( token ) {
        super( token );
        this.token = token;
        this.text = token.text;
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [
            `tokenType: ${this.token.type}`
        ];
        // Not all tokens have text
        if( this.token.text ){
            strArr.push(`text: ${this.token.text}`);
        }
        return this.toStringArray(indentLevel, indent, strArr).join("\n");
    }
    // No analysis necessary
    analyze( env ) {

    }
    generate(){
        return this.text;
    }
};