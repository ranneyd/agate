'use strict';

module.exports = class Call{
    constructor( name, attrs, args ) {
        this.type = "call";
        this.name = name;
        if(attrs.length){
            this.attrs = attrs;
        }
        if(args){
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
                attrString += attr.toString() + ", "
            }
            attrString = attrString.slice(0, -2) + "], ";
            str += attrString;
        }
        if(this.args){
            str += `"args":${this.args.toString()}, `;
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