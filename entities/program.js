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
        g.log(`Generating Program`);

        this.body.generate(g);
        // TODO: Probably have to detect head/body tags so we can merge them properly

        let linesOfCode = [
            "<!DOCTYPE>",
            "<html>",
            ...g.indent(g.html)
        ];
        if(g.scripts){
            linesOfCode = linesOfCode.concat(g.indent([
                `<script type="text/javascript">`,
                ...g.indent(g.scripts).map(str => str + ";"),
                "</script>",
            ]));
        }
        linesOfCode.push("</html>");
        return linesOfCode.join("\n");
    }
};