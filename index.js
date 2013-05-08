var fs = require('fs');
var path = require('path');
var ganam = require('ganam');
var swig = require('swig');

swig.init({
  autoescape: false,
  cache: false,
  allowErrors: true
});

var log = {
  level: 'info',

  warn: function(msg) {
    process.stdout.write('  \x1b[33mwarn\x1b[0m : ' + msg);
  },

  info: function(msg) {
    if (this.level === 'warn') return;
    process.stdout.write('  \x1b[32mwarn\x1b[0m : ' + msg);
  },

  debug: function(msg) {
    if (this.level !== 'debug') return;
    process.stdout.write('  debug : ' + msg);
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

  var out = options.out || 'out';
  var src = options.src || 'guide';
  var theme = options.theme || 'github';
  var tpl = compileFile(theme);

  var guides = [];
  fs.readdirSync(src).forEach(function(file) {
    if (!fs.statSync(file).isFile()) {
      return;
    }
    var guide = ganam.styleSync(
      path.join(src, file), options
    );
    if (guide && guide.sections.length) {
      guide.filename = file;
      guide.name = file.replace(/\.(\w+)$/, '.html');
      guides.push(guide);
      log.info('valid guide - ' + file);
    } else {
      log.warn('invalid guide - ' + file);
    }
  });
  guides.sort(function(a, b) {
    return a.order - b.order;
  });

  guides.forEach(function(guide) {
    var dest = path.join(out, guide.name + '.html');
    var data = tpl.render({guide: guide, styleguides: guides});
    write(dest, data);
  });

  copy(theme, out);
};


function findTheme(name) {
  var dir = path.resolve(__dirname, 'themes');
  if (fs.existsSync(path.join(dir, name))) {
    return path.join(dir, name);
  }
  return path.resolve(name);
}


function compileFile(theme) {
  var dir = findTheme(theme);
  console.log(dir)
  var template = path.resolve(dir, 'template.html');

  if (!fs.existsSync(template)) {
    throw new Error('template not found.');
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
