'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isPushIncrementing = isPushIncrementing;
exports.getLocalesFromPush = getLocalesFromPush;
exports.transformPushBodyForLocale = transformPushBodyForLocale;
exports.stripLocalesFromBody = stripLocalesFromBody;
exports.bodiesPerLocales = bodiesPerLocales;
exports.groupByLocaleIdentifier = groupByLocaleIdentifier;
exports.validatePushType = validatePushType;
exports.applyDeviceTokenExists = applyDeviceTokenExists;

var _node = require('parse/node');

var _node2 = _interopRequireDefault(_node);

var _deepcopy = require('deepcopy');

var _deepcopy2 = _interopRequireDefault(_deepcopy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function isPushIncrementing(body) {
  return body.data && body.data.badge && typeof body.data.badge == 'string' && body.data.badge.toLowerCase() == "increment";
}

var localizableKeys = ['alert', 'title'];

function getLocalesFromPush(body) {
  var data = body.data;
  if (!data) {
    return [];
  }
  return [].concat(_toConsumableArray(new Set(Object.keys(data).reduce(function (memo, key) {
    localizableKeys.forEach(function (localizableKey) {
      if (key.indexOf(localizableKey + '-') == 0) {
        memo.push(key.slice(localizableKey.length + 1));
      }
    });
    return memo;
  }, []))));
}

function transformPushBodyForLocale(body, locale) {
  var data = body.data;
  if (!data) {
    return body;
  }
  body = (0, _deepcopy2.default)(body);
  localizableKeys.forEach(function (key) {
    var localeValue = body.data[key + '-' + locale];
    if (localeValue) {
      body.data[key] = localeValue;
    }
  });
  return stripLocalesFromBody(body);
}

function stripLocalesFromBody(body) {
  if (!body.data) {
    return body;
  }
  Object.keys(body.data).forEach(function (key) {
    localizableKeys.forEach(function (localizableKey) {
      if (key.indexOf(localizableKey + '-') == 0) {
        delete body.data[key];
      }
    });
  });
  return body;
}

function bodiesPerLocales(body) {
  var locales = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  // Get all tranformed bodies for each locale
  var result = locales.reduce(function (memo, locale) {
    memo[locale] = transformPushBodyForLocale(body, locale);
    return memo;
  }, {});
  // Set the default locale, with the stripped body
  result.default = stripLocalesFromBody(body);
  return result;
}

function groupByLocaleIdentifier(installations) {
  var locales = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  return installations.reduce(function (map, installation) {
    var added = false;
    locales.forEach(function (locale) {
      if (added) {
        return;
      }
      if (installation.localeIdentifier && installation.localeIdentifier.indexOf(locale) === 0) {
        added = true;
        map[locale] = map[locale] || [];
        map[locale].push(installation);
      }
    });
    if (!added) {
      map.default.push(installation);
    }
    return map;
  }, { default: [] });
}

/**
 * Check whether the deviceType parameter in qury condition is valid or not.
 * @param {Object} where A query condition
 * @param {Array} validPushTypes An array of valid push types(string)
 */
function validatePushType() {
  var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var validPushTypes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  var deviceTypeField = where.deviceType || {};
  var deviceTypes = [];
  if (typeof deviceTypeField === 'string') {
    deviceTypes.push(deviceTypeField);
  } else if (Array.isArray(deviceTypeField['$in'])) {
    deviceTypes.concat(deviceTypeField['$in']);
  }
  for (var i = 0; i < deviceTypes.length; i++) {
    var deviceType = deviceTypes[i];
    if (validPushTypes.indexOf(deviceType) < 0) {
      throw new _node2.default.Error(_node2.default.Error.PUSH_MISCONFIGURED, deviceType + ' is not supported push type.');
    }
  }
}

function applyDeviceTokenExists(where) {
  where = (0, _deepcopy2.default)(where);
  if (!where.hasOwnProperty('deviceToken')) {
    where['deviceToken'] = { '$exists': true };
  }
  return where;
}