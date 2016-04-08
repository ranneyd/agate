'use strict';

var scanner = require("../scanner.js");
var parser = require("../parser.js");
var fs = require("fs");
Error = require("../error.js");

module.exports = class Template{
    // Since we're running a subprocess of the whole compiler up to this
    // point, we need the verbose setting
    constructor(filename, labels, verbose) {
        this.type = "Template";
        this.filename = filename;
        this.labels = labels;
        this.error = new Error();
        this.verbose = verbose;
        this.safe = true;
    }
    toString(){
        // Have we been analyzed yet?
        if(this.type === "block") {
            let str = "[";
            for(let stmt of this.statements){
                str += stmt.toString() + ', ';
            }
            return str.slice(0,-2) + "]";
        }
        let str = `{"type":"template", "filename":"${this.filename}", "labels":[`;
        for(let label of this.labels){
            str += `{"label":${label.label.toString()}, "body":${label.body.toString()}}, `;
        }
        return str.slice(0,-2) + "]}";
    }
    analyze( env ) {
        localEnv = env.makeChild();

        // Analyze all our labels, then add them to the environment
        for(let labelObj of labels) {
            let label = labelObj.label;
            let body = labelObj.body;

            localEnv.addLabel( label, body );

            body.analyze( env );

            this.safe = this.safe && body.safe;
        }

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

        // Analyze its body, but give it the new environment with the labels
        tree.body.analyze( localEnv );

        // The tree will be a "program". Make our object a block, make it's
        // body the body of the template "program"
        this.type = "block";
        this.body = tree;
        this.safe = this.safe && tree.body.safe;
    }
};
