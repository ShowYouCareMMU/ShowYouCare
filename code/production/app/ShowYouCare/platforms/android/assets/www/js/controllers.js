angular.module('syc.controllers', ['angularMoment'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  // $scope.$on('$ionicView.enter', function(e) {
  //});

})

.controller('BrowseCtrl', function($scope, $http) {
  $http.get('https://showyoucare.herokuapp.com/api/event/')
  .then(function(response){
    var events = response.data.event;

    for(e of events){
      e.friendlyDateTime = moment(e.time).calendar()
      e.distance = "0.3 miles away"
    }

    $scope.incidents = events

  }, function(err){
    alert("An error occured. Please try again later.")
  });

  $scope.$on('$locationChangeSuccess', function() {
    document.getElementById("full-content").style.height = "";
    if(QRScanner !== null){
      QRScanner.destroy();
    }
  });
})

.controller('NewIncidentCtrl', function($scope, $http) {
  document.getElementById("full-content").style.height = "43px";

  var postData = {
    location: {
      latitude: 10.0,
      longitude: 10.0
    }
  }

  navigator.geolocation.getCurrentPosition(function(position){
    postData.location = position.coords
  })

  window.plugins.OneSignal.getPermissionSubscriptionState(function(status) {
    postData.playerId =  status.subscriptionStatus.userId || null
  })

  if(QRScanner !== null){
    QRScanner.scan(function(err, text){
      if(err){
        alert("Code couldn't be scanned")
      } else {
        var uuid = text.replace("https://showyoucare.herokuapp.com/r/", "")
        
        $http.post('http://localhost:3000/api/event/' + uuid, postData)
        .then(function(success){
          console.log(JSON.stringify(success))
          $scope.success = true
        }, function(err){
          console.log(JSON.stringify(err))
          $scope.success = false
        });
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
