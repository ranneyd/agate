'use strict';

module.exports = class While{
    constructor( exp, body ) {
        this.type = "While";
        this.exp = exp;
        this.body = body;
        this.safe = true;
    }
    toString(){
        return `{`
            + `type:"while",`
            + `exp:${this.exp.toString()},`
            + `body:${this.body.toString()}}`
            + `}`;
    }
    analyze( env ) {
        exp.parse( env );

        this.safe = this.safe && exp.safe;

        localEnv = env.makeChild();
        localEnv.safe = localEnv.safe && this.safe;

        this.body.parse( localEnv );
        
        this.safe = this.safe && body.safe;
    }
};