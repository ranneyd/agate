'use strict';

module.exports = class ElemFunc{
    constructor( elem, func, args ) {
        this.type = "ElemFunc";
        this.elem = elem;
        this.func = func;
        if(args){
            this.args = args;
        }
        this.safe = true;
    }
    toString(){
        return `{`
            + `"type":"elemFunc", `
            + `"elem":${this.elem.toString()}, `
            + `"func":${this.func.toString()}`
            + (this.args ? `, "args":${this.args.toString()}` : "")
            + `}`;
    }
    analyze( env ) {
        this.elem.analyze( env );
        this.safe = this.safe && this.elem.safe;
        
        for(let arg of this.args) {
            arg.analyze( env );
            this.safe = this.safe && arg.safe;
        }
    }
};