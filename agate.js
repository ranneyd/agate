'use strict';

var file;
var code;
var verbose = false;
var fs = require("fs");

Error = require("./error.js");

var error = new Error();

var processArguments = function(){
    // First two elements are "node" and "analyzer.js"
    process.argv.slice(2).forEach(function (arg, index) {
        if (arg.charAt(0) === '-') {
            switch(arg.slice(1)){
                case 'v':
                    verbose = true;
                    break;
                default:
                    console.log("Help")
                    // TODO: make a help thingy
            }
        }
        else{
            file = arg;
        }
    });
    if ( !file ){
        throw new Error('No file selected');
    }
};

var readFile = function( callback ){
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        code = data;
        callback();
    });
};


processArguments();

readFile( function () {

    let util = require("util");
    let exec = require('child_process').execSync;

    let scanner = require("./scanner.js");
    let parser  = require("./parser.js");



    let tokens = scanner(code, error);

    if(!error.count){
        let parseTree = parser(tokens, error, verbose);
    }
    
    console.log(JSON.stringify(parseTree, null, 3));

});
