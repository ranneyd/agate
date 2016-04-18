'use strict';

let Literal = require("../entities/literal")

module.exports = ( p ) => {
    p.matchLog(`Matching Label`);

    p.match("openCurly");
    let label = p.match("bareword");
    p.match("closeCurly");

    if(!p.insertLabel( label )){
        return new Literal({
            type: "stringlit",
            text: "",
            line: label.line,
            column: label.column
        })
    }
};