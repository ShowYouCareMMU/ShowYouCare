angular.module('syc.controllers', ['angularMoment'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  // $scope.$on('$ionicView.enter', function(e) {
  //});

})

.controller('BrowseCtrl', function($scope) {
  // $http({
  //   method: 'GET',
  //   url: 'https://showyoucare.herokuapp.com/api/browse/'
  // }, postData)
  // .then(function successCallback(response) {
  //   $scope.success = true
  // }, function errorCallback(response) {
  //   $scope.success = false
  // });

  var data = [
    { id: 1, dateTime: new Date(2017, 11, 1, 11, 6), apologised: false, distance: '0.6 miles away' },
    { id: 2, dateTime: new Date(2017, 11, 5, 16, 12), apologised: true, distance: '1.5 miles away' },
    { id: 3, dateTime: new Date(2017, 12, 7, 9, 43), apologised: false, distance: '8 miles away' },
    { id: 4, dateTime: new Date(2017, 12, 28, 13, 21), apologised: true, distance: '1.2 miles away' },
    { id: 5, dateTime: new Date(2018, 1, 12, 19, 6), apologised: false, distance: '32 miles away' }
  ]

  for(d of data){
    d.friendlyDateTime = moment(d.dateTime).calendar()
  }

  $scope.$on('$locationChangeSuccess', function() {
    document.getElementById("full-content").style.height = "";
    if(QRScanner !== null){
      QRScanner.destroy();
    }
  });

  $scope.incidents = data

})

.controller('NewIncidentCtrl', function($scope, $http) {
  document.getElementById("full-content").style.height = "43px";

  if(QRScanner !== null){
    QRScanner.scan(function(err, text){
      if(err){
        alert("Code couldn't be scanned")
      } else {
        var uuid = text.replace("https://showyoucare.herokuapp.com/r/", "")

        window.plugins.OneSignal.getPermissionSubscriptionState(function(status) {
          var postData = {
            playerId: status.subscriptionStatus.userId
          }

          $http.post('https://showyoucare.herokuapp.com/api/event/' + uuid, postData)
          .then(function(success){
            $scope.success = true
          }, function(err){
            $scope.success = false
          });

        })
      }
      document.getElementById("full-content").style.height = "";
      QRScanner.destroy();
    });
    QRScanner.show();
  }
})


.controller('IncidentCtrl', function($scope, $stateParams) {

  console.log("IncidentCtrl :: init")
});
