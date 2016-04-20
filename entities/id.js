'use strict';

let Entity = require("./entity.js");

module.exports = class Id extends Entity{
    constructor( token ) {
        super( token );
        this.id = token.text;
    }
    toString(indentLevel, indent){
        return "@" + this.id;
    }
    analyze( env ) {
        // TODO: probably something
    }
    generate(){
        return {
            html: [],
            scripts: ["at" + this.id]
        };
    }
};