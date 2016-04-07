'use strict';

module.exports = class HashMap{
    constructor( pairs ) {
        this.type = "HashMap";
        this.pairs = pairs;
        this.safe = true;
    }
    toString(){
        let pairs = "[";
        for(let pair of this.pairs){
            pairs += pair.toString() + ", ";
        }
        return `{`
            + `"type":"hashMap",`
            + `"pairs":${pairs.slice(0,-2)}]`
            + `}`;
    }
    analyze( env ) {
        for(let pair of this.pairs) {
            pair.value.parse( env );

            this.safe = this.safe && pair.value.safe;  
        }

    }
};