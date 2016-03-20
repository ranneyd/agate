'use strict';

var file;
var verbose = false;
var dumpTokens = false;
var dumpParseTree = false;
var outName = false;
var fs = require("fs");

Error = require("./error.js");

var error = new Error();

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

        let tokens = scanner(code, error, verbose);
        if(dumpTokens) {
            let prettyTokens = JSON.stringify(tokens, null, 3);
            writeFile(`${outName || file}.tokens.json`, prettyTokens)
                .catch( err => {
                    console.log(err);
                });
        }

        if( !error.count ) {
            let parseTree = parser(tokens, error, verbose);
            if( dumpParseTree ) {
                let prettyTree = JSON.stringify(parseTree, null, 3);
                writeFile(`${outName || file}.tree.json`, prettyTree)
                    .catch( err => {
                        console.log(err);
                    });
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
