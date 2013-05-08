# Ganam Style Guide

> The command line tools for ganam.

**ON DEVELOPMENT**

## Usage

The command line interface:

```
$ ganam -h

  Usage: ganam [options] <dir>

  Options:

    -C, --config <path>    Speicify a config file
    -u, --use <path>       Utilize the stylus plugin at <path>
    -U, --inline           Utilize image inlining via data uri support
    -o, --out <dir>        Output to <dir> when passing files
    -I, --include <path>   Add <path> to lookup paths
    -c, --compress         Compress css output
    --import <file>        Import stylus <file>
    --include-css          Include regular css on @import
```

The style file structure:

```
guide/
  buttons.styl
  forms.styl
```

## Style Syntax

Find the syntax at: [Ganam Parser](https://github.com/lepture/ganam#syntax)
