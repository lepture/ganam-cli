exports.name = 'pure';

exports.filters = {
  purename: function(name) {
    var names = name.split('/');
    return names[names.length - 1];
  }
};
