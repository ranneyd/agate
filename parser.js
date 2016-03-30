"use strict";

ArrayDef = require("./entities/array");
ArrayAt = require("./entities/arrayAt");
Assignment = require("./entities/assignment");
BinaryExp = require("./entities/binaryExp");
Block = require("./entities/block");
Call = require("./entities/call");
Def = require("./entities/def");
ElemFunc = require("./entities/elemFunc");
HashMap = require("./entities/hashMap");
If = require("./entities/if");
Include = require("./entities/include");
Interable = require("./entities/iterable");
Label = require("./entities/label");
Literal = require("./entities/literal");
Lookup = require("./entities/lookup");
Program = require("./entities/program");
Return = require("./entities/return");
Selector = require("./entities/selector");
SpecialBlock = require("./entities/specialBlock");
Template = require("./entities/template");
This = require("./entities/this");
Token = require("./entities/token");
UnaryExp = require("./entities/unaryExp");
While = require("./entities/while");


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
            return definition();
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

        let ourTemp = match("template");
        let labels = [];
        if( at("newline") ) {
            match("newline");
            match("indent");
            do{
                labels.push( 
                    "label": label(),
                    "body": childBlock()
                );
            } while ( !at("dedent") );

            match("dedent");
        }
        return new Template( ourTemp, labels, verbose);
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
            statements.push( exp() );
        }
        do {
            statements.push( match("js") );
            if( atExp() ){
                statements.push( exp() );
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

            conditionals.push({
                condition: exp(),
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
        let name =  match("bareword");
        
        match("openParen");
        
        let params = [];
        while( at("id") ) {
            params.push( match("id") );
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
            ourExp = new BinaryExp( ourExp, relExp(), ourOp );
        }
        return ourExp;
    };
    var relExp = () => {
        matchLog("Matching relExp");
        
        let ourExp = addExp();
        while( at("relop") && !atSequential(["relop", "equals"])) {
            let ourOp = match("relop");
            ourExp = new BinaryExp( ourExp, addExp(), ourOp );
        }
        return ourExp;
    };
    var addExp = () => {
        matchLog("Matching addExp");
        let ourExp = multExp();
        while( at(["plus", "minus"])  && !atIndex("equals", 1) ) {
            let ourOp = at("plus") ? match("plus") : match("minus");
            ourExp = new BinaryExp( ourExp, multExp(), ourOp );
        }
        return ourExp;
    };
    var multExp = () => {
        matchLog("Matching multExp");
        
        let ourExp = postfixExp();
        while( at("multop") && !atSequential(["multop", "equals"])) {
            let ourOp = match("multop");
            ourExp = new BinaryExp( ourExp, postfixExp(), ourOp );
        }
        return ourExp;
    };
    var postfixExp = () => {
        matchLog("Matching postfixExp");

        let ourExp = elemFuncExp();
        if( at("postfixop") ) {
            ourExp = new UnaryExp( ourExp, match("postfixop") );
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
    var ArrayElemExp = () => {
        matchLog("Matching ArrayElemExp");

        let exp = MiscExp();

        while( at("openSquare") ) {
            let arrAt = ArrayAt();
            arrAt.of = exp;
            exp = arrAt;
        }
        return exp;
    };
    var ArrayAt = () => {
        matchLog("Matching ArrayAt");
        match("openSquare");

        let index;
        if( atSequential(["bareword", "closeSquare"]) ) {
            index = match("bareword");
        }
        else {
            index = Exp();
        }

        let exp = {
            "type": "elemat",
            "index": index,
        };

        match("closeSquare");

        return exp;
    };
    var MiscExp = () => {
        matchLog("Matching MiscExp");

        if( at(lits) ) {
            return Literal();
        }
        else if( atSequential(["openCurly", "bareword", "closeCurly"]) ) {
            return Label();
        }
        else if( at("include") ) {
            return Include();
        }
        else if( at("openSquare") ){
            return ArrayDef();
        }
        else if( at("openCurly") ) {
            return HashMap();
        }
        else if( at("id") ) {
            return match("id");
        }
        else if( at("this") ) {
            return match("this");
        }
        else if( at(["dot", "hash"]) ) {
            return HtmlSelect();
        }
        else if( at("openParen") ) {
            match("openParen");
            let exp = Exp();
            match("closeParen");
            return exp;
        }
        else if( at(["prefixop", "minus"]) ) {
            let exp = {
                "type":"prefixop",
                "op": at("prefixop") ? match("prefixop") : match("minus"),
                "body": Exp()
            };

            return exp;
        }
        else if( at(["bareword", ...builtins, "this"])){
            return Call();
        }
        else{
            error.expected('some kind of expression', tokens.shift());
        }
    };
    var Literal = () => {
        matchLog("Matching Literal");

        for( let lit in lits ) {
            if( at(lits[lit]) ) {
                if( at("stringlit") ) {
                    return StringDef();
                }
                else {
                    return match(lits[lit]);
                }
            }
        }
        error.expected('some kind of literal', tokens.shift());
    };
    var StringDef = () => {
        matchLog("Matching String");

        let str = match("stringlit");
        while( at("interpolate") ) {
            match("interpolate");
            let stringAndInter = {
                "type": "addop",
                "op": "plus",
                "a": str,
                "b": Exp()
            };
            match("/interpolate");
            str = {
                "type": "addop",
                "op": "plus",
                "a": stringAndInter,
                "b": match("stringlit")
            };
        }
        return str;
    }
    var Include = () => {
        matchLog("Matching Include");

        match("include");
        return {
            "type": "include",
            "file": match("stringlit")
        }
    };
    var Call = () => {
        matchLog("Matching Call");
        let call = {
            "type": "call"
        };

        if( at(builtins) ){
            call.callee = BuiltIn();
        }
        else if( at("this") ) {
            call.calle = match("this");
        }
        else {
            call.callee = match("bareword");
        }

        let classes = [];
        while( at("dot") ){
            classes.push(HtmlClass());
        }
        if(classes.length > 0){
            call.classes = classes;
        }

        if( at("hash") ) {
            call.id = HtmlId();
        }

        if( at("openSquare") ) {
            call.attrs = Attrs();
        }
        if( atArgs() ){
            call.args = Args();
        }
        return call;
    };
    var BuiltIn = () => {
        matchLog("Matching BuiltIn");

        for( let builtin in builtins ) {
            if( at(builtins[builtin]) ) {
                return match(builtins[builtin]);
            }
        }
        error.expected('some kind of built in function', tokens.shift());
    };
    var HtmlSelect = () => {
        matchLog("Matching HtmlSelect");

        if( at("dot") ){
            return HtmlClass();
        }
        else {
            return HtmlId();
        }
    };
    var HtmlClass = () => {
        matchLog("Matching HtmlClass");

        match("dot");
        let exp = match("bareword");
        exp.type = "htmlclass";
        // Because of the .
        exp.column--;
        return exp;
    }
    var HtmlId = () => {
        matchLog("Matching HtmlId");

        match("hash");
        let exp = match("bareword");
        exp.type = "htmlid";
        // Because of the #
        exp.column--;
        return exp;
    }
    var Attrs = () => {
        matchLog("Matching Attrs");
        
        match("openSquare")

        if( atBlock() ) {
            let block =  AttrBlock();
            match("closeSquare");
            return block;
        }

        let attrs = [];

        while( !at("closeSquare") ) {
            attrs.push(Attr());
        } 

        match("closeSquare");

        return attrs;
    };
    var AttrBlock = () => {
        matchLog("Matching AttrBlock");
        
        match("newline");
        match("indent");


        let attrs = [];

        while( !at("dedent") ) {
            attrs.push(Attr());
            match("newline");
        } 

        match("dedent");

        return attrs;
    };
    var Attr = () => {
        matchLog("Matching Attr");
        
        let attr = {};
        error.hint = "Did you use a reserved word as an index, like 'if', or did you forget an @ symbol?";
        if(at("stringlit")) {
            attr.name = match("stringlit");
        }
        else if(at(builtins)){
            attr.name = BuiltIn();
        }
        else {
            attr.name = match("bareword");
        }
        error.hint = "";
        if(at("equals")) {
            match("equals");
        }
        else {
            match("colon");
        }
        attr.value = Exp();

        return attr;
    };
    var Args = () => {
        matchLog("Matching Args");
        
        if( at("openParen") ){
            match("openParen");
            let args = [];
            if( !at("closeParen") ) {
                args.push(Arg());
            }
            while( !at("closeParen") ) {
                if( at("comma") ) {
                    match("comma");
                }
                args.push(Arg());
            }
            match("closeParen");
            return args;
        }
        else if( atBlock() ){
            return ChildBlock();
        }
        else{
            error.hint = "If you don't use parens or commas, we're going to try to gobble up as many expressions as we can as arguments.";
            let args = [Arg()];
            while( at("comma") || atExp() ) {
                if( at("comma") ) {
                    match("comma");
                }
                args.push(Arg());
            }
            error.hint = "";
            return args;
        }
    };
    var HashMap = () => {
        matchLog("Matching HashMap");

        match("openCurly");

        let hash = {
            "type": "hashmap"
        };

        if( atBlock() ) {
            hash.pairs = AttrBlock();
        }
        else {
            if( at("bareword") ) {
                hash.pairs = [];

                while( !at("closeCurly") ) {
                    hash.pairs.push(Attr());
                } 
            }
        }

        match("closeCurly");

        return hash;
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