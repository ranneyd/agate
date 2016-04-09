'use strict';

var file;
var verbose = false;
var dumpTokens = false;
var dumpParseTree = false;
var outName = false;
var fs = require("fs");

var AgateError = require("./error.js");

var error = new AgateError();

var scanner = require("./scanner.js");
var parser  = require("./parser.js");

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
            let fileName = arg.split('.');
            fileName.pop();
            file = fileName.join('.');
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

readFile(`${file}.agate`)
    .then( code => {
        if(verbose) {
            console.log("Beginning Scanning...");
        }
        let tokens = scanner(code, error, verbose);
        if(dumpTokens) {
            if(verbose) {
                console.log("-".repeat(80));
                console.log("Beginning Parsing...");
            }
            let prettyTokens = JSON.stringify(tokens, null, 3);
            console.log(prettyTokens);
            writeFile(`${outName || file}.tokens.json`, prettyTokens)
                .catch( err => {
                    console.log(err);
                });
        }

        if( !error.count ) {
            try{
                let parseTree = parser(tokens, error, verbose);
                if( dumpParseTree ) {
                    let treeString = parseTree.toString();
                    console.log(treeString);
                    let treeStringToJSON = JSON.parse(treeString); 
                    let prettyTree = JSON.stringify(treeStringToJSON, null, 3);
                    console.log(prettyTree);
                    writeFile(`${outName || file}.tree.json`, prettyTree)
                        .catch( err => {
                            console.log(err);
                        });
                }
            }
            // The built-in error handling is so bad
            catch(e){
                console.log(e.text);
                console.log(e.stack);
                debugger;
                return;
            }
        }

        // writeFile(`${outName || file}.html`, ---output I guess---)
        //     .catch( err => {
        //         console.log(err);
        //     });

    })
    .catch( err => {
        console.log(err);
    });
