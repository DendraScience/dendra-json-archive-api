'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseCategoryId = parseCategoryId;
exports.parseParentCategoryId = parseParentCategoryId;
exports.parseDocumentId = parseDocumentId;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseCategoryId(id, basePath) {
  const categoryId = id.toLowerCase();
  const parts = categoryId.split('-');
  const categoryParts = parts;
  const categoryPath = _path2.default.join(basePath, ...categoryParts);
  const parentCategoryParts = parts.slice(0, parts.length - 1);
  const parentCategoryId = parentCategoryParts.join('-');
  const parentCategoryPath = _path2.default.join(basePath, ...parentCategoryParts);

  return {
    categoryId,
    categoryParts,
    categoryPath,
    parentCategoryId,
    parentCategoryParts,
    parentCategoryPath
  };
} /**
   * JSON Archive API utilities and helpers.
   *
   * @author J. Scott Smith
   * @license BSD-2-Clause-FreeBSD
   * @module lib/utils
   */

function parseParentCategoryId(id, basePath) {
  const parentCategoryId = id.toLowerCase();
  const parts = parentCategoryId.split('-');
  const parentCategoryParts = parts;
  const parentCategoryPath = _path2.default.join(basePath, ...parentCategoryParts);

  return {
    parentCategoryId,
    parentCategoryParts,
    parentCategoryPath
  };
}

function parseDocumentId(id, basePath) {
  const documentId = id.toLowerCase();
  const parts = documentId.split('-');
  const documentName = `${parts[parts.length - 1]}.json`;
  const categoryParts = parts.slice(0, parts.length - 1);
  const categoryPath = _path2.default.join(basePath, ...categoryParts);
  const categoryId = categoryParts.join('-');
  const documentPath = _path2.default.join(categoryPath, documentName);

  return {
    categoryId,
    categoryParts,
    categoryPath,
    documentId,
    documentName,
    documentPath
  };
}