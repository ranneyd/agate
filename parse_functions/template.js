'use strict';

module.exports = p  => {
    let parseChildBlock = require("./childblock");
    let parseBlock = require("./block");

    let scanner = require("../scanner.js");
    let fs = require("fs");

    p.matchLog(`Matching template`);

    let templateToken = p.match("template");

    p.match("newline");

    // To have labels, you must indent
    if(p.at("indent")){
        p.match("indent");
        while(!p.at("dedent")) {
            // You have to be at a label. Nothing in between labels either
            if(!p.atLabel()){
                p.error.expected("Label", p.pop());
            }
            p.match("openCurly");
            let label = p.match("bareword");
            p.match("closeCurly");

            // Contents are always a block on the next line
            p.match("newline");
            p.match("indent");

            // We're going to go through removing all the tokens until the block ends. There can be
            // indentation within the block so we'll keep track of that with indentLevel.
            let tokens = [];
            let indentLevel = 0;
            while(!p.atSequential(["newline", "dedent"]) || indentLevel ){
                let token = p.pop();
                p.log(`Stashed ${token.type}`);
                p.log(`Tokens remaining: ${p.tokensLeft}`);

                if(token.type === "indent") {
                    indentLevel++;
                }
                if(token.type === "dedent"){
                    indentLevel--;
                }
                tokens.push(token);
            }

            p.match("newline");
            p.match("dedent");

            p.storeLabel(label, tokens);
        }

        // template block should be done
        p.match("dedent");
    }

    let filePath = p.getFile(templateToken.text);
    // Get the text from the file
    let raw = "";
    try{
        raw = fs.readFileSync( filePath, 'utf8');
    }
    catch(err){
        p.error.hint = "Are you using a legal file name?";
        p.error.parse(
            `No file named '${filePath}' found`,
            templateToken.line,
            templateToken.column
        );
        return;
    }

    // Scan it
    p.log("-".repeat(80));
    p.log(`Scanning file "${templateToken.text}"`);
    let tokens = scanner(raw, p.error, p.verbose);
    p.log("-".repeat(80));

    // This is the EOF
    tokens.pop();

    // Add the new tokens to our tokens
    p.tokens.splice(p.index, 0, ...tokens);

    return;
};
