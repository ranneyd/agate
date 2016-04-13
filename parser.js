"use strict";

let Block = require("./entities/block");
let Program = require("./entities/program");

module.exports = class Parser{
    constructor( tokens, error, verbose ) {
        this.tokens = tokens;
        this.index = 0;
        this.error = error;
        this.verbose = verbose;
        this.lastToken = null;
    }
    get next() {
        return this.tokens[this.index];
    }
    get empty() {
        return this.tokens.length <= this.index;
    }
    get tokensLeft() {

        return this.tokens.length - this.index;
    }
    get( i ) {
        return this.tokens[i];
    }
    pop() {
        let popped = this.tokens[this.index++];
        this.lastToken = popped;
        return popped;
    }
    log( message ) {
        if(this.verbose) {
            console.log(message);
        }
    }
    matchLog( message ) {
        this.log(message + ` at line ${this.next.line} col ${this.next.column}`);
    }
    match( type ){
        if( this.empty ) {
            this.error.parse(`Expected ${type}, got end of program`);
        }
        else if( type === undefined ||  type === this.next.type) {
            let msg = `Matched "${type}"`;
            if(this.next.text){
                msg += ` with text "${this.next.text}"`;
            }
            this.log( msg );

            log(`Tokens remaining: ${this.tokensLeft - 1}`);
            
            return this.pop();
        }
        else {
            this.error.expected(type, this.pop());
        }
    }
    // Returns true if the next token has type "type", or a type in "type" if
    // type is an array, false otherwise
    at( type ) {
        return atIndex( type, 0 );
    }
    atIndex ( type, i ) {
        if( this.empty ) {
            return false;
        }
        if(Array.isArray( type )) {
            for(let j = 0; j < type.length; ++j) {
                if( type[j] === this.get(j).type ) {
                    return true;
                }
            }
            return false;
        }
        return type === this.get(i).type;
    }
    init() {
        return [];
    }
};