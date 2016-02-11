/* My glorious testing script
 * 
 * This script goes through the folder "tests" and looks at every file that ends in .agate. It then
 * looks for a corresponding .json file and compares the output of the analyzer on the .agate file
 * and the JSON.
 */

var analyzer = require( "./analyzer.js" ),
    fs = require( 'fs' ),
    dir = "./tests";

// http://stackoverflow.com/questions/7041638/walking-a-directory-with-node-js
// Read the directory
fs.readdir( dir, function ( dir_err, list ) {
    // Return the error if something went wrong
    if ( dir_err ) {
        console.log( dir_err );
        return;
    }

    // For every file in the list
    list.forEach( function ( file ) {
        // only get the agate files
        var fileParts = /^(.+).agate$/g.exec(file);
        // if it matches something, this will have two elements, the first is the whole string and
        // the second is the first matching group. If regex didn't match, it's null
        if ( fileParts ){
            fs.readFile( dir + "/" + file, 'utf8', function ( test_err, testee ) {
                if ( test_err ) {
                    console.log( test_err );
                    return;
                }
                // For every agate file there should be a corresponding json with the expected
                // lexical analysis
                var expected = require( dir + "/" + fileParts[1] + ".json" );
                var analysis = analyzer( testee );
                if ( expected ){ 
                    if ( JSON.stringify( expected ) === JSON.stringify( analysis ) ) {
                        console.log( "Test " + fileParts[1] + " passed!" );
                    }
                    else {
                        console.log( "Test " + fileParts[1] + " FAILED!" );
                        console.log( "Expected: " );
                        console.log( expected );
                        console.log( "Produced: " );
                        console.log(analysis);  
                    }
                }
                else {
                    console.log( "ERROR. " + file + " found but no corresponding JSON found." );
                }
            });
        }
    });
});