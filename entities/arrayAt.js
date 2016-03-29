'use strict';

module.exports = class ArrayAt{
    constructor( array, index ) {
        this.type = "ArrayAt";
        this.array = array;
        this.index = index;
        this.safe = true;
    }
    analyze( env ) {
        let array = env.lookupVar( this.array );
        this.safe = this.safe && array.safe;
        
        index.analyze( env );
        this.safe = this.safe && this.index.safe;
    }
};