'use strict';

module.exports = class If{
    // Conditions is an array of objects, each with a "conditional" and
    // "body". If the last one does not have a conditional, it's the else case
    constructor( conditions ) {
        this.type = "If";
        this.conditions = conditions;
        this.safe = true;
    }
    toString(){
        let str = `{type:"if",conditions:[`;
        for(let condition of this.conditions) {
            str += `{conditional:${condition.conditional}, body:${condition.body}},`;
        }

        return str + "]}";
    }
    analyze( env ) {
        let tempSafe = this.safe;  
        for( let i = 0; i < this.conditions.length - 1; ++i) {
            let ifstmt = this.conditions[i];

            let localEnv = env.makeChild();
            // If not the else case
            if( ifstmt.conditional ) {
                ifstmt.conditional.analyze( env );
                localEnv.safe = localEnv.safe && this.safe && ifstmt.conditional.safe;
                tempSafe = tempSafe && ifstmt.conditional.safe;
            }
            ifstmt.body.analyze( localEnv );
            tempSafe = tempSafe && ifstmt.body.safe;
        }
        this.safe = tempSafe;
    }
};