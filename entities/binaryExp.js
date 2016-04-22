'use strict';

let Entity = require("./entity.js");

module.exports = class BinaryExp extends Entity{
    constructor( token, a, b, op ) {
        super(token);
        this.a = a;
        this.b = b;
        // NOT entity
        if(op.text) {
            this.op = op.text;
        }
        else if(op.type) {
            this.op = op.type
        }
        else{
            this.op = op;
        }
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [
            `a: ${this.a.toString(indentLevel + indent, indent)}`,
            `b: ${this.b.toString(indentLevel + indent, indent)}`,
            `op: ${this.op}`
        ];
        return this.toStringArray(indentLevel, indent, strArr).join("\n");
    }
    analyze( env ) {

    }
    generate(g){
        // TODO: parens? Probably parens
        this.a.generate(g);

        let b = g.branch();

        b.pushScripts(` ${this.realOp} `);

        g.merge(b);

        b = g.branch();

        this.b.generate(b);

        g.merge(b);
    }
    get realOp(){
        if(this.op === "plus"){
            return "+";
        }
        else if(this.op === "minus"){
            return "-";
        }
        else{
            return this.op;
        }
    }
};