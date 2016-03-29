'use strict';

module.exports = class While{
    constructor( exp, body ) {
        this.type = "While";
        this.exp = exp;
        this.body = body;
        this.safe = true;
    }
    analyze( env ) {
        exp.parse( env );

        this.safe = this.safe && exp.safe;

        localEnv = env.makeChild();
        localEnv.safe = this.safe;

        body.parse( localEnv );
        
        this.safe = this.safe && body.safe;
    }
};