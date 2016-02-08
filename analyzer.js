var file;

var processArguments = function(){
    process.argv.slice(2).forEach(function (arg, index) {
        file = arg;
    });
    if ( !file ){
        throw new Error('No file selected');
    }
};

var readFile = function(){
    fs = require('fs')
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(data);
    });
};


processArguments();

readFile();