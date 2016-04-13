'use strict';

module.exports = (filename, verbose) => {
    let scanner = require("../scanner.js");
    let parser = require("../parser.js");
    let fs = require("fs");
    let AgateError = require("../error.js");
    let error = new AgateError();

    // Get the text from the file
    let raw = "";
    try{
        raw = fs.readFileSync(filename.text, 'utf8');
    }
    catch(err){
        error.parse(
            `No file named '${filename.text}' found`,
            filename.line,
            filename.column
        );
    }

    // Scan it
    if( verbose ) {
        console.log(`Scanning file "${filename}"`);
    }
    let tokens = scanner(raw, error, verbose);
    
    // Parse it
    if( verbose ) {
        console.log(`Parsing file "${filename}"`);
    }
    let tree = parse(tokens, error, verbose);

    return tree.body;
};
