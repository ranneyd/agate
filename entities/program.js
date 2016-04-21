'use strict';

let Env = require('./env');
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

        let linesOfCode = [
            "<!DOCTYPE>",
            "<html>",
            ...g.html,
            "</html>",
        ];
        if(g.scripts){
            linesOfCode = linesOfCode.concat([
                `<script type="text/javascript">`,
                ...g.scripts,
                "</script>",
            ]);
        }
        return linesOfCode.join("\n");
    }
};