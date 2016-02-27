/*
    Macrosyntax
    name        | def
    ---------------------------------
    Program     | Block
    Block       | (Statement newline)+
    Statement   | Element
                | Control
                | Assignment
                | comment
    Element     | Tag(Class)?(Id)?Attrs?(Exp|Element|ChildBlock|Event ChildBlock)?
    Attrs       | openParen ((Attr Exp)|Class|Id)+ closeParen
    ChildBlock  | newline indent (Block|JSBlock|CSSBlock) dedent
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

module.exports = (scannerTokens) => {
    var tokens = scannerTokens;
    var error = require("./error.js");

    var Program = () => {
        var tree = ["program", Block()];
        match("EOF");
        return tree;
    };
    var Block = () => {
        var block = ["block"];
        var statements = [];

        // If we get a dedent or an EOF, we have no more block
        while(!at("dedent") && !at("EOF")){
            statements.push(Statement(statement));
            match("newline");
        }

        if(at("dedent")){
            match("dedent");
        }

        block.push(statements);
        return block;
    };
    var Statement = () => {
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
        var element = [ Tag() ];
        if( at("dot") ) {
            element.push( Class() );
        }
        if( at("hash") ) {
            element.push( Id() );
        }
        if( at("openParen") ) {
            element.push( Attrs() );
        }


        if( at("indent")  ) {
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

    };  
    var Tag = () => {

    };         
    var Class = () => {

    };   
    var Id = () => {

    };       
    var Attr = () => {

    };
    var Exp = () => {
        var exp = Exp1();
        if( at("question") ){
            tree.push(match("question"));
            err = err || Exp1();
            if( at("colon") ){
                tree.push(match("colon"));
            }
            else{
                return err || error("Parse Error: Ternary operator needs a colon", token[0].line, token[0].column);
            }
            err = err || Exp1();
        }
        return err;
    };         
    var Exp1 = () => {
        var err = Exp2();
    };     
    var Exp2 = () => {

    };    
    var Exp3 = () => {

    };    
    var Exp4 = () => {

    };     
    var Exp5 = () => {

    };     
    var Exp6 = () => {

    };     
    var Val = () => {

    };      
    var Lit = () => {

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

    return Program();
}