'use strict';

let Entity = require("./entity.js");

module.exports = class Literal extends Entity{
    constructor( token ) {
        super( token );
        this.litType = token.type;
        this.text = token.text;
        this.token = token;
    }
    toString(indentLevel, indent){
        return "" + this.text;
    }
    // No analysis necessary
    analyze( env ) {

    }
    generateJS(g){
        let text = this.text;
        if(this.litType === "stringlit"){
            // TODO: " vs '?
            text = `"` + text + `"`;
        }
        g.pushScripts(text);
    }
};