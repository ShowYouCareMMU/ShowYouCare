angular.module('syc.controllers', ['angularMoment'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

})

.controller('BrowseCtrl', function($scope, $http) {
  $http.get('http://10.0.2.2/api/event')
  .then(function(response){
    console.log(response.data)

    var events = response.data;

    events.forEach(function(e, i, o){
      e.friendlyDateTime = moment(e.time).calendar()
    })

    $scope.incidents = events

  }, function(err){

    alert(JSON.stringify(err))
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
