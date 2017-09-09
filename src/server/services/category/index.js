import filter from 'feathers-query-filters'
import {sorter} from 'feathers-commons'
import hooks from './hooks'
import fs from 'fs'
import path from 'path'

const CATEGORY_FILE_REGEX = /^\w+$/i

class Service {
  constructor (options) {
    this.basePath = options.basePath
    this.paginate = options.paginate || {}
    this._sorter = options.sorter || sorter

    // HACK: Syntax highlighting breaks on class methods named 'get'
    this.get = this._get
  }

  setup (app) {
    this.app = app
  }

  _find (params, getFilter = filter) {
    const {query, filters} = getFilter(params.query || {})

    const categoryId = typeof query.parent_category_id === 'string' ? query.parent_category_id.toLowerCase() : ''
    const categoryPath = path.join(this.basePath, ...categoryId.split('-'))

    let values = []

    return new Promise((resolve, reject) => {
      fs.readdir(categoryPath, (err, files) => err ? reject(err) : resolve(files))
    }).catch(err => {
      if (err.code !== 'ENOENT') throw err
      return []
    }).then(files => {
      /*
        Obtain file stats.
       */

      let step = Promise.resolve()

      files.filter(name => CATEGORY_FILE_REGEX.test(name)).forEach(name => {
        step = step.then(() => {
          return new Promise((resolve, reject) => {
            fs.stat(path.join(categoryPath, name), (err, stats) => {
              if (err) return reject(err)

              const item = {
                _id: name
              }

              if (stats.isDirectory()) {
                if (categoryId.length) {
                  item._id = `${categoryId}-${item._id}`
                  item.parent_category_id = categoryId
                }

                item.created_at = stats.ctime
                item.updated_at = stats.mtime

                values.push(item)
              }

              resolve()
            })
          })
        })
      })

      return step
    }).then(() => {
      const total = values.length

      if (filters.$sort) {
        values.sort(this._sorter(filters.$sort))
      }

      if (typeof filters.$limit !== 'undefined') {
        values = values.slice(0, filters.$limit)
      }

      return Promise.resolve({
        total,
        limit: filters.$limit,
        data: values
      })
    })
  }

  find (params) {
    const paginate = typeof params.paginate !== 'undefined' ? params.paginate : this.paginate
    const result = this._find(params, query => filter(query, paginate))

    if (!(paginate && paginate.default)) {
      return result.then(page => page.data)
    }

    return result
  }
}

module.exports = (function () {
  return function () {
    const app = this
    const databases = app.get('databases')

    if (databases.file && databases.file.archive) {
      app.set('serviceReady',
        Promise.resolve(databases.file.archive.db).then(db => {
          app.use('/categories', new Service({
            basePath: db.basePath,
            paginate: databases.file.archive.paginate
          }))

          // Get the wrapped service object, bind hooks
          const categoryService = app.service('/categories')

          categoryService.before(hooks.before)
          categoryService.after(hooks.after)
        }))
    }
  }
})()
