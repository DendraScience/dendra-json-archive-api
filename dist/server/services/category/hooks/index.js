'use strict';

var _feathersHooksCommon = require('feathers-hooks-common');

var _feathersErrors = require('feathers-errors');

const CATEGORY_ID_REGEX = /^\w+(-\w+)*$/i;

exports.before = {
  // all: [],

  find: [
  // NOTE: Normally included here, but we don't want to coerce parent_category_id
  // apiHooks.coerceQuery(),

  hook => {
    const parentCategoryId = (0, _feathersHooksCommon.getByDot)(hook, 'params.query.parent_category_id');
    if (typeof parentCategoryId === 'string' && !CATEGORY_ID_REGEX.test(parentCategoryId)) {
      throw new _feathersErrors.errors.BadRequest('Invalid parent_category_id parameter');
    }
  }],

  get: (0, _feathersHooksCommon.disallow)(),
  create: (0, _feathersHooksCommon.disallow)(),
  update: (0, _feathersHooksCommon.disallow)(),
  patch: (0, _feathersHooksCommon.disallow)(),
  remove: (0, _feathersHooksCommon.disallow)()
};

exports.after = {
  // all: [],
  // find [],
  // get: [],
  // create: [],
  // update: [],
  // patch: [],
  // remove: []
};