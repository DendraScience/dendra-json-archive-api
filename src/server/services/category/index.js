import filter from 'feathers-query-filters'
import {errors} from 'feathers-errors'
import {matcher, sorter} from 'feathers-commons'
import hooks from './hooks'
import fs from 'fs'
import path from 'path'

import {CATEGORY_FILE_REGEX} from '../../lib/consts'
import {parseCategoryId, parseParentCategoryId} from '../../lib/utils'

class Service {
  constructor (options) {
    this.basePath = options.basePath
    this.paginate = options.paginate || {}
    this._matcher = options.matcher || matcher
    this._sorter = options.sorter || sorter

    // HACK: Syntax highlighting breaks on class methods named 'get'
    this.get = this._get
  }

  _find (params, getFilter = filter) {
    const {query, filters} = getFilter(params.query || {})

    let p = {
      parentCategoryPath: this.basePath
    }

    if (typeof query.parent_category_id === 'string') {
      p = parseParentCategoryId(query.parent_category_id, this.basePath)
      delete query.parent_category_id
    } else if (typeof query._id === 'string') {
      p = parseCategoryId(query._id, this.basePath)
    }

    let values = []

    return new Promise((resolve, reject) => {
      fs.readdir(p.parentCategoryPath, (err, files) => err ? reject(err) : resolve(files))
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
            fs.stat(path.join(p.parentCategoryPath, name), (err, stats) => {
              if (err) return reject(err)

              const item = {
                _id: name
              }

              if (stats.isDirectory()) {
                if (p.parentCategoryId) {
                  item._id = `${p.parentCategoryId}-${item._id}`
                  item.parent_category_id = p.parentCategoryId
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
      values = values.filter(this._matcher(query))

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

  _get (id) {
    const p = parseCategoryId(id, this.basePath)
    const item = {}

    return new Promise((resolve, reject) => {
      fs.stat(p.categoryPath, (err, stats) => {
        if (err) return reject(err)

        item._id = p.categoryId

        if (p.parentCategoryId.length) item.parent_category_id = p.parentCategoryId

        item.created_at = stats.ctime
        item.updated_at = stats.mtime

        resolve()
      })
    }).catch(err => {
      if (err.code !== 'ENOENT') throw err
      throw new errors.NotFound(`No record found for id '${id}'`)
    }).then(() => {
      return item
    })
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
