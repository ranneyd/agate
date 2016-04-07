"use strict";
let ArrayDef = require("./entities/array");
let ArrayAt = require("./entities/arrayAt");
let Assignment = require("./entities/assignment");
let Attr = require("./entities/attr");
let BinaryExp = require("./entities/binaryExp");
let Block = require("./entities/block");
let Call = require("./entities/call");
let Def = require("./entities/def");
let ElemFunc = require("./entities/elemFunc");
let HashMap = require("./entities/hashMap");
let If = require("./entities/if");
let Include = require("./entities/include");
let Interable = require("./entities/iterable");
let Label = require("./entities/label");
let Literal = require("./entities/literal");
let Lookup = require("./entities/lookup");
let Program = require("./entities/program");
let Return = require("./entities/return");
let Selector = require("./entities/selector");
let SpecialBlock = require("./entities/specialBlock");
let Template = require("./entities/template");
let This = require("./entities/this");
let Token = require("./entities/token");
let UnaryExp = require("./entities/unaryExp");
let While = require("./entities/while");

var lits = ["stringlit", "intlit", "floatlit", "boollit"];
var builtins = ['script', 'style'];
var controlTypes = ['if', 'for', 'while'];
var binAssignOps = ["plus", "minus", "multop", "boolop"];

module.exports = (scannerTokens, error, verbose) => {
    var tokens = scannerTokens;
    var lastToken;

    var log = (message) => {
        if(verbose) {
            console.log(message);
        }
    };
    var matchLog = (message) => {
        log(message + ` at line ${tokens[0].line} col ${tokens[0].column}`);
    };

    var program = () => {
        matchLog("Matching the program");
        let tree = new Program( block() );
        match("EOF");
        return tree;
    };
    var block = () => {
        matchLog("Matching block");
        let statements = [];

        // If we get a dedent or an EOF, we have no more block
        while(!at("dedent") && !at("EOF")){
            while( at("newline") ) {
                match("newline");
            }
            let stmt = statement();

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

        return new Block(statements);
    };
    var statement = () => {
        matchLog("Matching a statement");

        if( at("comment") ) {
            return new Token( match("comment") );
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

    };
    var template = () => {
        matchLog('Matching template');

        let filename = match("template");
        let labels = [];
        if( at("newline") ) {
            match("newline");
            match("indent");
            do{
                labels.push({ 
                    "label": label(),
                    "body": childBlock()
                });
            } while ( !at("dedent") );

            match("dedent");
        }
        return new Template( filename, labels, verbose);
    };
    var label = () =>{
        matchLog("Matching label");
        match("openCurly");
        let ourLabel = new Label( match("bareword") );
        match("closeCurly");
        return ourLabel;
    };
    var childBlock = () => {
        matchLog("Matching childBlock");
        match("newline");
        match("indent");

        let ourBlock;

        if( at("js") ){
            ourBlock = JSBlock();
        }
        else if( at("css") ){
            ourBlock = CSSBlock();
        }
        else {
            ourBlock = block();
        }

        if( !at("EOF")){
            match("dedent");
        }
        return ourBlock;
    };
    var JSBlock = () => {
        matchLog("Matching JS Block");

        let statements = [];
        if( atExp() ){
            statements.push( Exp() );
        }
        do {
            statements.push( match("js") );
            if( atExp() ){
                statements.push( Exp() );
            }
            // If they put newlines in their JS, more power to them
            while( at("newline") ){
                match("newline");
            }
        } while( at("js") );

        return new SpecialBlock( statements, "js" );
    };
    var CSSBlock = () => {
        matchLog("Matching CSS Block");

        let statements = [];
        if( atExp() ){
            statements.push( exp() );
        }
        do {
            statements.push( match("css") );
            if( atExp() ){
                statements.push( exp() );
            }
            // If they put newlines in their CSS, more power to them
            while( at("newline") ){
                match("newline");
            }
        } while( at("css") );

        return new SpecialBlock( statements, "css" );
    };
    var control = () => {
        matchLog("Matching control block");

        if( at("if")) {
            return ifDef();
        }
        else if( at("for") ) {
            return forDef();
        }
        else if( at("while") ) {
            return whileDef();
        }
        else {
            error.parse(`${tokens[0].text} is not a recognized control statement`, tokens.shift());
        }
    };
    var ifDef = () => {
        matchLog("Matching if");

        let conditionals = [];

        if( at("if") ) {
            match("if");

            let condition = exp();
            debugger;

            conditionals.push({
                condition: condition,
                body: childBlock()
            });

            while( at("else-if") ) {
                match("else-if");

                conditionals.push({
                    condition: exp(),
                    body: childBlock()
                });
            }

            if( at("else") ) {
                match("else");

                conditionals.push({
                    body: childBlock()
                });
            }
        }
        else {
            error.expected('an if statement', tokens.shift());          
        }

        return new If( conditionals );
    };
    var forDef = () => {
        matchLog("Matching for");

        match('for');

        let ourId = match("id");
        match("in");

        return new For(ourId, iterable(), childBlock());
    };
    var iterable = () => {
        matchLog("Matching iterable");
        return new Iterable( exp() );
    }
    var arrayDef = () => {
        matchLog("Matching array");

        match("openSquare");

        let elems = [];
        if( !at("closeSquare") ){
            if(atSequential(["intlit", "range", "intlit"])) {
                let a = match("intlit");
                let aVal = parseInt( a.text() );
                
                match("range");
                
                let b = match("intlit");
                let bVal = parseInt( b.text() );

                if( isNaN(aVal) ){
                    error.parse(`'${a.text()}' has to be a number`, a);
                }
                else if( isNaN(bVal) ){
                    error.parse(`'${b.text()}' has to be a number`, b);
                }
                else{
                    if( aVal < bVal ) {
                        for( let i = aVal; i < bVal; ++i ){
                            elems.push( new Literal("Intlit", {
                                type: "intlit",
                                text: i,
                                line: a.line(),
                                column: a.column()
                            }));
                        }
                    }
                }
            }
            else if( at("newline") ) {
                elems = argBlock();
            }
            else {
                elems = [];
                do{
                    elems.push(arg());
                } while( !at("closeSquare") );
            }
        }
        match("closeSquare");

        return new ArrayDef( elems );
    };
    var argBlock = () => {
        matchLog("Matching argBlock");
        match("newline");
        match("indent");
        let ourArgs = [];
        do {
            ourArgs.push(arg());
            match("newline");
        } while( !at("dedent") );

        match("dedent");

        return ourArgs;
    };
    var arg = () => {
        matchLog("Matching arg");
        return exp();
    };
    var whileDef = () => {
        matchLog("Matching while");

        if( at("while") ) {
            return new While( exp(), childBlock() );
        }
        else {
            error.expected('a while statement', tokens.shift());
        }
    };
    var def = () => {
        matchLog("Matching definition");
        match("def");
        let name = new Token(match("bareword"));
        
        match("openParen");
        
        let params = [];
        while( at("id") ) {
            params.push( new Token(match("id")) );
            if( at("comma") ) {
                match("comma");
            }
        }
        
        match("closeParen");

        return new Def( name, params, childBlock() );
    };
    var exp = () => {
        matchLog("Matching exp");

        return ternaryIfExp();
    }
    var ternaryIfExp = () => {
        matchLog("Matching ternaryIfExp");

        let ourExp = boolExp();
        if( at("question") ) {
            match("question");
            
            ourExp = [{
                condition: ourExp,
                body: boolExp()
            }];

            match("colon");
            
            ourExp.push({ body: boolExp()});
        }
        return ourExp;
    };
    var boolExp = () => {
        matchLog("Matching boolExp");

        let ourExp = relExp();
        while( at("boolop") && !atSequential(["boolop", "equals"])) {
            let ourOp = match("boolop");
            ourExp = new BinaryExp( ourExp, relExp(), new Token(ourOp) );
        }
        return ourExp;
    };
    var relExp = () => {
        matchLog("Matching relExp");
        
        let ourExp = addExp();
        while( at("relop") && !atSequential(["relop", "equals"])) {
            let ourOp = match("relop");
            debugger;
            ourExp = new BinaryExp( ourExp, addExp(), new Token(ourOp) );
            debugger;
        }
        return ourExp;
    };
    var addExp = () => {
        matchLog("Matching addExp");
        let ourExp = multExp();
        while( at(["plus", "minus"])  && !atIndex("equals", 1) ) {
            let ourOp = at("plus") ? match("plus") : match("minus");
            ourExp = new BinaryExp( ourExp, multExp(), new Token(ourOp) );
        }
        return ourExp;
    };
    var multExp = () => {
        matchLog("Matching multExp");
        
        let ourExp = postfixExp();
        while( at("multop") && !atSequential(["multop", "equals"])) {
            let ourOp = match("multop");
            ourExp = new BinaryExp( ourExp, postfixExp(), new Token(ourOp) );
        }
        return ourExp;
    };
    var postfixExp = () => {
        matchLog("Matching postfixExp");

        let ourExp = elemFuncExp();
        if( at("postfixop") ) {
            ourExp = new UnaryExp( ourExp, new Token(match("postfixop")) );
        }
        return ourExp;
    };
    var elemFuncExp = () => {
        matchLog("Matching elemFuncExp");

        let ourExp = arrayElemExp();

        while ( at("tilde") ) {
            match("tilde")
            
            let func = match("bareword");
            let ourArgs = [];
            error.hint = "The ~ operator is for member functions only. Thus, if you don't put parens after, we're going to gobble up as many potential arguments as we can";
            
            if( atArgs() ) {
                ourArgs = args();
            }
            error.hint = "";

            ourExp = new ElemFunc( ourExp, func, ourArgs);
        }
        return ourExp;
    };
    var arrayElemExp = () => {
        matchLog("Matching arrayElemExp");

        let ourExp = miscExp();

        while( at("openSquare") ) {
            match("openSquare");
            let index;
            if( atSequential(["bareword", "closeSquare"]) ) {
                index = new Token(match("bareword"));
            }
            else {
                index = exp();
            }
            ourExp = new ArrayAt(ourExp, index);

            match("closeSquare");
        }
        return ourExp;
    };
    var miscExp = () => {
        matchLog("Matching miscExp");

        if( at(lits) ) {
            return literal();
        }
        else if( atSequential(["openCurly", "bareword", "closeCurly"]) ) {
            return label();
        }
        else if( at("include") ) {
            return include();
        }
        else if( at("openSquare") ){
            return arrayDef();
        }
        else if( at("openCurly") ) {
            return hashMap();
        }
        else if( at("id") ) {
            return new Token(match("id"));
        }
        else if( at("this") ) {
            return new This(match("this"));
        }
        else if( at(["dot", "hash"]) ) {
            return htmlSelect();
        }
        else if( at("openParen") ) {
            match("openParen");
            let exp = exp();
            match("closeParen");
            return exp;
        }
        else if( at(["prefixop", "minus"]) ) {
            let op = at("prefixop") ? match("prefixop") : match("minus");
            return new UnaryExp(exp(), op);
        }
        else if( at(["bareword", ...builtins])){
            return call();
        }
        else{
            error.expected('some kind of expression', tokens.shift());
        }
    };
    var literal = () => {
        matchLog("Matching literal");

        for( let lit of lits ) {
            if( at(lit) ) {
                if( at("stringlit") ) {
                    return stringDef();
                }
                else {
                    return new Literal(lit, match(lit));
                }
            }
        }
        error.expected('some kind of literal', tokens.shift());
    };
    var stringDef = () => {
        matchLog("Matching string");

        let actualStr = new Token(match("stringlit"));
        // Ditch those quotes son
        actualStr.text = actualStr.text.slice(1, -1);

        let str = new Literal("stringlit", actualStr);
        while( at("interpolate") ) {
            let interp = match("interpolate");
            let fakePlusToken = {
                type: "plus",
                line: interp.line,
                column: interp.column
            }
            let stringAndInter = new BinaryExp(str, exp(), fakePlusToken);
            interp = match("/interpolate");
            fakePlusToken = {
                type: "plus",
                line: interp.line,
                column: interp.column
            }
            str = new BinaryExp(
                stringAndInter, 
                new Literal("stringlit", match("stringlit")),
                fakePlusToken
            );
        }
        return str;
    }
    var include = () => {
        matchLog("Matching include");

        match("include");
        return new Include(match("stringlit"), verbose);
    };
    var call = () => {
        matchLog("Matching call");
        let name;
        let ourAttrs = [];
        let ourArgs = [];

        if( at(builtins) ){
            name = builtIn();
        }
        else{
            name = new Token(match("bareword"));
        }

        
        let classes = [];
        while( at("dot") ){
            classes.push(htmlClass());
        }
        if(classes.length > 0){
            ourAttrs.push( new Attr("class", classes) );
        }

        if( at("hash") ) {
            ourAttrs.push( new Attr("id", htmlId()) );
        }

        if( at("openSquare") ) {
            ourAttrs.concat( attrs() );
        }
        if( atArgs() ){
            ourArgs = args();
        }
        return new Call(name, ourAttrs, ourArgs);
    };
    var builtIn = () => {
        matchLog("Matching builtIn");

        for( let builtin of builtins ) {
            if( at(builtin) ) {
                return new Token(match(builtins));
            }
        }
        error.expected('some kind of built in function', tokens.shift());
    };
    var htmlSelect = () => {
        matchLog("Matching htmlSelect");

        if( at("dot") ){
            return htmlClass();
        }
        else {
            return htmlId();
        }
    };
    var htmlClass = () => {
        matchLog("Matching htmlClass");

        match("dot");
        let ourExp = match("bareword");
        // Because of the .
        ourExp.column--;
        return new Selector("HtmlClass", ourExp);
    }
    var htmlId = () => {
        matchLog("Matching htmlId");

        match("hash");
        let ourExp = match("bareword");
        // Because of the #
        ourExp.column--;
        return new Selector("HtmlId", ourExp);
    }
    var attrs = () => {
        matchLog("Matching attrs");
        
        match("openSquare")

        if( atBlock() ) {
            let ourBlock = attrBlock();
            match("closeSquare");
            return ourBlock;
        }

        let ourAttrs = [];

        while( !at("closeSquare") ) {
            ourAttrs.push(attr());
        } 

        match("closeSquare");

        return ourAttrs;
    };
    var attrBlock = () => {
        matchLog("Matching attrBlock");
        
        match("newline");
        match("indent");


        let ourAttrs = [];

        while( !at("dedent") ) {
            ourAttrs.push(attr());
            match("newline");
        } 

        match("dedent");

        return ourAttrs;
    };
    var attr = () => {
        matchLog("Matching attr");
        
        let key;
        let value;
        error.hint = "Did you use a reserved word as an index, like 'if', or did you forget an @ symbol?";
        if(at("stringlit")) {
            name = new Literal("stringlit", match("stringlit"));
        }
        else if(at(builtins)){
            name = builtIn();
        }
        else {
            name = new Token(match("bareword"));
        }
        error.hint = "";
        if(at("equals")) {
            match("equals");
        }
        else {
            match("colon");
        }
        value = exp();

        return new Attr(key, value);
    };
    var args = () => {
        matchLog("Matching args");
        
        if( at("openParen") ){
            match("openParen");
            let ourArgs = [];
            if( !at("closeParen") ) {
                ourArgs.push(arg());
            }
            while( !at("closeParen") ) {
                if( at("comma") ) {
                    match("comma");
                }
                ourArgs.push(arg());
            }
            match("closeParen");
            return ourArgs;
        }
        else if( atBlock() ){
            return childBlock().statements;
        }
        else{
            error.hint = "If you don't use parens or commas, we're going to try to gobble up as many expressions as we can as arguments.";
            let ourArgs = [arg()];
            while( at("comma") || atExp() ) {
                if( at("comma") ) {
                    match("comma");
                }
                ourArgs.push(arg());
            }
            error.hint = "";
            return ourArgs;
        }
    };
    var hashMap = () => {
        matchLog("Matching hashMap");

        match("openCurly");

        let pairs;

        if( atBlock() ) {
            pairs = attrBlock();
        }
        else {
            if( at("bareword") ) {
                pairs = [];

                while( !at("closeCurly") ) {
                    pairs.push(attr());
                } 
            }
        }

        match("closeCurly");

        return new HashMap(pairs);
    };
    
    
    // Returns true if the next token has type "type", or a type in "type" if
    // type is an array, false otherwise
    var at = ( type ) => {
        return atIndex( type, 0 );
    };
    var atIndex = ( type, i ) => {
        if(tokens.length <= i) {
            return false;
        }
        if(Array.isArray( type )) {
            for(let j = 0; j < type.length; ++j) {
                if( type[j] === tokens[i].type ) {
                    return true;
                }
            }
            return false;
        }
        return type === tokens[i].type;
    }
    // Like at except if type is an array, it checks one after the other.
    var atSequential = ( type ) => {
        for(let i = 0; i < type.length; ++i) {
            // If we don't have enough tokens or the token we're at doesn't
            // match, no sale. 
            if(tokens.length <= i || type[i] !== tokens[i].type) {
                return false;
            }
        }
        return true;
    };

    var atBlock = () =>{
        return atSequential(["newline", "indent"]);
    }

    var atArgs = () =>{
        return at("openParen") || atBlock() || atExp();
    }

    var atExp = () =>{
        return at([...lits,
                   "include",
                   "openSquare", 
                   "openCurly", 
                   "id", 
                   "this", 
                   "dot", 
                   "hash",
                   "openParen",
                   "prefixop",
                   "minus",
                   ...builtins,
                   "bareword"]);
    }

    // Pops off the top token if its type matches 'type', returns an error otherwise
    var match = ( type ) => {
        if( !tokens.length ) {
            error.parse(`Expected ${type}, got end of program`);
        }
        else if( type === undefined ||  type === tokens[0].type) {
            log(`Matched "${type}"` + (tokens[0].text ? ` with text "${tokens[0].text}"` : ""));
            lastToken = tokens.shift();
            log(`Tokens remaining: ${tokens.length}`);
            return lastToken;
        }
        else {
            error.expected(type, tokens.shift());
        }
    };

    return program();
};