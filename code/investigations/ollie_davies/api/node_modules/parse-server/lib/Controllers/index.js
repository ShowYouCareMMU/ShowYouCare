'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getControllers = getControllers;
exports.getLoggerController = getLoggerController;
exports.getFilesController = getFilesController;
exports.getUserController = getUserController;
exports.getCacheController = getCacheController;
exports.getAnalyticsController = getAnalyticsController;
exports.getLiveQueryController = getLiveQueryController;
exports.getDatabaseController = getDatabaseController;
exports.getHooksController = getHooksController;
exports.getPushController = getPushController;
exports.getAuthDataManager = getAuthDataManager;
exports.getDatabaseAdapter = getDatabaseAdapter;

var _Auth = require('../Adapters/Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _Options = require('../Options');

var _AdapterLoader = require('../Adapters/AdapterLoader');

var _defaults = require('../defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _LoggerController = require('./LoggerController');

var _FilesController = require('./FilesController');

var _HooksController = require('./HooksController');

var _UserController = require('./UserController');

var _CacheController = require('./CacheController');

var _LiveQueryController = require('./LiveQueryController');

var _AnalyticsController = require('./AnalyticsController');

var _PushController = require('./PushController');

var _PushQueue = require('../Push/PushQueue');

var _PushWorker = require('../Push/PushWorker');

var _DatabaseController = require('./DatabaseController');

var _DatabaseController2 = _interopRequireDefault(_DatabaseController);

var _SchemaCache = require('./SchemaCache');

var _SchemaCache2 = _interopRequireDefault(_SchemaCache);

var _GridStoreAdapter = require('../Adapters/Files/GridStoreAdapter');

var _WinstonLoggerAdapter = require('../Adapters/Logger/WinstonLoggerAdapter');

var _InMemoryCacheAdapter = require('../Adapters/Cache/InMemoryCacheAdapter');

var _AnalyticsAdapter = require('../Adapters/Analytics/AnalyticsAdapter');

var _MongoStorageAdapter = require('../Adapters/Storage/Mongo/MongoStorageAdapter');

var _MongoStorageAdapter2 = _interopRequireDefault(_MongoStorageAdapter);

var _PostgresStorageAdapter = require('../Adapters/Storage/Postgres/PostgresStorageAdapter');

var _PostgresStorageAdapter2 = _interopRequireDefault(_PostgresStorageAdapter);

var _parseServerPushAdapter = require('parse-server-push-adapter');

var _parseServerPushAdapter2 = _interopRequireDefault(_parseServerPushAdapter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getControllers(options) {
  var loggerController = getLoggerController(options);
  var filesController = getFilesController(options);
  var userController = getUserController(options);

  var _getPushController = getPushController(options),
      pushController = _getPushController.pushController,
      hasPushScheduledSupport = _getPushController.hasPushScheduledSupport,
      hasPushSupport = _getPushController.hasPushSupport,
      pushControllerQueue = _getPushController.pushControllerQueue,
      pushWorker = _getPushController.pushWorker;

  var cacheController = getCacheController(options);
  var analyticsController = getAnalyticsController(options);
  var liveQueryController = getLiveQueryController(options);
  var databaseController = getDatabaseController(options, cacheController);
  var hooksController = getHooksController(options, databaseController);
  var authDataManager = getAuthDataManager(options);
  return {
    loggerController: loggerController,
    filesController: filesController,
    userController: userController,
    pushController: pushController,
    hasPushScheduledSupport: hasPushScheduledSupport,
    hasPushSupport: hasPushSupport,
    pushWorker: pushWorker,
    pushControllerQueue: pushControllerQueue,
    analyticsController: analyticsController,
    cacheController: cacheController,
    liveQueryController: liveQueryController,
    databaseController: databaseController,
    hooksController: hooksController,
    authDataManager: authDataManager
  };
}

// Adapters

// Controllers
function getLoggerController(options) {
  var appId = options.appId,
      jsonLogs = options.jsonLogs,
      logsFolder = options.logsFolder,
      verbose = options.verbose,
      logLevel = options.logLevel,
      silent = options.silent,
      loggerAdapter = options.loggerAdapter;

  var loggerOptions = { jsonLogs: jsonLogs, logsFolder: logsFolder, verbose: verbose, logLevel: logLevel, silent: silent };
  var loggerControllerAdapter = (0, _AdapterLoader.loadAdapter)(loggerAdapter, _WinstonLoggerAdapter.WinstonLoggerAdapter, loggerOptions);
  return new _LoggerController.LoggerController(loggerControllerAdapter, appId, loggerOptions);
}

function getFilesController(options) {
  var appId = options.appId,
      databaseURI = options.databaseURI,
      filesAdapter = options.filesAdapter,
      databaseAdapter = options.databaseAdapter;

  if (!filesAdapter && databaseAdapter) {
    throw 'When using an explicit database adapter, you must also use an explicit filesAdapter.';
  }
  var filesControllerAdapter = (0, _AdapterLoader.loadAdapter)(filesAdapter, function () {
    return new _GridStoreAdapter.GridStoreAdapter(databaseURI);
  });
  return new _FilesController.FilesController(filesControllerAdapter, appId);
}

function getUserController(options) {
  var appId = options.appId,
      emailAdapter = options.emailAdapter,
      verifyUserEmails = options.verifyUserEmails;

  var emailControllerAdapter = (0, _AdapterLoader.loadAdapter)(emailAdapter);
  return new _UserController.UserController(emailControllerAdapter, appId, { verifyUserEmails: verifyUserEmails });
}

function getCacheController(options) {
  var appId = options.appId,
      cacheAdapter = options.cacheAdapter,
      cacheTTL = options.cacheTTL,
      cacheMaxSize = options.cacheMaxSize;

  var cacheControllerAdapter = (0, _AdapterLoader.loadAdapter)(cacheAdapter, _InMemoryCacheAdapter.InMemoryCacheAdapter, { appId: appId, ttl: cacheTTL, maxSize: cacheMaxSize });
  return new _CacheController.CacheController(cacheControllerAdapter, appId);
}

function getAnalyticsController(options) {
  var analyticsAdapter = options.analyticsAdapter;

  var analyticsControllerAdapter = (0, _AdapterLoader.loadAdapter)(analyticsAdapter, _AnalyticsAdapter.AnalyticsAdapter);
  return new _AnalyticsController.AnalyticsController(analyticsControllerAdapter);
}

function getLiveQueryController(options) {
  return new _LiveQueryController.LiveQueryController(options.liveQuery);
}

function getDatabaseController(options, cacheController) {
  var databaseURI = options.databaseURI,
      databaseOptions = options.databaseOptions,
      collectionPrefix = options.collectionPrefix,
      schemaCacheTTL = options.schemaCacheTTL,
      enableSingleSchemaCache = options.enableSingleSchemaCache;
  var databaseAdapter = options.databaseAdapter;

  if ((databaseOptions || databaseURI && databaseURI !== _defaults2.default.databaseURI || collectionPrefix !== _defaults2.default.collectionPrefix) && databaseAdapter) {
    throw 'You cannot specify both a databaseAdapter and a databaseURI/databaseOptions/collectionPrefix.';
  } else if (!databaseAdapter) {
    databaseAdapter = getDatabaseAdapter(databaseURI, collectionPrefix, databaseOptions);
  } else {
    databaseAdapter = (0, _AdapterLoader.loadAdapter)(databaseAdapter);
  }
  return new _DatabaseController2.default(databaseAdapter, new _SchemaCache2.default(cacheController, schemaCacheTTL, enableSingleSchemaCache));
}

function getHooksController(options, databaseController) {
  var appId = options.appId,
      webhookKey = options.webhookKey;

  return new _HooksController.HooksController(appId, databaseController, webhookKey);
}

function getPushController(options) {
  var scheduledPush = options.scheduledPush,
      push = options.push;


  var pushOptions = Object.assign({}, push);
  var pushQueueOptions = pushOptions.queueOptions || {};
  if (pushOptions.queueOptions) {
    delete pushOptions.queueOptions;
  }

  // Pass the push options too as it works with the default
  var pushAdapter = (0, _AdapterLoader.loadAdapter)(pushOptions && pushOptions.adapter, _parseServerPushAdapter2.default, pushOptions);
  // We pass the options and the base class for the adatper,
  // Note that passing an instance would work too
  var pushController = new _PushController.PushController();
  var hasPushSupport = !!(pushAdapter && push);
  var hasPushScheduledSupport = hasPushSupport && scheduledPush === true;

  var disablePushWorker = pushQueueOptions.disablePushWorker;


  var pushControllerQueue = new _PushQueue.PushQueue(pushQueueOptions);
  var pushWorker = void 0;
  if (!disablePushWorker) {
    pushWorker = new _PushWorker.PushWorker(pushAdapter, pushQueueOptions);
  }
  return {
    pushController: pushController,
    hasPushSupport: hasPushSupport,
    hasPushScheduledSupport: hasPushScheduledSupport,
    pushControllerQueue: pushControllerQueue,
    pushWorker: pushWorker
  };
}

function getAuthDataManager(options) {
  var auth = options.auth,
      enableAnonymousUsers = options.enableAnonymousUsers;

  return (0, _Auth2.default)(auth, enableAnonymousUsers);
}

function getDatabaseAdapter(databaseURI, collectionPrefix, databaseOptions) {
  var protocol = void 0;
  try {
    var parsedURI = _url2.default.parse(databaseURI);
    protocol = parsedURI.protocol ? parsedURI.protocol.toLowerCase() : null;
  } catch (e) {/* */}
  switch (protocol) {
    case 'postgres:':
      return new _PostgresStorageAdapter2.default({
        uri: databaseURI,
        collectionPrefix: collectionPrefix,
        databaseOptions: databaseOptions
      });
    default:
      return new _MongoStorageAdapter2.default({
        uri: databaseURI,
        collectionPrefix: collectionPrefix,
        mongoOptions: databaseOptions
      });
  }
}