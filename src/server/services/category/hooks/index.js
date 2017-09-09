import {disallow, getByDot} from 'feathers-hooks-common'
import {errors} from 'feathers-errors'

const CATEGORY_ID_REGEX = /^\w+(-\w+)*$/i

exports.before = {
  // all: [],

  find: [
    // NOTE: Normally included here, but we don't want to coerce parent_category_id
    // apiHooks.coerceQuery(),

    (hook) => {
      const parentCategoryId = getByDot(hook, 'params.query.parent_category_id')
      if ((typeof parentCategoryId === 'string') && !CATEGORY_ID_REGEX.test(parentCategoryId)) {
        throw new errors.BadRequest('Invalid parent_category_id parameter')
      }
    }
  ],

  get: disallow(),
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
