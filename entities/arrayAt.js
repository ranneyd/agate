'use strict';

module.exports = class ArrayAt{
    constructor( array, index ) {
        this.type = "ArrayAt";
        this.array = array;
        this.index = index;
        this.safe = true;
    }
    toString(){
        return `{"type":"arrayAt", "array":${this.array.toString()}, "index":${this.index}}`;
    }
    analyze( env ) {
        this.array = env.lookupVar( this.array );
        this.safe = this.safe && this.array.safe;
        
        this.index.analyze( env );
        this.safe = this.safe && this.index.safe;
    }
};