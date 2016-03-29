'use strict';

module.exports = class Return{
    constructor( val ) {
        this.type = "Return";
        this.val = val;
        this.safe = true;
    }
    analyze( env ) {
        this.val.analyze( env );
    }
};