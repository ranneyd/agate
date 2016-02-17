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
    Element     | Tag(Class)?(Id)?Attrs?(ChildBlock?|Event ChildBlock)
    Attrs       | openParen ((Attr Exp)|Class|Id)+ closeParen
    ChildBlock  | indent Block dedent
    Tag         | bareword
    Class       | dot bareword
    Id          | hash bareword
    Attr        | bareword
    Exp         | Exp1 (boolop Exp1)*
    Exp1        | Exp2 (relop Exp2)*
    Exp2        | Exp3 (addop Exp3)*
    Exp3        | Exp4 (multop Exp4)*
    Exp4        | prefixop? Exp5
    Exp5        | Val | openParen Exp closeParen
    Val         | ElemAttr | Lit | id | FuncCall
    Lit         | stringlit | intlit | floatlit | boollit
    ElemAttr    | Id?tilde Attr
    Event       | tilde("on")?bareword
    FuncCall    | bareword(Exp|openParen(Exp)*closeParen)
    Control*    | If | For | While
    If          | "if" Exp ChildBlock ("else" "if" Exp ChildBlock)*("else" ChildBlock)?
    For         | 
*/

module.exports = (tokens) => {


    return {
        status: "success"
    };
}