'use strict';

module.exports = class Selector{
    constructor( type, selector) {
        this.type = type;
        this.selector = selector;
        this.safe = true;
    }
    toString(){
        return `{`
            + `"type":"${this.type}", `
            + `"selector":${this.selector.toString()}`
            + `}`;
    }
    analyze( env ) {

    }
};