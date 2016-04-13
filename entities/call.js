'use strict';

let Entity = require("./entity");
let Block = require("./block");

module.exports = class Call extends Entity{
    constructor( token, name, attrs, args ) {
        super( token );
        this.name = name;
        if(attrs.length){
            this.attrs = new Block(token, attrs);
        }
        if(args.length){
            this.args = new Block(token, args);
        }
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [
            `name: ${this.name.toString(indentLevel + indent, indent)}`,
        ];
        if(this.attrs) {
            strArr.push(`attrs: ${this.attrs.toString(indentLevel + indent, indent)}`);
        }
        if(this.args) {
            strArr.push(`args: ${this.args.toString(indentLevel + indent, indent)}`);
        }
        return this.toStringArray(indentLevel, indent, strArr).join("\n"); 
    }
    analyze( env ) {
        // if( env.existsFunc( this.name ) ) {
        //     this.func = env.lookupFunc( this.name );
        //     this.safe = this.safe && this.func.safe;
        // }
        // else {
        //     this.safe = false;
        // }

        // for( let attr of this.attrs ) {
        //     attr.analyze( env );
        //     this.safe = this.safe && attr.safe;
        // }

        // for( let arg of this.args ) {
        //     arg.analyze( env );
        //     this.safe = this.safe && arg.safe;
        // }
    }
};