'use strict';

let Entity = require("./entity");
let Block = require("./block");

module.exports = class HashMap extends Block{
    constructor( token, attrs ) {
        // Should be array of Attrs
        super(token, attrs);
    }
    get attrs(){
        return this.statements;
    }
};