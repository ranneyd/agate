"use strict";

class Env{
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
        let newEnv = new Env();
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


    var globalEnv = new Env();

    var Block = (statements, env) => {
        log("Parsing Block");

        let localEnv = env.copy();

        let block = {};

        // // First we have to see if functions are declared
        // for(let i = 0; i < statements.length; ++i) {
        //     let statement = statements[i];

        //     if( statement.type === "definition" ) {
                
        //     }
        // }

        for(let i = 0; i < statements.length; ++i) {
            //If assignment, add to environment
            //else do this
            block.push(Statement(statements[i], localEnv));
        }
    };

    var Statement = (statement, env) => {
        log("Parsing Statement");

        let localEnv = env.copy();


    }


    return Block(parseTree.block, globalEnv());
};