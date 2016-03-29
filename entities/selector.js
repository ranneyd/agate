'use strict';

module.exports = class Selector{
    constructor( type, selector) {
        this.type = "Selector";
        this.selector = selector;
        this.safe = true;
    }
    analyze( env ) {

    }
};