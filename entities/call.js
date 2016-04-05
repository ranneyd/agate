'use strict';

module.exports = class Call{
    constructor( name, attrs, args ) {
        this.type = "Call";
        this.name = name;
        this.attrs = attrs;
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

        for( let attr of this.attrs ) {
            attr.analyze( env );
            this.safe = this.safe && attr.safe;
        }

        for( let arg of this.args ) {
            arg.analyze( env );
            this.safe = this.safe && arg.safe;
        }
    }
};