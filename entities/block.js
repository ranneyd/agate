'use strict';

let Entity = require("./entity");

module.exports = class Block extends Entity{
    constructor(token, statements) {
        super(token);
        this.statements = statements;
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [];
        for(let stmt of this.statements) {
            strArr.push(stmt.toString(indentLevel + indent, indent))
        }

        return this.toStringArray(indentLevel, indent, strArr).join("\n");
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
            ...attrs
        ];
        // Indent these attrs
        strArr = strArr.map(str => " ".repeat(indent) + str);
        // End bracket isn't indented
        strArr.push("]")
        // Open bracket should not have any indentation (often begins at end
        // of previous line). For the rest, add the indentLevel to the front
        return ["[", ...strArr.map(str => " ".repeat(indentLevel) + str) ];
    }
    analyze( env ) {
    }
    generateJS(g){

        // function defs first
        for(let stmt of this.statements){
            if(stmt.type === "Def"){
                g.addFunction(stmt.name.text);
            }
        }

        let lines = [];
        for(let stmt of this.statements){
            stmt.generateJS(g);
        }
    }
};