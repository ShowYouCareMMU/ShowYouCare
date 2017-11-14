'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FilesAdapter = exports.FilesAdapter = function () {
  function FilesAdapter() {
    _classCallCheck(this, FilesAdapter);
  }

  _createClass(FilesAdapter, [{
    key: 'createFile',


    /* Responsible for storing the file in order to be retrieved later by its filename
     *
     * @param {string} filename - the filename to save
     * @param {*} data - the buffer of data from the file
     * @param {string} contentType - the supposed contentType
     * @discussion the contentType can be undefined if the controller was not able to determine it
     *
     * @return {Promise} a promise that should fail if the storage didn't succeed
     */
    value: function createFile(filename, data, contentType) {}

    /* Responsible for deleting the specified file
     *
     * @param {string} filename - the filename to delete
     *
     * @return {Promise} a promise that should fail if the deletion didn't succeed
     */

  }, {
    key: 'deleteFile',
    value: function deleteFile(filename) {}

    /* Responsible for retrieving the data of the specified file
     *
     * @param {string} filename - the name of file to retrieve
     *
     * @return {Promise} a promise that should pass with the file data or fail on error
     */

  }, {
    key: 'getFileData',
    value: function getFileData(filename) {}

    /* Returns an absolute URL where the file can be accessed
     *
     * @param {Config} config - server configuration
     * @param {string} filename
     *
     * @return {string} Absolute URL
     */

  }, {
    key: 'getFileLocation',
    value: function getFileLocation(config, filename) {}
  }]);

  return FilesAdapter;
}(); /*eslint no-unused-vars: "off"*/
// Files Adapter
//
// Allows you to change the file storage mechanism.
//
// Adapter classes must implement the following functions:
// * createFile(filename, data, contentType)
// * deleteFile(filename)
// * getFileData(filename)
// * getFileLocation(config, filename)
//
// Default is GridStoreAdapter, which requires mongo
// and for the API server to be using the DatabaseController with Mongo
// database adapter.

exports.default = FilesAdapter;