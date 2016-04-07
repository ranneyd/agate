'use strict';

module.exports = class ElemFunc{
    constructor( elem, func, args ) {
        this.type = "ElemFunc";
        this.elem = elem;
        this.func = func;
        this.args = args;
        this.safe = true;
    }
    toString(){
        let args = `[`;
        for(let arg of this.args){
            args += arg.toString() + ", ";
        }
        return `{`
            + `"type":"elemFunc", `
            + `"elem":${this.elem.toString()}, `
            + `"func":${this.func.toString()}, `
            + `"args":${args.slice(0,-2)}]`
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