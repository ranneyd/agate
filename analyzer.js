"use strict";

class Namespace{
    constructor(){
        this.env = {};
    }
    add(key, value){
        this.env[key] = value;
    }
    lookup(key){
        return this.env[key];
    }
    copy(){
        let newEnv = new Namespace();
        for(let key in this.env){
            newEnv[key] = this.env[key];
        }
        return newEnv();
    }
    // If there are conflicts, go with otherEnv 
    joinAndCopy(otherEnv) {
        let newEnv = this.copy();
        for(let key in otherEnv){
            newEnv[key] = otherEnv[key];
        }
        return newEnv;
    }
}


module.exports = (parseTree, error, verbose) => {
    
    var log = (message) => {
        if(verbose) {
            console.log(message);
        }
    };


    var globalEnv = new Namespace();

    var Block = (statements, env) => {
        log("Parsing Block");

        let localEnv = env.copy();

        let output = "";

        for(let i = 0; i < statements.length; ++i) {
            let statement = statements[i];

            if( statement.type === "call" ) {
                output += Call(statement, localEnv);
            }
        }
    };

    var Call = (call, env) => {
        log("Parsing Call");

        let localEnv = env.copy();

        let output = "";

        
        
    }

    return `<html>\n${Block(parseTree.block, {})}</html>`
};