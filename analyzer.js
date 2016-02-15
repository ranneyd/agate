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
    newline    | (\r\n|\r|\n)+
    indent     | complicated
    dedent     | also complicated
    keyword    | (if)|(else)|(for)|(in)|(def)|(css)
               |     |(js)|(float)|(int)|(boolean)|(string)
    widget     | >.+?[\r\n]+
    template   | \|.+?[\r\n]+
    label      | \[[A-Za-z0-9_-]\]
    assignment | =
    openParen  | \(
    closeParen | \)
    openCurly  | \{
    closeCurly | \}
    hash       | #
    dot        | \.
    bareword   | [a-zA-Z._-][a-zA-Z0-9._-]+
    script     | script + complicated
    js         | [^\n\r].+?(?=(\r\n|\r|\n)|('@))
    style      | style + complicated
    css        | [^\n\r].+?(?=(\r\n|\r|\n)|(@))
*/

var regexes = [
    {
        "type": "stringlit",
        "regex": /^('([^'\\]|(\\'')|(\\\\))*'|"([^"\\]|(\\")|(\\\\))*")/
    },
    {
        "type": "id",
        "regex": /^@[A-Za-z$_-]+/
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


module.exports = (data) => {

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
        dataLength = data.length;

    while( position < dataLength ) {
        var truncData = data.slice( position ),
            matchData,
            notMatched = true;

        // Some complicated ones we need to preempt

        // Since JS and CSS are separate token sets, we have to use these flags to determine when
        // we're looking at them.
        if ( newModeTrigger ) {
            // If it's JS mode, we do JS, otherwise, it's css
            if ( jsMode ) {
                if ( matchData = /^[^\n\r].+?(?=(\r\n|\r|\n|$))/.exec( truncData ) ) {
                    var token = {
                        "type": "js",
                        "text": matchData ? matchData[0] : ""
                    };

                    tokens.push( token );

                    column += matchData[0].length;
                    position += matchData[0].length;
                }
            }
            else {
                if ( matchData = /^[^\n\r].+?(?=(\r\n|\r|\n|$))/.exec( truncData ) ) {
                    var token = {
                        "type": "css",
                        "text": matchData ? matchData[0] : ""
                    };

                    tokens.push( token );

                    column += matchData[0].length;
                    position += matchData[0].length;
                }
            }
            // If this is null, we didn't get a match, meaning we have a newline, meaning we need to
            // keep checking. Otherwise, we don't want to keep checking
            if ( !!matchData ) {
                notMatched = false;
            }
        } 

        if (matchData = /^((script)|(style))/.exec( truncData )) {
            var token = {
                "type": matchData[0]
            };

            tokens.push( token );

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
                var token = {
                    "type": regexes[type].type,
                };

                if (!regexes[type].notext) {
                    token.text = matchData[0];
                }

                tokens.push( token );

                column += matchData[0].length;
                position += matchData[0].length;
                notMatched = false;
            }
        }

        // More complicated ones
        if( notMatched ) {
            // newline and indentation
            if ( matchData = /^((\r\n|\r|\n)+)([\t ]*)/.exec( truncData ) ) {
                // This is inspired heavily by Python
                // https://docs.python.org/3/reference/lexical_analysis.html
                tokens.push({
                    "type": "newline"
                });

                line++;
                column = 1;


                // Last matching group is the indentation. Note one tab = one space because we don't
                // respect people who mix spaces and tabs. Technically, however, if you use only
                // tabs it will work fine
                var indentSize = matchData[matchData.length - 1].length;

                // Encapsulating this so I can use it in the js/css mode also
                var dedentDetect = function(indentSize){

                    indent.pop();

                    tokens.push({
                        "type": "dedent"
                    });

                    var nextIndent = indent.peek();

                    if( indentSize > nextIndent ) {
                        return {
                                status: "error",
                                line: line,
                                column: column,
                                message: "Indentation error"
                        };
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
                        position += indentSize;
                    }
                    else {
                        position += indent.peek();
                        column += indent.peek();
                    }
                }
                else {
                    position += matchData[0].length;

                    // If the top indentation level is smaller than what we have, we have a new
                    // indentation block
                    if ( indent.peek() < indentSize ) {
                        tokens.push({
                            "type": "indent"
                        });

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
            // Whitespace (for ignoring)
            else if ( matchData = /^[\s]+/.exec( truncData ) ) {
                column += matchData[0].length;
                position += matchData[0].length;
            }
            // If it doesn't match those we have a problem
            else {
                return {
                    status: "error",
                    line: line,
                    column: column,
                    message: "Could not tokenize"
                };
            }
        }
    }

    return tokens;
}