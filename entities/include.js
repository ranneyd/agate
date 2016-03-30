'use strict';

var scanner = require("../scanner.js");
var parser = require("../parser.js");
var fs = require("fs");
Error = require("../error.js");

module.exports = class Include{
    // Since we're running a subprocess of the whole compiler up to this
    // point, we need the verbose setting
    constructor(filename, verbose) {
        this.type = "Include";
        this.filename = filename;
        this.error = new Error();
        this.verbose = verbose;
        this.safe = true;
    }
    analyze( env ) {

        // Get the text from the file
        let raw = "";
        try{
            raw = fs.readFileSync(this.filename.text, 'utf8');
        }
        catch(err){
            this.error.generic(
                `Semantic error: No file named '${this.filename.text}' found`,
                this.filename.line,
                this.filename.column
            );
        }

        // Scan it
        if( this.verbose ) {
            console.log(`Scanning file "${this.filename}"`);
        }
        let tokens = scanner(raw, this.error, this.verbose);
        
        // Parse it
        if( this.verbose ) {
            console.log(`Parsing file "${this.filename}"`);
        }
        let tree = parse(tokens, this.error, this.verbose);

        // Analyze its body
        tree.body.analyze( env );

        // The tree will be a "program". Make our object a block, make it's
        // body the body of the template "program"
        this.type = "block";
        this.body = tree;
        this.safe = this.safe && tree.body.safe;
    }
};
