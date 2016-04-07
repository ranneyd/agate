'use strict';

module.exports = class Return{
    constructor( val ) {
        this.type = "Return";
        this.val = val;
        this.safe = true;
    }
    toString(){
        return `{`
            + `"type":"return", `
            + `"val":${this.val.toString()}`
            + `}`;
    }
    analyze( env ) {
        this.val.analyze( env );
    }
};