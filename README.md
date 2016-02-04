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

- Whitespace-based code blocking
- Loosely typed variables delimited by the '@'' symbol
    - Supports integers, floating-point numbers, strings, and arrays
- Simple control blocks such as if/else and for loops
- Import widgets (copy/paste style) into code with '> filename'
    - Importing copy/pastes the code THEN compiles as if they were one document. '>> filename' imports code as raw text and does not compile it.
- Import templates with '| filename'

