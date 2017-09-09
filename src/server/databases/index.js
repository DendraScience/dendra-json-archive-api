module.exports = (function () {
  return function () {
    const app = this
    const databases = app.get('databases')

    if (databases.file) app.configure(require('./file'))
  }
})()
