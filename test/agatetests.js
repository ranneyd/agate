"use strict";

const fs = require( 'fs' );
const assert = require('assert');

const scanner = require( "../scanner.js" );
const Parser = require("../parser.js");

const dir = "./tests";

const AgateError = require("../error.js");

describe("Agate Files", function() {
    it("(being mocha) is irritating", function(){
    
    // http://stackoverflow.com/questions/7041638/walking-a-directory-with-node-js
    // Read the directory
    fs.readdir( dir, ( dir_err, list ) => {
        // Return the error if something went wrong
        if ( dir_err ) {
            console.log( dir_err );
            return;
        }

        // For every file in the list
        list.forEach( file => {
            // only get the agate files
            let fileParts = /^(.+).agate$/g.exec(file);
            // if it matches something, this will have two elements, the first is
            // the whole string and the second is the first matching group. If
            // regex didn't match, it's null
            if ( fileParts ){
                describe(fileParts[1], function() {
                    let error = new AgateError();

                    let raw = fs.readFileSync( `${dir}/${file}`, 'utf8');
                    let tokens;
                    let tree;

                    it('should scan properly', function () {
                        // For every agate file there should be a corresponding json with
                        // the expected lexical analysis
                        let expectedTokens = JSON.parse(fs.readFileSync( `${dir}/${fileParts[1]}.tokens.json`, "utf8"));

                        tokens = scanner( raw, error );

                        assert.deepStrictEqual(tokens, expectedTokens, "scanner");
                    });
                    it('should parse properly', function () {
                        let expectedTree = fs.readFileSync( `${dir}/${fileParts[1]}.tree`, 'utf8');

                        let parser = new Parser(tokens, error, false);
                        tree = parser.init();
                        let str = tree.toString();

                        // Line endings >:(
                        expectedTree = expectedTree.replace(/\r/g, "");
                        assert.strictEqual(str, expectedTree, "parser");
                    });
                });
            }
        });
    });
    });
});