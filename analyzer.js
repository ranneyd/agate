module.exports = (data) => {

    var tokens = [],
        indent = {
            elems: [0],
            pop: function () {
                return elems.pop();
            },
            push: function ( elem ) {
                return elems.push();
            },
            peek: function () {
                return elems[elems.length - 1];
            },
            isTop: function ( elem ) {
                return this.peek() === elem;
            }
        },
        line = 0,
        position = 0,
        // I don't trust javascript to optimize this and not call length every time
        dataLength = data.length;

    while( position < dataLength ) {
        var truncData = data.slice( position ),
            matchData;
        // stringlit
        // Start (^), then either '(not ' OR \')*' OR "(not " OR \")"
        if ( matchData = /^('([^'\\]|(\\''))*'|"([^"\\]|(\\"))*")/.exec( truncData ) ) {
            tokens.push( {
                "type": "stringlit",
                "text": matchData[0]
            } );
            position += matchData[0].length;
        }
        // Some tag
        else if ( matchData = /^[a-zA-Z_][a-zA-Z0-9-_.]*/.exec( truncData ) ) {
            tokens.push({
                "type": "tag",
                "text": matchData[0]
            });
            position += matchData[0].length;
        }
        // newline
        else if ( matchData = /^(\r\n|\r|\n)+/.exec( truncData ) ) {
            tokens.push({
                "type": "newline"
            });
            line++;
            position += matchData[0].length;
        }
        // indentation
        // only happens if last thing was a newline
        else if ( tokens[tokens.length - 1].type === "newline"
                && matchData = /^[\t ]*/.exec( truncData ) ) {
            // NOTE: one tab = one space. Using tabs is dumb anyway
            var indentSize = matchData[0].length;
            
            // If level is greater than the current indent level.
            if ( indent.peek() < indentSize ) {
                tokens.push({
                    "type": "indent"
                });
                indent.push(indentSize);
            }
            // If level is less than the current index level
            if ( indent.peek() > indentSize ) {
                var popped;
                while ( (popped = indent.pop()) !== indentSize ) {
                    tokens.push({
                        "type": "dedent"
                    });
                    // If we pop indents that are smaller than what we're looking for, we have an indent error
                    if (popped < indentSize) {
                        return {
                            status: "error",
                            line: line,
                            message: "Indentation error"
                        }
                    }
                }
                // If we accidentally popped the 0, we have to put it back
                if ( !popped ) {
                    indent.push(0);
                }

            }
        }
        // Whitespace (for ignoring)
        else if ( matchData = /^[\s]+/.exec( truncData ) ) {
            position += matchData[0].length;
        }
        // If it doesn't match those we have a problem
        else {
            return {
                status: "error",
                line: line,
                message: "Could not tokenize"
            };
        }
    }

    return tokens;
}