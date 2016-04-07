'use strict';

module.exports = class Block{
    constructor(statements) {
        this.type = "Block";
        this.statements = statements;
        this.safe = true;
    }
    toString(){
        let str = "[";
        for(let stmt of this.statements){
            str += stmt.toString() + ', ';
        }
        return str.slice(0, -2) + "]";
    }
    analyze( env ) {
        localEnv = env.makeChild();
        localEnv.safe = localEnv.safe && this.safe;
        
        for( let i = 0; i < this.statements.length; ++i) {
            let stmt = this.statements[i]
            stmt.analyze( localEnv );
            // If anything comes back unsafe, our whole block is unsafe
            this.safe = this.safe && stmt.safe;
        }
    }
};