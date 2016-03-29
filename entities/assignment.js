'use strict';

module.exports = class Assignment{
    constructor( id, val ) {
        this.type = "Assignment";
        this.id = id;
        this.val = val;
        this.safe = true;
    }
    analyze( env ) {
        val.parse( env );
        
        env.addVar(id, val);

        this.safe = this.safe && val.safe;
    }
};