/*
    Macrosyntax
    name        | def
    ---------------------------------
    Program     | Block
    Block       | (Statement newline)+
    Statement   | Element
                | Control
                | comment
                | js
                | css
    Element     | (Tag|Exp)(Class)?(Id)?Attrs?(Element|ChildBlock|Event ChildBlock)?
    Attrs       | openParen ((Attr Exp)|Class|Id)+ closeParen
    ChildBlock  | newline indent Block dedent
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
    Exp6        | Val | openParen Exp closeParen
    Val         | ElemAttr | Lit | id | FuncCall
    Lit         | stringlit | intlit | floatlit | boollit
    ElemAttr    | Id?tilde Attr
    Event       | tilde bareword
    FuncCall    | bareword(Exp|openParen(Exp)*closeParen)
    Control*    | If | For | While         
    If          | "if" Exp ChildBlock ("else" "if" Exp ChildBlock)*("else" ChildBlock)?
    For         | "for" id "in" Array|stringlit|Range ChildBlock
    While       | "while" Exp
    Array       | openSquare Lit+ closeSquare
    Range       | openSquare intLit range intLit closeSquare
*/

module.exports = (scannerTokens) => {
    var tokens = scannerTokens;
    var programTree = ["program"];
    var error = require("./error.js");


    // If any of these return something, that means we had an error
    var Program = ( tree ) => {
        var block = [];
        var err = Block(block) || matchBasic("EOF");
        tree.push(block);
        return err;
    };
    var Block = ( tree ) => {
        var statements = [];
        var err;

        // If we get a dedent or an EOF, we have no more block
        while(!at("dedent") && !at("EOF")){
            var statement = {};
            err = Statement(statement);
            err = err || matchBasic("newline");
            if(err) {
                break;
            }
            else{
                statements.push(statement);
            }
        }

        if(at("dedent")){
            matchBasic("dedent");
        }

        return err;
    };
    var Statement = ( tree ) => {
        if( at("js") ){
            tree.push( match("js") );
            return;
        }
        if ( at("css") ){
            tree.push( match("css") );
            return;
        }
        if ( at("comment") ){
            tree.push( match("comment") );
            return;
        }
        if ( at("bareword") ) {
            if ( at(['if', 'for', 'while']) ) {
                return Control(tree);
            }
            else {
                return Element(tree);
            }
        }
        return error("Statement expected, got " + tokens[0].type, tokens[0].line, tokens[0].column);

    };
    var Element = ( tree ) => {
        var err;

        if( at(['bareword', 'style', 'script']) ) {
            err = Tag( tree );
        }
        else {
            err = Exp( tree );
        }
        if( at("dot") ) {
            err = err || Class( tree );
        }
        if( at("hash") ) {
            err = err || Id( tree );
        }
        if( at("openParen") ) {
            err = err || Attr( tree );
        }
        if( at("indent")  ) {
            err = err || ChildBlock( tree );
        }
        if( at("tilde") ){
            err = err || Event( tree );
            err = err || ChildBlock( tree );
        }
        if( !at("newline") ) {
            var exp = [];
            err = err || Exp(exp);
            tree.push(exp);
        }
        return err;
    };     
    var Attrs = ( tree ) => {

    };       
    var ChildBlock = ( tree ) => {

    };  
    var Tag = ( tree ) => {

    };         
    var Class = ( tree ) => {

    };   
    var Id = ( tree ) => {

    };       
    var Attr = ( tree ) => {

    };
    var Exp = ( tree ) => {
        var err = Exp1( tree );
        if( at("question") ){
            tree.push(match("question"));
            err = err || Exp1( tree );
            if( at("colon") ){
                tree.push(match("colon"));
            }
            else{
                return err || error("Parse Error: Ternary operator needs a colon", token[0].line, token[0].column);
            }
            err = err || Exp1( tree );
        }
        return err;
    };         
    var Exp1 = ( tree ) => {
        var err = Exp2( tree );
    };     
    var Exp2 = ( tree ) => {

    };    
    var Exp3 = ( tree ) => {

    };    
    var Exp4 = ( tree ) => {

    };     
    var Exp5 = ( tree ) => {

    };     
    var Exp6 = ( tree ) => {

    };     
    var Val = ( tree ) => {

    };      
    var Lit = ( tree ) => {

    };  
    var ElemAttr = ( tree ) => {

    };  
    var Event = ( tree ) => {

    };       
    var FuncCall = ( tree ) => {

    };    
    var Control = ( tree ) => {

    };   
    var If = ( tree ) => {

    };          
    var For = ( tree ) => {

    };         
    var ArrayDef = ( tree ) => {

    };       
    var Range = ( tree ) => {

    };

    // Returns true if the next token has type "type", false otherwise
    var at = ( type ) => {
        return tokens.length && 
            (Array.isArray( type ) && type.some(at) 
                || type === tokens[0].type);
    };

    // Pops off the top token if its type matches 'type', returns an error otherwise
    var match = ( type ) => {
        if( !tokens.length ) {
            return error("Parse error: Expected " + type + ", got end of program");
        }
        else if( type === undefined ||  kind === tokens[0].type){
            return tokens.shift();
        }
        else{
            return error("Parse error: Expected " + type + ", got " + tokens[0].type, 
                        tokens[0].line,
                        tokens[0].column);
        }
    };

    // Like match, but returns false if there is a match, rather than what was found.
    var matchBasic = ( type ) => {
        return errorMatch( match( type ) );
    };

    var errorMatch = ( match ) => {
        if(match.type === "error"){
            return match;
        }
        return false;
    };

    return Program(programTree) || programTree;
}