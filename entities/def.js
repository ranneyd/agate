'use strict';

let Entity = require("./entity");
let Block = require("./block");

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
        // let localEnv = env.makeChild();
        // localEnv.safe = localEnv.safe && this.safe;

        // for(let arg of this.args){
        //     // hoisting since these obviously don't have values yet
        //     localEnv.addVar( arg, null );
        // }
        
        // this.body.parse( localEnv );

        // this.safe = this.safe && this.body.safe;
        // env.addFunc( this.name, this );
    }
};