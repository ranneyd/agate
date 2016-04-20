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
    // If this thing has an id as an attr, return it. Else return false
    get id(){
        if(this.attrs){
            for(let attr of this.attrs.statements){
                // Fun fact: in html if an element has two id attributes, the browser only takes the
                // first one. How convenient for us.
                if(attr.key === "id"){
                    return attr.value;
                }
            }
        }
        return false;
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
        // If it's not a user-defined or built-in function, we treat it like html
        else{
           return this.generateHTML(g, context);
        }
    }
    // This makes the html actually html
    generateHTML(g, context){
        let name = this.name.text;

        let ref = this.id || `elem${g.counter++}`;

        let localContext = context.makeChild();
        localContext.container = ref;

        let lines = [];
        let scripts = [];

        let signature = `<${name} id="${ref}">`;

        // If there is only one argument and it's a literal
        if(this.args.statements.length === 1 && this.args.statements[0].type === "Literal"){
            signature += this.args.statements[0].generate(g, context);
            signature += `</${name}>`;
            lines = [signature];
        }
        else{
            if(this.args){
                lines.push(signature);

                let argLines = [];
                let argScripts = [];

                for(let arg of this.args.statements){
                    let tempLines = arg.generate(g, localContext);
                    argLines = argLines.concat(tempLines.html);
                    argScripts = argScripts.concat(tempLines.scripts);
                }

                lines = lines.concat(g.indent(argLines));
                scripts = scripts.concat(g.indent(argScripts));

                lines.push(`</${name}>`);
            }
            else{
                // self-closing tag
                lines = [signature.substr(0, -1) + "/" + ">"];
            }
        }

        return {
            html: lines,
            scripts: scripts.concat(this.generateAttrs(g, localContext))
        };
    }
    // This generates the html with javascript. Necessary for things like click events
    generateJS(g, context){
        let name = this.name.text;

        g.log(`Generating Call (js mode)`);

        let ref = `elem${g.counter++}`;

        let lines = [
            `let ${ref} = document.createElement("${name}");`
        ];

        let localContext = context.makeChild();
        localContext.container = ref;

        lines.concat(this.generateAttrs(g, localContext));

        if(this.args){
            for(let arg of this.args.statements){
                let argLines = arg.generate(g, localContext);

                lines = lines.concat(argLines);
            }
        }

        lines.push(`${context.container}.appendChild(${ref});`);

        return {
            html: [],
            scripts: lines,
        };
    }
    generateAttrs(g, context){
        let lines = [];
        if(this.attrs){
            // ES6 scope! :)
            lines.push(`{`);

            let attrLines = [`let attr;`];

            for(let attr of this.attrs.statements) {
                let value = attr.value.generate(g, context, 0);

                // TODO: if they did some bullshit like making an attr equal to an html element,
                // bitch at them
                this.attrLines.push(`attr = ${value};`);
                this.attrLines.push(`${context.container}.setAttribute("${attr.key}", attr);`);
            }

            lines.push(g.indent(attrLines));

            lines.push(`}`);
        }
        return lines;
    }
};