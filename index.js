var fs = require('fs');
var path = require('path');
var ganam = require('ganam');
var swig = require('swig');
var format = require('util').format;

swig.init({
  autoescape: false,
  cache: false,
  allowErrors: true,
  filters: {
    markdown: require('marked'),
    highlight: function(code, lang) {
      if (!lang) {
        code = code
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
        return '<pre>' + code + '</pre>';
      }

      if (lang === 'html') {
        lang = 'xml';
      }

      code = require('highlight.js').highlight(lang, code).value;
      return format(
        '<pre class="highlight"><code class="%s">%s</code></pre>',
        lang, code
      );
    }
  }
});

var log = {
  level: 'info',

  warn: function(msg) {
    console.log('  \x1b[33mwarn\x1b[0m : ' + msg);
  },

  info: function(msg) {
    if (this.level === 'warn') return;
    console.log('  \x1b[32minfo\x1b[0m : ' + msg);
  },

  debug: function(msg) {
    if (this.level !== 'debug') return;
    console.log(' \x1b[34mdebug\x1b[0m : ' + msg);
  }
}

module.exports = function(options) {
  options = options || {};

  if (options.verbose) {
    log.level = 'debug';
  }
  if (options.quiet) {
    log.level = 'warn';
  }

  var src = options.src || 'guide';
  options.paths = options.paths || [];
  options.paths.push(path.resolve(src));

  var out = options.out || 'out';
  var theme = options.theme || 'github';
  var tpl = compileFile(theme);

  var guides = [];
  recurse(src, function(filepath, rootdir, subdir) {
    // if the filename startswith _, ignore it.
    var filename = unixifyPath(path.relative(src, filepath));
    if (filename.charAt(0) === '_') {
      log.debug('ignore - ' + filename);
      return;
    }
    if (subdir && subdir.charAt(0) === '_') {
      log.debug('ignore - ' + filename);
      return;
    }
    var guide = ganam.styleSync(filepath, options);
    if (guide && guide.sections.length) {
      guide.filename = filename;
      guide.name = filename.replace(/\.(\w+)$/, '');
      guides.push(guide);
      log.info('valid guide - ' + filename);
    } else {
      log.warn('invalid guide - ' + filename);
    }
  });
  guides.sort(function(a, b) {
    return a.order - b.order;
  });

  guides.forEach(function(guide) {
    var dest = path.join(out, guide.name + '.html');
    var data = {guide: guide, styleguides: guides}
    data.permalink = function(item) {
      var url = path.relative(path.dirname(guide.name), item.name);
      return url = unixifyPath(url) + '.html';
    };
    write(dest, tpl.render(data));
  });

  copy(theme, out);
};


function findTheme(name) {
  var dir = path.resolve(__dirname, 'themes');
  if (fs.existsSync(path.join(dir, name))) {
    return path.join(dir, name);
  }
  var filepath = path.resolve(name);
  if (!fs.existsSync(filepath)) {
    throw new Error('theme not found: ' + name);
  }
  return filepath;
}


function compileFile(theme) {
  var dir = findTheme(theme);
  var template = path.resolve(dir, 'template.html');

  if (!fs.existsSync(template)) {
    throw new Error('template not found: ' + template);
  }

  return swig.compileFile(template);
}


function copy(theme, dest) {
  var dir = findTheme(theme);

  recurse(dir, function(filepath) {
    var filename = path.relative(dir, filepath);
    if (filename === 'template.html') {
      return false;
    }
    var out = path.join(dest, filename);
    // make sure the directory exists
    mkdir(path.dirname(out));
    var content = fs.readFileSync(filepath);
    log.debug('copy - ' + filename);
    fs.writeFileSync(out, content);
  });
}


function write(filepath, content) {
  mkdir(path.dirname(filepath));
  fs.writeFileSync(filepath, content);
}


function recurse(rootdir, callback, subdir) {
  var abspath = subdir ? path.join(rootdir, subdir) : rootdir;
  fs.readdirSync(abspath).forEach(function(filename) {
    var filepath = path.join(abspath, filename);
    if (fs.statSync(filepath).isDirectory()) {
      recurse(rootdir, callback, unixifyPath(path.join(subdir || '', filename)));
    } else {
      callback(unixifyPath(filepath), rootdir, subdir, filename);
    }
  });
}


function mkdir(dirpath, mode) {
  if (fs.existsSync(dirpath)) return;

  mode = mode || (parseInt('0777', 8) & (~process.umask()));

  dirpath.split(path.sep).reduce(function(parts, part) {
    parts += part + '/';
    var subpath = path.resolve(parts);
    if (!fs.existsSync(subpath)) {
      fs.mkdirSync(subpath, mode);
    }
    return parts;
  }, '');
}


function unixifyPath(filepath) {
  if (process.platform === 'win32') {
    return filepath.replace(/\\/g, '/');
  }
  return filepath;
}
