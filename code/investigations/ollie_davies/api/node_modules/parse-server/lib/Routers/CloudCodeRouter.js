'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CloudCodeRouter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _PromiseRouter2 = require('../PromiseRouter');

var _PromiseRouter3 = _interopRequireDefault(_PromiseRouter2);

var _node = require('parse/node');

var _node2 = _interopRequireDefault(_node);

var _rest = require('../rest');

var _rest2 = _interopRequireDefault(_rest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var triggers = require('../triggers');
var middleware = require('../middlewares');

function formatJobSchedule(job_schedule) {
  if (typeof job_schedule.startAfter === 'undefined') {
    job_schedule.startAfter = new Date().toISOString();
  }
  return job_schedule;
}

function validateJobSchedule(config, job_schedule) {
  var jobs = triggers.getJobs(config.applicationId) || {};
  if (job_schedule.jobName && !jobs[job_schedule.jobName]) {
    throw new _node2.default.Error(_node2.default.Error.INTERNAL_SERVER_ERROR, 'Cannot Schedule a job that is not deployed');
  }
}

var CloudCodeRouter = exports.CloudCodeRouter = function (_PromiseRouter) {
  _inherits(CloudCodeRouter, _PromiseRouter);

  function CloudCodeRouter() {
    _classCallCheck(this, CloudCodeRouter);

    return _possibleConstructorReturn(this, (CloudCodeRouter.__proto__ || Object.getPrototypeOf(CloudCodeRouter)).apply(this, arguments));
  }

  _createClass(CloudCodeRouter, [{
    key: 'mountRoutes',
    value: function mountRoutes() {
      this.route('GET', '/cloud_code/jobs', middleware.promiseEnforceMasterKeyAccess, CloudCodeRouter.getJobs);
      this.route('GET', '/cloud_code/jobs/data', middleware.promiseEnforceMasterKeyAccess, CloudCodeRouter.getJobsData);
      this.route('POST', '/cloud_code/jobs', middleware.promiseEnforceMasterKeyAccess, CloudCodeRouter.createJob);
      this.route('PUT', '/cloud_code/jobs/:objectId', middleware.promiseEnforceMasterKeyAccess, CloudCodeRouter.editJob);
      this.route('DELETE', '/cloud_code/jobs/:objectId', middleware.promiseEnforceMasterKeyAccess, CloudCodeRouter.deleteJob);
    }
  }], [{
    key: 'getJobs',
    value: function getJobs(req) {
      return _rest2.default.find(req.config, req.auth, '_JobSchedule', {}, {}).then(function (scheduledJobs) {
        return {
          response: scheduledJobs.results
        };
      });
    }
  }, {
    key: 'getJobsData',
    value: function getJobsData(req) {
      var config = req.config;
      var jobs = triggers.getJobs(config.applicationId) || {};
      return _rest2.default.find(req.config, req.auth, '_JobSchedule', {}, {}).then(function (scheduledJobs) {
        return {
          response: {
            in_use: scheduledJobs.results.map(function (job) {
              return job.jobName;
            }),
            jobs: Object.keys(jobs)
          }
        };
      });
    }
  }, {
    key: 'createJob',
    value: function createJob(req) {
      var job_schedule = req.body.job_schedule;

      validateJobSchedule(req.config, job_schedule);
      return _rest2.default.create(req.config, req.auth, '_JobSchedule', formatJobSchedule(job_schedule), req.client);
    }
  }, {
    key: 'editJob',
    value: function editJob(req) {
      var objectId = req.params.objectId;
      var job_schedule = req.body.job_schedule;

      validateJobSchedule(req.config, job_schedule);
      return _rest2.default.update(req.config, req.auth, '_JobSchedule', { objectId: objectId }, formatJobSchedule(job_schedule)).then(function (response) {
        return {
          response: response
        };
      });
    }
  }, {
    key: 'deleteJob',
    value: function deleteJob(req) {
      var objectId = req.params.objectId;

      return _rest2.default.del(req.config, req.auth, '_JobSchedule', objectId).then(function (response) {
        return {
          response: response
        };
      });
    }
  }]);

  return CloudCodeRouter;
}(_PromiseRouter3.default);