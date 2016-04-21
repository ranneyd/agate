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
    generateJS( g ){
        let name = this.name.text;

        if(g.isFunction(name)){
            g.pushScripts(`${name}_func(`);

            for(let arg of this.args.statements){
                let b = g.branch();

                if(arg.type === "Literal"){
                    b.pushScripts(arg.text)
                }
                else{
                    arg.generateJS(b);
                    b.wrapClosure();
                }
                g.merge(b, ", ");
            }
            // get rid of the pesky end comma/space
            g.scriptChop(2);
            g.merge(g.branch().pushScripts(")"));
            // Should parent be responsible for appending? Probably
        }
        else if (g.isBuiltInFunction(name)){
            // TODO: do this too
        }
        else{
            let ref = `elem_${g.counter++}`;
            let lines = [
                `let ${ref} = document.createElement("${name}");`,
            ];

            g.pushScripts(lines);
            //TODO: attrs

            if(this.args){
                let b = g.branch();
                b.container = ref;
                for(let arg of this.args.statements) {
                    // TODO: is there a way to make the parent responsible for appending?
                    arg.generateJS(b);
                }
                g.join(b, ";");
            }

            g.pushScripts(`${g.container}.appendChild(${ref})`);
        }
    }
};