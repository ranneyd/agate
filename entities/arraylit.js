'use strict';

const Block = require("./block.js");

module.exports = class ArrayLit extends Block{
    constructor( token, elems ) {
        super( token, elems );
    }
    get elems(){
        return this.statements;
    }
};