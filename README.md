![Logo](/logo_small.png)

#Agate

##Introduction

Agate is a template/scripting/markup hybrid language that aims to fix various problems with the basic web development experience. Agate aims to simply, integrate, and expand HTML, CSS, and JavaScript. Agate allows the programmer to layout a web document with a much more terse and sensible language than HTML. It adds much-needed features to CSS (inspired by LESS) and implements common JavaScript components in a way that makes sense. It allows for templating and variables to be used across markup, scripts, and styles. But the best part is it compiles directly into HTML, CSS, and JavaScript. No libraries are required; code output by the Agate compiler is indistinguishable from code made without it.
##Macrosyntax

|Name          | Def                                                           |
|--------------|---------------------------------------------------------------|
|Program       |`Block`                                                        |
|Block*        |`Statement ((?<!ChildBlock)newline)?)+`                        |
|Statement     |`Control`                                                      |
|              |`Assignment`                                                   |
|              |`Definition`                                                   |
|              |`Exp                                                           |
|Control       |`If | For | While`                                             |
|If            |`if Exp ChildBlock (else-if Exp ChildBlock)*(else ChildBlock)?`|
|For           |`for id in (Array|stringlit|id) ChildBlock`                    |
|Array         |`openSquare (Exp+|ArgBlock)? closeSquare`                      |
|ArgBlock      |`newline indent (Arg newline)+ dedent`                         |
|Arg           |`Exp`                                                          |
|While         |`while Exp ChildBlock`                                         |
|Assignment    |`id equals Exp`                                                |
|Definition    |`def bareword openParen id* closeParen ChildBlock`             |
|Exp           |`Literal|Array|HashMap|id`                                     |
|              |`openParen Exp closeParen`                                     |
|              |`Exp (question Exp colon Exp)?                                 |
|              |`Exp (boolop Exp)*`                                            |
|              |`Exp (relop Exp)*`                                             |
|              |`Exp (addop Exp)*`                                             |
|              |`Exp (multop Exp)*`                                            |
|\*\*          |`(prefixop|addop)? Exp`                                        |
|              |`Exp postfixop?`                                               |
|              |`Call`                                                         |
|              |`Exp tilde bareword (ArgBlock|Args)?`                          |
|Literal       |`stringlit|intlit|floatlit|boollit`                            |
|Call          |`bareword(dot bareword)*(hash bareword)?Attrs?Args`            |
|Attrs         |`openSquare (Attr+|AttrBlock)? closeSquare`                    |
|AttrBlock     |`newline indent (Attr newline)+ dedent`                        |
|Attr          |`bareword equals Exp`                                          |
|Args          |`openParen (Arg+|ArgBlock)? closeParen`                        |
|              |`Arg`                                                          |
|HashMap       |`openCurly (Attr+|AttrBlock)? closeCurly`                      |
|ChildBlock    |`newline indent (Block|JSBlock|CSSBlock) newline dedent`       |
|JSBlock       |`id? (js id? newline?)+`                                       |
|CSSBlock      |`id? (css id? newline?)+`                                      |

\*Statements end in newlines. However, a dedent will always follow a newline. So for ChildBlock to work properly, it has to gobble the newline. Thus, the negative lookbehind
\*\*Both appops are also prefixops
##Features (Overview)

- Terse, JavaScript-like markup
- Variables accessible in markup, styles, and scripts
- Templates for easy code and widget reuse
- Nested classes in styles
- Compilation to HTML, JavaScript, and CSS
- Compiler options to output in one document, or three (one HTML, one JS, and one CSS)

##Features (Specific)

###General

- Whitespace-based code blocking.
- Loosely typed variables delimited by the `@` symbol.
    - Supports Booleans (`boolean`), integers (`int`), floating-point numbers (`float`), strings (`strings`), and arrays (`array`).
    - Type specification is not required because type can be inferred.
    - Variable assignment via the `=` symbol.
- Basic arithmetic operators and parentheses are supported
    - `0`, `0.0`, and `""` evaluate to `false` when converted to a `boolean`. All other values evaluate to true.
    - Integers divided by integers result in truncated integers.
        - `3 / 2` produces `1`.
    - Floats divided by integers or integers divided by floats will be floats.
        - `3.0 / 2` and `3 / 2.0` both produce `1.5`.
    - Types can be casted with `boolean`, `int`, `float`, and `string`.
        - Parentheses are optional.
        - Casting to `boolean` is almost never necessary, because all values can be automatically cast to a boolean value.
        - `int 3.0 / 2` and `int(3.0 / 2)` produce `1`.
        - `float(2 + 2)` produces `4.0`
        - `string(float 4)` produces `'4.0'`
    - Variables and literals can be concatenated by placing them next to each other
        - Concatenation will always result in a string.
        - `"Hello " 4.0 " World"` produces `"Hello 4.0 World"`.
        - `"Hello " float(2 + 2) " World"` produces `"Hello 4.0 World"`.
- Simple control blocks such as if/else and for loops.
    - Includes a ternary `statement ? true_case : false_case` operator
- Functions
    - Function signatures are the `def` keyword, followed by an identifier, followed by parenthesized parameters
        - ex: `def my_function(arg1 arg2 arg3)`
    - Indentation block below constitutes body of function
    - Functions are invoked with the identifier, followed by parenthesized arguments
        - ex: `my_function(1 "string" @variable)`
    - Any markup generated in functions will be inserted where function is called
    - Functions return the last computed value
        - The `return` keyword can also be used in the usual way
- Import widgets (copy/paste style) into code with `> filename`.
    - Importing copy/pastes the code THEN compiles as if they were one document. `>> filename` imports code as raw text and does not compile it.
- Invoke templates with `| filename`.
- Comments are C-style, `\\` denoting a single-line comment.
    - Comments will insert HTML comments into the code.
    - Adding an exclamation point (`\\! comment`) will prevent the comment from occurring in HTML in the compiled document.
    - Block comments can be achieved with indentation. 

###Templates

- Templates define labels with square brackets, such as `[label]`.
- Files that invoke templates will define the contents of these labels by indenting after a template invocation, inserting labels with square brackets (`[label]`), then inserting template content after the labels
    - Indentation block after label will be inserted where the corresponding label in the template is.
    - "One liners" can be written right after the name of a label.
- Templating works like reverse widget importing. Code will be inserted and then the resultant file will be compiled.

###HTML
- Any HTML tag can be placed with the tag name.
    - `p` in agate produces `<p></p>`.
    - HTML attributes can be parenthesized.
        - They are `name 'value'` and comma-separated.
        - Quotes around `value` are optional.
        - `id` and `class` have shortcuts `#` and `.` respectively and do not require a space.
            - `p(#ourP, .red)` produces `<p id="ourP" class="red"></p>`.
        - ex: `img(#ourImage, .thumbnail, src image.jpg, alt "Alt text!")`
    - Content of tag (assuming non-self-closing tag) is in indented block
        - Contents can be included in one line if short, such as `p "contents of p"`
            - Contents can include variables and literals.
                - Note, that a string literal containing raw HTML will be inserted into the resultant document. 
            - This content can include tags
                - Content belonging to tag is _non-greedy_.
                    - `p strong "bold" " stuff"` produces `<p><strong>bold</strong> stuff</p>`.
                - Curly brackets can optionally be used to change this behavior
                    - `p{strong "bold" " stuff"}` produces `<p><strong>bold stuff</strong></p>`.
- Import external CSS and JavaScript files with `css "filename"` and `js "filename"` shortcuts, respectively.
- Some basic, common JavaScript idioms will be implemented directly in Agate.
    - Elements can be selected by id or class name via `#name` and `.name`, respectively.
        - Any element in the document can be accessed anywhere in the document.
    - Any selection can be preceded by a `~event` where `event` is any HTML event attribute.
        - i.e. `~onclick`, `~onsubmit`,`~onpause`
            - The "on" is optional, so `.click`, `.submit`, and `.pause` would work.
        - The contents of the event block will execute when that event happens.
            - For instance, when a form is submitted, a `p` tag that says "thank you for submitting" can appear.
        - Attributes of the parent element can be accessed with just `~attr`.
            - Imagine `this~attr` but with an implicit `this` because having `this` is lame.
        - Note: inserting an element counts as a selection, so `p(#myP) "a paragraph"` followed by `#myP~mouseover` is equivalent to `p(#myP) "a paragraph" ~mouseover`

###CSS
- Raw CSS can be put in a `style` block
    - Contents of a `style` block will be passed directly into a `<style type="text/css"></style>` tag.
- CSS placed in `style` blocks will be preprocessed
    - Nested classes will be compiled, similar to how they work in LESS and SASS
    - Variable values introduced earlier in the document can be referenced in the CSS
        - If, before the `style` block, the programmer writes `@foo = "red"` then the CSS `background-color:@foo` will be converted into `background-color: red`
- CSS can be imported and templated in the same way as normal Agate
    - `>` and `|` statements can be written at top-level indentation and will be escaped from the CSS
    - ex: injecting the contents of `p_styles.css` would go like 
    ```
    style
        p: {
            background-color: red;
    > p_styles.css
        }
    ```
###JS
- Raw JavaScript can be put in a `script` block.
    - Contents of a `script` block will be passed directly into a `<script type="text/javascript"></script` tag.
- JavaScript placed in `script` blocks will be preprocessed.
    - Any time `'@variable'` occurs, for any identifier in place of `variable`, that entire statement will be replaced with the corresponding value.
    - ex: the following creates an alert dialog that says `42`
    ```
    @foo = 42
    ...
    script
        alert('@foo');
    ```
- JavaScript can be imported and templated in the same way CSS is imported and templated, as described above.

###Options
- Insert JavaScript where JavaScript-compiled code occurs or combine all JavaScript in `script` tag at the end of the document
- Compile code into one HTML document, or compile into an HTML, a CSS, and a JavaScript file.

###Misc
- Values taken from attributes via selectors will be implicitly typecast
    - The agate compiler will try to figure out the best return type of `#myInput~value`
    - The precedence is as follows
        - If the value is `true`, `false`, `0`, or `1`, the value is a Boolean
            - This does mean that even if a value `0` or `1` is meant to be an integer, it will be initially cast as a boolean. However, all arithmetic operators implicitly convert Booleans to integers or floats depending on the context so it shouldn't matter.
        - Otherwise, if the value is an integer, the type is made integer
        - Otherwise, if the value is a float ("digits . digits E digits"), the type is made float
            - Actual matching pattern for floats: `/(\.\d+|\d+(\.\d+)?)([Ee]\d+)?/`
        - Otherwise, value is made a string.
- We detect for circular dependencies.