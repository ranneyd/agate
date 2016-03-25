'use strict';

module.exports = class If{
    // Conditions is an array of objects, each with a "conditional" and
    // "body". If the last one does not have a conditional, it's the else case
    constructor( conditions ) {
        this.type = "If";
        this.conditions = conditions;
    }
    analyze( env ) {        
        // we're going to length -1 to skip the last one. It's inefficient to
        // check for an else with a conditional in every iteration
        let i = 0;
        for( ; i < this.conditions.length - 1; ++i) {
            let ifstmt = this.conditions[i];
            
            ifstmt.conditional.analyze( env );
            ifstmt.body.analyze( env );
        }
        let ifstmt = this.conditions[i];

        if( ifstmt.conditional ) {
            ifstmt.conditional.analyze( env );
        }
        ifstmt.body.analyze( env );
    }
};