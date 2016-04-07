'use strict';

module.exports = class This{
    constructor() {
        this.type = "This";
        this.safe = true;
    }
    toString(){
        return "'this'";
    }
    analyze( env ) {

    }
};