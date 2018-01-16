// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if (window.plugins && window.plugins.OneSignal) {
      window.plugins.OneSignal.setLogLevel({ logLevel: 4 });

      var notificationOpenedCallback = function(jsonData) {
        console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
      };

      window.plugins.OneSignal
        .startInit("2d327c1f-f855-4163-aac7-c8724674deca")
        .handleNotificationOpened(notificationOpenedCallback)
        .endInit();
    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

    .state('app.newIncident', {
      url: '/new-incident',
      views: {
        'menuContent': {
          templateUrl: 'templates/new-incident.html',
          controller: 'NewIncidentCtrl'
        }
      }
    })

    .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html',
          controller: 'BrowseCtrl'
        }
      }
    })

  .state('app.single', {
    url: '/browse/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/incident.html',
        controller: 'IncidentCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/browse');
});
