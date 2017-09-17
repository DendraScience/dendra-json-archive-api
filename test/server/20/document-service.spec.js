/**
 * Tests for document service
 */

const fs = require('fs')
const path = require('path')

describe('Service /documents', function () {
  const databases = main.app.get('databases')

  before(function () {
    if (databases.file && databases.file.archive) {
      return Promise.resolve(databases.file.archive.db).then(db => {
        try {
          fs.unlinkSync(path.join(db.basePath, 'aaa', 'bbb', 'ccc.json'))
        } catch (e) {}
        try {
          fs.rmdirSync(path.join(db.basePath, 'aaa', 'bbb'))
        } catch (e) {}
        try {
          fs.rmdirSync(path.join(db.basePath, 'aaa'))
        } catch (e) {}
      })
    }
  })

  after(function () {
    if (databases.file && databases.file.archive) {
      return Promise.resolve(databases.file.archive.db).then(db => {
        try {
          fs.unlinkSync(path.join(db.basePath, 'aaa', 'bbb', 'ccc.json'))
        } catch (e) {}
        try {
          fs.rmdirSync(path.join(db.basePath, 'aaa', 'bbb'))
        } catch (e) {}
        try {
          fs.rmdirSync(path.join(db.basePath, 'aaa'))
        } catch (e) {}
      })
    }
  })

  describe('#create()', function () {
    it('should create without error', function () {
      return main.app.service('/documents').create({
        _id: 'aaa-bbb-ccc',
        content: {
          'hello': 'world'
        }
      }).then(doc => {
        expect(doc).to.have.property('_id', 'aaa-bbb-ccc')
        expect(doc).to.have.nested.property('content.hello', 'world')
      })
    })
  })

  describe('#get()', function () {
    it('should get without error', function () {
      return main.app.service('/documents').get('aaa-bbb-ccc').then(doc => {
        expect(doc).to.have.property('_id', 'aaa-bbb-ccc')
        expect(doc).to.have.nested.property('content.hello', 'world')
      })
    })
  })

  describe('#find()', function () {
    it('should find without error using id', function () {
      return main.app.service('/documents').find({query: {_id: 'aaa-bbb-ccc'}}).then(res => {
        expect(res).to.have.property('data').lengthOf(1)
      })
    })
  })

  describe('#find()', function () {
    it('should find without error using category', function () {
      return main.app.service('/documents').find({query: {category_id: 'aaa-bbb'}}).then(res => {
        expect(res).to.have.property('data').lengthOf(1)
      })
    })
  })

  describe('#remove()', function () {
    it('should remove without error', function () {
      return main.app.service('/documents').remove('aaa-bbb-ccc').then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })
})
