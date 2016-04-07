'use strict';

module.exports = class Def{
    constructor( name, args, body ) {
        this.type = "Def";
        this.name = name;
        this.args = args;
        this.body = body;
        this.safe = true;
    }
    toString(){
        return `{`
            + `type:"def",`
            + `name:${this.name.toString()},`
            + `args:${this.args.toString()}}`
            + `body:${this.body.toString()}}`
            + `}`;
    }
    analyze( env ) {
        localEnv = env.makeChild();
        localEnv.safe = localEnv.safe && this.safe;

        for(let arg of this.args){
            // hoisting since these obviously don't have values yet
            localEnv.addVar( arg, null );
        }
        
        this.body.parse( localEnv );

        this.safe = this.safe && this.body.safe;
        env.addFunc( this.name, this );
    }
};