'use strict';

let Env = require('./env');
let Entity = require("./entity");
let Block = require("./block");

module.exports = class Program extends Entity{
    constructor(token, block) {
        super(token);
        this.body = block;
    }
    toString(indentLevel, indent){
        return this.body.toString(indentLevel, indent);
    }
    analyze() {
        // this.body.analyze( new Env() );
        // this.safe = this.body.safe;
    }
};