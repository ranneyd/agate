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
            this.hint = "";
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
        if(message === "newline" && token.type === "equals"
            || message === "colon" && token.type === "closeSquare") {
            this.hint = "Did you forget an @ symbol?";
        }
        if(message === "newline" && token.type === "dot") {
            this.hint = "Did you mean @var[attr] or @var~func instead of @var.attr?";
        }
        if(message === "Expected some kind of expression" 
            && ["colon", "equals"].indexOf(token.type) !== -1) {
            this.hint = "Did you use parens instead of square brackets for attributes, like a(href='place.html') instead of a[href='place.html']?"
        }
        return this.parse(`Expected ${message}, got ${token.type}`, token);
    }
}