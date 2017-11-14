'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FilesRouter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _middlewares = require('../middlewares');

var Middlewares = _interopRequireWildcard(_middlewares);

var _node = require('parse/node');

var _node2 = _interopRequireDefault(_node);

var _Config = require('../Config');

var _Config2 = _interopRequireDefault(_Config);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FilesRouter = exports.FilesRouter = function () {
  function FilesRouter() {
    _classCallCheck(this, FilesRouter);
  }

  _createClass(FilesRouter, [{
    key: 'expressRouter',
    value: function expressRouter() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$maxUploadSize = _ref.maxUploadSize,
          maxUploadSize = _ref$maxUploadSize === undefined ? '20Mb' : _ref$maxUploadSize;

      var router = _express2.default.Router();
      router.get('/files/:appId/:filename', this.getHandler);

      router.post('/files', function (req, res, next) {
        next(new _node2.default.Error(_node2.default.Error.INVALID_FILE_NAME, 'Filename not provided.'));
      });

      router.post('/files/:filename', Middlewares.allowCrossDomain, _bodyParser2.default.raw({ type: function type() {
          return true;
        }, limit: maxUploadSize }), // Allow uploads without Content-Type, or with any Content-Type.
      Middlewares.handleParseHeaders, this.createHandler);

      router.delete('/files/:filename', Middlewares.allowCrossDomain, Middlewares.handleParseHeaders, Middlewares.enforceMasterKeyAccess, this.deleteHandler);
      return router;
    }
  }, {
    key: 'getHandler',
    value: function getHandler(req, res) {
      var config = _Config2.default.get(req.params.appId);
      var filesController = config.filesController;
      var filename = req.params.filename;
      var contentType = _mime2.default.lookup(filename);
      if (isFileStreamable(req, filesController)) {
        filesController.getFileStream(config, filename).then(function (stream) {
          handleFileStream(stream, req, res, contentType);
        }).catch(function () {
          res.status(404);
          res.set('Content-Type', 'text/plain');
          res.end('File not found.');
        });
      } else {
        filesController.getFileData(config, filename).then(function (data) {
          res.status(200);
          res.set('Content-Type', contentType);
          res.set('Content-Length', data.length);
          res.end(data);
        }).catch(function () {
          res.status(404);
          res.set('Content-Type', 'text/plain');
          res.end('File not found.');
        });
      }
    }
  }, {
    key: 'createHandler',
    value: function createHandler(req, res, next) {
      if (!req.body || !req.body.length) {
        next(new _node2.default.Error(_node2.default.Error.FILE_SAVE_ERROR, 'Invalid file upload.'));
        return;
      }

      if (req.params.filename.length > 128) {
        next(new _node2.default.Error(_node2.default.Error.INVALID_FILE_NAME, 'Filename too long.'));
        return;
      }

      if (!req.params.filename.match(/^[_a-zA-Z0-9][a-zA-Z0-9@\.\ ~_-]*$/)) {
        next(new _node2.default.Error(_node2.default.Error.INVALID_FILE_NAME, 'Filename contains invalid characters.'));
        return;
      }

      var filename = req.params.filename;
      var contentType = req.get('Content-type');
      var config = req.config;
      var filesController = config.filesController;

      filesController.createFile(config, filename, req.body, contentType).then(function (result) {
        res.status(201);
        res.set('Location', result.url);
        res.json(result);
      }).catch(function (e) {
        _logger2.default.error(e.message, e);
        next(new _node2.default.Error(_node2.default.Error.FILE_SAVE_ERROR, 'Could not store file.'));
      });
    }
  }, {
    key: 'deleteHandler',
    value: function deleteHandler(req, res, next) {
      var filesController = req.config.filesController;
      filesController.deleteFile(req.config, req.params.filename).then(function () {
        res.status(200);
        // TODO: return useful JSON here?
        res.end();
      }).catch(function () {
        next(new _node2.default.Error(_node2.default.Error.FILE_DELETE_ERROR, 'Could not delete file.'));
      });
    }
  }]);

  return FilesRouter;
}();

function isFileStreamable(req, filesController) {
  return req.get('Range') && typeof filesController.adapter.getFileStream === 'function';
}

function getRange(req) {
  var parts = req.get('Range').replace(/bytes=/, "").split("-");
  return { start: parseInt(parts[0], 10), end: parseInt(parts[1], 10) };
}

// handleFileStream is licenced under Creative Commons Attribution 4.0 International License (https://creativecommons.org/licenses/by/4.0/).
// Author: LEROIB at weightingformypizza (https://weightingformypizza.wordpress.com/2015/06/24/stream-html5-media-content-like-video-audio-from-mongodb-using-express-and-gridstore/).
function handleFileStream(stream, req, res, contentType) {
  var buffer_size = 1024 * 1024; //1024Kb
  // Range request, partiall stream the file

  var _getRange = getRange(req),
      start = _getRange.start,
      end = _getRange.end;

  var notEnded = !end && end !== 0;
  var notStarted = !start && start !== 0;
  // No end provided, we want all bytes
  if (notEnded) {
    end = stream.length - 1;
  }
  // No start provided, we're reading backwards
  if (notStarted) {
    start = stream.length - end;
    end = start + end - 1;
  }

  // Data exceeds the buffer_size, cap
  if (end - start >= buffer_size) {
    end = start + buffer_size - 1;
  }

  var contentLength = end - start + 1;

  res.writeHead(206, {
    'Content-Range': 'bytes ' + start + '-' + end + '/' + stream.length,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  });

  stream.seek(start, function () {
    // get gridFile stream
    var gridFileStream = stream.stream(true);
    var bufferAvail = 0;
    var remainingBytesToWrite = contentLength;
    var totalBytesWritten = 0;
    // write to response
    gridFileStream.on('data', function (data) {
      bufferAvail += data.length;
      if (bufferAvail > 0) {
        // slice returns the same buffer if overflowing
        // safe to call in any case
        var buffer = data.slice(0, remainingBytesToWrite);
        // write the buffer
        res.write(buffer);
        // increment total
        totalBytesWritten += buffer.length;
        // decrement remaining
        remainingBytesToWrite -= data.length;
        // decrement the avaialbe buffer
        bufferAvail -= buffer.length;
      }
      // in case of small slices, all values will be good at that point
      // we've written enough, end...
      if (totalBytesWritten >= contentLength) {
        stream.close();
        res.end();
        this.destroy();
      }
    });
  });
}