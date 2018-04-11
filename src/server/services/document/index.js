import filter from 'feathers-query-filters'
import {errors} from 'feathers-errors'
import {matcher, sorter} from 'feathers-commons'
import hooks from './hooks'
import fs from 'fs'
import path from 'path'

import {DOCUMENT_FILE_REGEX} from '../../lib/consts'
import {parseCategoryId, parseDocumentId} from '../../lib/utils'

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
      categoryPath: this.basePath
    }

    if (typeof query.category_id === 'string') {
      p = parseCategoryId(query.category_id, this.basePath)
      delete query.category_id
    } else if (typeof query._id === 'string') {
      p = parseDocumentId(query._id, this.basePath)
    }

    let values = []

    return new Promise((resolve, reject) => {
      fs.readdir(p.categoryPath, (err, files) => err ? reject(err) : resolve(files))
    }).catch(err => {
      if (err.code !== 'ENOENT') throw err
      return []
    }).then(files => {
      /*
        Obtain file stats.
       */

      let step = Promise.resolve()

      files.filter(name => DOCUMENT_FILE_REGEX.test(name)).forEach(name => {
        step = step.then(() => {
          return new Promise((resolve, reject) => {
            fs.stat(path.join(p.categoryPath, name), (err, stats) => {
              if (err) return reject(err)

              const item = {}

              if (name.endsWith('.json')) {
                item._id = name.substr(0, name.length - 5)
                item.is_compressed = false
              }

              if (item._id) {
                if (p.categoryId) {
                  item._id = `${p.categoryId}-${item._id}`
                  item.category_id = p.categoryId
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
    const p = parseDocumentId(id, this.basePath)
    const item = {}

    return new Promise((resolve, reject) => {
      fs.stat(p.documentPath, (err, stats) => {
        if (err) return reject(err)

        item._id = p.documentId
        item.is_compressed = false

        if (p.categoryId.length) item.category_id = p.categoryId

        item.created_at = stats.ctime
        item.updated_at = stats.mtime

        resolve()
      })
    }).catch(err => {
      if (err.code !== 'ENOENT') throw err
      throw new errors.NotFound(`No record found for id '${id}'`)
    }).then(() => {
      return new Promise((resolve, reject) => {
        fs.readFile(p.documentPath, 'utf8', (err, data) => {
          if (err) return reject(err)

          // Async-ish JSON parsing
          setImmediate(() => {
            try {
              resolve(JSON.parse(data))
            } catch (parseErr) {
              reject(parseErr)
            }
          })
        })
      })
    }).then(content => {
      item.content = content

      return item
    })
  }

  _create (data, params) {
    const p = parseDocumentId(data._id, this.basePath)

    let step = Promise.resolve()

    p.categoryParts.forEach((name, i) => {
      step = step.then(() => {
        return new Promise((resolve, reject) => {
          const partialPath = path.join(this.basePath, ...p.categoryParts.slice(0, i + 1))
          fs.mkdir(partialPath, err => err && (err.code !== 'EEXIST') ? reject(err) : resolve())
        })
      })
    })

    return step.then(() => {
      return new Promise((resolve, reject) => {
        const content = data.content || {}

        fs.writeFile(p.documentPath, JSON.stringify(content), err => {
          if (err) return reject(err)

          resolve(this._get(p.documentId))
        })
      })
    })
  }

  create (data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this._create(current)))
    }

    return this._create(data, params)
  }

  remove (id, params) {
    const p = parseDocumentId(id, this.basePath)

    let item

    return this._get(p.documentId).then(res => {
      item = res

      return new Promise((resolve, reject) => {
        fs.unlink(p.documentPath, err => err && (err.code !== 'ENOENT') ? reject(err) : resolve())
      })
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
          app.use('/documents', new Service({
            basePath: db.basePath,
            paginate: databases.file.archive.paginate
          }))

          // Get the wrapped service object, bind hooks
          const documentService = app.service('/documents')

          documentService.before(hooks.before)
          documentService.after(hooks.after)
        }))
    }
  }
})()
