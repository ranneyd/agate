'use strict';

Env = require('../env');

module.exports = class Program{
    constructor(block) {
        this.body = block;
    }
    analyze() {
        this.body.analyze( new Env() );
    }
    
};