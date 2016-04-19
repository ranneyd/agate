'use strict';

var file;
var directory = "./";
var verbose = false;
var dumpTokens = false;
var dumpParseTree = false;
var outName = false;
var fs = require("fs");

var AgateError = require("./error.js");

var error = new AgateError();

var scanner = require("./scanner.js");
let Parser  = require("./parser.js");
let Generator  = require("./generator.js");


var help = () =>{
    console.log("Help")
    // TODO: make a help thingy
}

var processArguments = function(){
    // First two elements are "node" and "analyzer.js"
    let args = process.argv.slice(2);
    let noHelp = true;
    for(var i = 0; i < args.length && noHelp; ++i) {
        let arg = args[i];

        if (arg.charAt(0) === '-') {
            switch(arg.slice(1)){
                case 'v':
                    verbose = true;
                    break;
                case 't':
                    dumpTokens = true;
                    break;
                case 'p':
                    dumpParseTree = true;
                    break;
                case 'o':
                    outName = arg[++i];
                    break;
                default:
                    file = "";
                    noHelp = false;
            }
        }
        else{
            // optional /, (characters followed by /)* ((non-dots)+ (dot (non-dots)+)*) (dot then characters)
            let fileparts = /^((\/)?(.+?\/)*)([^\.]+(\.[^\.]+)*)\..+$/.exec(arg);
            directory = fileparts[1];
            file = fileparts[4];
        }
    }
    if ( !file ){
        help();
    }
};

var readFile = name => new Promise( (resolve, reject) => {
    fs.readFile(name, 'utf8', (err, data) => {
        if (err) {
            reject(err);
        }
        resolve(data);
    });
});
var writeFile = (name, toWrite) => new Promise( (resolve, reject) => {
    fs.writeFile(name, toWrite, 'utf8', err => {
        if (err) {
            reject(err);
        }
        resolve();
    });
});


processArguments();

readFile(`${directory}${file}.agate`)
    .then( code => {
        if(verbose) {
            console.log("Beginning Scanning...");
        }
        let tokens = scanner(code, error, verbose);
        if(verbose) {
            console.log("-".repeat(80));
            console.log("Beginning Parsing...");
        }
        if(dumpTokens) {
            let prettyTokens = JSON.stringify(tokens, null, 3);
            writeFile(`${directory}${outName || file}.tokens.json`, prettyTokens)
                .catch( err => {
                    console.log(err);
                });
        }

        if( !error.count ) {
            try{
                let parser = new Parser(tokens, error, verbose, directory);
                let parseTree = parser.init();
                if( dumpParseTree ) {
                    let treeString = parseTree.toString();

                    writeFile(`${directory}${outName || file}.tree`, treeString)
                        .catch( err => {
                            console.log(err);
                        });
                }
                if( !error.count ){
                    let generator = new Generator(parseTree, error, verbose);
                    let code = generator.init();
                    writeFile(`${directory}${outName || file}.html`, code)
                        .catch( err => {
                            console.log(err);
                        });
                }
            }
            // The built-in error handling is so bad
            catch(e){
                console.log(e.text);
                console.log(e.stack);
                return;
            }
        }
    })
    .catch( err => {
        console.log(err);
    });
