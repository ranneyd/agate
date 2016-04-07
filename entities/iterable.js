'use strict';

module.exports = class Iterable{
    constructor( exp ) {
        this.type = "Iterable";
        this.exp = exp;
        this.safe = true;
    }
    toString(){
        return this.exp.toString();
    }
    analyze( env ) {
        this.exp.parse( env );

        this.safe = this.safe && this.exp.safe;
    }
};