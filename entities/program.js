'use strict';

const Env = require('./env');
const Entity = require("./entity");
const Block = require("./block");

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
    static parse( parser ) {
        super( parser );
        let tree = Block.parse( parser );
        parser.match("EOF");
        return tree;
    }
};