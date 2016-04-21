"use strict";

module.exports = class Generator{
    constructor( error, verbose, parent) {
        this.error = error;
        this.verbose = verbose;
        this.INDENT = 4;
        this.counter = 0;
        this.html = [];
        this.scripts = [];
        this.functions = {};
        if(parent){
            this.counter = parent.counter;
            this.container = parent.container;
            // The deep copy lifestyle
            for(let key in parent.functions){
                this.functions[key] = parent.functions[key];
            }
        }
        else{
            this.container = "document.getElementsByTagName('html')[0]";
        }
    }
    log( message ) {
        if(this.verbose) {
            console.log(message);
        }
    }
    pushHTML( lines ){
        this.html = this.html.concat(lines);
        return this;
    }
    pushScripts( lines ){
        this.scripts = this.scripts.concat(lines);
        return this;
    }
    wrapClosure(){
        this.scripts = [
            `(function(){`,
            ...this.indent(this.scripts),
            `})()`
        ];
        return this;
    }
    scriptChop(amount){
        let end = this.scripts.length - 1;
        // I hate javascript
        this.scripts[end] = this.scripts[end].substring(0, this.scripts[end].length - amount);
        return this;
    }
    branch(){
        return new Generator(this.error, this.verbose, this);
    }
    merge( g, ending ){
        // Assume the last line of HTML was the close tag
        this.html.splice(-1, 0, ...this.indent(g.html));

        if(ending){
            // Whatever the last line was, add ending
            g.scripts[g.scripts.length - 1] += ending;
        }
        // Merge the beginning of the branch with the end of the last line
        this.scripts[this.scripts.length - 1] += g.scripts[0];

        // Add the rest of the lines to us
        this.scripts.concat(g.scripts.slice(1));

        this.counter = g.counter;
        return this;
    }
    join( g, ending){
        this.html = this.html.concat(g.html);
        this.scripts = this.scripts.concat(g.scripts);
        if(ending){
            this.scripts[this.scripts.length - 1] += ending;
        }
        this.counter = g.counter;
        return this;
    }
    indent(lines){
        lines = lines || [];

        return lines.map(str => " ".repeat(this.INDENT) + str);
    }

    isFunction(name){
        return !!this.functions[name];
    }
    addFunction(name){
        this.functions[name] = true;
        return this;
    }

    get builtInFunctions() {
        return {};
    }
    isBuiltInFunction(name){
        return !!this.builtInFunctions[name];
    }
};