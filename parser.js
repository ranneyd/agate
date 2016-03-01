"use strict";

/*
    Macrosyntax
    name        | def
    ---------------------------------
    Program     | Block
    Block       | (Statement ((?<!ChildBlock)newline)?)+
    Statement   | Element
                | Exp
                | Control
                | Assignment
                | comment
                | newline
    Element     | Tag(Class)?(Id)?Attrs?(Exp|Element|ChildBlock|Event ChildBlock)?
    Attrs       | openParen ((Attr Exp)|Class|Id)+ closeParen
    ChildBlock  | newline indent (Block|JSBlock|CSSBlock) newline dedent
    JSBlock     | js (id js)*
    CSSBlock    | css (id css)*
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
    Event       | tilde Attr
    FuncCall    | bareword(Exp|openParen(Exp)*closeParen)
    Control*    | If | For | While         
    If          | "if" Exp ChildBlock ("else" "if" Exp ChildBlock)*("else" ChildBlock)?
    For         | "for" id "in" (Array|stringlit|Range) ChildBlock
    While       | "while" Exp ChildBlock
    Array       | openSquare (Lit+|Range) closeSquare
    Range       | intLit range intLit
    Assignment  | id assignment Exp
*/

Error = require("./error.js");

var error = new Error();

var lits = ["stringlit", "intlit", "floatlit", "boollit"];
var tags = ["bareword", "script", "style"];


module.exports = (scannerTokens, verbose) => {
    var tokens = scannerTokens;
    var lastToken;

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
            let statement = Statement();

            // They can put as many blank lines as they'd like, but that
            // doesn't mean we have to pay attention to them
            if(statement !== "blank"){
                statements.push( statement );
            }

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
        if ( at(tags) ) {
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
        if ( at("newline") ){
            return "blank";
        }
        return Exp();
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
            element.push( [ Event(), ChildBlock() ]);
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
        log("Matching Attrs");
        
        var attrs = [];

        match("openParen")

        do{
            if( at("hash") ){
                attrs.push( Id() );
            }
            else if( at("dot") ){
                attrs.push( Class() );
            }
            else if( at("bareword") || at("style") ){
                attrs.push([Attr(), Exp()]);
            }
            else{
                return error.expected('some attribute', tokens[0]);
            }
        } while( !at("closeParen") );

        match("closeParen");

        return attrs;
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
    var JSBlock = () => {
        log("Matching JS Block");

        let js = [ match("js") ];
        while( at("id") ) {
            js.push( match( "id" ));
            // TODO: Why can't it end with an id?
            js.push( match( "js" ));
        }

        return js;
    }
    var CSSBlock = () => {
        log("Matching CSS Block");

        let css = [ match("css") ];
        while( at("id") ) {
            css.push( match( "id" ));
            // TODO: Why can't it end with an id?
            css.push( match( "css" ));
        }

        return js;
    }
    var Tag = () => {
        log("Matching Tag");
        for( let tag in tags){
            if( at(tags[tag]) ){
                return match(tags[tag]);
            }
        }
        return error.expected('some kind of tag', tokens[0]);
    };         
    var Class = () => {
        log("Matching Class");
        match("dot");
        return { "class": match("bareword") };
    };   
    var Id = () => {
        log("Matching Id (html kind)");
        match("hash");
        return { "id": match("bareword") };
    };       
    var Attr = () => {
        log("Matching Attr");
        if( at("style") ){
            return { "attr": match("style") };
        }
        return { "attr": match("bareword") };
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
                return error.parse('Ternay operator needs a colon', tokens[0]);
            }
            exp = ternary;
        }
        return exp;
    };         
    var Exp1 = () => {
        log("Matching Exp1");
        let exp = Exp2();
        while( at("boolop") ) {
            let boolop = [ match("boolop"), [exp, Exp2()]]
            exp = boolop;
        }
        return exp;
    };     
    var Exp2 = () => {
        log("Matching Exp2");
        let exp = Exp3();
        while( at("relop") ) {
            let relop = [ match("relop"), [exp, Exp3()]]
            exp = relop;
        }
        return exp;
    };    
    var Exp3 = () => {
        log("Matching Exp3");
        let exp = Exp4();
        while( at("addop") ) {
            let addop = [ match("addop"), [exp, Exp4()]]
            exp = addop;
        }
        return exp;
    };    
    var Exp4 = () => {
        log("Matching Exp4");
        let exp = Exp5();
        while( at("multop") ) {
            let multop = [ match("multop"), [exp, Exp5()]]
            exp = multop;
        }
        return exp;
    };     
    var Exp5 = () => {
        log("Matching Exp5");
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
        log("Matching Exp6");
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
        log("Matching Val");
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
            return error.expected('some kind of value', tokens[0]);
        }
    };      
    var Lit = () => {
        log("Matching Lit");
        for( let lit in lits){
            if( at(lits[lit]) ){
                return match(lits[lit]);
            }
        }
        return error.expected('some kind of literal', tokens[0]);

    };  
    var ElemAttr = () => {
        log("Matching ElemAttr");

        let elemAttr = [];

        if( at("dot") ){
            elemAttr.push( Class() );
        }
        else if( at("hash") ){
            elemAttr.push( Id() );
        }
        else{
            elemAttr.push( "this" );
        }

        match("tilde");

        elemAttr.push( Attr() );

        return elemAttr;

    };
    // Note that this is very similar to ElemAttr. I considered merging the
    // two somehow, but they really have different meanings. At the end of an
    // element you should not be able to access any attribute of that element
    // (since you can do that in its attributes area). It really is JUST for
    // events
    var Event = () => {
        log("Matching Event");

        match("tilde");

        return match("bareword");
    };       
    var FuncCall = () => {
        log("Matching Function call");

        let funcCall = [ match("bareword") ];

        if( at("openParen") ){
            let args = [];
            match("openParen");
            while( !at("closeParen") ){
                args.push( Exp() );
            }
            match("closeParen");
            funcCall.push(args);
        }
        else{
            funcCall.push( Exp() );
        }

        return funcCall;
    };    
    var Control = () => {
        log("Matching Control block");

        if( at("bareword") ) {
            if( tokens[0].text === "if" ) {
                return If();
            }
            else if( tokens[0].text === "for" ) {
                return For();
            }
            else if( tokens[0].text === "while" ) {
                return While();
            }
            else {
                return error.parse('${tokens[0].text} is not a recognized control statement', tokens[0]);
            }
        }
        else {
            return error.expected('some kind of control statement', tokens[0]);
        }

    };   
    var If = () => {
        log("Matching If");

        let ifStatement = [];

        if( at("bareword") && tokens[0].text === "if") {
            match("bareword");

            let thisIf = ["if"]
            thisIf.push( Exp() );
            thisIf.push( ChildBlock() )
            ifStatement.push(thisIf);

            while( atSequential(["bareword", "bareword"]) 
                    && tokens[0].text === "else"
                    && tokens[1].text === "if") {
                match("bareword");
                match("bareword");

                let thisIf = [ "else if"];
                thisIf.push( Exp() );
                thisIf.push( ChildBlock() )
                ifStatement.push(thisIf);
            }

            if( at("bareword") && tokens[0].text === "else" ) {
                match("bareword");

                let thisIf = [ "else"];
                thisIf.push( ChildBlock() )
                ifStatement.push(thisIf);
            }
        }
        else {
            return error.expected('an if statement', tokens[0]);          
        }

        return ifStatement;
    };          
    var For = () => {

    };
    var While = () => {
        log("Matching While");
        if( at("bareword") && tokens[0].text === "while") {
            return [ "while", Exp(), ChildBlock() ];
        }
        else {
            return error.expected('an while statement', tokens[0]);
        }
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
            return error.parse('Expected ${type}, got end of program');
        }
        else if( type === undefined ||  type === tokens[0].type){
            log("Matched '" + type + "'" + (tokens[0].text? " with text '" + tokens[0].text + "'":""));
            log("Tokens remaining: " + tokens.length);
            lastToken = tokens.shift();
            return lastToken;
        }
        else{
            tokens.shift();
            return error.expected(type, tokens[0]);
        }
    };

    return Program();
}