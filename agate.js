'use strict';

var file;
var code;
var fs = require("fs");

var processArguments = function(){
    // First two elements are "node" and "analyzer.js"
    process.argv.slice(2).forEach(function (arg, index) {
        file = arg;
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

    let tokens = scanner(code);
    let parseTree = parser(tokens, true);
    
    console.log(JSON.stringify(parseTree, null, 3));

});
