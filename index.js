var fs = require('fs');
var path = require('path');
var ganam = require('ganam');
var format = require('util').format;

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
};

exports = module.exports = function(options) {
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

  var nm = path.resolve('node_modules');
  if (fs.existsSync(nm)) {
    options.paths.push(path.resolve(nm));
  }

  var out = options.out || 'out';
  var theme = options.theme || 'github';
  var tpl = compileTheme(theme);

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
    if (path.basename(filename).charAt(0) === '_') {
      log.debug('ignore - ' + filename);
      return;
    }
    var guide;
    if (options.verbose) {
      guide = ganam.styleSync(filepath, options);
    } else {
      try {
        guide = ganam.styleSync(filepath, options);
      } catch (e) {
        log.warn(e.message);
        guide = null;
      }
    }
    if (guide && guide.sections.length) {
      guide.filename = filename;
      guide.name = filename.replace(/\.(\w+)$/, '');
      guides.push(guide);
      log.info('guide - ' + filename);
    } else {
      log.warn('invalid - ' + filename);
    }
  });
  guides.sort(function(a, b) {
    return a.order - b.order;
  });

  // copy static files to out dir
  copy(theme, out);

  // generate index page
  var readme = findIndex(options.src);
  if (!readme) {
    readme = findIndex('.');
  }
  if (readme) {
    log.info('readme - ' + readme);
    tpl(out, 'index.html', {
      readme: fs.readFileSync(readme, 'utf8'),
      styleguides: guides
    });
  }

  // render style guides
  guides.forEach(function(guide) {
    tpl(out, guide.name + '.html', {guide: guide, styleguides: guides});
  });
};
exports.log = log;

function findIndex(src) {
  var names = fs.readdirSync(src).filter(function(name) {
    return /^readme\.md/i.test(name) || /^index\.md/i.test(name);
  });
  if (names.length) {
    return path.join(src, names[0]);
  }
}

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
exports.findTheme = findTheme;


function compileTheme(theme) {
  var dir = findTheme(theme);
  var template = path.resolve(dir, 'template.html');

  if (!fs.existsSync(template)) {
    throw new Error('template not found: ' + template);
  }
  var swig = require('swig');

  // default filters for swig
  var filters = {
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

  // load theme config
  var config = path.resolve(dir, 'theme.js');
  var themeConfig = {};
  if (fs.existsSync(config)) {
    log.debug('config - ' + config);
    themeConfig = require(config);
  }
  if (themeConfig.filters) {
    Object.keys(themeConfig.filters).forEach(function(key) {
      filters[key] = themeConfig.filters[key];
    });
  }

  // load package information
  var pkg = {};
  if (fs.existsSync('package.json')) {
    log.debug('package - package.json');
    pkg = require(path.resolve('package.json'));
  } else if (fs.existsSync('component.json')) {
    log.debug('package - component.json');
    pkg = require(path.resolve('component.json'));
  }

  swig.init({
    autoescape: false,
    cache: false,
    allowErrors: true,
    filters: filters
  });

  var tpl = swig.compileFile(template);

  return function(out, dest, data) {
    data.theme = themeConfig;
    data.pkg = pkg;
    data.permalink = function(item) {
      var dir = path.dirname(dest);
      var url = unixifyPath(path.relative(dir, item.name || item));
      if (item.name) {
        url += '.html';
      }
      return url;
    };
    write(path.join(out, dest), tpl.render(data));
  }
}
exports.compileTheme = compileTheme;


function copy(theme, dest) {
  var dir = findTheme(theme);

  recurse(dir, function(filepath) {
    var filename = path.relative(dir, filepath);
    if (filename === 'template.html') {
      return false;
    }
    if (filename === 'theme.js') {
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
  log.debug('write - ' + filepath);
  mkdir(path.dirname(filepath));
  fs.writeFileSync(filepath, content);
}
exports.write = write;


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
exports.recurse = recurse;


function mkdir(dirpath, mode) {
  if (fs.existsSync(dirpath)) return;
  log.debug('mkdir - ' + dirpath);

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
exports.mkdir = mkdir;


function unixifyPath(filepath) {
  if (process.platform === 'win32') {
    return filepath.replace(/\\/g, '/');
  }
  return filepath;
}
