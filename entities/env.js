'use strict';

Error = require("../error.js");

module.exports = class Env {
    constructor(parent) {
        this.parent = parent;
        this.vars = {};
        this.functions = {};
        this.labels = {};
    }
    makeChild() {
        return new Env(this);
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
    lookup( type, token ) {
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

            if( !value ) {
                error.undefined( type, name, token );
                return false;
            }
        }
        return value;
    }
    existsVar( token ) {
        return exists( "var", token );
    }
    existsFunction( token ) {
        return exists( "function", token );
    }
    existsLabel( token ) {
        return exists( "label", token );
    }
    exists( type, token ) {
        let value = this.lookup( token );
        return !!value;
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