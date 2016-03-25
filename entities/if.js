'use strict';

module.exports = class If{
    // Conditions is an array of objects, each with a "conditional" and
    // "body". If the last one does not have a conditional, it's the else case
    constructor( conditions ) {
        this.type = "If";
        this.conditions = conditions;
        this.safe = true;
    }
    analyze( env ) {        
        for( let i = 0; i < this.conditions.length - 1; ++i) {
            let ifstmt = this.conditions[i];

            let localEnv = env.makeChild();
            // If not the else case
            if( ifstmt.conditional ) {
                ifstmt.conditional.analyze( localEnv );
                if( !ifstmt.conditional.safe ) {
                    this.safe = false;
                    localEnv.markUnsafe();
                }
            }
            ifstmt.body.analyze( localEnv );

        }

    }
};