'use strict';

let Entity = require("./entity");
let Block = require("./block");

module.exports = class Call extends Entity{
    constructor( token, name, attrs, args ) {
        super( token );
        this.name = name;
        // If it's a block and it's not an empty block
        if(attrs.statements && attrs.statements.length){
            this.attrs = attrs;
        }
        if(args.statements && args.statements.length){
            this.args = args;
        }
    }
    toString(indentLevel, indent){
        // Thanks node for your default parameter support >:(
        indentLevel = indentLevel || 0;
        indent = indent || 3;

        let strArr = [
            `name: ${this.name.toString(indentLevel + indent, indent)}`,
        ];
        if(this.attrs) {
            strArr.push(`attrs: ${this.attrs.toString(indentLevel + indent, indent)}`);
        }
        if(this.args) {
            strArr.push(`args: ${this.args.toString(indentLevel + indent, indent)}`);
        }
        return this.toStringArray(indentLevel, indent, strArr).join("\n");
    }
    analyze( env ) {
    }
    generate(g, context){
        g.log(`Generating Call`);

        let name = this.name.text;

        if(context.isFunction(name)){
            // TODO: javascript function call
        }
        else if(g.builtinFunctions[name]){
            // TODO: what do I do when a built in function is called?
        }
        else{
            // If it's not a user-defined or built-in function, we treat it like html

            let ref = `elem${g.counter++}`;
            let lines = [
                ...g.setScriptMode(true),
                `let ${ref} = document.createElement("${name}");`
            ];

            if(this.attrs){
                // ES6 scope! :)
                lines.push(`{`);

                let attrLines = [`let attr;`];

                for(let attr of this.attrs.statements) {
                    let value = attr.value.generate(g, context, 0);

                    // TODO: if they did some bullshit like making an attr equal to an html element,
                    // bitch at them
                    this.attrLines.push(`attr = ${value};`);
                    this.attrLines.push(`${ref}.setAttribute("${attr.key}", attr);`);
                }

                lines.push(attrLines.map(str => " ".repeat(g.INDENT) + str));

                lines.push(`}`);
            }

            if(this.args){
                let localContext = context.makeChild();
                localContext.container = ref;

                for(let arg of this.args.statements){
                    let argLines = arg.generate(g, localContext);

                    if(Array.isArray(argLines)) {
                        lines = lines.concat(g.formatArray(argLines));
                    }
                    else {
                        lines.push(argLines);
                    }
                }
            }

            lines.push(`${context.container}.appendChild(${ref});`);
            return g.formatArray(lines);
        }
    }
};