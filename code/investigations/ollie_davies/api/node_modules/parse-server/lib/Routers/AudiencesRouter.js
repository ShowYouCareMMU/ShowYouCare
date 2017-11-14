'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AudiencesRouter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _ClassesRouter2 = require('./ClassesRouter');

var _ClassesRouter3 = _interopRequireDefault(_ClassesRouter2);

var _rest = require('../rest');

var _rest2 = _interopRequireDefault(_rest);

var _middlewares = require('../middlewares');

var middleware = _interopRequireWildcard(_middlewares);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudiencesRouter = exports.AudiencesRouter = function (_ClassesRouter) {
  _inherits(AudiencesRouter, _ClassesRouter);

  function AudiencesRouter() {
    _classCallCheck(this, AudiencesRouter);

    return _possibleConstructorReturn(this, (AudiencesRouter.__proto__ || Object.getPrototypeOf(AudiencesRouter)).apply(this, arguments));
  }

  _createClass(AudiencesRouter, [{
    key: 'className',
    value: function className() {
      return '_Audience';
    }
  }, {
    key: 'handleFind',
    value: function handleFind(req) {
      var body = Object.assign(req.body, _ClassesRouter3.default.JSONFromQuery(req.query));
      var options = _ClassesRouter3.default.optionsFromBody(body);

      return _rest2.default.find(req.config, req.auth, '_Audience', body.where, options, req.info.clientSDK).then(function (response) {

        response.results.forEach(function (item) {
          item.query = JSON.parse(item.query);
        });

        return { response: response };
      });
    }
  }, {
    key: 'handleGet',
    value: function handleGet(req) {
      return _get(AudiencesRouter.prototype.__proto__ || Object.getPrototypeOf(AudiencesRouter.prototype), 'handleGet', this).call(this, req).then(function (data) {
        data.response.query = JSON.parse(data.response.query);

        return data;
      });
    }
  }, {
    key: 'mountRoutes',
    value: function mountRoutes() {
      var _this2 = this;

      this.route('GET', '/push_audiences', middleware.promiseEnforceMasterKeyAccess, function (req) {
        return _this2.handleFind(req);
      });
      this.route('GET', '/push_audiences/:objectId', middleware.promiseEnforceMasterKeyAccess, function (req) {
        return _this2.handleGet(req);
      });
      this.route('POST', '/push_audiences', middleware.promiseEnforceMasterKeyAccess, function (req) {
        return _this2.handleCreate(req);
      });
      this.route('PUT', '/push_audiences/:objectId', middleware.promiseEnforceMasterKeyAccess, function (req) {
        return _this2.handleUpdate(req);
      });
      this.route('DELETE', '/push_audiences/:objectId', middleware.promiseEnforceMasterKeyAccess, function (req) {
        return _this2.handleDelete(req);
      });
    }
  }]);

  return AudiencesRouter;
}(_ClassesRouter3.default);

exports.default = AudiencesRouter;