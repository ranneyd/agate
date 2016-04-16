"use strict";

/*
    Microsyntax
    token      | match
    ---------------------------------------------------------
    intlit     | \d+
    floatlit   | (\.\d+|\d+(\.\d+)?)([Ee]\d+)?
    stringlit  | ('([^'\\]|(\\''))*'|"([^"\\]|(\\"))*")
    boollit    | (true)|(false)
    comment    | \/\/[^\r\n]*
    id         | @[A-Za-z0-9_-]+
    relop      | \<|\>|(\<\=)|(\=\=)|(\!\=)|(\>\=)
    prefixop   | \!|\+\+|--
    postfixop  | \+\+|--
    plus       | \+
    minus      | -
    multop     | \*|\/|\%
    boolop     | and|or|xor
    newline    | (\r\n|\r|\n)+
    indent     | complicated
    dedent     | also complicated
    template   | \|.+?[\r\n]+
    equals     | =
    openParen  | \(
    closeParen | \)
    openCurly  | \{
    closeCurly | \}
    openSquare | \[
    closeSquare| \]
    question   | \?
    colon      | \:
    this       | \^
    comma      | ,
    hash       | #
    dot        | \.
    def        | def
    return     | return
    bareword   | [a-zA-Z_-][a-zA-Z0-9_-]+
    script     | script + complicated
    js         | [^\n\r].+?(?=(\r\n|\r|\n)|('@))
    style      | style + complicated
    css        | [^\n\r].+?(?=(\r\n|\r|\n)|(@))
    include    | > *(.+?)(?=[\n\r])
    template   | \| *(.+?)(?=[\n\r])
    unbuffered | \/\/![^\r\n]*
    range      | \.\.
*/

module.exports = (data, error, verbose) => {

    var log = (message) => {
        if(verbose) {
            console.log(message);
        }
    };

    var keywords = ["def", "if", "else if", "else", "for", "in", "while", "return", "include"];
    var regexes = [
        {
            "type": "comment",
            "regex": /^\/\/\![^\r\n]*/
        },
        {
            "type": "question",
            "regex": /^\?/,
            "notext": true
        },
        {
            "type": "colon",
            "regex": /^:/,
            "notext": true
        },
        {
            "type": "this",
            "regex": /^\^/,
            "notext": true
        },
        {
            "type": "comma",
            "regex": /^,/,
            "notext": true
        },
        {
            "type": "range",
            "regex": /^\.\./,
            "notext": true
        },
        {
            "type": "relop",
            "regex": /^((<\=)|(\=\=)|(!\=)|(>\=)|<|>)/
        },
        {
            "type": "prefixop",
            "regex": /^(!|\+\+|--)/
        },
        {
            "type": "postfixop",
            "regex": /^(\+\+|--)/
        },
        {
            "type": "plus",
            "regex": /^\+/,
            "notext": true
        },
        {
            "type": "minus",
            "regex": /^-/,
            "notext": true
        },
        {
            "type": "multop",
            "regex": /^(\*|\/|\%)/
        },
        {
            "type": "boolop",
            "regex": /^(and|or|xor)/
        },
        {
            "type": "bareword",
            "regex": /^[a-zA-Z_][a-zA-Z0-9_]*/
        },
        {
            "type": "floatlit",
            "regex": /^(\.\d+([Ee]\d+)?|\d+(\.\d+([Ee]\d+)?|\d+([Ee]\d+)))/
        },
        {
            "type": "intlit",
            "regex": /^\d+/
        },
        {
            "type": "openParen",
            "regex": /^\(/,
            "notext": true
        },
        {
            "type": "closeParen",
            "regex": /^\)/,
            "notext": true
        },
        {
            "type": "openCurly",
            "regex": /^\{/,
            "notext": true
        },
        {
            "type": "closeCurly",
            "regex": /^\}/,
            "notext": true
        },
        {
            "type": "openSquare",
            "regex": /^\[/,
            "notext": true
        },
        {
            "type": "closeSquare",
            "regex": /^\]/,
            "notext": true
        },
        {
            "type": "hash",
            "regex": /^#/,
            "notext": true
        },
        {
            "type": "dot",
            "regex": /^\./,
            "notext": true
        },
        {
            "type": "tilde",
            "regex": /^~/,
            "notext": true
        },
        {
            "type": "equals",
            "regex": /^=/,
            "notext": true
        }
    ];

    var tokens = [];
    var indent = {
        elems: [0],
        pop: function () {
            return this.elems.pop();
        },
        push: function ( elem ) {
            this.elems.push( elem );
        },
        peek: function () {
            return this.elems[this.elems.length - 1];
        },
        isTop: function ( elem ) {
            return this.peek() === elem;
        },
        isEmpty: function () {
            return !this.elems.length;
        }
    };
    var line = 1;
    var column = 1;
    var position = 0;
    var jsMode = false;
    var cssMode = false;
    var newModeTrigger = false;
    var interpolating = false;
    var codeEscape = false;
        // I don't trust javascript to optimize this and not call length every time
    var dataLength = data.length;
    var token = function(type, text){
            var ourToken = {
                "type": type,
                "line": line,
                "column": column
            };
            if (text !== undefined) {
                ourToken.text = text;
            }
            return ourToken;
        };

    while( position < dataLength ) {
        var truncData = data.slice( position );
        var matchData;
        var notMatched = true;

        log(`Scanning at line ${line} col ${column}`);
        // Some complicated ones we need to preempt

        if(codeEscape && truncData.slice(0, 2) === "}'") {
            codeEscape = false;
            newModeTrigger = true;
            column += 2;
            position += 2;

            truncData = truncData.slice(2);
        }
        // Since JS and CSS are separate token sets, we have to use these flags to determine when
        // we're looking at them.
        if ( newModeTrigger && !codeEscape) {
            if ( matchData = /^(.*?)('\$\{|\r?\n|$)/.exec( truncData ) ) {

                if(matchData[0].match(/^\r?\n/)){
                    notMatched = true;
                }
                else {
                    tokens.push( token(jsMode ? "js" : "css", matchData[1] || "" ) );

                    // If the last 3 characters are "'${", we have an interpolation situation
                    if ( matchData[2] === "'${" ) {
                        codeEscape = true;
                        newModeTrigger = false;
                        column += 3;
                        position += 3;
                        notMatched = false;
                    }

                    column += matchData[1].length;
                    position += matchData[1].length;
                    notMatched = false;
                    // EOF
                    if(matchData[2] === "") {
                        position++;
                    }
                }
            }
        }
        else {
            // Comments for ignoring
            if( matchData = /^\/\/(?!!)[^\r\n]*(\r?\n)/.exec( truncData ) ) {
                log("I see a comment")
                line++;
                column = 1;
                position += matchData[0].length;
                notMatched = false;
            }
            // string literals are a little complicated
            if( matchData = /^"([^"\\\r\n]|(\\")|(\\\\))*("|\r?\n)/.exec( truncData ) ) {
                let stringToken = token("stringlit", matchData[0].slice(1,-1).replace(/\r?\n$/, " "))
                column += matchData[0].length;
                position += matchData[0].length;

                let lastGroup = matchData[matchData.length - 1];

                // If we end with a newline, not a quote
                if(lastGroup.charAt(lastGroup.length - 1) === "\n") {
                    column = 1;
                    line++;
                    truncData = data.slice( position );
                    // Note: no beginning quote
                    while( matchData = /([^"\\\r\n]|(\\")|(\\\\))*("|\r?\n)/.exec( truncData ) ) {
                        let stringAddon = matchData[0].replace(/(^ +)|\r?\n/g, " ");

                        stringToken.text += stringAddon;
                        position += matchData[0].length;

                        lastGroup = matchData[matchData.length - 1];
                        if(lastGroup.charAt(lastGroup.length - 1) === "\n") {
                            column = 1;
                            line++;
                            truncData = data.slice( position );
                        }
                        else {
                            column += matchData[0].length;
                            break;
                        }
                    }
                }

                tokens.push( stringToken );
                notMatched = false;
            }
            if( interpolating && truncData.charAt(0) === "}" ) {
                tokens.push( token("/interpolate") );
                interpolating = false;
                // some 1337 hax here to replace first character, since apparently
                // that isn't a thing in javascript
                truncData = truncData.replace(/^./, "'");
            }
            if( matchData = /^'([^'\\\r\n]|(\\')|(\\\\))*?('|\r?\n|\$\{)/.exec( truncData )) {
                let stringToken = token("stringlit", matchData[0].slice(1,-1).replace(/\r?\n$/, " "))
                column += matchData[0].length;
                position += matchData[0].length;

                let lastGroup = matchData[matchData.length - 1];

                // If we end with a newline
                if(lastGroup.charAt(lastGroup.length - 1) === "\n") {
                    column = 1;
                    line++;
                    truncData = data.slice( position );
                    // Note: no beginning quote
                    while( matchData = /([^'\\\r\n]|(\\")|(\\\\))*("|\r?\n)/.exec( truncData ) ) {
                        let stringAddon = matchData[0].replace(/(^ +)|\r?\n/g, " ");

                        stringToken.text += stringAddon;
                        position += matchData[0].length;

                        lastGroup = matchData[matchData.length - 1];
                        if(lastGroup.charAt(lastGroup.length - 1) === "\n") {
                            column = 1;
                            line++;
                            truncData = data.slice( position );
                        }
                        else {
                            column += matchData[0].length;
                            break;
                        }
                    }
                }

                if(lastGroup === "${") {
                    // Because we handle the beginning and ending quotes for normal strings, our
                    // last character get knocked off. This is usually a quote, but in this case
                    // it's a {. This still triggers because the last matching group is unchanged.
                    // So our string was `'...${` and now it's `...$`. So we need to just knock off
                    // the $ and we're good!
                    stringToken.text = stringToken.text.slice(0, -1);
                    interpolating = true;

                    tokens.push( stringToken );

                    tokens.push( token("interpolate") );
                }
                else{
                    tokens.push( stringToken );
                }

                notMatched = false;
            }
            if (matchData = /^(script|style)/.exec( truncData ) ) {
                tokens.push( token(matchData[0]) );

                column += matchData[0].length;
                position += matchData[0].length;
                notMatched = false;
                jsMode = matchData[0] === "script";
                cssMode = !jsMode;
            }
            if (matchData = /^(=|:)/.exec( truncData ) ) {
                // If we just matched a style or a script, it's actually an attribute
                let lastType = tokens[tokens.length - 1].type;
                if(lastType === "script" || lastType === "style") {
                    jsMode = false;
                    cssMode = false;
                }
            }
            // Template
            if (matchData = /^\| *(.+?)(?=[\n\r])/.exec( truncData )) {
                tokens.push( token("template", matchData[1]) );
                column += matchData[0].length;
                position += matchData[0].length;

                notMatched = false;
            }
        }

        // Match the keywords in a special way
        for ( let keyword in keywords ) {
            let keywordRegex = new RegExp(`^${keywords[keyword]}(?![A-Za-z$_])`);
            if( notMatched && (matchData = keywordRegex.exec( truncData ))) {
                // Replace spaces with dashed (else if => else-if)
                tokens.push( token(matchData[0].replace(" ", "-"), false) );
                column += matchData[0].length;
                position += matchData[0].length;
                notMatched = false;
            }
        }
        // Simples cases handled here. If we match something, notMatched will be false so we won't
        // do the stuff down there
        for ( var type in regexes ) {
            let ourType = regexes[type];
            if ( notMatched && (matchData = ourType.regex.exec( truncData ) ) ) {
                // I care this much
                let an = ["a","e","i","o","u"].indexOf(ourType.type.charAt(0)) !== -1 ? "an" : "a";
                log(`I see ${an} ${ourType.type} at line ${line} col ${column}`)
                tokens.push( token(ourType.type, ourType.notext ? false : matchData[0] ) );

                column += matchData[0].length;
                position += matchData[0].length;
                notMatched = false;
            }
        }

        // More complicated ones
        if( notMatched ) {
            if( matchData =/^@([A-Za-z0-9_]+)/.exec( truncData )) {
                tokens.push( token("id", matchData[matchData.length - 1]) );

                column += matchData[0].length;
                position += matchData[0].length;
            }
            // newline and indentation
            else if ( matchData = /^(\r?\n)+([\t ]*)/.exec( truncData ) ) {
                // This is inspired heavily by Python
                // https://docs.python.org/3/reference/lexical_analysis.html
                // extra newlines can really mess up indentation
                for( let i = 0; i < matchData[0].length; ++i) {
                    let character = matchData[0].charAt(i);
                    // ignore those pesky /r's
                    if( character === "\n") {
                        log(`Newline at line ${line} col ${column}`);
                        tokens.push( token("newline") );
                        column = 1;
                        line++;
                    }
                }


                // Last matching group is the indentation. Note one tab = one space because we don't
                // respect people who mix spaces and tabs. Technically, however, if you use only
                // tabs it will work fine
                var indentSize = matchData[matchData.length - 1].length;

                // Encapsulating this so I can use it in the js/css mode also
                var dedentDetect = function(indentSize){
                    log(`looking for an indent size of ${indentSize}`);
                    log(`Removing indent level ${indent.pop()}`);
                    error.hint = "";
                    tokens.push( token("dedent") );

                    var nextIndent = indent.peek();
                    log(`Next indent level ${nextIndent}`);
                    if( indentSize > nextIndent ) {
                        return error.scanner("Indentation error", line, column);
                    }

                    if ( indentSize === nextIndent) {
                        log("Indentation level found");
                        return;
                    }

                    return dedentDetect(indentSize);
                };

                // We have special indentation rules if we're in JS or CSS mode
                if ( (jsMode || cssMode) && newModeTrigger) {

                    // If we're in JS/CSS mode, we want to ignore the first [previous indentation
                    // level] space characters and capture the rest as raw js/css.
                    var specialIndentSize = indentSize - indent.peek();


                    // If this number is negative, we have a dedent
                    if( specialIndentSize < 0 ) {
                        error.hint = "Is it possible you have a blank line that isn't indented?"
                        let returnError = dedentDetect(indentSize);
                        if( returnError ){
                            return returnError;
                        }

                        // If we're dedenting and we're in JS or CSS mode, we have to turn those off
                        jsMode = false;
                        cssMode = false;
                        newModeTrigger = false;

                        column += indentSize;
                        position += matchData[0].length;
                    }
                    else {
                        // Get the newline char and all the spaces minus the ones we're leaving
                        position += matchData[0].length - specialIndentSize;
                        column += indent.peek();
                    }
                }
                else {
                    position += matchData[0].length;
                    // If the top indentation level is smaller than what we have, we have a new
                    // indentation block
                    if ( indent.peek() < indentSize ) {
                        log(`Indenting to size ${indentSize}`);
                        tokens.push( token("indent") );

                        indent.push(indentSize);


                        // If we have a script or style tag, the resultant block will be a separate set
                        // of tokens. If a script or style tag is found, jsMode or cssMode is made true,
                        // respectively. Once we get a new line and a new indentation block, it's game
                        // time.
                        if ( jsMode || cssMode ) {
                            newModeTrigger = true;
                        }
                    }
                    // In the other case, we have returned to a previous indent level
                    if ( indent.peek() > indentSize ) {
                        let returnError = dedentDetect(indentSize);
                        if( returnError ){
                            return returnError;
                        }
                    }

                    // In the event that we got a style or script tag with nothing inside, then we'll
                    // get jsMode or cssMode to be true but newModeTrigger to be false. But we need to
                    // abandon ship in this case so we kill the jsMode and cssMode
                    if ((jsMode || cssMode) && !newModeTrigger) {
                        jsMode = false;
                        cssMode = false;
                    }

                    column += indentSize;
                }
            }
            // Whitespace (for ignoring)
            else if ( matchData = /^[ \t]+/.exec( truncData ) ) {
                log(`Ignoring whitespace at line ${line} col ${column}`);
                column += matchData[0].length;
                position += matchData[0].length;
            }
            // If it doesn't match those we have a problem
            else {
                return error.scanner(`Could not tokenize \n...${data.slice(position - 10, position + 10)}...\n             ^`, line, column);
            }
        }
    }
    tokens.push( token("EOF") );
    return tokens;
}