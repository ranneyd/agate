"use strict";

/*
    Macrosyntax
    name        | def
    ---------------------------------
    Program     | Block
    Block       | (Statement ((?<!ChildBlock)newline)?)+
    Statement   | Control
                | Assignment
                | comment
                | newline
                | Element
                | Exp
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
    Control     | If | For | While
    If          | if Exp ChildBlock (else-if Exp ChildBlock)*(else ChildBlock)?
    For         | for id in (Array|stringlit|Range) ChildBlock
    While       | while Exp ChildBlock
    Array       | openSquare (Lit+|Range) closeSquare
    Range       | intLit range intLit
    Assignment  | id assignment Exp
    TODO: function def
*/

Error = require("./error.js");

var error = new Error();

var lits = ["stringlit", "intlit", "floatlit", "boollit"];
var tags = ["bareword", "script", "style"];


module.exports = (scannerTokens, verbose) => {
    var tokens = scannerTokens;
    var lastToken;

    var log = (message) => {
        if(verbose) {
            console.log(message);
        }
    };

    var Program = () => {
        log("Matching the program");
        let tree = {
            "type":"program",
            "body": Block()
        };
        match("EOF");
        return tree;
    };
    var Block = () => {
        log("Matching block");
        let block = {
            "type": "block"
        };
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

        block.body = statements;
        return block;
    };
    var Statement = () => {
        log("Matching a Statement");

        if ( at(['if', 'for', 'while']) ) {
            return Control();
        }
        if ( at("id") ) {
            return Assignment();
        }
        
        if ( at("comment") ) {
            return match("comment");
        }
        if ( at("newline") ) {
            return "blank";
        }
        if( at("bareword") ) {
            return Element();
        }
        return Exp();
    };
    var Element = () => {
        log("Matching Element");

        let element = {
            "type": "element",
            "tag": Tag()
        };
        if( at("dot") ) {
            element.class = Class();
        }
        if( at("hash") ) {
            element.id = Id();
        }
        if( at("openParen") ) {
            element.attrs = Attrs();
        }

        if( atSequential(["newline", "indent"]) ) {
            element.child = ChildBlock();
        }
        else if( at("tilde") ){
            element.event = Event();
            element.event.child = ChildBlock();
        }
        else if( at(["bareword", "script", "style"]) ) {
            element.child = Element();
        }
        else{
            if( !at("newline") ) {
                element.child = Exp();
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
                attrs.push({
                    "type": "id",
                    "body": Id()
                });
            }
            else if( at("dot") ){
                attrs.push({
                    "type": "class",
                    "body": Class()
                });
            }
            else if( at("bareword") || at("style") ){
                attrs.push({
                    "type": Attr(),
                    "body": Exp()
                });
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
            block = CSSBlock();
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

        let js = {
            "type": "JS Block",
            "body": [match("js")]
        };
        while( at("id") ) {
            js.body.push( match( "id" ));
            // TODO: Why can't it end with an id?
            js.body.push( match( "js" ));
        }

        return js;
    }
    var CSSBlock = () => {
        log("Matching CSS Block");

        let css = {
            "type": "CSS Block",
            "body": [match("css")]
        };
        while( at("id") ) {
            css.body.push( match( "id" ));
            // TODO: Why can't it end with an id?
            css.body.push( match( "css" ));
        }

        return css;
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
        return { 
            "type":"class",
            "body": match("bareword")
        };
    };   
    var Id = () => {
        log("Matching Id (html kind)");
        match("hash");
        return { 
            "type":"id",
            "body": match("bareword")
        };    
    };       
    var Attr = () => {
        log("Matching Attr");

        if( at("style") ) {
            return match("style");
        }
        return match("bareword");
    };
    var Exp = () => {
        log("Matching Exp");

        let exp = Exp1();
        if( at("question") ) {
            let ternary = {
                "type": "ternary",
                "condition": exp,
                "if": Exp1()
            };
            match("colon");
            ternary.else = Exp1();
            
            exp = ternary;
        }
        return exp;
    };         
    var Exp1 = () => {
        log("Matching Exp1");

        let exp = Exp2();
        while( at("boolop") ) {
            let boolop = {
                "type": "boolop",
                "op": match("boolop"),
                "a": exp,
                "b": Exp2()
            };

            exp = boolop;
        }
        return exp;
    };     
    var Exp2 = () => {
        log("Matching Exp2");
        let exp = Exp3();
        while( at("relop") ) {
           let relop = {
                "type": "relop",
                "op": match("relop"),
                "a": exp,
                "b": Exp3()
            };
            exp = relop;
        }
        return exp;
    };    
    var Exp3 = () => {
        log("Matching Exp3");
        let exp = Exp4();
        while( at("addop") ) {
            let addop = {
                "type": "addop",
                "op": match("addop"),
                "a": exp,
                "b": Exp4()
            };
            exp = addop;
        }
        return exp;
    };    
    var Exp4 = () => {
        log("Matching Exp4");
        let exp = Exp5();
        while( at("multop") ) {
            let multop = {
                "type": "multop",
                "op": match("multop"),
                "a": exp,
                "b": Exp5()
            };
            exp = multop;
        }
        return exp;
    };     
    var Exp5 = () => {
        log("Matching Exp5");

        let exp;
        if ( at("prefixop") ) {
            exp = {
                "type": "prefixop",
                "op": match("prefixop"),
                "body": Exp6()
            };
        }
        else {
            exp = Exp6();
        }
        return exp;
    };     
    var Exp6 = () => {
        log("Matching Exp6");

        if ( at("openParen") ) {
            match("openParen")
            
            let exp = Exp();
            while( at("newline") ) {
                match("newline");
            }

            match("closeParen");
            return exp;
        }
        return Val();
    };     
    var Val = () => {
        log("Matching Val");

        if( at(["dot", "hash", "tilde"]) ) {
            return ElemAttr();
        }
        else if( at(lits) ) {
            return Lit();
        }
        else if( at("id") ) {
            return {
                "type": "identifier",
                "body": match("id")
            };
        }
        else if( at("bareword") ) {
            return FuncCall();
        }
        else {
            return error.expected('some kind of value', tokens[0]);
        }
    };      
    var Lit = () => {
        log("Matching Lit");

        for( let lit in lits ) {
            if( at(lits[lit]) ) {
                return {
                    "type": lits[lit],
                    "body": match(lits[lit])
                };
            }
        }
        return error.expected('some kind of literal', tokens[0]);
    };  
    var ElemAttr = () => {
        log("Matching ElemAttr");

        let elemAttr = {
            "type": "elemattr"
        };

        if( at("dot") ) {
            elemAttr.source = Class();
        }
        else if( at("hash") ) {
            elemAttr.source = Id();
        }
        else {
            elemAttr.source = "this";
        }

        match("tilde");

        elemAttr.body = Attr();

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

        return {
            "type": "event",
            "body": match("bareword")
        };
    };       
    var FuncCall = () => {
        log("Matching Function call");

        let funcCall = {
            "type": "funcCall",
            "name" : match("bareword")
        };

        if( at("openParen") ){
            let args = [];

            match("openParen");
            while( !at("closeParen") ){
                args.push( Exp() );
            }
            match("closeParen");

            funcCall.args = args;
        }
        else{
            funcCall.args = [ Exp() ];
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

        let ifStatement = {
            "type": "if"
        };

        if( at("bareword") && tokens[0].text === "if") {
            match("bareword");

            ifStatement.condition = Exp();
            ifStatement.body = ChildBlock();

            while( atSequential(["bareword", "bareword"]) 
                    && tokens[0].text === "else"
                    && tokens[1].text === "if") {
                match("bareword");
                match("bareword");

                let thisIf = {
                    "condition": Exp(),
                    "body": ChildBlock()
                };
                
                let elseIfs = ifStatement["else if"] || [];
                elseIfs.push(thisIf);
                ifStatement["else if"] = elseIfs;
            }

            if( at("bareword") && tokens[0].text === "else" ) {
                match("bareword");

                ifStatement.else = ChildBlock()
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
            return {
                "type": "while",
                "condition": Exp(),
                "body": ChildBlock()
            };
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
        for(let i = 0; i < type.length; ++i) {
            // If we don't have enough tokens or the token we're at doesn't
            // match, no sale
            if(tokens.length <= i || type[i] !== tokens[i].type) {
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
        else if( type === undefined ||  type === tokens[0].type) {
            log('Matched "${type}"' + (tokens[0].text ? 'with text "${tokens[0].text}"' : ""));
            lastToken = tokens.shift();
            log('Tokens remaining: ${tokens.length}');
            return lastToken;
        }
        else {
            tokens.shift();
            return error.expected(type, tokens[0]);
        }
    };

    return Program();
};