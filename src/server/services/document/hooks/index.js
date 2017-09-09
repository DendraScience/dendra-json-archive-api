import {disallow, getByDot} from 'feathers-hooks-common'
import {errors} from 'feathers-errors'

const CATEGORY_ID_REGEX = /^\w+(-\w+)*$/i

exports.before = {
  // all: [],

  find: [
    // NOTE: Normally included here, but we don't want to coerce category_id
    // apiHooks.coerceQuery(),

    (hook) => {
      const categoryId = getByDot(hook, 'params.query.category_id')
      if ((typeof categoryId === 'string') && !CATEGORY_ID_REGEX.test(categoryId)) {
        throw new errors.BadRequest('Invalid category_id parameter')
      }
    }
  ],

  get (hook) {
    const id = hook.id
    if ((typeof id !== 'string') || !CATEGORY_ID_REGEX.test(id)) {
      throw new errors.BadRequest('Invalid _id parameter')
    }
  },

  create (hook) {
    const id = getByDot(hook, 'data._id')
    if ((typeof id !== 'string') || !CATEGORY_ID_REGEX.test(id)) {
      throw new errors.BadRequest('Invalid _id field')
    }
  },

  update: disallow(),
  patch: disallow(),

  remove (hook) {
    const id = hook.id
    if ((typeof id !== 'string') || !CATEGORY_ID_REGEX.test(id)) {
      throw new errors.BadRequest('Invalid _id parameter')
    }
  }
}

exports.after = {
  // all: [],
  // find [],
  // get: [],
  // create: [],
  // update: [],
  // patch: [],
  // remove: []
}
