/*
    Microsyntax
    token      | match
    ---------------------------------------------------------
    intlit     | \d+
    floatlit   | (\.\d+|\d+(\.\d+)?)([Ee]\d+)?
    stringlit  | ('([^'\\]|(\\''))*'|"([^"\\]|(\\"))*")
    boollit    | (true)|(false)
    id         | @[A-Za-z0-9$_-]+
    relop      | \<|\>|(\<\=)|(\=\=)|(\!\=)|(\>\=)
    addop      | \+|-
    multop     | \*|\/
    prefixop   | \!|-
    boolop     | (and)|(or)|(xor)
    newline    | (\r\n|\r|\n)+
    indent     | complicated
    dedent     | also complicated
    widget     | >.+?[\r\n]+
    template   | \|.+?[\r\n]+
    label      | \{[A-Za-z0-9_-]\}
    assignment | =
    openParen  | \(
    closeParen | \)
    openCurly  | \{
    closeCurly | \}
    openSquare | \[
    closeSquare| \]
    question   | \?
    colon      | \:
    hash       | #
    dot        | \.
    def        | def
    return     | return
    bareword   | [a-zA-Z._-][a-zA-Z0-9._-]+
    script     | script + complicated
    js         | [^\n\r].+?(?=(\r\n|\r|\n)|('@))
    style      | style + complicated
    css        | [^\n\r].+?(?=(\r\n|\r|\n)|(@))
    include    | > *(.+?)(?=[\n\r])
    template   | \| *(.+?)(?=[\n\r])
    label      | \[.+?\]
    comment    | \/\/[^\r\n]*
    unbuffered | \/\/![^\r\n]*
    range      | \.\.
*/

module.exports = (data) => {
    var error = require("./error.js");

    var regexes = [
        {
            "type": "comment",
            "regex": /^\/\/(?!\!)[^\r\n]*/
        },
        {
            "type": "stringlit",
            "regex": /^('([^'\\]|(\\'')|(\\\\))*'|"([^"\\]|(\\")|(\\\\))*")/
        },
        {
            "type": "id",
            "regex": /^@[A-Za-z$_-]+/
        },
        {
            "type": "def",
            "regex": /^def/,
            "notext": true
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
            "type": "range",
            "regex": /^\.\./,
            "notext": true
        },
        {
            "type": "boolop",
            "regex": /^((and)|(or)|(xor))/
        },
        {
            "type": "return",
            "regex": /^return/,
            "notext": true
        },
        {
            "type": "bareword",
            "regex": /^[a-zA-Z._-][a-zA-Z0-9._-]*/
        },
        {
            "type": "relop",
            "regex": /^\<|\>|(\<\=)|(\=\=)|(\!\=)|(\>\=)/
        },
        {
            "type": "intlit",
            "regex": /^\d+/
        },
        {
            "type": "floatlit",
            "regex": /^(\.\d+|\d+(\.\d+)?)([Ee]\d+)?/
        },
        {
            "type": "label",
            "regex": /^\{[A-Za-z0-9_-]\}/
        },
        {
            "type": "assignment",
            "regex": /^=/,
            "notext": true
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
    ];
    
    var tokens = [],
        indent = {
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
        },
        line = 1,
        column = 1,
        position = 0,
        jsMode = false,
        cssMode = false,
        newModeTrigger = false,
        // I don't trust javascript to optimize this and not call length every time
        dataLength = data.length,
        token = function(type, text){
            var ourToken = {
                "type": type,
                "line": line,
                "column": column
            };
            if (text) {
                ourToken.text = text;
            }
            return ourToken;
        };

    while( position < dataLength ) {
        var truncData = data.slice( position ),
            matchData,
            notMatched = true;
        // Some complicated ones we need to preempt

        // Since JS and CSS are separate token sets, we have to use these flags to determine when
        // we're looking at them.
        if ( newModeTrigger ) {
            // Interesting note about this bad boy: it makes the quotes in '@name' optional. The
            // problem is @ isn't technically illegal JS and I think it can be used in legal JS
            // identifiers, so it may lead to incorrectness. But hey, if the user doesn't want
            // to put the quotes, they don't have to. If there are quotes around it, however,
            // they will be removed.
            if ( matchData = /^((.(?!'?@|[\n\r]))*.)('?(@[A-Za-z$_-]+)'?)?/.exec( truncData ) ) {
                tokens.push( token(jsMode ? "js" : "css", matchData ? matchData[1] : "") );

                column += matchData[0].length;
                position += matchData[0].length;

                // If the last group is matched, this is it. Otherwise this is undefined. :D
                var potentialID = matchData[matchData.length - 1]
                if ( potentialID ) {
                    tokens.push( token("id", potentialID) );
                }
            }
            // If this is null, we didn't get a match, meaning we have a newline or an id, meaning
            // we need to keep checking. Otherwise, we don't want to keep checking
            if ( !!matchData ) {
                notMatched = false;
            }
        } 

        if (matchData = /^((script)|(style))/.exec( truncData )) {

            tokens.push( token(matchData[0]) );

            column += matchData[0].length;
            position += matchData[0].length;
            notMatched = false;
            jsMode = matchData[0] === "script";
            cssMode = !jsMode;
        }

        // Simples cases handled here. If we match something, notMatched will be false so we won't
        // do the stuff down there
        for ( var type in regexes ) {
            if ( notMatched && (matchData = regexes[type].regex.exec( truncData ) ) ) {

                tokens.push( token(regexes[type].type, regexes[type].notext ? false : matchData[0] ) );

                column += matchData[0].length;
                position += matchData[0].length;
                notMatched = false;
            }
        }

        // More complicated ones
        if( notMatched ) {
            // newline and indentation
            if ( matchData = /^(\r\n|\r|\n)([\t ]*)/.exec( truncData ) ) {
                // This is inspired heavily by Python
                // https://docs.python.org/3/reference/lexical_analysis.html
                tokens.push( token("newline") );

                line++;
                column = 1;


                // Last matching group is the indentation. Note one tab = one space because we don't
                // respect people who mix spaces and tabs. Technically, however, if you use only
                // tabs it will work fine
                var indentSize = matchData[matchData.length - 1].length;

                // Encapsulating this so I can use it in the js/css mode also
                var dedentDetect = function(indentSize){

                    indent.pop();

                    tokens.push( token("dedent") );

                    var nextIndent = indent.peek();

                    if( indentSize > nextIndent ) {
                        return error("Scanner error: Indentation error", line, column);
                    }

                    if ( indentSize === nextIndent) {
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
                        var error = dedentDetect(indentSize);
                        if( error ){
                            return error;
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
                        var error = dedentDetect(indentSize);
                        if( error ){
                            return error;
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
            // Include
            else if (matchData = /^> *(.+?)(?=[\n\r])/.exec( truncData )) {
                tokens.push( token("include", matchData[1]) );
                column += matchData[0].length;
                position += matchData[0].length;
            }
            // Template
            else if (matchData = /^\| *(.+?)(?=[\n\r])/.exec( truncData )) {
                tokens.push( token("template", matchData[1]) );
                column += matchData[0].length;
                position += matchData[0].length;
            }
            // Whitespace (for ignoring)
            else if ( matchData = /^[\s]+/.exec( truncData ) ) {
                column += matchData[0].length;
                position += matchData[0].length;
            }
            // Comments for ignoring
            else if ( matchData = /^\/\/![^\r\n]*/.exec( truncData ) ) {
                column += matchData[0].length;
                position += matchData[0].length;
            }
            // If it doesn't match those we have a problem
            else {
                return error("Scanner error: Could not tokenize", line, column);
            }
        }
    }
    tokens.push( token("EOF") );
    return tokens;
}