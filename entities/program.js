'use strict';

let Entity = require("./entity");
let Block = require("./block");

module.exports = class Program extends Entity{
    constructor(token, block) {
        super(token);
        this.body = block;
    }
    toString(indentLevel, indent){
        return this.body.toString(indentLevel, indent);
    }
    analyze() {

    }
    generate(g){
        this.body.generateJS(g);
        // TODO: Probably have to detect head/body tags so we can merge them properly

        let linesOfCode = [
            "<!DOCTYPE>",
            "<html>",
            ...g.html
        ];
        if(g.scripts){
            linesOfCode = linesOfCode.concat([
                `<script type="text/javascript">`,
                ...g.scripts,//.map(str => str + ";"), TODO: how am I going to do this
                "</script>",
            ]);
        }
        linesOfCode.push("</html>");
        return linesOfCode.join("\n");
    }
};