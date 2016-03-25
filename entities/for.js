'use strict';

module.exports = class For{
    constructor( id, iterable, body ) {
        this.type = "For";
        this.id = id;
        this.iterable = iterable;
        this.body = body;
    }
    analyze( env ) {
        iterable.parse( env );
        // If this environment is unsafe, or the iterable is unsafe, we'll
        // just convert straight to js
        if( env.isSafe || iterable.isSafe ){

        }
        else{
            localEnv = env.makeChild();
            // If those didn't work, we certainly have something unsafe
            localEnv.markUnsafe();
        }

    }
};