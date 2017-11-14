'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PushController = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _node = require('parse/node');

var _RestQuery = require('../RestQuery');

var _RestQuery2 = _interopRequireDefault(_RestQuery);

var _RestWrite = require('../RestWrite');

var _RestWrite2 = _interopRequireDefault(_RestWrite);

var _Auth = require('../Auth');

var _StatusHandler = require('../StatusHandler');

var _utils = require('../Push/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PushController = exports.PushController = function () {
  function PushController() {
    _classCallCheck(this, PushController);
  }

  _createClass(PushController, [{
    key: 'sendPush',
    value: function sendPush() {
      var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var where = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var config = arguments[2];
      var auth = arguments[3];
      var onPushStatusSaved = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : function () {};
      var now = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : new Date();

      if (!config.hasPushSupport) {
        throw new _node.Parse.Error(_node.Parse.Error.PUSH_MISCONFIGURED, 'Missing push configuration');
      }

      // Replace the expiration_time and push_time with a valid Unix epoch milliseconds time
      body.expiration_time = PushController.getExpirationTime(body);
      body.expiration_interval = PushController.getExpirationInterval(body);
      if (body.expiration_time && body.expiration_interval) {
        throw new _node.Parse.Error(_node.Parse.Error.PUSH_MISCONFIGURED, 'Both expiration_time and expiration_interval cannot be set');
      }

      // Immediate push
      if (body.expiration_interval && !body.hasOwnProperty('push_time')) {
        var ttlMs = body.expiration_interval * 1000;
        body.expiration_time = new Date(now.valueOf() + ttlMs).valueOf();
      }

      var pushTime = PushController.getPushTime(body);
      if (pushTime && pushTime.date !== 'undefined') {
        body['push_time'] = PushController.formatPushTime(pushTime);
      }

      // TODO: If the req can pass the checking, we return immediately instead of waiting
      // pushes to be sent. We probably change this behaviour in the future.
      var badgeUpdate = function badgeUpdate() {
        return Promise.resolve();
      };

      if (body.data && body.data.badge) {
        var badge = body.data.badge;
        var restUpdate = {};
        if (typeof badge == 'string' && badge.toLowerCase() === 'increment') {
          restUpdate = { badge: { __op: 'Increment', amount: 1 } };
        } else if (Number(badge)) {
          restUpdate = { badge: badge };
        } else {
          throw "Invalid value for badge, expected number or 'Increment'";
        }

        // Force filtering on only valid device tokens
        var updateWhere = (0, _utils.applyDeviceTokenExists)(where);
        badgeUpdate = function badgeUpdate() {
          // Build a real RestQuery so we can use it in RestWrite
          var restQuery = new _RestQuery2.default(config, (0, _Auth.master)(config), '_Installation', updateWhere);
          return restQuery.buildRestWhere().then(function () {
            var write = new _RestWrite2.default(config, (0, _Auth.master)(config), '_Installation', restQuery.restWhere, restUpdate);
            write.runOptions.many = true;
            return write.execute();
          });
        };
      }
      var pushStatus = (0, _StatusHandler.pushStatusHandler)(config);
      return Promise.resolve().then(function () {
        return pushStatus.setInitial(body, where);
      }).then(function () {
        onPushStatusSaved(pushStatus.objectId);
        return badgeUpdate();
      }).then(function () {
        // Update audience lastUsed and timesUsed
        if (body.audience_id) {
          var audienceId = body.audience_id;

          var updateAudience = {
            lastUsed: { __type: "Date", iso: new Date().toISOString() },
            timesUsed: { __op: "Increment", "amount": 1 }
          };
          var write = new _RestWrite2.default(config, (0, _Auth.master)(config), '_Audience', { objectId: audienceId }, updateAudience);
          write.execute();
        }
        // Don't wait for the audience update promise to resolve.
        return Promise.resolve();
      }).then(function () {
        if (body.hasOwnProperty('push_time') && config.hasPushScheduledSupport) {
          return Promise.resolve();
        }
        return config.pushControllerQueue.enqueue(body, where, config, auth, pushStatus);
      }).catch(function (err) {
        return pushStatus.fail(err).then(function () {
          throw err;
        });
      });
    }

    /**
     * Get expiration time from the request body.
     * @param {Object} request A request object
     * @returns {Number|undefined} The expiration time if it exists in the request
     */

  }], [{
    key: 'getExpirationTime',
    value: function getExpirationTime() {
      var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var hasExpirationTime = body.hasOwnProperty('expiration_time');
      if (!hasExpirationTime) {
        return;
      }
      var expirationTimeParam = body['expiration_time'];
      var expirationTime;
      if (typeof expirationTimeParam === 'number') {
        expirationTime = new Date(expirationTimeParam * 1000);
      } else if (typeof expirationTimeParam === 'string') {
        expirationTime = new Date(expirationTimeParam);
      } else {
        throw new _node.Parse.Error(_node.Parse.Error.PUSH_MISCONFIGURED, body['expiration_time'] + ' is not valid time.');
      }
      // Check expirationTime is valid or not, if it is not valid, expirationTime is NaN
      if (!isFinite(expirationTime)) {
        throw new _node.Parse.Error(_node.Parse.Error.PUSH_MISCONFIGURED, body['expiration_time'] + ' is not valid time.');
      }
      return expirationTime.valueOf();
    }
  }, {
    key: 'getExpirationInterval',
    value: function getExpirationInterval() {
      var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var hasExpirationInterval = body.hasOwnProperty('expiration_interval');
      if (!hasExpirationInterval) {
        return;
      }

      var expirationIntervalParam = body['expiration_interval'];
      if (typeof expirationIntervalParam !== 'number' || expirationIntervalParam <= 0) {
        throw new _node.Parse.Error(_node.Parse.Error.PUSH_MISCONFIGURED, 'expiration_interval must be a number greater than 0');
      }
      return expirationIntervalParam;
    }

    /**
     * Get push time from the request body.
     * @param {Object} request A request object
     * @returns {Number|undefined} The push time if it exists in the request
     */

  }, {
    key: 'getPushTime',
    value: function getPushTime() {
      var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var hasPushTime = body.hasOwnProperty('push_time');
      if (!hasPushTime) {
        return;
      }
      var pushTimeParam = body['push_time'];
      var date;
      var isLocalTime = true;

      if (typeof pushTimeParam === 'number') {
        date = new Date(pushTimeParam * 1000);
      } else if (typeof pushTimeParam === 'string') {
        isLocalTime = !PushController.pushTimeHasTimezoneComponent(pushTimeParam);
        date = new Date(pushTimeParam);
      } else {
        throw new _node.Parse.Error(_node.Parse.Error.PUSH_MISCONFIGURED, body['push_time'] + ' is not valid time.');
      }
      // Check pushTime is valid or not, if it is not valid, pushTime is NaN
      if (!isFinite(date)) {
        throw new _node.Parse.Error(_node.Parse.Error.PUSH_MISCONFIGURED, body['push_time'] + ' is not valid time.');
      }

      return {
        date: date,
        isLocalTime: isLocalTime
      };
    }

    /**
     * Checks if a ISO8601 formatted date contains a timezone component
     * @param pushTimeParam {string}
     * @returns {boolean}
     */

  }, {
    key: 'pushTimeHasTimezoneComponent',
    value: function pushTimeHasTimezoneComponent(pushTimeParam) {
      var offsetPattern = /(.+)([+-])\d\d:\d\d$/;
      return pushTimeParam.indexOf('Z') === pushTimeParam.length - 1 // 2007-04-05T12:30Z
      || offsetPattern.test(pushTimeParam); // 2007-04-05T12:30.000+02:00, 2007-04-05T12:30.000-02:00
    }

    /**
     * Converts a date to ISO format in UTC time and strips the timezone if `isLocalTime` is true
     * @param date {Date}
     * @param isLocalTime {boolean}
     * @returns {string}
     */

  }, {
    key: 'formatPushTime',
    value: function formatPushTime(_ref) {
      var date = _ref.date,
          isLocalTime = _ref.isLocalTime;

      if (isLocalTime) {
        // Strip 'Z'
        var isoString = date.toISOString();
        return isoString.substring(0, isoString.indexOf('Z'));
      }
      return date.toISOString();
    }
  }]);

  return PushController;
}();

exports.default = PushController;