'use strict';


module.exports = class BinaryExp{
    constructor( a, b, op ) {
        this.type = "BinaryExp";
        this.a = a;
        this.b = b;
        this.op = op;
        this.safe = true;
    }
    toString(){
        return `{ type:${this.op.toString()}, a:${this.a.toString()}, b:${this.b.toString()}}`;
    }
    analyze( env ) {
        this.a.analyze( env );
        this.b.analyze( env );
        this.safe = this.safe && this.a.safe && this.b.safe;
    }
};