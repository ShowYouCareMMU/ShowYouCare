'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PushWorker = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _deepcopy = require('deepcopy');

var _deepcopy2 = _interopRequireDefault(_deepcopy);

var _AdaptableController = require('../Controllers/AdaptableController');

var _AdaptableController2 = _interopRequireDefault(_AdaptableController);

var _Auth = require('../Auth');

var _Config = require('../Config');

var _Config2 = _interopRequireDefault(_Config);

var _PushAdapter = require('../Adapters/Push/PushAdapter');

var _rest = require('../rest');

var _rest2 = _interopRequireDefault(_rest);

var _StatusHandler = require('../StatusHandler');

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _ParseMessageQueue = require('../ParseMessageQueue');

var _PushQueue = require('./PushQueue');

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function groupByBadge(installations) {
  return installations.reduce(function (map, installation) {
    var badge = installation.badge + '';
    map[badge] = map[badge] || [];
    map[badge].push(installation);
    return map;
  }, {});
}

var PushWorker = exports.PushWorker = function () {
  function PushWorker(pushAdapter) {
    var _this = this;

    var subscriberConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, PushWorker);

    _AdaptableController2.default.validateAdapter(pushAdapter, this, _PushAdapter.PushAdapter);
    this.adapter = pushAdapter;

    this.channel = subscriberConfig.channel || _PushQueue.PushQueue.defaultPushChannel();
    this.subscriber = _ParseMessageQueue.ParseMessageQueue.createSubscriber(subscriberConfig);
    if (this.subscriber) {
      var subscriber = this.subscriber;
      subscriber.subscribe(this.channel);
      subscriber.on('message', function (channel, messageStr) {
        var workItem = JSON.parse(messageStr);
        _this.run(workItem);
      });
    }
  }

  _createClass(PushWorker, [{
    key: 'unsubscribe',
    value: function unsubscribe() {
      if (this.subscriber) {
        this.subscriber.unsubscribe(this.channel);
      }
    }
  }, {
    key: 'run',
    value: function run(_ref) {
      var _this2 = this;

      var body = _ref.body,
          query = _ref.query,
          pushStatus = _ref.pushStatus,
          applicationId = _ref.applicationId,
          UTCOffset = _ref.UTCOffset;

      var config = _Config2.default.get(applicationId);
      var auth = (0, _Auth.master)(config);
      var where = utils.applyDeviceTokenExists(query.where);
      delete query.where;
      pushStatus = (0, _StatusHandler.pushStatusHandler)(config, pushStatus.objectId);
      return _rest2.default.find(config, auth, '_Installation', where, query).then(function (_ref2) {
        var results = _ref2.results;

        if (results.length == 0) {
          return;
        }
        return _this2.sendToAdapter(body, results, pushStatus, config, UTCOffset);
      }, function (err) {
        throw err;
      });
    }
  }, {
    key: 'sendToAdapter',
    value: function sendToAdapter(body, installations, pushStatus, config, UTCOffset) {
      var _this3 = this;

      // Check if we have locales in the push body
      var locales = utils.getLocalesFromPush(body);
      if (locales.length > 0) {
        // Get all tranformed bodies for each locale
        var bodiesPerLocales = utils.bodiesPerLocales(body, locales);

        // Group installations on the specified locales (en, fr, default etc...)
        var grouppedInstallations = utils.groupByLocaleIdentifier(installations, locales);
        var _promises = Object.keys(grouppedInstallations).map(function (locale) {
          var installations = grouppedInstallations[locale];
          var body = bodiesPerLocales[locale];
          return _this3.sendToAdapter(body, installations, pushStatus, config, UTCOffset);
        });
        return Promise.all(_promises);
      }

      if (!utils.isPushIncrementing(body)) {
        _logger2.default.verbose('Sending push to ' + installations.length);
        return this.adapter.send(body, installations, pushStatus.objectId).then(function (results) {
          return pushStatus.trackSent(results, UTCOffset).then(function () {
            return results;
          });
        });
      }

      // Collect the badges to reduce the # of calls
      var badgeInstallationsMap = groupByBadge(installations);

      // Map the on the badges count and return the send result
      var promises = Object.keys(badgeInstallationsMap).map(function (badge) {
        var payload = (0, _deepcopy2.default)(body);
        payload.data.badge = parseInt(badge);
        var installations = badgeInstallationsMap[badge];
        return _this3.sendToAdapter(payload, installations, pushStatus, config, UTCOffset);
      });
      return Promise.all(promises);
    }
  }]);

  return PushWorker;
}();

exports.default = PushWorker;