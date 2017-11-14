'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefaultMongoURI = undefined;

var _parsers = require('./Options/parsers');

var _require = require('./Options/Definitions'),
    ParseServerOptions = _require.ParseServerOptions;

var logsFolder = function () {
  var folder = './logs/';
  if (typeof process !== 'undefined' && process.env.TESTING === '1') {
    folder = './test_logs/';
  }
  if (process.env.PARSE_SERVER_LOGS_FOLDER) {
    folder = (0, _parsers.nullParser)(process.env.PARSE_SERVER_LOGS_FOLDER);
  }
  return folder;
}();

var _ref = function () {
  var verbose = process.env.VERBOSE ? true : false;
  return { verbose: verbose, level: verbose ? 'verbose' : undefined };
}(),
    verbose = _ref.verbose,
    level = _ref.level;

var DefinitionDefaults = Object.keys(ParseServerOptions).reduce(function (memo, key) {
  var def = ParseServerOptions[key];
  if (def.hasOwnProperty('default')) {
    memo[key] = def.default;
  }
  return memo;
}, {});

var computedDefaults = {
  jsonLogs: process.env.JSON_LOGS || false,
  logsFolder: logsFolder,
  verbose: verbose,
  level: level
};

exports.default = Object.assign({}, DefinitionDefaults, computedDefaults);
var DefaultMongoURI = exports.DefaultMongoURI = DefinitionDefaults.databaseURI;