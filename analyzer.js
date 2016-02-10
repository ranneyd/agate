module.exports = (data) => {
    var tokens = [];

    var position = 0,
        // I don't trust javascript to optimize this and not call length every time
        dataLength = data.length;

    while(position < dataLength){
        var truncData = data.slice(position),
            matchData;
        // stringlit
        // Start (^), then either '(not ' OR \')*' OR "(not " OR \")"
        if ( matchData = /^('([^'\\]|(\\''))*'|"([^"\\]|(\\"))*")/.exec(truncData) ) {
            tokens.push({
                "type": "stringlit",
                "text": matchData[0]
            });
            position += matchData[0].length;
        }
        // Some tag
        else if (matchData = /^[a-zA-Z_][a-zA-Z0-9-_.]*/.exec(truncData)){
            tokens.push({
                "type": "tag",
                "text": matchData[0]
            });
            position += matchData[0].length;
        }
        else if (matchData = /^[\s]+/.exec(truncData)) {
            position += matchData[0].length;
        }
        else {
            console.log("Something weird happened");
            return -1;
        }
    }

    return tokens;
}