"use strict";

module.exports = class Generator{
    constructor( error, verbose, container) {
        this.error = error;
        this.verbose = verbose;
        this.INDENT = 4;
        this.counter = 0;
        this.html = [];
        this.scripts = [];
        this.container = container || "document.getElementsByTagName('html')[0]";
    }
    log( message ) {
        if(this.verbose) {
            console.log(message);
        }
    }
    pushHTML( lines ){
        this.html = this.html.concat(lines);
    }
    pushScript( lines ){
        this.scripts = this.scripts.concat(lines);
    }
    pushClosure( lines ){
        this.scripts = [
            ...this.scripts,
            `(function(){`,
            ...this.indent(lines),
            `})()`
        ]
    }
    branch(){
        return new Generator(this.error, this.verbose, this.container);
    }
    merge( g ){
        // Assume the last line of HTML was the close tag
        this.html.splice(-1, 0, this.indent(g.html));

        // Whatever the last line was, add a semicolon
        g.scripts[g.scripts.length - 1] += ";";
        // Merge the beginning of the branch with the end of the last line
        this.scripts[this.scripts.length - 1] += g.scripts[0];

        // Add the rest of the lines to us
        this.scripts.concat(g.split(1));
    }
    join( g ){
        this.html = this.html.concat(g.html);
        this.scripts = this.scripts.concat(g.scripts);
    }
    indent(lines){
        lines = lines || [];

        return lines.map(str => " ".repeat(this.INDENT) + str);
    }
    get builtinFunctions() {
        return {};
    }
};