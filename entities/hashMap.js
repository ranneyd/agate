'use strict';

module.exports = class HashMap{
    constructor( pairs ) {
        this.type = "HashMap";
        this.pairs = pairs;
        this.safe = true;
    }
    analyze( env ) {
        for(let pair of this.pairs) {
            pair.value.parse( env );

            this.safe = this.safe && pair.value.safe;  
        }

    }
};