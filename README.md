# Ganam Style Guide

> The command line tools for ganam.

**ON DEVELOPMENT**

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
    -q, --quiet            Only show warn logs
    -v, --verbose          Show more logs
    -V, --version          Display the version
    -h, --help             Display this help menu
```

The style file structure:

```
guide/
  buttons.styl
  forms.styl
```

## Style Syntax

Find the syntax at: [Ganam Parser](https://github.com/lepture/ganam#syntax)
