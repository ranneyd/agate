'use strict';

Env = require('../env');

module.exports = class Program{
    constructor(block) {
        this.type = "Program";
        this.body = block;
        this.safe = true;
    }
    analyze() {
        this.body.analyze( new Env() );
        this.safe = this.body.safe;
    }
    
};