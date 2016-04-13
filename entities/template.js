'use strict';

// Labels is an array of objects, where "label" is a Label and "body" is a Block
module.exports = (filename, labels, verbose) => {
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
        this.error.generic(
            `Semantic error: No file named '${filename.text}' found`,
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

    // TODO: actually insert the stuff

    return tree.body;
};
