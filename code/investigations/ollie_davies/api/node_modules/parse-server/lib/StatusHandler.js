'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.flatten = flatten;
exports.jobStatusHandler = jobStatusHandler;
exports.pushStatusHandler = pushStatusHandler;

var _cryptoUtils = require('./cryptoUtils');

var _logger = require('./logger');

var _rest = require('./rest');

var _rest2 = _interopRequireDefault(_rest);

var _Auth = require('./Auth');

var _Auth2 = _interopRequireDefault(_Auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PUSH_STATUS_COLLECTION = '_PushStatus';
var JOB_STATUS_COLLECTION = '_JobStatus';

var incrementOp = function incrementOp() {
  var object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var key = arguments[1];
  var amount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  if (!object[key]) {
    object[key] = { __op: 'Increment', amount: amount };
  } else {
    object[key].amount += amount;
  }
  return object[key];
};

function flatten(array) {
  var flattened = [];
  for (var i = 0; i < array.length; i++) {
    if (Array.isArray(array[i])) {
      flattened = flattened.concat(flatten(array[i]));
    } else {
      flattened.push(array[i]);
    }
  }
  return flattened;
}

function statusHandler(className, database) {
  var lastPromise = Promise.resolve();

  function create(object) {
    lastPromise = lastPromise.then(function () {
      return database.create(className, object).then(function () {
        return Promise.resolve(object);
      });
    });
    return lastPromise;
  }

  function update(where, object) {
    lastPromise = lastPromise.then(function () {
      return database.update(className, where, object);
    });
    return lastPromise;
  }

  return Object.freeze({
    create: create,
    update: update
  });
}

function restStatusHandler(className, config) {
  var lastPromise = Promise.resolve();
  var auth = _Auth2.default.master(config);
  function create(object) {
    lastPromise = lastPromise.then(function () {
      return _rest2.default.create(config, auth, className, object).then(function (_ref) {
        var response = _ref.response;

        // merge the objects
        return Promise.resolve(Object.assign({}, object, response));
      });
    });
    return lastPromise;
  }

  function update(where, object) {
    // TODO: when we have updateWhere, use that for proper interfacing
    lastPromise = lastPromise.then(function () {
      return _rest2.default.update(config, auth, className, { objectId: where.objectId }, object).then(function (_ref2) {
        var response = _ref2.response;

        // merge the objects
        return Promise.resolve(Object.assign({}, object, response));
      });
    });
    return lastPromise;
  }

  return Object.freeze({
    create: create,
    update: update
  });
}

function jobStatusHandler(config) {
  var jobStatus = void 0;
  var objectId = (0, _cryptoUtils.newObjectId)(config.objectIdSize);
  var database = config.database;
  var handler = statusHandler(JOB_STATUS_COLLECTION, database);
  var setRunning = function setRunning(jobName, params) {
    var now = new Date();
    jobStatus = {
      objectId: objectId,
      jobName: jobName,
      params: params,
      status: 'running',
      source: 'api',
      createdAt: now,
      // lockdown!
      ACL: {}
    };

    return handler.create(jobStatus);
  };

  var setMessage = function setMessage(message) {
    if (!message || typeof message !== 'string') {
      return Promise.resolve();
    }
    return handler.update({ objectId: objectId }, { message: message });
  };

  var setSucceeded = function setSucceeded(message) {
    return setFinalStatus('succeeded', message);
  };

  var setFailed = function setFailed(message) {
    return setFinalStatus('failed', message);
  };

  var setFinalStatus = function setFinalStatus(status) {
    var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

    var finishedAt = new Date();
    var update = { status: status, finishedAt: finishedAt };
    if (message && typeof message === 'string') {
      update.message = message;
    }
    return handler.update({ objectId: objectId }, update);
  };

  return Object.freeze({
    setRunning: setRunning,
    setSucceeded: setSucceeded,
    setMessage: setMessage,
    setFailed: setFailed
  });
}

function pushStatusHandler(config, existingObjectId) {

  var pushStatus = void 0;
  var database = config.database;
  var handler = restStatusHandler(PUSH_STATUS_COLLECTION, config);
  var objectId = existingObjectId;
  var setInitial = function setInitial() {
    var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var where = arguments[1];
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { source: 'rest' };

    var now = new Date();
    var pushTime = now.toISOString();
    var status = 'pending';
    if (body.hasOwnProperty('push_time')) {
      if (config.hasPushScheduledSupport) {
        pushTime = body.push_time;
        status = 'scheduled';
      } else {
        _logger.logger.warn('Trying to schedule a push while server is not configured.');
        _logger.logger.warn('Push will be sent immediately');
      }
    }

    var data = body.data || {};
    var payloadString = JSON.stringify(data);
    var pushHash = void 0;
    if (typeof data.alert === 'string') {
      pushHash = (0, _cryptoUtils.md5Hash)(data.alert);
    } else if (_typeof(data.alert) === 'object') {
      pushHash = (0, _cryptoUtils.md5Hash)(JSON.stringify(data.alert));
    } else {
      pushHash = 'd41d8cd98f00b204e9800998ecf8427e';
    }
    var object = {
      pushTime: pushTime,
      query: JSON.stringify(where),
      payload: payloadString,
      source: options.source,
      title: options.title,
      expiry: body.expiration_time,
      expiration_interval: body.expiration_interval,
      status: status,
      numSent: 0,
      pushHash: pushHash,
      // lockdown!
      ACL: {}
    };
    return handler.create(object).then(function (result) {
      objectId = result.objectId;
      pushStatus = {
        objectId: objectId
      };
      return Promise.resolve(pushStatus);
    });
  };

  var setRunning = function setRunning(count) {
    _logger.logger.verbose('_PushStatus ' + objectId + ': sending push to %d installations', count);
    return handler.update({ status: "pending", objectId: objectId }, { status: "running", count: count });
  };

  var trackSent = function trackSent(results, UTCOffset) {
    var _this = this;

    var cleanupInstallations = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : process.env.PARSE_SERVER_CLEANUP_INVALID_INSTALLATIONS;

    var update = {
      numSent: 0,
      numFailed: 0
    };
    var devicesToRemove = [];
    if (Array.isArray(results)) {
      results = flatten(results);
      results.reduce(function (memo, result) {
        // Cannot handle that
        if (!result || !result.device || !result.device.deviceType) {
          return memo;
        }
        var deviceType = result.device.deviceType;
        var key = result.transmitted ? 'sentPerType.' + deviceType : 'failedPerType.' + deviceType;
        memo[key] = incrementOp(memo, key);
        if (typeof UTCOffset !== 'undefined') {
          var offsetKey = result.transmitted ? 'sentPerUTCOffset.' + UTCOffset : 'failedPerUTCOffset.' + UTCOffset;
          memo[offsetKey] = incrementOp(memo, offsetKey);
        }
        if (result.transmitted) {
          memo.numSent++;
        } else {
          if (result && result.response && result.response.error && result.device && result.device.deviceToken) {
            var token = result.device.deviceToken;
            var error = result.response.error;
            // GCM errors
            if (error === 'NotRegistered' || error === 'InvalidRegistration') {
              devicesToRemove.push(token);
            }
            // APNS errors
            if (error === 'Unregistered' || error === 'BadDeviceToken') {
              devicesToRemove.push(token);
            }
          }
          memo.numFailed++;
        }
        return memo;
      }, update);
      incrementOp(update, 'count', -results.length);
    }

    _logger.logger.verbose('_PushStatus ' + objectId + ': sent push! %d success, %d failures', update.numSent, update.numFailed);
    _logger.logger.verbose('_PushStatus ' + objectId + ': needs cleanup', { devicesToRemove: devicesToRemove });
    ['numSent', 'numFailed'].forEach(function (key) {
      if (update[key] > 0) {
        update[key] = {
          __op: 'Increment',
          amount: update[key]
        };
      } else {
        delete update[key];
      }
    });

    if (devicesToRemove.length > 0 && cleanupInstallations) {
      _logger.logger.info('Removing device tokens on ' + devicesToRemove.length + ' _Installations');
      database.update('_Installation', { deviceToken: { '$in': devicesToRemove } }, { deviceToken: { "__op": "Delete" } }, {
        acl: undefined,
        many: true
      });
    }

    return handler.update({ objectId: objectId }, update).then(function (res) {
      if (res && res.count === 0) {
        return _this.complete();
      }
    });
  };

  var complete = function complete() {
    return handler.update({ objectId: objectId }, {
      status: 'succeeded',
      count: { __op: 'Delete' }
    });
  };

  var fail = function fail(err) {
    if (typeof err === 'string') {
      err = { message: err };
    }
    var update = {
      errorMessage: err,
      status: 'failed'
    };
    return handler.update({ objectId: objectId }, update);
  };

  var rval = {
    setInitial: setInitial,
    setRunning: setRunning,
    trackSent: trackSent,
    complete: complete,
    fail: fail
  };

  // define objectId to be dynamic
  Object.defineProperty(rval, "objectId", {
    get: function get() {
      return objectId;
    }
  });

  return Object.freeze(rval);
}