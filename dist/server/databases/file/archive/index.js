'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function () {
  return function () {
    const app = this;
    const archive = app.get('databases').file.archive;
    const archivePath = path.resolve(archive.path);

    // Configure a new instance
    archive.db = new Promise((resolve, reject) => {
      fs.mkdir(archivePath, err => err && err.code !== 'EEXIST' ? reject(err) : resolve());
    }).then(() => {
      return {
        basePath: archivePath
      };
    });
  };
}();