'use strict';

module.exports = class Call{
    constructor( name, attrs, args ) {
        this.type = "call";
        this.name = name;
        if(attrs.length){
            this.attrs = attrs;
        }
        if(args.length){
            this.args = args;
        }
        this.safe = true;
    }
    toString(){
        let str =  `{`
            + `"type":"call", `
            + `"name":${this.name.toString()}, `;
        if(this.attrs){
            let attrString = '"attrs":[';
            for(let attr of this.attrs){
                attrString = attrString.slice(0, -2) + attr.toString() + ", "
            }
            attrString = attrString.slice(0, -2) + "], ";
            str += attrString;
        }
        if(this.args){
            let argString = '"args":[';
            for(let arg of this.args){
                argString += arg.toString() + ", "
            }
            argString = argString.slice(0, -2) + "], ";
            str += argString;
        }
        return str.slice(0, -2) + "}";
    }
    analyze( env ) {
        if( env.existsFunc( this.name ) ) {
            this.func = env.lookupFunc( this.name );
            this.safe = this.safe && this.func.safe;
        }
        else {
            this.safe = false;
        }

        for( let attr of this.attrs ) {
            attr.analyze( env );
            this.safe = this.safe && attr.safe;
        }

        for( let arg of this.args ) {
            arg.analyze( env );
            this.safe = this.safe && arg.safe;
        }
    }
};