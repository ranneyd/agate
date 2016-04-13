'use strict';

const Entity = require("./entity");
const Token = require("./token");

module.exports = class Block extends Entity{
    constructor(token, statements) {
        super(token);
        this.statements = statements;
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [];

        for(let stmt of this.statements) {
            strArr.push(stmt.toString(indentLevel + indent, indent))
        }

        return this.toStringArray(indentLevel, indent, strArr).join("\n"); 
    }
    toStringArray(indentLevel, indent, attrs){
        // indentLevel = how many spaces whole block is indented by
        // indent = how many spaces we should indent with
        // attrs = additional attributes to spit out
        indentLevel = indentLevel || 0;
        indent = indent || 3;        
        attrs = attrs || [];

        // Every entity should output its type. Optionally add more attrs to
        // this list
        let strArr = [
            ...attrs
        ];
        // Indent these attrs
        strArr = strArr.map(str => " ".repeat(indent) + str);
        // End bracket isn't indented
        strArr.push("]")
        // Open bracket should not have any indentation (often begins at end
        // of previous line). For the rest, add the indentLevel to the front
        return ["[", ...strArr.map(str => " ".repeat(indentLevel) + str) ];
    }
    analyze( env ) {
        let localEnv = env.makeChild();
        localEnv.safe = localEnv.safe && this.safe;
        
        for( let stmt of this.statements) {
            stmt.analyze( localEnv );
            // If anything comes back unsafe, our whole block is unsafe
            this.safe = this.safe && stmt.safe;
        }
    }

    static parse( parser ){
        super( parser );

        // Save the first token
        let token = parser.next;
        let statements = [];

        // If we get a dedent or an EOF, we have no more block
        while(!parser.at("dedent") && !parser.at("EOF")){
            while( parser.at("newline") ) {
                parser.match("newline");
            }

            let statement;

            if( at("comment") ) {
                statement = new Token( match("comment") );
            }
            else if ( at('template') ) {
                return template();
            }
            else if( at(controlTypes) ) {
                return control();
            }
            else if( at("def") ) {
                return def();
            }
            else if( at("return") ) {
                match("return");
                return new Return( exp() );
            }
            else if( atExp() ){
                let ourExp = exp();
                if( at("equals") || at(binAssignOps) ) {
                    if( at(binAssignOps) ){
                        if( at("boolop") ) {
                            let op = new Token( match("boolop") );
                            match("equals");
                            ourExp = new Assignment(
                                ourExp,
                                new BinaryExp(ourExp, exp(), op)
                            );
                        }
                        else if( at("multop") ) {
                            let op = new Token( match("multop") );
                            match("equals");
                            ourExp = new Assignment(
                                ourExp,
                                new BinaryExp(ourExp, exp(), op)
                            );
                        }
                        else {
                            error.hint = "You have 'id *something*= *stuff*' and we're trying to figure out"
                                       + "what the *something* means. We're looking for stuff like +=, -= etc";
                            let op = new Token( at("minus") ? match("minus") : match("plus") );
                            match("equals");
                            ourExp = new Assignment(
                                ourExp,
                                new BinaryExp(ourExp, exp(), op)
                            );
                        }
                    }
                    else {
                        match("equals");
                        ourExp = new Assignment( ourExp, exp());
                    }
                }
                return ourExp;
            }
            else {
                error.hint = "Did you put a blank line without indentation?";
                error.expected("some kind of statement", tokens.shift());
                error.hint = "";
            }
            // They can put as many blank lines as they'd like, but that
            // doesn't mean we have to pay attention to them
            if(stmt !== "blank"){
                statements.push( stmt );
            }

            // child blocks are special cases. Since dedents come after the
            // newlines, the ChildBlock pattern needs to consume the newline.
            if(lastToken.type !== "dedent" && !at("EOF")){
                do{
                    match("newline");
                } while( at("newline") );
            }
        }

        return new Block( token, statements );
    }
};