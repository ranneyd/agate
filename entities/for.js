'use strict';

let Entity = require("./entity.js");

module.exports = class For extends Entity{
    constructor( token, id, iterable, body ) {
        super(token);
        this.id = id;
        this.iterable = iterable;
        this.body = body;
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [
            `id: ${this.id.toString(indentLevel + indent, indent)}`,
            `iterable: ${this.iterable.toString(indentLevel + indent, indent)}`,
            `body: ${this.body.toString(indentLevel + indent, indent)}`
        ];
        return this.toStringArray(indentLevel, indent, strArr).join("\n");
    }
    analyze( env ) {
    }
};