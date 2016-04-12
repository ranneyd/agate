'use strict';

const Entity = require("./entity");
const Block = require("./block");

module.exports = class HashMap extends Block{
    constructor( token, pairs ) {
        // Should be array of Attrs
        super(token, pairs);
    }
    get pairs(){
        return this.statements;
    }
};