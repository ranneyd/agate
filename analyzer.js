/*
    Microsyntax
    token      | match
    ---------------------------------------------------------
    intlit     | \d+
    floatlit   | (\.\d+|\d+(\.\d+)?)([Ee]\d+)?
    stringlit  | ('([^'\\]|(\\''))*'|"([^"\\]|(\\"))*")
    boollit    | (true)|(false)
    id         | @[\p{L}$_-]+
    relop      | <|>|(<=)|(==)|(\!=)|(>=)
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
    label      | \[[\p{L}_-]\]
    assignment | =
    openParen  | \(
    closeParen | \)
    openCurly  | \{
    closeCurly | \}
    attribute  | (?<=\()[^=\w"'@]+
*/

var regexes = [
    {
        "type": "stringlit",
        "regex": /^('([^'\\]|(\\''))*'|"([^"\\]|(\\"))*")/
    },
    {
        "type": "id",
        "regex": /^@[\p{L}$_-]+/
    },
    {
        "type": "tag",
        "regex": /^[a-zA-Z_][a-zA-Z0-9-_.]*/
    }
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
        line = 0,
        char = 0,
        position = 0,
        // I don't trust javascript to optimize this and not call length every time
        dataLength = data.length;

    while( position < dataLength ) {
        var truncData = data.slice( position ),
            matchData,
            notMatched = true;

        // Simples cases handled here. If we match something, notMatched will be false so we won't
        // do the stuff down there
        for ( var type in regexes ) {
            if ( notMatched && (matchData = regexes[type].regex.exec( truncData ) ) ) {
                tokens.push( {
                    "type": regexes[type].type,
                    "text": matchData[0]
                } );

                char += matchData[0].length;
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
                char = 0;
                position += matchData[0].length;


                // Last matching group is the indentation. Note one tab = one space because we don't
                // respect people who mix spaces and tabs. Technically, however, if you use only
                // tabs it will work fine
                var indentSize = matchData[matchData.length - 1].length;

                // If the top indentation level is smaller than what we have, we have a new
                // indentation block
                if ( indent.peek() < indentSize ) {
                    tokens.push({
                        "type": "indent"
                    });

                    indent.push(indentSize);
                }
                // In the other case, we have returned to a previous indent level
                if ( indent.peek() > indentSize ) {
                    do {
                        // If we peek at an indent that is smaller than what we're looking for, we
                        // have an indent error
                        if (indent.peek() < indentSize) {
                            return {
                                status: "error",
                                line: line,
                                char: char,
                                message: "Indentation error"
                            }
                        }

                        // If we aren't at the 0, we want to dedent
                        if (!indent.isTop(0)) {
                            tokens.push({
                                "type": "dedent"
                            });
                        }
                    } while ( !indent.isTop(0) && (indent.pop() !== indentSize) );
                }
            }
            // Whitespace (for ignoring)
            else if ( matchData = /^[\s]+/.exec( truncData ) ) {
                char += matchData[0].length;
                position += matchData[0].length;
            }
            // If it doesn't match those we have a problem
            else {
                return {
                    status: "error",
                    line: line,
                    char: char,
                    message: "Could not tokenize"
                };
            }
        }
    }

    return tokens;
}