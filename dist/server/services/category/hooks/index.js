'use strict';

var _feathersHooksCommon = require('feathers-hooks-common');

var _feathersErrors = require('feathers-errors');

var _consts = require('../../../lib/consts');

exports.before = {
  // all: [],

  find: [
  // NOTE: Normally included here, but we don't want to coerce _id and parent_category_id
  // apiHooks.coerceQuery(),

  hook => {
    const id = (0, _feathersHooksCommon.getByDot)(hook, 'params.query._id');
    if (typeof id === 'string' && !_consts.OBJECT_ID_REGEX.test(id)) {
      throw new _feathersErrors.errors.BadRequest('Invalid _id parameter');
    }

    const parentCategoryId = (0, _feathersHooksCommon.getByDot)(hook, 'params.query.parent_category_id');
    if (typeof parentCategoryId === 'string' && !_consts.OBJECT_ID_REGEX.test(parentCategoryId)) {
      throw new _feathersErrors.errors.BadRequest('Invalid parent_category_id parameter');
    }
  }],

  get(hook) {
    const id = hook.id;
    if (typeof id !== 'string' || !_consts.OBJECT_ID_REGEX.test(id)) {
      throw new _feathersErrors.errors.BadRequest('Invalid _id parameter');
    }
  },

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