angular.module('syc.controllers', ['angularMoment'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  $scope.$on('$ionicView.enter', function(e) {
    console.log('$ionicView.enter :: init')
    navigator.geolocation.getCurrentPosition(function(position){
      window.location = position.coords
    })
  });

})

.controller('BrowseCtrl', function($scope, $http) {
  $http.get('https://showyoucare.herokuapp.com/api/event/')
  .then(function(response){
    var events = response.data.event;

    for(e of events){
      if(!moment(e.time).isValid()){
        e = null
        continue;
      }

      e.friendlyDateTime = moment(e.time).calendar()
      e.distance = "0.3 miles away"
      // e.distance = Math.round(haversine(position.coords, offerLoc, {unit: 'mile'}) * 10) / 10 + " mi " + String.fromCharCode(187)
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
      latitude: null,
      longitude: null
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

        $http.post('http://10.0.2.2:3000/api/event/' + uuid, postData)
        .then(function(success){
          $scope.success = true
        }, function(err){
          if(err.status == 409){
            $scope.alreadyExists = true
          } else {
            $scope.fail = true
          }

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
