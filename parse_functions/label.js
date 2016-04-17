'use strict';

module.exports = ( p ) => {
    p.matchLog(`Matching Label`);

    p.match("{");
    let label = p.match("bareword");
    p.match("}");

    p.insertLabel( label );
};