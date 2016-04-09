'use strict';

const AgateError = require("../error.js");

module.exports = class Lookup{
    constructor( token ) {
        this.type = "Lookup";
        this.token = token;
        this.error = new AgateError();
        this.safe = true;
    }
    toString(){
        return `{`
            + `"type":"lookup",`
            + `"token":${this.token.toString()},`
            + `}`;
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