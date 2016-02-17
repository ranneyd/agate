/*
    Macrosyntax
    name        | def
    ---------------------------------
    Program     | Block
    Block       | (Statement newline)+
    Statement   | Element
                | Exp
                | Control
                | comment
                | js
                | css
    Element     | Tag(Class)?(Id)?Attrs?(ChildBlock?|Event ChildBlock)
    Attrs       | openParen ((Attr Exp)|Class|Id)+ closeParen
    ChildBlock  | newline indent Block dedent
    Tag         | bareword|script|style
    Class       | dot bareword
    Id          | hash bareword
    Attr        | bareword
    Exp         | Exp1 ( question Exp1 colon Exp1)
    Exp1        | Exp2 (boolop Exp2)*
    Exp2        | Exp3 (relop Exp3)*
    Exp3        | Exp4 (addop Exp4)*
    Exp4        | Exp5 (multop Exp5)*
    Exp5        | prefixop? Exp6
    Exp6        | Val | openParen Exp closeParen
    Val         | ElemAttr | Lit | id | FuncCall
    Lit         | stringlit | intlit | floatlit | boollit
    ElemAttr    | Id?tilde Attr
    Event       | tilde("on")?bareword
    FuncCall    | bareword(Exp|openParen(Exp)*closeParen)
    Control*    | If | For | While
    If          | "if" Exp ChildBlock ("else" "if" Exp ChildBlock)*("else" ChildBlock)?
    For         | "for" id "in" Array|stringlit|Range ChildBlock
    Array       | openSquare Lit+ closeSquare
    Range       | openSquare intLit range intLit closeSquare
*/

module.exports = (tokens) => {
    var tree = {};

    var Program = function(){
        Block();
    };
    var Block = function(){
        
    };
    var Statement = function(){

    };
    var Element = function () {

    };     
    var Attrs = function () {

    };       
    var ChildBlock = function () {

    };  
    var Tag = function () {

    };         
    var Class = function () {

    };   
    var Id = function () {

    };       
    var Attr = function () {

    };
    var Exp = function () {

    };         
    var Exp1 = function () {

    };     
    var Exp2 = function () {

    };    
    var Exp3 = function () {

    };    
    var Exp4 = function () {

    };     
    var Exp5 = function () {

    };     
    var Exp6 = function () {

    };     
    var Val = function () {

    };      
    var Lit = function () {

    };  
    var ElemAttr = function () {

    };  
    var Event = function () {

    };       
    var FuncCall = function () {

    };    
    var Control = function () {

    };   
    var If = function () {

    };          
    var For = function () {

    };         
    var ArrayDef = function () {

    };       
    var Range = function () {

    };

    Program();
    return {
        status: "success"
    };
}