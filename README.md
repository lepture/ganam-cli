# Ganam Style Guide

> The command line tools for ganam.


## Install

Install with npm:

    $ npm install ganam-cli -g

Remember the `-g` option.

## Usage

The command line interface:

```
$ ganam -h

  Usage: ganam [options] <dir>

  Options:

    -o, --out <dir>        Output to <dir> when passing files
    -t, --theme <name>     Specify the theme, default is github
    -u, --use <path>       Utilize the stylus plugin at <path>
    -I, --include <path>   Add <path> to lookup paths
    -c, --compress         Compress css output
    --import <file>        Import stylus <file>
    --include-css          Include regular css on @import
    -w, --watch            Watch file(s) for changes and re-compile
    -q, --quiet            Only show warn logs
    -v, --verbose          Show more logs
    -V, --version          Display the version
    -h, --help             Display this help menu
```

The style file structure:

```
package.json
README.md
guide/
  buttons.styl
  forms.styl
```

## Style Syntax

Find the syntax at: [Ganam Parser](https://github.com/lepture/ganam#syntax)

In CSS, it is something like:

```css
/*
1.1 Classy Buttons

Classy buttons is clickable form action buttons,
it is widely usage in forms.

:hover - button when hovered
:disabled - button when disabled
.disabled - the same as :disabled

Examples:

    <button class="classy {{modifier}}">Button</button
    <a class="button-classy {{modifier}}">Button</a>
*/

button.classy,
a.button-classy {
  color: #d64;
}
button.classy:hover {
  color: #000;
}
```

In stylus, you can use `//` as the comment leading, like:

```
// 1.1 Classy Buttons
//
// Classy buttons ....
```

There are five parts of a section:

### Title

The first line with a version number is the title, which is:

```
1.1 Classy Buttons
```

### Description

The lines below title and above modifiers, which is:

```
Classy buttons is clickable form action buttons,
it is widely usage in forms.
```

### Modifiers

Modifiers are key value pairs to decorate the element:

```
:hover - button when hovered
:disabled - button when disabled
.disabled - the same as :disabled
```

The key is a class or a pseudo-class before `-`.

Modifiers are not required, the section may contain no modifiers.

### Examples

Examples are code to be rendered. If the section has modifiers, the example code will be rendered (modifiers.length) times, and the variable `{{modifier}}` will be replaced every time.

Examples can be a path to a file:

```
Examples: ./code.html
```

## Theme

Ganam-cli ships with a default theme. If you are not satisfied with it, you can write your own theme.

A theme folder is something like:

```
template.html     <- required
theme.js          <- optional
...               <- any other files will be copied to out directory
```

### template.html

Template is powered by [swig](http://paularmstrong.github.com/swig/), you should learn some basic knowledge of swig markup.

Variables that can be used in template:

- **styleguides**: always available
- **readme**: only available when render readme
- **guide**: only available when render this specified guide
- **theme**: (*optional*), variables that you defined in `theme.js`
- **pkg**: (*optional*), variables that you defined in `package.json`
- **permalink_url**: a function to generate permalink


#### guide

The `guide` variable is an object, which looks like:

```js
{
    "order": 1,
    "name": "foo",
    "filename": "foo.styl",
    "filepath": "./foo.styl",
    "css": "button {.....}",
    "sections": [....]
}
```

`sections` is a list of section object, which looks like:

```js
{
    "name": "1.1",
    "title": "Classy Buttons"
    "description": "Classy buttons is clickable form action buttons,\nit is widely usage in forms.",
    "modifiers": [
        {"name": ":hover", "description": "button when hovered"},
        {"name": ":disabled", "description": "button when disabled"},
        {"name": ".disabled", "description": "the same as :disabled"}
    ],
    "html": "<button class='classy {{modifier}}'>Button</button\n<a class='button-classy {{modifier}}'>Button</a>",
    "examples": [
        {"name": "", "code": "<button class='classy '>Button</button>......"},
        {"name": ":hover", "code": "<button class='classy pseudo-class-hover'>Button</button>......"},
        {"name": ":disabled", "code": "<button class='classy pseudo-class-disabled'>Button</button>......"},
        ...
    ]
}
```

#### styleguides

Styleguides is a list of `guide` object ordered by `order`.


#### readme

Readme is the content in `README.md`.

Ganam will search readme file in the style guide folder first, if not found, it will search readme file in the current working directory.


### theme.js

You can define some information in `theme.js` which can be used in `template.html`.

Take an example, your `theme.js` is:

```js
exports.name = 'ganam'
```

In your `template.html`, you can use the `theme` variable:

```
<h1>{{theme.name}}</h1>
```

If you want to extend the filters, add in your `theme.js`:

```js
exports.filters = {
    subtring: function(s, start, end) {
        return s.substring(start, end)
    }
}
```

And then, you can use the `substring` filter in `template.html`:

```
{{ "ganam"|subtring(0, 2) }}
```

## Changelog

**Jun 6, 2013** `0.3.1`

- Update ganam (~0.2.0)
- Pure theme support header feature [lepture/ganam#3](https://github.com/lepture/ganam/issues/3)

**Jun 6, 2013** `0.3.0`

- Read data from `theme.js` and `package.json`
- Improve theme, and improve how to organize theme
- Support render readme as index page. [#5](https://github.com/lepture/ganam-cli/issues/5)
- Add watch option for command line. [#4](https://github.com/lepture/ganam-cli/issues/4)
- Add pure theme. [#2](https://github.com/lepture/ganam-cli/issues/2)


**May 8, 2013** `0.2.0`

- Support recurse walk directory. [#1](https://github.com/lepture/ganam-cli/issues/1)
- Bugfix, missing option `-c, --compress`. [#3](https://github.com/lepture/ganam-cli/issues/3)
- Show ganam version: `ganam --version`.

**May 8, 2013** `0.1.0`

First preview release.
