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
- Loosely typed variables delimited by the '@'' symbol.
    - Supports integers, floating-point numbers, strings, and arrays.
- Simple control blocks such as if/else and for loops.
    - Includes a ternary 'statement ? true_case : false_case' operator
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
    - 'p' in agate produces '<p></p>'.
    - HTML attributes can be parenthesized.
        - They are "name 'value'" and comma-separated.
        - Quotes around 'value' are optional.
        - 'id' and 'class' have shortcuts '#' and '.' respectively and do not require a space.
            - 'p(#ourP, .red)' produces `<p id="ourP" class="red"></p>`.
        - ex: 'img(#ourImage, .thumbnail, src image.jpg, alt "Alt text!")'
    - Content of tag (assuming non-self-closing tag) is in indented block
        - Contents can be included in one line if short, such as `p "contents of p"`
            - In this case, curly brackets are optional 


- Import external CSS and JavaScript files with 'css "filename"' and 'js "filename"' shortcuts, respectively.

