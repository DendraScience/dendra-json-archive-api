/**
 * Tests for category service
 */

const fs = require('fs')
const path = require('path')

describe('Service /categories', function () {
  const databases = main.app.get('databases')

  before(function () {
    if (databases.file && databases.file.archive) {
      return Promise.resolve(databases.file.archive.db).then(db => {
        try {
          fs.unlinkSync(path.join(db.basePath, 'xxx', 'yyy', 'zzz.json'))
        } catch (e) {}
        try {
          fs.rmdirSync(path.join(db.basePath, 'xxx', 'yyy'))
        } catch (e) {}
        try {
          fs.rmdirSync(path.join(db.basePath, 'xxx'))
        } catch (e) {}

        return main.app.service('/documents').create({
          _id: 'xxx-yyy-zzz'
        })
      })
    }
  })

  after(function () {
    if (databases.file && databases.file.archive) {
      return Promise.resolve(databases.file.archive.db).then(db => {
        try {
          fs.unlinkSync(path.join(db.basePath, 'xxx', 'yyy', 'zzz.json'))
        } catch (e) {}
        try {
          fs.rmdirSync(path.join(db.basePath, 'xxx', 'yyy'))
        } catch (e) {}
        try {
          fs.rmdirSync(path.join(db.basePath, 'xxx'))
        } catch (e) {}
      })
    }
  })

  describe('#find()', function () {
    it('should find without error', function () {
      return main.app.service('/categories').find().then(res => {
        expect(res).to.have.property('data').lengthOf(1)
      })
    })

    it('should find without error using parent', function () {
      return main.app.service('/categories').find({query: {parent_category_id: 'xxx'}}).then(res => {
        expect(res).to.have.property('data').lengthOf(1)
      })
    })
  })
})
