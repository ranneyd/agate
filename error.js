'use strict';
module.exports = class Error {
    constructor() {
        this.count = 0;
        this.log = true;
        this.hint = "";
    }
    // Stops logging errors. Still counts
    suspend() {
        this.log = false;
    }
    // Resumes logging errors
    resume() {
        this.log = true;
    }
    generic(message, line, col) {
        this.count++;
        if(this.log){
            console.log(message);
        }
        if(line && this.log){
            console.log(`\tat line ${line} and column ${col}`);
        }
        if(this.hint) {
            console.log(`Hint: ${this.hint}`);
        }
        return {
            status: "error",
            line: line,
            column: col,
            message: message
        };
    }
    scanner(message, line, col) {
        return this.generic(`Scanner error: ${message}`, line, col);
    }
    parse(message, token) {
        return this.generic(`Parse Error: ${message}`, token.line, token.column);
    }
    expected(message, token) {
        return this.parse(`Expected ${message}, got ${token.type}`, token);
    }
}