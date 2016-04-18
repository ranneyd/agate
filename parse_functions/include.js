'use strict';

module.exports = p  => {
    let scanner = require("../scanner.js");
    let fs = require("fs");

    p.matchLog(`Matching include`);

    let token = p.match("include");

    if(!p.at("stringlit")){
        p.error.expected( `String literal after 'include'`, p.pop() );
        return;
    }

    // NOTE: Include strings cannot have interpolation
    let filename = p.match("stringlit");
    let filePath = p.getFile(filename.text)
    // Get the text from the file
    let raw = "";
    try{
        raw = fs.readFileSync( filePath, 'utf8');
    }
    catch(err){
        p.error.hint = "Are you using a legal file name?";
        p.error.parse(
            `No file named '${filePath}' found`,
            filename.line,
            filename.column
        );
        return;
    }

    // Scan it
    p.log("-".repeat(80));
    p.log(`Scanning file "${filename.text}"`);
    let tokens = scanner(raw, p.error, p.verbose);
    p.log("-".repeat(80));

    // This is the EOF
    tokens.pop();

    // Add the new tokens to our tokens

    p.tokens.splice(p.index, 0, ...tokens);

    return;
};
