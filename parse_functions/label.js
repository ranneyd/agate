'use strict';

module.exports = ( p ) => {
    p.matchLog(`Matching Label`);

    p.match("openCurly");
    let label = p.match("bareword");
    p.match("closeCurly");

    p.insertLabel( label );
};