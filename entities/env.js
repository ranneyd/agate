'use strict';

Error = require("../error.js");

module.exports = class Env {
    constructor(parent) {
        this.parent = parent;
        this.env = {};
    }
    makeChild() {
        return new Env(this);
    }
    lookup( token ) {
        let key = token.text;
        let value = this.env[key];
        if( !value ) {
            value = this.parent.lookup( key );
            if( !value ) {
                error.undefined( "key", token );
                return false;
            }
        }
        return value;
    }
    exists( token ) {
        let value = this.lookup( token );
        return !!value;
    }
    add( key, value ) {
        this.env[key] = value;
        return this;
    }
};