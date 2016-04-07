'use strict';

module.exports = class Attr{
    constructor( key, value ) {
        this.type = "Attr";
        this.key = key;
        this.value = value;
        this.safe = true;
    }
    toString(){
        return `{ type:"attr", key:${this.key.toString()}, value:${this.value.toString()}}`;
    }
    analyze( env ) {     
        this.value.analyze( env );
        this.safe = this.safe && this.index.safe;
    }
};