'use strict';

module.exports = class Context {
    constructor(parent, error, container) {
        this.parent = parent;
        this.vars = {};
        this.functions = {};
        if(parent){
            this.error = parent.error;
            this.container = parent.container
        }
        if(error){
            this.error = error;
        }
        if(container){
            this.container = container;
        }
        // Safety is based on runtime vs compile-time values.
        this.safe = true;
    }
    makeChild() {
        let context = new Context(this);
        context.safe = this.safe;
        return context;
    }
    setFunction( name ){
        this.functions[name] = true;
    }
    isFunction(name){
        return (this.parent && this.parent.isFunction(name)) || this.functions[name];
    }
};