'use strict';

var scanner = require("../scanner.js");
var parser = require("../parser.js");
var fs = require("fs");
const AgateError = require("../error.js");
var Block = require('./block.js');

module.exports = class Include{
    // Since we're running a subprocess of the whole compiler up to this
    // point, we need the verbose setting
    constructor(filename, verbose) {
        this.type = "Include";
        this.filename = filename;
        this.error = new AgateError();
        this.verbose = verbose;
        this.safe = true;
    }
    toString(){
        // Pre or post analysis
        if(this.type === "block") {
            let str = "[";
            for(let stmt of this.statements){
                str += stmt.toString() + ',';
            }
            return str + "]";
        }
        return `{`
            + `"type":"include",`
            + `"filename":${this.filename.toString()},`
            + `}`;
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
        this.statements = tree.body.statements;
        this.safe = this.safe && tree.body.safe;
    }
};
