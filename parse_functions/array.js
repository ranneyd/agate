'use strict';

// Entities
let ArrayLit = require("../entities/arraylit");
let Literal = require("../entities/literal");

module.exports = ( p ) => {
    let parseChildBlock = require("./childblock");
    let parseExp = require("./exp");

    p.matchLog(`Matching Array`);

    let bracket = p.match("openSquare");

    let elems = [];
    // If it isn't just an empty array...
    if( !p.at("closeSquare") ){
        // Is it a range situation?
        if(p.atSequential(["intlit", "range", "intlit"])) {
            let a = p.match("intlit");
            let aVal = parseInt( a.text );

            p.match("range");

            let b = p.match("intlit");
            let bVal = parseInt( b.text );

            if( isNaN(aVal) ){
                error.parse(`'${a.text}' has to be a number`, a);
            }
            else if( isNaN(bVal) ){
                error.parse(`'${b.text}' has to be a number`, b);
            }
            else{
                if( aVal < bVal ) {
                    for( let i = aVal; i < bVal; ++i ){
                        elems.push( new Literal({
                            type: "intlit",
                            text: i,
                            line: a.line(),
                            column: a.column()
                        }));
                    }
                }
            }
        }
        else if( p.at("newline") ) {
            elems = parseChildBlock( p );
        }
        else {
            elems = [];
            do{
                elems.push( parseExp( p ) );
                // commas optional
                if( p.at("comma") ) {
                    p.match("comma");
                }
            } while( !p.at("closeSquare") );
        }
    }

    p.match("closeSquare");

    return new ArrayLit(bracket, elems);
};
