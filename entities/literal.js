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
    generate(g, context) {
        g.log(`Generating literal`);

        return this.text;
    }
    generateJS(g, context){
        g.log(`Generating literal (js mode)`);

        // TODO: " vs '?
        return [`${context.container}.appendChild(document.createTextNode("${this.text}"));`];
    }
};