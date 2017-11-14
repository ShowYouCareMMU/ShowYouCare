'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LRUCache = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

var _defaults = require('../../defaults');

var _defaults2 = _interopRequireDefault(_defaults);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LRUCache = exports.LRUCache = function () {
  function LRUCache(_ref) {
    var _ref$ttl = _ref.ttl,
        ttl = _ref$ttl === undefined ? _defaults2.default.cacheTTL : _ref$ttl,
        _ref$maxSize = _ref.maxSize,
        maxSize = _ref$maxSize === undefined ? _defaults2.default.cacheMaxSize : _ref$maxSize;

    _classCallCheck(this, LRUCache);

    this.cache = new _lruCache2.default({
      max: maxSize,
      maxAge: ttl
    });
  }

  _createClass(LRUCache, [{
    key: 'get',
    value: function get(key) {
      return this.cache.get(key) || null;
    }
  }, {
    key: 'put',
    value: function put(key, value) {
      var ttl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.ttl;

      this.cache.set(key, value, ttl);
    }
  }, {
    key: 'del',
    value: function del(key) {
      this.cache.del(key);
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.cache.reset();
    }
  }]);

  return LRUCache;
}();

exports.default = LRUCache;