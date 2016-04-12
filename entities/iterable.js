'use strict';

const Entity = require("./entity.js");

module.exports = class Iterable extends Entity{
    constructor( token, exp ) {
        super(token);
        this.exp = exp;
    }
    toString(indentLevel, indent){
        return this.exp.toString(indentLevel, indent)
    }
    analyze( env ) {
        this.exp.analyze( env );
        this.safe = this.safe && this.exp.safe;
    }
};