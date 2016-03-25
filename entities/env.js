'use strict';

Error = require("../error.js");

module.exports = class Env {
    constructor(parent) {
        this.parent = parent;
        this.vars = {};
        this.functions = {};
        this.labels = {};
        // Safety is based on runtime vs compile-time values. 
        this.isSafe = true;
    }
    // Make an entire environment unsafe. You might want to do this inside the
    // success block of an ajax request. Once an entire environment is unsafe,
    // it cannot be made safe again.
    markUnsafe() {
        this.isSafe = false;
    }
    makeChild() {
        let env = new Env(this);
        env.isSafe = this.isSafe;
        return env;
    }
    lookupVar( token ) {
        return lookup( "var", token );
    }
    lookupFunction( token ) {
        return lookup( "function", token );
    }
    lookupLabel( token ) {
        return lookup( "label", token );
    }
    // Look up in one of the tables, designated by 'type'
    lookup( type, token, noError ) {
        let key = token.text;
        let value;
        if( type === "var" ) {
            value = this.vars[key];
        }
        else if( type === "functions" ) {
            value = this.functions[key];
        }
        else {
            value = this.labels[key];
        }


        if( !value ) {
            if( type === "var" ) {
                value = this.parent.lookupVar(key);
            }
            else if( type === "functions" ) {
                value = this.parent.lookupFunction(key);
            }
            else {
                value = this.parent.lookupLabel(key);
            }            

            if( !value && !noError) {
                error.undefined( type, name, token );
                return false;
            }
        }
        return value;
    }
    // These actually work with tokens or just key strings. Works with both for convenience
    existsVar( key ) {
        return exists( "var", key );
    }
    existsFunction( key ) {
        return exists( "function", key );
    }
    existsLabel( key ) {
        return exists( "label", key );
    }
    exists( type, key ) {
        let value = this.lookup( key.text ? key.text : key, true );
        return !!value;
    }
    // These actually work with tokens or just key strings. Works with both for convenience
    isSafeVar( key ) {
        return isSafe( "var", key );
    }
    isSafeFunction( key ) {
        return isSafe( "function", key );
    }
    isSafeLabel( key ) {
        return isSafe( "label", key );
    }
    isSafe( type, key ) {
        let value = this.lookup( key.text ? key.text : key, true );
        if( value ){
            // If we got a hit, check if it's safe, double banging to get a proper bool
            return !!value.safe
        }
        // If we didn't get a hit, it's definitely not safe
        return false;
    }
    addVar( key, value ) {
        return add( "var", key, value );
    }
    addFunction( key, value ) {
        return add( "function", key, value );
    }
    addLabel( key, value ) {
        return add( "label", key, value );
    }
    add( type, key, value ) {
        if( type === "var" ) {
            this.vars[key] = value;
        }
        else if( type === "functions" ) {
            this.functions[key] = value;
        }
        else {
            this.labels[key] = value;
        } 
        return this;
    }
};