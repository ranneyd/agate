'use strict';

module.exports = class Block{
    constructor(statements) {
        this.type = "Block";
        this.statements = statements;
    }
    analyze( env ) {
        localEnv = env.makeChild();
        
        for( let i = 0; i < this.statements.length; ++i) {
            this.statements[i].analyze( localEnv );
        }
    }
};