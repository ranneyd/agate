'use strict';

module.exports = class Attr{
    constructor( key, value ) {
        this.type = "Attr";
        this.key = key;
        this.value = value;
        this.safe = true;
    }
    analyze( env ) {     
        this.value.analyze( env );
        this.safe = this.safe && this.index.safe;
    }
};