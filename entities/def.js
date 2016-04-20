'use strict';

let Entity = require("./entity");
let Block = require("./block");
let Token = require("./token");


module.exports = class Def extends Entity{
    constructor( token, name, args, body ) {
        super( token );
        this.name = name;
        if(args.length){
            this.args = new Block(token, args);
        }
        this.body = body;
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [
            `name: ${this.name.toString(indentLevel + indent, indent)}`,
        ];
        if(this.args) {
            strArr.push(`args: ${this.args.toString(indentLevel + indent, indent)}`);
        }
        strArr.push(`body: ${this.body.toString(indentLevel + indent, indent)}`)
        return this.toStringArray(indentLevel, indent, strArr).join("\n");
    }
    analyze( env ) {

    }

    generate(g, context, js){
        g.log(`Generating Def`);

        let name = this.name.text;
        let lines = [];
        let args = [];

        for(let arg of this.args.statements) {
            args.push("at" + arg.id);
        }



        return {
            html: [],
            scripts: [
                `let func${name} = function(${args.join(", ")}){`,
                ...g.indent(this.body.generate(g, context, true).scripts),
                `}`
            ]
        };
    }
};