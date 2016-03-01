'use strict';
export class Error{
    constructor() {
        this.count = 0;
    }
    generic(message, line, col) {
        error.count++;
        console.log(message);
        if(line){
            console.log('at line ${line} and column ${col}');
        }
        return {
            status: "error",
            line: line,
            column: col,
            message: message
        };
    }
    scanner(message, line, col) {
        return generic('Scanner error: ${message}', line, col);
    }
    parse(message, token) {
        return generic('Parse Error: ${message}', token.line, token.column);
    }
    expected(message, token) {
        return parse('Expected ${message}, got ${token.type}', token);
    }
}