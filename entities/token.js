'use strict';

module.exports = class Token{
    constructor( token ) {
        this.type = token.type;
        this.text = token.text;
        this.line = token.line;
        this.column = token.column;
        this.safe = true;
    }
    toString(){
        return `{`
            + `"type":"${this.type}", `
            + (this.text ? `"text":"${this.text}"` : "" )
            // + `line:${this.line.toString()}}`
            // + `column:${this.column.toString()}}`
            + `}`;
    }
    // No analysis necessary
    analyze( env ) {

    }
};