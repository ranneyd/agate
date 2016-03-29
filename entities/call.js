'use strict';

module.exports = class Call{
    constructor( name, args ) {
        this.type = "Call";
        this.name = name;
        this.args = args;
        this.safe = true;
    }
    analyze( env ) {
        if( env.existsFunc( this.name ) ) {
            this.func = env.lookupFunc( this.name );
            this.safe = this.safe && this.func.safe;
        }
        else {
            this.safe = false;
        }

        for( let arg in this.args ) {
            arg.analyze( env );
            this.safe = this.safe && arg.safe;
        }
    }
};