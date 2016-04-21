'use strict';

module.exports = class Entity{
    constructor( token ) {
        this.line = token.line;
        this.column = token.column;
        this.safe = true;
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;
        return this.toStringArray(indentLevel, indent).join("\n");
    }
    toStringArray(indentLevel, indent, attrs){
        // indentLevel = how many spaces whole block is indented by
        // indent = how many spaces we should indent with
        // attrs = additional attributes to spit out
        indentLevel = indentLevel || 0;
        indent = indent || 3;
        attrs = attrs || [];

        // Every entity should output its type. Optionally add more attrs to
        // this list
        let strArr = [
            `type: ${this.type}`,
            ...attrs
        ];
        // Indent these attrs
        strArr = strArr.map(str => " ".repeat(indent) + str);
        // End bracket isn't indented
        strArr.push("}")
        // Open bracket should not have any indentation (often begins at end
        // of previous line). For the rest, add the indentLevel to the front
        return ["{", ...strArr.map(str => " ".repeat(indentLevel) + str) ];
    }
    // No analysis necessary
    analyze( env ) {

    }
    get type() {
        return this.constructor.name;
    }

    generate(g){
        // TODO: optimization
        return this.generateJS(g);
    }
};