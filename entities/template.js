'use strict';

var scanner = require("../scanner.js");
var parser = require("../parser.js");
var fs = require("fs");
Error = require("../error.js");

module.exports = class Template{
    // Since we're running a subprocess of the whole compiler up to this
    // point, we need a pointer to the error object and the verbose setting
    constructor(filename, labels, verbose) {
        this.type = "Template";
        this.filename = filename;
        this.labels = labels;
        this.error = new Error();
        this.verbose = verbose;
    }
    analyze( env ) {
        localEnv = env.makeChild();

        // Analyze all our labels, then add them to the environment
        for(let i = 0; i < this.labels.length; ++i) {
            let label = this.labels[i].label;
            let body = this.labels[i].body;

            localEnv.addLabel( label, body );

            body.analyze();
        }

        // Get the text from the file
        let raw = fs.readFileSync(this.filename, 'utf8');

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

        // Analyze its body, but give it the new environment with the labels
        tree.body.analyze( localEnv );

        // The tree will be a "program". Make our object a block, make it's
        // body the body of the template "program"
        this.type = "block";
        this.body = tree;
    }
};
