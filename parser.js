"use strict";

var lits = ["stringlit", "intlit", "floatlit", "boollit"];
var builtins = ['script', 'style'];
var controlTypes = ['if', 'for', 'while'];

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
            "block": Block()
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

        while( at("newline") ) {
            match("newline");
        }

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
                do{
                    match("newline");
                } while( at("newline") );
            }
        }

        block.statements = statements;
        return block;
    };
    var Statement = () => {
        log("Matching a Statement");

        if ( at('widget') ) {
            return match('widget');
        }
        else if ( at('template') ) {
            return Template();
        }
        else if( at(controlTypes) ) {
            return Control();
        }
        else if( atSequential(["id", "equals"]) ) {
            return Assignment();
        }
        else if( at("def") ) {
            return Definition();
        }
        else if( at("comment") ) {
            return match("comment");
        }
        else{
            return Exp();
        }
    };
    var Template = () => {
        log('Matching Template');

        let template = {
            "type": "template",
            "template": match("template")
        };
        if( at("newline") ) {
            match("newline");
            match("indent");
            let labels = [];
            do{
                labels.push({
                    "label": match("label"),
                    "body": ChildBlock()
                });
            } while ( !at("dedent") );

            template.labels = labels;
            match("dedent");
        }
        return template;
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
            "id": match("id")
        };

        match("in");

        if( at("openSquare") ) {
            forStatement.interable = ArrayDef();
        }
        else if( at("stringlit") ){
            forStatement.interable = match( "stringlit" );   
        }
        else if( at("id") ) {
            forStatement.iterable = match( "id" );   
        }
        else{
            return error.expected('something you can loop over', tokens.shift()); 
        }
        forStatement.body = ChildBlock();

        return forStatement;
    };
    var ArrayDef = () => {
        log("Matching Array");

        match("openSquare");

        let arrayDef = {
            "type": "array",
        };
        if( !at("closeSquare") ){
            if(at("intlit")) {
                arrayDef.elems = {
                    "type": "range",
                    "a": match("intlit")
                }
                match("range");
                arrayDefs.elems.b = match("intlit");
            }
            else if( at("newline") ) {
                arrayDef.elems = ArgBlock();
            }
            else {
                arrayDef.elems = [];
                do{
                    arrayDef.elems.push(Arg());
                } while( !at("closeSquare") );
            }
        }
        match("closeSquare");

        return arrayDef;
    };
    var ArgBlock = () => {
        log("Matching ArgBlock");
        match("newline");
        match("indent");
        let args = [];
        do {
            args.push(Arg());
            match("newline");
        } while( !at("dedent") );

        match("dedent");

        return args;
    };
    var Arg = () => {
        log("Matching Arg");
        return Exp();
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
            return error.expected('a while statement', tokens.shift());
        }
    };
    var Assignment = () => {
        log("Matching Assignment");

        let assignment = {
            "type": "assignment",
            "id": match("id")
        };
        match("equals");
        assignment.value = Exp();

        return assignment;
    };
    var Definition = () => {
        match("def");
        let func = {
            "type": "definition",
            "name": match("bareword"),
        };
        
        match("openParen");
        
        let params = [];
        while( at("id") ) {
            params.push( at("id") );
        }
        if(params.length > 0){
            func.params = params;
        }
        
        match("closeParen");
        
        func.body = ChildBlock();

        return func;
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

        let exp = Exp6();
        if ( at("postfixop") ) {
            return {
                "type": "postfixop",
                "op": match("postfixop"),
                "body": exp
            };
        }
        return exp;
    };     
    var Exp6 = () => {
        log("Matching Exp6");

        let exp;

        // If we're not at a tilde, we def have an Exp7
        if(!at("tilde")){
            exp = Exp7();
        }

        // We could have an Exp7 or not have an Exp7. Either way, if we have a
        // tilde here, it's game time
        if ( at("tilde") ) {
            match("tilde")
            
            exp = {
                "type": "elemattr",
                "elem": exp,
                "attr": match("bareword")
            };
            if( at(["openParen", "bareword", "newline"])){
                exp.args = Args();
            }
        }
        return exp;
    };     
    var Exp7 = () => {
        log("Matching Exp7");

        if( at(lits) ) {
            return Literal();
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
        else if( at("dot") ) {
            return HtmlClass();
        }
        else if( at("hash") ) {
            return HtmlId();
        }
        else if( at("openParen") ) {
            match("openParen");
            let exp = Exp();
            match("closeParen");
            return exp;
        }
        else if( at(["prefixop", "addop"]) ) {
            let exp = {
                "type":"prefixop"
            };
            if( at("prefixop") ){
                exp.op = match("prefixop");
            }
            else{
                exp.op = match("addop");
            }
            exp.body = Exp();

            return exp;
        }
        else if( at(["bareword", ...builtins])){
            return Call();
        }
        else{
            return error.expected('some kind of expression', tokens.shift());
        }
    };           
    var Literal = () => {
        log("Matching Literal");

        for( let lit in lits ) {
            if( at(lits[lit]) ) {
                return match(lits[lit]);
            }
        }
        return error.expected('some kind of literal', tokens.shift());
    };
    var Call = () => {
        log("Matching Call");
        let call = {
            "type": "call"
        };

        if( at(builtins) ){
            call.callee = BuiltIn();
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
        call.args = Args();
        return call;
    };
    var BuiltIn = () => {
        log("Matching BuiltIn");

        for( let builtin in builtins ) {
            if( at(builtins[builtin]) ) {
                return match(builtins[builtin]);
            }
        }
        return error.expected('some kind of built in function', tokens.shift());
    };
    var HtmlClass = () => {
        log("Matching HtmlClass");

        match("dot");
        return match("bareword");
    }
    var HtmlId = () => {
        log("Matching HtmlId");

        match("hash");
        return match("bareword");
    }
    var Attrs = () => {
        log("Matching Attrs");
        
        match("openSquare")

        if( atBlock() ) {
            return AttrBlock();
        }

        let attrs = [];

        while( !at("closeSquare") ) {
            attrs.push(Attr());
        } 

        match("closeSquare");

        return attrs;
    };
    var AttrBlock = () => {
        log("Matching AttrBlock");
        
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
        log("Matching Attr");
        
        let attr = {
            "name": match("stringlit")
        };
        match("equals");
        attr.value = Exp();

        return attr;
    };
    var Args = () => {
        log("Matching Args");
        
        if( at("openParen") ){
            match("openParen");
            let args = [];
            while(!at("closeParen")) {
                args.push(Arg());
            }
            match("closeParen");
            return args;
        }
        else if( atBlock() ){
            // ooooo I'm cheating, but this makes the tree look a lot nicer and make more sense
            return ChildBlock().statements;
        }
        else{
            error.hint = "Are you calling a function with no parameters, but missing parentheses (i.e. @elem~foo instead of @elem~foo())?";
            let arg = [Arg()];
            error.hint = "";
            return arg;
        }
    };
    var HashMap = () => {
        log("Matching HashMap");

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

    var atBlock = () =>{
        return atSequential(["newline", "indent"]);
    }

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