"use strict";

/*
    Macrosyntax
    name        | def
    ---------------------------------
    Program     | Block
    Block       | (Statement ((?<!ChildBlock)newline)?)+
    Statement   | Element
                | Control
                | Assignment
                | comment
    Element     | Tag(Class)?(Id)?Attrs?(Exp|Element|ChildBlock|Event ChildBlock)?
    Attrs       | openParen ((Attr Exp)|Class|Id)+ closeParen
    ChildBlock  | newline indent (Block|JSBlock|CSSBlock) newline dedent
    JSBlock     | js (Exp js)*
    CSSBlock    | css (Exp css)*
    Tag         | bareword|script|style
    Class       | dot bareword
    Id          | hash bareword
    Attr        | bareword
    Exp         | Exp1 ( question Exp1 colon Exp1)?
    Exp1        | Exp2 (boolop Exp2)*
    Exp2        | Exp3 (relop Exp3)*
    Exp3        | Exp4 (addop Exp4)*
    Exp4        | Exp5 (multop Exp5)*
    Exp5        | prefixop? Exp6
    Exp6        | Val | openParen Exp newline? closeParen
    Val         | ElemAttr | Lit+ | id | FuncCall
    Lit         | stringlit | intlit | floatlit | boollit
    ElemAttr    | (Id|Class)?tilde Attr
    Event       | tilde bareword
    FuncCall    | bareword(Exp|openParen(Exp)*closeParen)
    Control*    | If | For | While         
    If          | "if" Exp ChildBlock ("else" "if" Exp ChildBlock)*("else" ChildBlock)?
    For         | "for" id "in" Array|stringlit|Range ChildBlock
    While       | "while" Exp
    Array       | openSquare (Lit+|Range) closeSquare
    Range       | intLit range intLit
    Assignment  | id assignment Exp
*/

var lits = ["stringlit", "intlit", "floatlit", "boollit"];
var tags = ["bareword", "script", "style"];

module.exports = (scannerTokens, verbose) => {
    var tokens = scannerTokens;
    var lastToken;
    var error = require("./error.js");

    var log = function(message){
        if(verbose){
            console.log(message);
        }
    }

    var Program = () => {
        log("Matching the program");
        let tree = ["program", Block()];
        match("EOF");
        return tree;
    };
    var Block = () => {
        log("Matching block");
        let block = ["block"];
        let statements = [];

        // If we get a dedent or an EOF, we have no more block
        while(!at("dedent") && !at("EOF")){
            statements.push( Statement() );

            // child blocks are special cases. Since dedents come after the
            // newlines, the ChildBlock pattern needs to consume the newline.
            if(lastToken.type !== "dedent" && !at("EOF")){
                match("newline");
            }
        }

        block.push(statements);
        return block;
    };
    var Statement = () => {
        log("Matching a Statement");
        if( at("js") ){
            return match("js");
        }
        if ( at("css") ){
            return match("css");
        }
        if ( at("comment") ){
            return match("comment");
        }
        if ( at("bareword") ) {
            if ( at(['if', 'for', 'while']) ) {
                return Control();
            }
            else {
                return Element();
            }
        }
        if ( at("id") ) {
            return Assignment();
        }
        error("Statement expected, got " + tokens[0].type, tokens[0].line, tokens[0].column);
    };
    var Element = () => {
        log("Matching Element");
        debugger;
        let element = [ Tag() ];
        if( at("dot") ) {
            element.push( Class() );
        }
        if( at("hash") ) {
            element.push( Id() );
        }
        if( at("openParen") ) {
            element.push( Attrs() );
        }

        if( atSequential(["newline", "indent"]) ) {
            element.push( ChildBlock() );
        }
        else if( at("tilde") ){
            element.push( Event() );
            element.push( ChildBlock() );
        }
        else if( at(["bareword", "script", "style"]) ) {
            element.push( Element() );
        }
        else{
            if( !at("newline") ) {
                element.push( Exp() );
            }
        }
        return element;
    };     
    var Attrs = () => {

    };       
    var ChildBlock = () => {
        log("Matching ChildBlock");
        match("newline");
        match("indent");

        let block;

        if( at("js") ){
            block = JSBlock();
        }
        else if( at("css") ){
            block = JSBlock();
        }
        else {
            block = Block();
        }
        if( !at("EOF")){
            match("dedent");
        }
        return block;
    };  
    var Tag = () => {
        log("Matching Tag");
        for( let tag in tags){
            if( at(tags[tag]) ){
                return match(tags[tag]);
            }
        }
        let errorStr = "Parse Error: Expected some kind of tag, got " + tokens[0].type;
        return error(errorStr, tokens[0].line, tokens[0].column);
    };         
    var Class = () => {

    };   
    var Id = () => {

    };       
    var Attr = () => {

    };
    var Exp = () => {
        log("Matching Exp");
        let exp = Exp1();
        if( at("question") ){
            let ternary = [ "ternary", [exp, Exp1()] ];
            if( at("colon") ){
                ternary[1].push( Exp1() );
            }
            else{
                let errorStr = "Parse Error: Ternary operator needs a colon";
                error(errorStr, tokens[0].line, tokens[0].column);
            }
            exp = ternary;
        }
        return exp;
    };         
    var Exp1 = () => {
        let exp = Exp2();
        while( at("boolop") ) {
            let boolop = [ match("boolop"), [exp, Exp2()]]
            exp = boolop;
        }
        return exp;
    };     
    var Exp2 = () => {
        let exp = Exp3();
        while( at("relop") ) {
            let relop = [ match("relop"), [exp, Exp3()]]
            exp = relop;
        }
        return exp;
    };    
    var Exp3 = () => {
        let exp = Exp4();
        while( at("addop") ) {
            let addop = [ match("addop"), [exp, Exp4()]]
            exp = addop;
        }
        return exp;
    };    
    var Exp4 = () => {
        let exp = Exp5();
        while( at("multop") ) {
            let multop = [ match("multop"), [exp, Exp5()]]
            exp = multop;
        }
        return exp;
    };     
    var Exp5 = () => {
        let exp;
        if ( at("prefixop") ){
            exp = [ match("prefixop"), Exp6()];
        }
        else{
            exp = Exp6();
        }
        return exp;
    };     
    var Exp6 = () => {
        if ( at("openParen") ) {
            let exp = Exp();
            while( at("newline") ) {
                match("newline");
            }
            return Exp();
        }
        return Val();
    };     
    var Val = () => {
        if( at(["dot", "hash", "tilde"]) ){
            return ElemAttr();
        }
        else if( at(lits) ){
            return Lit();
        }
        else if( at("id") ){
            return match("id");
        }
        else if( at("bareword") ){
            return FuncCall();
        }
        else {
            let errorStr = "Parse Error: Expected some kind of value, got " + tokens[0].type;
            return error(errorStr, tokens[0].line, tokens[0].column);
        }
    };      
    var Lit = () => {
        log("Matching Lit");
        for( let lit in lits){
            if( at(lits[lit]) ){
                return match(lits[lit]);
            }
        }
        let errorStr = "Parse Error: Expected some kind of literal, got " + tokens[0].type;
        return error(errorStr, tokens[0].line, tokens[0].column);
    };  
    var ElemAttr = () => {

    };  
    var Event = () => {

    };       
    var FuncCall = () => {

    };    
    var Control = () => {

    };   
    var If = () => {

    };          
    var For = () => {

    };         
    var ArrayDef = () => {

    };       
    var Range = () => {

    };
    var Assignment = () => {

    };

    // Returns true if the next token has type "type", or a type in "type" if
    // type is an array, false otherwise
    var at = ( type ) => {
        return tokens.length && 
            (Array.isArray( type ) && type.some(at) 
                || type === tokens[0].type);
    };
    // Like at except if type is an array, it checks one after the other.
    var atSequential = ( type ) => {
        for(let i = 0; i < type.length; ++i){
            // If we don't have enough tokens or the token we're at doesn't
            // match, no sale
            if(tokens.length <= i || type[i] !== tokens[i].type){
                return false;
            }
        }
        return true;
    };

    // Pops off the top token if its type matches 'type', returns an error otherwise
    var match = ( type ) => {
        if( !tokens.length ) {
            return error("Parse error: Expected " + type + ", got end of program");
        }
        else if( type === undefined ||  type === tokens[0].type){
            log("Matched " + type);
            log("Tokens remaining: " + tokens.length);
            lastToken = tokens.shift();
            return lastToken;
        }
        else{
            return error("Parse error: Expected " + type + ", got " + tokens[0].type, 
                        tokens[0].line,
                        tokens[0].column);
        }
    };

    return Program();
}