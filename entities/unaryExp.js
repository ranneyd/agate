'use strict';

module.exports = class UnaryExp{
    constructor( a, op ) {
        this.type = "UnaryExp";
        this.a = a;
        this.op = op;
        this.safe = true;
    }
    analyze( env ) {
        this.a.analyze( env );
        this.safe = this.safe && this.a.safe;
    }
};