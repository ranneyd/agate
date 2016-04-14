"use strict";

let parseProgram = require("./parse_functions/program.js");

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
            this.error.parse(`Expected ${type}, got end of program`, this.lastToken);
        }
        else if( type === undefined ||  type === this.next.type) {
            let msg = `Matched "${type}"`;
            if(this.next.text){
                msg += ` with text "${this.next.text}"`;
            }
            this.log( msg );

            this.log(`Tokens remaining: ${this.tokensLeft - 1}`);
            
            return this.pop();
        }
        else {
            this.error.expected(type, this.pop());
        }
    }
    // Returns true if the next token has type "type", or a type in "type" if
    // type is an array, false otherwise
    at( type ) {
        return this.atAhead( type, 0 );
    }
    atAhead ( type, i ) {
        if( this.empty ) {
            return false;
        }
        if(Array.isArray( type )) {
            for(let j = 0; j < type.length; ++j) {
                if( type[j] === this.get(this.index + i).type ) {
                    return true;
                }
            }
            return false;
        }
        return type === this.get(this.index + i).type;
    }
    atSequential( type ){
        for(let i = 0; i < type.length; ++i) {
            // If we don't have enough tokens or the token we're at doesn't
            // match, no sale. 
            if(this.tokensLeft <= i || !this.atAhead( type[i], i )) {
                return false;
            }
        }
        return true;
    }
    atBlock() {
        return this.atSequential(["newline", "indent"]);
    }
    atArgs() {
        return this.at("openParen") || this.atBlock() || this.atExp();
    }
    atExp() {
        return this.at([...this.lits,
                   "include",
                   "openSquare", 
                   "openCurly", 
                   "id", 
                   "this", 
                   "dot", 
                   "hash",
                   "openParen",
                   "prefixop",
                   "minus",
                   ...this.builtins,
                   "bareword"]);
    }
    get lits() {
        return ["stringlit", "intlit", "floatlit", "boollit"];
    }
    get builtins() {
        return ['script', 'style'];
    }
    get controlTypes() {
        return ['if', 'for', 'while'];
    }
    get binAssignOps() {
        return ["plus", "minus", "multop", "boolop"];
    }
    init() {
        return parseProgram( this );
    }
};