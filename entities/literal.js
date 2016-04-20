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
    generate(g, context, js) {
        // TODO: we need a better way to do this. We need a way for parents to look for literals and
        // deal with them appropriately
        if(js){
            return this.generateJS(g, context);
        }

        g.log(`Generating literal`);

        return {
            html: [this.text],
            scripts: []
        };
    }
    generateJS(g, context){
        g.log(`Generating literal (js mode)`);

        // TODO: " vs '?
        let lit =  [`${context.container}.appendChild(document.createTextNode("${this.text}"));`];
        return {
            html: lit,
            scripts: lit
        };
    }
};