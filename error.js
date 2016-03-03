'use strict';
module.exports = class Error {
    constructor() {
        this.count = 0;
    }
    generic(message, line, col) {
        this.count++;
        console.log(message);
        if(line){
            console.log(`at line ${line} and column ${col}`);
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