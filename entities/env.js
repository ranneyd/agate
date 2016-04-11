'use strict';

const AgateError = require("../error.js");

module.exports = class Env {
    constructor(parent) {
        this.parent = parent;
        this.vars = {};
        this.functions = {};
        this.labels = {};
        this.error = parent ? parent.error : new AgateError();
        // Safety is based on runtime vs compile-time values. 
        this.safe = true;
    }
    // Make an entire environment unsafe. You might want to do this inside the
    // success block of an ajax request. Once an entire environment is unsafe,
    // it cannot be made safe again.
    markUnsafe() {
        this.safe = false;
    }
    makeChild() {
        let env = new Env(this);
        env.safe = this.safe;
        return env;
    }
    lookupVar( token ) {
        return this.lookup( "var", token );
    }
    lookupFunction( token ) {
        return this.lookup( "function", token );
    }
    lookupLabel( token ) {
        return this.lookup( "label", token );
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
            if(this.parent){
                if( type === "var" ) {
                    value = this.parent.lookupVar(key);
                }
                else if( type === "functions" ) {
                    value = this.parent.lookupFunction(key);
                }
                else {
                    value = this.parent.lookupLabel(key);
                }   
            }
         
            if( !value && !noError) {
                this.error.undefined( type, key, token );
                return false;
            }
        }
        return value;
    }
    // These actually work with tokens or just key strings. Works with both for convenience
    existsVar( key ) {
        return this.exists( "var", key );
    }
    existsFunction( key ) {
        return this.exists( "function", key );
    }
    existsLabel( key ) {
        return this.exists( "label", key );
    }
    exists( type, key ) {
        let value = this.lookup( key.text ? key.text : key, true );
        return !!value;
    }
    // These actually work with tokens or just key strings. Works with both for convenience
    isSafeVar( key ) {
        return this.isSafe( "var", key );
    }
    isSafeFunction( key ) {
        return this.isSafe( "function", key );
    }
    isSafeLabel( key ) {
        return this.isSafe( "label", key );
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
        return this.add( "var", key, value );
    }
    addFunction( key, value ) {
        return this.add( "function", key, value );
    }
    addLabel( key, value ) {
        return this.add( "label", key, value );
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