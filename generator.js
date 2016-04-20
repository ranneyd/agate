"use strict";

let Context = require("./context");

module.exports = class Generator{
    constructor( program, error, verbose ) {
        this.program = program;
        this.error = error;
        this.verbose = verbose;
        this.inScript = false;
        this.INDENT = 4;
        this.counter = 0;
    }
    log( message ) {
        if(this.verbose) {
            console.log(message);
        }
    }

    // setScriptMode (isScriptMode){
    //     let lines = [];
    //     if(isScriptMode){
    //         // If we belong in a script tag, but we're not in one, we need to start one
    //         if(!this.inScript){
    //             // Note I'm not going to indent this tag at the same level, so I have to do it separately
    //             lines.push(`<script type='text/javascript'>`);
    //             lines.push(`'use strict';`);
    //             this.inScript = true;
    //         }
    //     }
    //     else{
    //         // Likewise, if this doesn't belong in a script tag, and we're in one, close it
    //         if(this.inScript){
    //             lines.push(`</script>`);
    //             this.inScript = false;
    //         }
    //     }
    //     return lines;
    // }
    // Takes an array of lines of code and fixes it in various ways

    indent(lines){
        lines = lines || [];

        return lines.map(str => " ".repeat(this.INDENT) + str);
    }
    get builtinFunctions() {
        return {};
    }
    init() {
        let context = new Context(null, this.error, "document.getElementsByTagName('html')[0]");
        return this.program.generate( this, context );
    }
};