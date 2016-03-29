"use strict";

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

    var Program = () => {
        matchLog("Matching the program");
        let tree = {
            "type":"program",
            "block": Block()
        };
        match("EOF");
        return tree;
    };
    var Block = () => {
        matchLog("Matching Block");
        let statements = [];

        // If we get a dedent or an EOF, we have no more block
        while(!at("dedent") && !at("EOF")){
            while( at("newline") ) {
                match("newline");
            }
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

        return statements;
    };
    var Statement = () => {
        matchLog("Matching a Statement");

        if( at("comment") ) {
            return match("comment");
        }
        else if ( at('template') ) {
            return Template();
        }
        else if( at(controlTypes) ) {
            return Control();
        }
        else if( at("def") ) {
            return Definition();
        }
        else if( at("return") ) {
            match("return");
            return {
                "type": "return",
                "value": Exp()
            };
        }
        else if( atExp() ){
            let exp = Exp();
            if( at("equals") || at(binAssignOps) ) {
                let assignment = {
                    "type": "assignment",
                    "lhs": exp
                };
                if( at(binAssignOps) ){
                    if( at("boolop") ) {
                        assignment.value = {
                            "type": "boolop",
                            "op": match("boolop"),
                            "a": assignment.id
                        };
                    }
                    else if( at("multop") ) {
                        assignment.value = {
                            "type": "multop",
                            "op": match("multop"),
                            "a": assignment.id
                        };
                    }
                    else {
                        error.hint = "You have 'id *something*= *stuff*' and we're trying to figure out"
                                   + "what the *something* means. We're looking for stuff like +=, -= etc";
                        assignment.value = {
                            "type": "addop",
                            "op": at("minus") ? match("minus") : match("plus"),
                            "a": assignment.id
                        };
                    }
                    match("equals")
                    assignment.value.b = Exp();
                }
                else {
                    match("equals");
                    assignment.value = Exp();
                }
                exp = assignment;
            }
            return exp;
        }
        else {
            error.hint = "Did you put a blank line without indentation?";
            error.expected("some kind of statement", tokens.shift());
            error.hint = "";
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
                    "label": Label(),
                    "body": ChildBlock()
                });
            } while ( !at("dedent") );

            template.labels = labels;
            match("dedent");
        }
        return template;
    };
    var Label = () =>{
        matchLog("Matching Label");
        match("openCurly");
        let label = { 
            type: "Label,",
            label: match("bareword")
        };
        match("closeCurly");
        return label;
    };
    var ChildBlock = () => {
        matchLog("Matching ChildBlock");
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
        matchLog("Matching JS Block");

        let js = {
            "type": "JS Block",
            "body": []
        };
        if( atExp() ){
            js.body.push( Exp() );
        }
        do {
            js.body.push( match("js") );
            if( atExp() ){
                js.body.push( Exp() );
            }
            // If they put newlines in their JS, more power to them
            while( at("newline") ){
                match("newline");
            }
        } while( at("js") );

        return js;
    };
    var CSSBlock = () => {
        matchLog("Matching CSS Block");

        let css = {
            "type": "CSS Block",
            "body": []
        };
        if( atExp() ){
            css.body.push( Exp() );
        }
        do {
            css.body.push( match("css") );
            if( atExp() ){
                css.body.push( Exp() );
            }
            // If they put newlines in their CSS, more power to them
            while( at("newline") ){
                match("newline");
            }
        } while( at("css") );

        return css;
    };
    var IdWithAttr = () => {
        matchLog("Matching IdWithAttr");
        let id = match("id");

        while( at("openSquare") ) {
            let arrAt = ArrayAt();
            arrAt.of = id;
            id = arrAt;
        }

        return id;
    }
    var Control = () => {
        matchLog("Matching Control block");

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
            error.parse(`${tokens[0].text} is not a recognized control statement`, tokens.shift());
        }
    };
    var If = () => {
        matchLog("Matching If");

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
            error.expected('an if statement', tokens.shift());          
        }

        return ifStatement;
    };
    var For = () => {
        matchLog("Matching For");

        match('for');

        let forStatement = {
            "type": "for",
            "id": match("id")
        };

        match("in");

        forStatement.iterable = Iterable();
        forStatement.body = ChildBlock();

        return forStatement;
    };
    var Iterable = () => {
        matchLog("Matching Iterable");
        return Exp();
    }
    var ArrayDef = () => {
        matchLog("Matching Array");

        match("openSquare");

        let arrayDef = {
            "type": "array",
        };
        if( !at("closeSquare") ){
            if(atSequential(["intlit", "range", "intlit"])) {
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
        matchLog("Matching ArgBlock");
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
        matchLog("Matching Arg");
        return Exp();
    };
    var While = () => {
        matchLog("Matching While");

        if( at("while") ) {
            return {
                "type": "while",
                "condition": Exp(),
                "body": ChildBlock()
            };
        }
        else {
            error.expected('a while statement', tokens.shift());
        }
    };
    var Definition = () => {
        matchLog("Matching Definition");
        match("def");
        let func = {
            "type": "definition",
            "name": match("bareword"),
        };
        
        match("openParen");
        
        let params = [];
        while( at("id") ) {
            params.push( match("id") );
            if( at("comma") ) {
                match("comma");
            }
        }
        if(params.length > 0){
            func.params = params;
        }
        
        match("closeParen");
        
        func.body = ChildBlock();

        return func;
    };
    var Exp = () => {
        matchLog("Matching Exp");

        return TernaryIfExp();
    }
    var TernaryIfExp = () => {
        matchLog("Matching TernaryIfExp");

        let exp = BoolExp();
        if( at("question") ) {
            match("question");
            let ternary = {
                "type": "ternary",
                "condition": exp,
                "if": BoolExp()
            };
            match("colon");
            ternary.else = BoolExp();
            
            exp = ternary;
        }
        return exp;
    };
    var BoolExp = () => {
        matchLog("Matching BoolExp");

        let exp = RelExp();
        while( at("boolop") && !atSequential(["boolop", "equals"])) {
            let boolop = {
                "type": "boolop",
                "op": match("boolop"),
                "a": exp,
                "b": RelExp()
            };

            exp = boolop;
        }
        return exp;
    };
    var RelExp = () => {
        matchLog("Matching RelExp");
        let exp = AddExp();
        while( at("relop") ) {
           let relop = {
                "type": "relop",
                "op": match("relop"),
                "a": exp,
                "b": AddExp()
            };
            exp = relop;
        }
        return exp;
    };
    var AddExp = () => {
        matchLog("Matching AddExp");
        let exp = MultExp();
        while( at(["plus", "minus"])  && !atIndex("equals", 1) ) {
            let addop = {
                "type": "addop",
                "op": at("plus") ? match("plus") : match("minus"),
                "a": exp,
                "b": MultExp()
            };
            exp = addop;
        }
        return exp;
    };
    var MultExp = () => {
        matchLog("Matching MultExp");
        let exp = PostfixExp();
        while( at("multop")  && !atSequential(["multop", "equals"]) ) {
            let multop = {
                "type": "multop",
                "op": match("multop"),
                "a": exp,
                "b": PostfixExp()
            };
            exp = multop;
        }
        return exp;
    };
    var PostfixExp = () => {
        matchLog("Matching PostfixExp");

        let exp = ElemFuncExp();
        if ( at("postfixop") ) {
            return {
                "type": "postfixop",
                "op": match("postfixop"),
                "body": exp
            };
        }
        return exp;
    };
    var ElemFuncExp = () => {
        matchLog("Matching ElemFuncExp");

        let exp = ArrayElemExp();

        while ( at("tilde") ) {
            match("tilde")
            
            exp = {
                "type": "elemfunc",
                "elem": exp,
                "func": match("bareword")
            };
            error.hint = "The ~ operator is for member functions only. Thus, if you don't put parens after, we're going to gobble up as many potential arguments as we can";
            if( atArgs() ) {
                exp.args = Args();
            }
            error.hint = "";
        }
        return exp;
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

    return Program();
};