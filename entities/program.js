'use strict';

var Env = require('./env');

module.exports = class Program{
    constructor(block) {
        this.type = "Program";
        this.body = block;
        this.safe = true;
    }
    toString(){
        return this.body.toString();
    }
    analyze() {
        this.body.analyze( new Env() );
        this.safe = this.body.safe;
    }
    
};