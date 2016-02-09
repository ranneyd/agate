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

    var analyzer = require("./analyzer.js");

    console.log(analyzer(code));
});
