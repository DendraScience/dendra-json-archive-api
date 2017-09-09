'use strict';

module.exports = function () {
  return function () {
    const app = this;
    const file = app.get('databases').file;

    if (file.archive) app.configure(require('./archive'));
  };
}();