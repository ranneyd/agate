'use strict';

module.exports = class Iterable{
    constructor( exp ) {
        this.type = "Iterable";
        this.exp = exp;
        this.safe = true;
    }
    analyze( env ) {
        this.exp.parse( env );

        this.safe = this.safe && this.exp.safe;
    }
};