'use strict';

let Entity = require("./entity");

module.exports = class Block extends Entity{
    constructor(token, statements) {
        super(token);
        this.statements = statements;
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [];
        for(let stmt of this.statements) {
            strArr.push(stmt.toString(indentLevel + indent, indent))
        }

        return this.toStringArray(indentLevel, indent, strArr).join("\n");
    }
    toStringArray(indentLevel, indent, attrs){
        // indentLevel = how many spaces whole block is indented by
        // indent = how many spaces we should indent with
        // attrs = additional attributes to spit out
        indentLevel = indentLevel || 0;
        indent = indent || 3;
        attrs = attrs || [];

        // Every entity should output its type. Optionally add more attrs to
        // this list
        let strArr = [
            ...attrs
        ];
        // Indent these attrs
        strArr = strArr.map(str => " ".repeat(indent) + str);
        // End bracket isn't indented
        strArr.push("]")
        // Open bracket should not have any indentation (often begins at end
        // of previous line). For the rest, add the indentLevel to the front
        return ["[", ...strArr.map(str => " ".repeat(indentLevel) + str) ];
    }
    analyze( env ) {
        let localEnv = env.makeChild();
        localEnv.safe = localEnv.safe && this.safe;

        for( let stmt of this.statements) {
            stmt.analyze( localEnv );
            // If anything comes back unsafe, our whole block is unsafe
            this.safe = this.safe && stmt.safe;
        }
    }
    generate(g, context, js){
        g.log(`Generating Block`);

        let lines = {
            html: [],
            scripts: []
        };

        let localContext = context.makeChild();
        // first, go through and look for function defs in this scope
        for(let stmt of this.statements) {
            if(stmt.type === "Def"){
                localContext.setFunction(stmt.name);
            }
        }

        for(let stmt of this.statements) {
            let generated = stmt.generate(g, context, js);
            lines.html = lines.html.concat(generated.html);
            lines.scripts = lines.scripts.concat(generated.scripts);
        }

        return lines;
    }
};