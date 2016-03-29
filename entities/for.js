'use strict';

module.exports = class For{
    constructor( id, iterable, body ) {
        this.type = "For";
        this.id = id;
        this.iterable = iterable;
        this.body = body;
        this.safe = true;
    }
    analyze( env ) {
        iterable.parse( env );

        this.safe = this.safe && iterable.safe;

        localEnv = env.makeChild();
        localEnv.safe = this.safe;

        // Doing some hoisting since we don't have the value yet
        localEnv.addVar(id, null);

        body.parse( localEnv );
        
        this.safe = this.safe && iterable.safe && body.safe;
    }
};