'use strict';

module.exports = class ArrayDef{
    constructor( elems ) {
        this.type = "Array";
        this.elems = elems;
        this.safe = true;
    }
    toString(){
        let str = "[";
        for(let elem of elems) {
            str += elem.toString() + ",";
        }
        return str + "]";
    }
    analyze( env ) {
        for(let elem of this.elems) {
            elem.parse( env );

            this.safe = this.safe && elem.safe;  
        }

    }
};