var fs = require('fs');
var path = require('path');
var ganam = require('ganam');
var swig = require('swig');

swig.init({
  autoescape: false,
  cache: false,
  allowErrors: true
});


function compileFile(filepath, options) {
  var theme = options.theme || 'github';

  var styleguide = ganam.styleFileSync(filepath, options);

  var template;

  if (/\.html$/.test(theme)) {
    // not built-in theme
    template = path.resolve(theme)
  } else if (theme.indexOf('/') !== -1) {
    template = path.join(path.resolve(theme), 'template.html');
  } else {
    template = path.join(__dirname, theme, 'template.html');
  }

  if (!fs.existsSync(template)) {
    throw new Error('template not found.');
  }

  var tpl = swig.compileFile(template);
}
