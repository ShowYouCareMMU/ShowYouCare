'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Config = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // A Config object provides information about how a specific app is
// configured.
// mount is the URL for the root of the API; includes http, domain, etc.

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _SchemaCache = require('./Controllers/SchemaCache');

var _SchemaCache2 = _interopRequireDefault(_SchemaCache);

var _DatabaseController = require('./Controllers/DatabaseController');

var _DatabaseController2 = _interopRequireDefault(_DatabaseController);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function removeTrailingSlash(str) {
  if (!str) {
    return str;
  }
  if (str.endsWith("/")) {
    str = str.substr(0, str.length - 1);
  }
  return str;
}

var Config = exports.Config = function () {
  function Config() {
    _classCallCheck(this, Config);
  }

  _createClass(Config, [{
    key: 'generateEmailVerifyTokenExpiresAt',
    value: function generateEmailVerifyTokenExpiresAt() {
      if (!this.verifyUserEmails || !this.emailVerifyTokenValidityDuration) {
        return undefined;
      }
      var now = new Date();
      return new Date(now.getTime() + this.emailVerifyTokenValidityDuration * 1000);
    }
  }, {
    key: 'generatePasswordResetTokenExpiresAt',
    value: function generatePasswordResetTokenExpiresAt() {
      if (!this.passwordPolicy || !this.passwordPolicy.resetTokenValidityDuration) {
        return undefined;
      }
      var now = new Date();
      return new Date(now.getTime() + this.passwordPolicy.resetTokenValidityDuration * 1000);
    }
  }, {
    key: 'generateSessionExpiresAt',
    value: function generateSessionExpiresAt() {
      if (!this.expireInactiveSessions) {
        return undefined;
      }
      var now = new Date();
      return new Date(now.getTime() + this.sessionLength * 1000);
    }
  }, {
    key: 'mount',
    get: function get() {
      var mount = this._mount;
      if (this.publicServerURL) {
        mount = this.publicServerURL;
      }
      return mount;
    },
    set: function set(newValue) {
      this._mount = newValue;
    }
  }, {
    key: 'invalidLinkURL',
    get: function get() {
      return this.customPages.invalidLink || this.publicServerURL + '/apps/invalid_link.html';
    }
  }, {
    key: 'invalidVerificationLinkURL',
    get: function get() {
      return this.customPages.invalidVerificationLink || this.publicServerURL + '/apps/invalid_verification_link.html';
    }
  }, {
    key: 'linkSendSuccessURL',
    get: function get() {
      return this.customPages.linkSendSuccess || this.publicServerURL + '/apps/link_send_success.html';
    }
  }, {
    key: 'linkSendFailURL',
    get: function get() {
      return this.customPages.linkSendFail || this.publicServerURL + '/apps/link_send_fail.html';
    }
  }, {
    key: 'verifyEmailSuccessURL',
    get: function get() {
      return this.customPages.verifyEmailSuccess || this.publicServerURL + '/apps/verify_email_success.html';
    }
  }, {
    key: 'choosePasswordURL',
    get: function get() {
      return this.customPages.choosePassword || this.publicServerURL + '/apps/choose_password';
    }
  }, {
    key: 'requestResetPasswordURL',
    get: function get() {
      return this.publicServerURL + '/apps/' + this.applicationId + '/request_password_reset';
    }
  }, {
    key: 'passwordResetSuccessURL',
    get: function get() {
      return this.customPages.passwordResetSuccess || this.publicServerURL + '/apps/password_reset_success.html';
    }
  }, {
    key: 'parseFrameURL',
    get: function get() {
      return this.customPages.parseFrameURL;
    }
  }, {
    key: 'verifyEmailURL',
    get: function get() {
      return this.publicServerURL + '/apps/' + this.applicationId + '/verify_email';
    }
  }], [{
    key: 'get',
    value: function get(applicationId, mount) {
      var cacheInfo = _cache2.default.get(applicationId);
      if (!cacheInfo) {
        return;
      }
      var config = new Config();
      config.applicationId = applicationId;
      Object.keys(cacheInfo).forEach(function (key) {
        if (key == 'databaseController') {
          var schemaCache = new _SchemaCache2.default(cacheInfo.cacheController, cacheInfo.schemaCacheTTL, cacheInfo.enableSingleSchemaCache);
          config.database = new _DatabaseController2.default(cacheInfo.databaseController.adapter, schemaCache);
        } else {
          config[key] = cacheInfo[key];
        }
      });
      config.mount = removeTrailingSlash(mount);
      config.generateSessionExpiresAt = config.generateSessionExpiresAt.bind(config);
      config.generateEmailVerifyTokenExpiresAt = config.generateEmailVerifyTokenExpiresAt.bind(config);
      return config;
    }
  }, {
    key: 'put',
    value: function put(serverConfiguration) {
      Config.validate(serverConfiguration);
      _cache2.default.put(serverConfiguration.appId, serverConfiguration);
      Config.setupPasswordValidator(serverConfiguration.passwordPolicy);
      return serverConfiguration;
    }
  }, {
    key: 'validate',
    value: function validate(_ref) {
      var verifyUserEmails = _ref.verifyUserEmails,
          userController = _ref.userController,
          appName = _ref.appName,
          publicServerURL = _ref.publicServerURL,
          revokeSessionOnPasswordReset = _ref.revokeSessionOnPasswordReset,
          expireInactiveSessions = _ref.expireInactiveSessions,
          sessionLength = _ref.sessionLength,
          maxLimit = _ref.maxLimit,
          emailVerifyTokenValidityDuration = _ref.emailVerifyTokenValidityDuration,
          accountLockout = _ref.accountLockout,
          passwordPolicy = _ref.passwordPolicy,
          masterKeyIps = _ref.masterKeyIps,
          masterKey = _ref.masterKey,
          readOnlyMasterKey = _ref.readOnlyMasterKey;


      if (masterKey === readOnlyMasterKey) {
        throw new Error('masterKey and readOnlyMasterKey should be different');
      }

      var emailAdapter = userController.adapter;
      if (verifyUserEmails) {
        this.validateEmailConfiguration({ emailAdapter: emailAdapter, appName: appName, publicServerURL: publicServerURL, emailVerifyTokenValidityDuration: emailVerifyTokenValidityDuration });
      }

      this.validateAccountLockoutPolicy(accountLockout);

      this.validatePasswordPolicy(passwordPolicy);

      if (typeof revokeSessionOnPasswordReset !== 'boolean') {
        throw 'revokeSessionOnPasswordReset must be a boolean value';
      }

      if (publicServerURL) {
        if (!publicServerURL.startsWith("http://") && !publicServerURL.startsWith("https://")) {
          throw "publicServerURL should be a valid HTTPS URL starting with https://";
        }
      }

      this.validateSessionConfiguration(sessionLength, expireInactiveSessions);

      this.validateMasterKeyIps(masterKeyIps);

      this.validateMaxLimit(maxLimit);
    }
  }, {
    key: 'validateAccountLockoutPolicy',
    value: function validateAccountLockoutPolicy(accountLockout) {
      if (accountLockout) {
        if (typeof accountLockout.duration !== 'number' || accountLockout.duration <= 0 || accountLockout.duration > 99999) {
          throw 'Account lockout duration should be greater than 0 and less than 100000';
        }

        if (!Number.isInteger(accountLockout.threshold) || accountLockout.threshold < 1 || accountLockout.threshold > 999) {
          throw 'Account lockout threshold should be an integer greater than 0 and less than 1000';
        }
      }
    }
  }, {
    key: 'validatePasswordPolicy',
    value: function validatePasswordPolicy(passwordPolicy) {
      if (passwordPolicy) {
        if (passwordPolicy.maxPasswordAge !== undefined && (typeof passwordPolicy.maxPasswordAge !== 'number' || passwordPolicy.maxPasswordAge < 0)) {
          throw 'passwordPolicy.maxPasswordAge must be a positive number';
        }

        if (passwordPolicy.resetTokenValidityDuration !== undefined && (typeof passwordPolicy.resetTokenValidityDuration !== 'number' || passwordPolicy.resetTokenValidityDuration <= 0)) {
          throw 'passwordPolicy.resetTokenValidityDuration must be a positive number';
        }

        if (passwordPolicy.validatorPattern) {
          if (typeof passwordPolicy.validatorPattern === 'string') {
            passwordPolicy.validatorPattern = new RegExp(passwordPolicy.validatorPattern);
          } else if (!(passwordPolicy.validatorPattern instanceof RegExp)) {
            throw 'passwordPolicy.validatorPattern must be a regex string or RegExp object.';
          }
        }

        if (passwordPolicy.validatorCallback && typeof passwordPolicy.validatorCallback !== 'function') {
          throw 'passwordPolicy.validatorCallback must be a function.';
        }

        if (passwordPolicy.doNotAllowUsername && typeof passwordPolicy.doNotAllowUsername !== 'boolean') {
          throw 'passwordPolicy.doNotAllowUsername must be a boolean value.';
        }

        if (passwordPolicy.maxPasswordHistory && (!Number.isInteger(passwordPolicy.maxPasswordHistory) || passwordPolicy.maxPasswordHistory <= 0 || passwordPolicy.maxPasswordHistory > 20)) {
          throw 'passwordPolicy.maxPasswordHistory must be an integer ranging 0 - 20';
        }
      }
    }

    // if the passwordPolicy.validatorPattern is configured then setup a callback to process the pattern

  }, {
    key: 'setupPasswordValidator',
    value: function setupPasswordValidator(passwordPolicy) {
      if (passwordPolicy && passwordPolicy.validatorPattern) {
        passwordPolicy.patternValidator = function (value) {
          return passwordPolicy.validatorPattern.test(value);
        };
      }
    }
  }, {
    key: 'validateEmailConfiguration',
    value: function validateEmailConfiguration(_ref2) {
      var emailAdapter = _ref2.emailAdapter,
          appName = _ref2.appName,
          publicServerURL = _ref2.publicServerURL,
          emailVerifyTokenValidityDuration = _ref2.emailVerifyTokenValidityDuration;

      if (!emailAdapter) {
        throw 'An emailAdapter is required for e-mail verification and password resets.';
      }
      if (typeof appName !== 'string') {
        throw 'An app name is required for e-mail verification and password resets.';
      }
      if (typeof publicServerURL !== 'string') {
        throw 'A public server url is required for e-mail verification and password resets.';
      }
      if (emailVerifyTokenValidityDuration) {
        if (isNaN(emailVerifyTokenValidityDuration)) {
          throw 'Email verify token validity duration must be a valid number.';
        } else if (emailVerifyTokenValidityDuration <= 0) {
          throw 'Email verify token validity duration must be a value greater than 0.';
        }
      }
    }
  }, {
    key: 'validateMasterKeyIps',
    value: function validateMasterKeyIps(masterKeyIps) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = masterKeyIps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var ip = _step.value;

          if (!_net2.default.isIP(ip)) {
            throw 'Invalid ip in masterKeyIps: ' + ip;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'validateSessionConfiguration',
    value: function validateSessionConfiguration(sessionLength, expireInactiveSessions) {
      if (expireInactiveSessions) {
        if (isNaN(sessionLength)) {
          throw 'Session length must be a valid number.';
        } else if (sessionLength <= 0) {
          throw 'Session length must be a value greater than 0.';
        }
      }
    }
  }, {
    key: 'validateMaxLimit',
    value: function validateMaxLimit(maxLimit) {
      if (maxLimit <= 0) {
        throw 'Max limit must be a value greater than 0.';
      }
    }
  }]);

  return Config;
}();

exports.default = Config;

module.exports = Config;