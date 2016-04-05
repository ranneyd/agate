'use strict';

module.exports = class Selector{
    constructor( type, selector) {
        this.type = type;
        this.selector = selector;
        this.safe = true;
    }
    analyze( env ) {

    }
};