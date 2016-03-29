'use strict';

module.exports = class Array{
    constructor( elems ) {
        this.type = "Array";
        this.elems = elems;
        this.safe = true;
    }
    analyze( env ) {
        for(let elem of this.elems) {
            elem.parse( env );

            this.safe = this.safe && elem.safe;  
        }

    }
};