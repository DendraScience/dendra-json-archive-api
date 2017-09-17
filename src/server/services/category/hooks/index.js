import {disallow, getByDot} from 'feathers-hooks-common'
import {errors} from 'feathers-errors'
import {OBJECT_ID_REGEX} from '../../../lib/consts'

exports.before = {
  // all: [],

  find: [
    // NOTE: Normally included here, but we don't want to coerce _id and parent_category_id
    // apiHooks.coerceQuery(),

    (hook) => {
      const id = getByDot(hook, 'params.query._id')
      if ((typeof id === 'string') && !OBJECT_ID_REGEX.test(id)) {
        throw new errors.BadRequest('Invalid _id parameter')
      }

      const parentCategoryId = getByDot(hook, 'params.query.parent_category_id')
      if ((typeof parentCategoryId === 'string') && !OBJECT_ID_REGEX.test(parentCategoryId)) {
        throw new errors.BadRequest('Invalid parent_category_id parameter')
      }
    }
  ],

  get (hook) {
    const id = hook.id
    if ((typeof id !== 'string') || !OBJECT_ID_REGEX.test(id)) {
      throw new errors.BadRequest('Invalid _id parameter')
    }
  },

  create: disallow(),
  update: disallow(),
  patch: disallow(),
  remove: disallow()
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
