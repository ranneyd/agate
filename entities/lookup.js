'use strict';

Error = require("../error.js");

module.exports = class Lookup{
    constructor( token ) {
        this.type = "Lookup";
        this.token = token;
        this.error = new Error();
        this.safe = true;
    }
    analyze( env ) {
        if( env.existsVar( this.token ) ) {
            this.id = env.lookupVar( this.token );
            this.safe = this.safe && this.id.safe;
        }
        else {
            this.error.undefined( "id", this.token.text, this.token, true );
            this.id = null;
            this.safe = false;
        }
    }
};