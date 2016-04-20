'use strict';

let Entity = require("./entity");
let Block = require("./block");

module.exports = class If extends Block{
    // Conditions is an array of objects, each with a "condition" and
    // "body". If the last one does not have a condition, it's the else case
    constructor( token, conditionals ) {
        super(token);
        this.conditionals = conditionals;
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [];

        for(let stmt of this.conditionals) {
            strArr.push("{");
            if(stmt.condition) {
                strArr.push(" ".repeat(indent) + `condition: ${stmt.condition.toString(indentLevel + indent * 2, indent)}`)
            }
            strArr.push(" ".repeat(indent) + `body: ${stmt.body.toString(indentLevel + indent * 2, indent)}`)
            strArr.push("}");
        }

        return this.toStringArray(indentLevel, indent, strArr).join("\n");
    }
    analyze( env ) {

    }
    generate(g, context){
        g.log("Generating if statement");
        // Optimize me pls

        let firstCondition = this.conditionals[0].condition.generate(g, context).scripts;
        firstCondition[0] = `let cond0 = ${firstCondition[0]}`;
        firstCondition[firstCondition.length - 1] += ";";

        let lines = [
            ...firstCondition,
            `if(cond0) {`,
            ...g.indent(this.conditionals[0].body.generate(g, context).scripts),
            `}`
        ];

        for(let i = 1; i < this.conditionals.length - 1; ++i){
            let conditional = this.conditionals[i];
            let condition = conditional.condition.generate(g, context).scripts;
            condition[0] = `let cond${i} = ${condition[0]}`;
            condition[condition.length - 1] += ";";

            lines.concat(condition);
            lines.push(`else if(cond${i}) {`);
            lines.concat(g.indent(conditional.body.generate(g, context).scripts));
            lines.push(`}`);
        }

        let lastCondition = this.conditionals[this.conditionals.length - 1];

        // Either an else if or an else
        if(lastCondition.condition){
            let condition = lastCondition.condition.generate(g, context).scripts;
            condition[0] = `let cond${this.conditionals.length - 1} = ${condition[0]}`;
            condition[condition.length - 1] += ";";

            lines.concat(condition);
            lines.push(`else if(cond${this.conditionals.length - 1}) {`);
            lines.concat(g.indent(lastCondition.body.generate(g, context).scripts));
            lines.push(`}`);
        }
        else{
            lines.push(`else {`);
            lines.concat(g.indent(lastCondition.body.generate(g, context).scripts));
            lines.push(`}`);
        }

        return {
            html: [],
            scripts: [
                "{",
                ...g.indent(lines),
                "}"
            ]
        };
    }
};