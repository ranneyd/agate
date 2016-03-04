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
                | Concatable
    Element     | Tag(Class)?(Id)?Attrs?(Element (Element|Exp)+|Exp|ChildBlock|Event ChildBlock)?
    Attrs       | openParen ((Attr Exp)|Class|Id)+ closeParen
    ChildBlock  | newline indent (Block|JSBlock|CSSBlock) newline dedent
    JSBlock     | id? (js id? newline?)+
    CSSBlock    | id? (css id? newline?)+
    Tag         | bareword|script|style
    Class       | dot bareword
    Id          | hash bareword
    Attr        | bareword
    Concatable  | Exp+
    Exp         | Exp1 ( question Exp1 colon Exp1)?
    Exp1        | Exp2 (boolop Exp2)*
    Exp2        | Exp3 (relop Exp3)*
    Exp3        | Exp4 (addop Exp4)*
    Exp4        | Exp5 (multop Exp5)*
    Exp5        | prefixop? Exp6
    Exp6        | Val | openParen Concatable newline? closeParen
    Val         | ElemAttr | id | FuncCall | Lit | Array | HashMap
    Lit         | stringlit | intlit | floatlit | boollit
    ElemAttr    | (Id|Class|id)?tilde Attr ChildBlock?
    Event       | tilde Attr
    FuncCall    | bareword(Exp|openParen(Exp)*closeParen)?
    Control     | If | For | While
    If          | if Exp ChildBlock (else-if Exp ChildBlock)*(else ChildBlock)?
    For         | for id in (Array|stringlit|id) ChildBlock
    While       | while Exp ChildBlock
    Array*      | openSquare ((newline? indent? Exp+ newline? dedent?)|Range) closeSquare
    HashMap*    | openCurly newline? indent? ( stringlit colon Exp newline?)* dedent? closeCurly
    Range       | intLit range intLit
    Assignment  | id assignment Concatable
    TODO: function def
    TODO: import/template

    * Only match the optional dedent if there was an indent
*/

var lits = ["stringlit", "intlit", "floatlit", "boollit"];
var tags = ["bareword", "script", "style"];
var elemAttrStarts = ["dot", "hash", "tilde"];
var expBeginings = ["prefixop", "id", ...elemAttrStarts, "id", ...lits, "bareword", "openSquare", "openCurly", "openParen"];


module.exports = (scannerTokens, error, verbose) => {
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
        if( at(tags) ) {
            return Element();
        }
        return Concatable();
    };
    var Element = () => {
        log("Matching Element");

        let element = {
            "type": "element",
            "tag": Tag()
        };
        if( at("dot") ) {
            element.attrs = [Class()];
        }
        if( at("hash") ) {
            element.attrs = [Id()];
        }
        if( at("openParen") ) {
            element.attrs = [...(element.attrs||[]), Attrs()];
        }

        if( atSequential(["newline", "indent"]) ) {
            element.child = ChildBlock();
        }
        else if( at("tilde") ){
            element.event = Event();
            element.event.child = ChildBlock();
        }
        // So some function calls and some elements have the same syntax. The
        // way we determine what we're dealing with is context: if there is a
        // function with that name, use it. Otherwise, it's an element. This
        // is beyond the scope of the parser. So, for the time being, we will
        // label things but they will potentially be incorrect, i.e. we will
        // label things as function calls that are really elements. Fortunately, however, 
        else if( at() ){


            while( !at("newline") ) {
                let elemOrExp;
                if( at(tags) ){
                    elemOrExp = Element();
                }
                else {
                    elemOrExp = Exp();
                }
                element.child = [...(element.child || []), elemOrExp];
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
                attrs.push({
                    "type": Attr(),
                    "body": Exp()
                });
            }
            else{
                return error.expected('some attribute', tokens.shift());
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
            "body": []
        };
        if( at("id") ){
            js.body.push( match("id") );
        }
        do {
            js.body.push( match("js") );
            if( at("id") ){
                js.body.push( match("id") );
            }
            // If they put newlines in their JS, more power to them
            if( at("newline") ){
                js.body.push( match("newline") );
            }
        } while( at("js") );

        return js;
    }
    var CSSBlock = () => {
        log("Matching CSS Block");

        let css = {
            "type": "CSS Block",
            "body": []
        };
        if( at("id") ){
            css.body.push( match("id") );
        }
        do {
            css.body.push( match("css") );
            if( at("id") ){
                css.body.push( match("id") );
            }
            // If they put newlines in their CSS, more power to them
            if( at("newline") ){
                css.body.push( match("newline") );
            }
        } while( at("css") );

        return css;
    }
    var Tag = () => {
        log("Matching Tag");
        for( let tag in tags){
            if( at(tags[tag]) ){
                return match(tags[tag]);
            }
        }
        return error.expected('some kind of tag', tokens.shift());
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
    var Concatable = () => {
        log("Matching Concatable");

        var exp = [Exp()];

        while( at(expBeginings) ) {
            exp = [...exp, Exp()];
        }

        return exp;
    }
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
            
            let exp = Concatable();
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

        if( at(elemAttrStarts) || atSequential(["id", "tilde"]) ) {
            return ElemAttr();
        }
        else if( at(lits) ) {
            return Lit();
        }
        else if( at("id") ) {
            return match("id");
        }
        else if( at("bareword") ) {
            return FuncCall();
        }
        else if( at("openSquare") ) {
            return ArrayDef();
        }
        else if( at("openCurly") ) {
            return HashMap();
        }
        else {
            return error.expected('some kind of value', tokens.shift());
        }
    };           
    var Lit = () => {
        log("Matching Lit");

        for( let lit in lits ) {
            if( at(lits[lit]) ) {
                return match(lits[lit]);
            }
        }
        return error.expected('some kind of literal', tokens.shift());
    };  
    var ElemAttr = () => {
        log("Matching ElemAttr");

        let elemAttr = {
            "type": "elemattr"
        };
        if( at("id") ) {
            elemAttr.source = match("id");
        }
        else if( at("dot") ) {
            elemAttr.source = Class();
        }
        else if( at("hash") ) {
            elemAttr.source = Id();
        }
        else {
            elemAttr.source = "this";
        }

        match("tilde");

        elemAttr.attr = Attr();

        if( atSequential(["newline", "indent"]) ) {  
            elemAttr.child = ChildBlock();
        }

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
            if( at( expBeginings )){
                funcCall.args = [ Exp() ];
            }
        }

        return funcCall;
    };    
    var Control = () => {
        log("Matching Control block");

        if( at("if")) {
            return If();
        }
        else if( at("for") ) {
            return For();
        }
        else if( at("while") ) {
            return While();
        }
        else {
            return error.parse(`${tokens[0].text} is not a recognized control statement`, tokens.shift());
        }
    };   
    var If = () => {
        log("Matching If");

        let ifStatement = {
            "type": "if"
        };

        if( at("if") ) {
            match("if");

            ifStatement.condition = Exp();
            ifStatement.body = ChildBlock();

            while( at("else-if") ) {
                match("else-if");

                let thisIf = {
                    "condition": Exp(),
                    "body": ChildBlock()
                };
                
                let elseIfs = ifStatement["else-if"] || [];
                elseIfs.push(thisIf);
                ifStatement["else-if"] = elseIfs;
            }

            if( at("else") ) {
                match("else");

                ifStatement.else = ChildBlock()
            }
        }
        else {
            return error.expected('an if statement', tokens.shift());          
        }

        return ifStatement;
    };          
    var For = () => {
        log("Matching For");

        match('for');

        let forStatement = {
            "type": "for",
            "condition": {
                "type": "in",
                "a": match("id")
            }
        };

        match("in");

        if( at("openSquare") ) {
            forStatement.condition.b = ArrayDef();
        }
        else if( at("stringlit") ){
            forStatement.condition.b = match( "stringlit" );   
        }
        else if( at("id") ) {
            forStatement.condition.b = match( "id" );   
        }
        else{
            return error.expected('something you can loop over', tokens.shift()); 
        }
        forStatement.body = ChildBlock();

        return forStatement;
    };
    var While = () => {
        log("Matching While");

        if( at("while") ) {
            return {
                "type": "while",
                "condition": Exp(),
                "body": ChildBlock()
            };
        }
        else {
            return error.expected('an while statement', tokens.shift());
        }
    };     
    var ArrayDef = () => {
        log("Matching Array");

        match("openSquare");

        let arrayDef = {
            "type": "array",
        };

        if(atSequential(["intlit", "range"])) {
            arrayDef.elems = Range();
        }
        else{
            if( at("newline") ) {
                match("newline");
            }

            let indented = false;
            if( at("indent") ){
                match("indent");
                indented = true;
            }
            arrayDef.elems = [];
            do {
                arrayDef.push(Exp());
                if( at("newline") ) {
                    match("newline");
                }
            } while( !(at("closeSquare") || at("dedent")) );

            if( indented ) {
                match("dedent");
            }
        }
        match("closeSquare");

        return arrayDef;
    };
    var HashMap = () => {
        log("Matching HashMap");

        let hashMap = {
            "type": "hashmap",
            "props": []
        };

        match("openCurly");

        if( at("newline") ){
            match("newline");
        }

        let indented = false;
        if( at("indent") ){
            match("indent");
            indented = true;
        }

        while( at("stringlit") ){
            let prop = {
                "key": match("stringlit")
            };
            match("colon");
            prop.value = Exp();
            if( at("newline") ) {
                match("newline");
            }
            hashMap.props.push(prop);
        }
        if(indented){
            match("dedent");
        }
        match("closeCurly");

        return hashMap;
    };
    var Range = () => {
        log("Matching Range");

        let range = {
            "type": "range",
            "a": match("intLit")
        };
        match("range");
        range.b = match("intLit");
        return range;
    };
    var Assignment = () => {
        log("Matching Assignment");

        let assignment = {
            "type": "assignment",
            "id": match("id")
        };
        match("assignment");
        assignment.value = Concatable();

        return assignment;
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
            return error.parse(`Expected ${type}, got end of program`);
        }
        else if( type === undefined ||  type === tokens[0].type) {
            log(`Matched "${type}"` + (tokens[0].text ? ` with text "${tokens[0].text}"` : ""));
            lastToken = tokens.shift();
            log(`Tokens remaining: ${tokens.length}`);
            return lastToken;
        }
        else {
            return error.expected(type, tokens.shift());
        }
    };

    return Program();
};