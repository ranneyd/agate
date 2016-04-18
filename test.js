'use strict';

/* My glorious testing script
 * 
 * This script goes through the folder "tests" and looks at every file that ends in .agate. It then
 * looks for a corresponding .json file and compares the output of the scanner on the .agate file
 * and the JSON.
 */

var scanner = require( "./scanner.js" );
var parser = require("./parser.js");
var fs = require( 'fs' );
var dir = "./tests";

AgateError = require("./error.js");

require('colors');
var jsdiff = require('diff');

var diff = (expected, produced) =>{
    let ourDiff = jsdiff.diffJson(expected, produced);

    if(ourDiff.length > 1){
        ourDiff.forEach(function(part){
            // green for additions, red for deletions 
            // grey for common parts 
            var color = part.added ? 'green' :
                part.removed ? 'red' : 'grey';
            process.stdout.write(part.value[color]);
        });

        process.stdout.write("\n");

        return false;
    }
    return true;
}

// http://stackoverflow.com/questions/7041638/walking-a-directory-with-node-js
// Read the directory
fs.readdir( dir, ( dir_err, list ) => {
    // Return the error if something went wrong
    if ( dir_err ) {
        console.log( dir_err );
        return;
    }

    // For every file in the list
    list.forEach( ( file ) => {
        // only get the agate files
        let fileParts = /^(.+).agate$/g.exec(file);
        // if it matches something, this will have two elements, the first is the whole string and
        // the second is the first matching group. If regex didn't match, it's null
        if ( fileParts ){
            console.log(`Testing ${fileParts[1]}`);
            let testee = fs.readFileSync( `${dir}/${file}`, 'utf8');
            // For every agate file there should be a corresponding json with the expected
            // lexical analysis
            let expectedTokens = require( `${dir}/${fileParts[1]}.tokens.json` );
            let error = new AgateError();
            // If the test has "fail" in the name, it's testing that things properly fail. So we
            // should not log errors
            let failTest = /fail/g.exec(fileParts[1]);
            if( failTest ){
                error.suspend();
            }
            let tokens = scanner( testee, error );

            if ( error.count && !failTest ) {
                console.log(`\tError`);
                console.log(tokens);
            }
            else if ( expectedTokens ){
                if (diff(expectedTokens, tokens) ) {
                    console.log( `\tScanning passed!` );
                    if (!error.count){
                        let tree = parser(tokens, error);
                        let expectedTree = require( `${dir}/${fileParts[1]}.tree.json` );
                        if (expectedTree) {
                            if (diff(expectedTree, tree)) {
                                console.log( `\tParsing passed!` );
                            }
                            else {
                                console.log( `\tParsing FAILED!` );
                            }
                        }
                        else {
                            console.log( `\tERROR. ${file} found but no corresponding tree.json found.` );
                        } 
                    }
                }
                else {
                    console.log( `\tScanning FAILED!` );
                }
            }
            else {
                console.log( `\tERROR. ${file} found but no corresponding token.json found.` );
            }
        }
    });
});
