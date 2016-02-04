![Logo](/logo_small.png)

#Agate

##Introduction

Agate is a template/scripting/markup hybrid language that aims to fix various problems with the basic web development experience. Agate aims to simply, integrate, and expand HTML, CSS, and JavaScript. Agate allows the programmer to layout a web document with a much more terse and sensible language than HTML. It adds much-needed features to CSS (inspired by LESS) and implements common JavaScript components in a way that makes sense. It allows for templating and variables to be used across markup, scripts, and styles. But the best part is it compiles directly into HTML, CSS, and JavaScript. No libraries are required; code output by the Agate compiler is indistinguishable from code made without it.

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
    - Supports integers (`int`), floating-point numbers (`float`), strings (`strings`), and arrays (`array`).
    - Type specification is not required because type can be inferred.
    - Variable assignment via the `=` symbol.
- Basic arithmetic operators and parentheses are supported
    - Integers divided by integers result in truncated integers.
        - `3 / 2` produces `1`.
    - Floats divided by integers or integers divided by floats will be floats.
        - `3.0 / 2` and `3 / 2.0` both produce `1.5`.
    - Types can be casted with `int`, `float`, and `string`.
        - Parentheses are optional
        - `int 3.0 / 2` and `int(3.0 / 2)` produce `1`.
        - `float(2 + 2)` produces `4.0`
        - `string(float 4)` produces `'4.0'`
    - Variables and literals can be concatenated by placing them next to each other
        - Concatenation will always result in a string.
        - `"Hello " 4.0 " World"` produces `"Hello 4.0 World"`.
        - `"Hello " float(2 + 2) " World"` produces `"Hello 4.0 World"`.
- Simple control blocks such as if/else and for loops.
    - Includes a ternary `statement ? true_case : false_case` operator
- Mixins
    - Mixin signatures are the `def` keyword, followed by an identifier, followed by parenthesized parameters
        - ex: `def my_mixin(arg1, arg2, arg3)`
    - Indentation block below constitutes body of function
    - Mixins are invoked with the identifier, followed by parenthesized arguments
        - ex: `my_mixin(1, "string", @variable)`
    - Any markup generated in functions will be inserted where mixin is called
- Import widgets (copy/paste style) into code with `> filename`.
    - Importing copy/pastes the code THEN compiles as if they were one document. `>> filename` imports code as raw text and does not compile it.
- Invoke templates with `| filename`.

###Templates

- Templates define labels at top-level indentation followed by colons, such as `label:`.
    - Indentation block after a label in a template will be the default value. 
- Files that invoke templates will define the contents of these labels by putting colons followed by label names at top-level indentation, such as `:label`.
    - Indentation block after label will be inserted where the corresponding label in the template is.
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



###Options
- Insert JavaScript where JavaScript-compiled code occurs or combine all JavaScript in `script` tag at the end of the document
- Compile code into one HTML document, or compile into an HTML, a CSS, and a JavaScript file.