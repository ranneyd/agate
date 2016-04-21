'use strict';

let Entity = require("./entity");
let Block = require("./block");
let Token = require("./token");


module.exports = class Def extends Entity{
    constructor( token, name, args, body ) {
        super( token );
        // TODO: Make this name.text?
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
    generateJS(g){
        let signature = `let ${this.name.text}_func = function(`;

        for(let arg of this.args.statements){
            // We know these are just IDs
            signature += arg.id + "_id, ";
        }
        g.pushScripts(signature.slice(0, -2) + "){");

        let b = g.branch();

        this.body.generateJS(b);

        g.join(b);

        g.pushScripts("}");
    }
};