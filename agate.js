var file;
var code;

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
    fs = require('fs')
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
    let parse-tree = parser(tokens, false);
    
    console.log(util.inspect(parse-tree, false, null));


    exec("perl someperl.pl", function(err, stdout, stderr) {
        /* do something */
    });
    console.log(util.inspect(parser(tokens, false), false, null));
});
