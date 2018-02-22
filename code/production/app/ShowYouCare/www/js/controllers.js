angular.module('syc.controllers', ['angularMoment'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

})

.controller('BrowseCtrl', function($scope, $http) {
  var mapOptions = {
    // center: latLng,
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var mcr = { lat: 53.4808, lng: -2.2426 };

  $scope.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: mcr
  });

  $http.get('https://showyoucare.herokuapp.com/api/event')
  .then(function(response){
    console.log(response.data)

    var events = response.data;

    for(e of events){
      var marker = new google.maps.Marker({
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          position: mcr
      });

      var infoWindow = new google.maps.InfoWindow({
          content: "Here I am!"
      });

      google.maps.event.addListener(marker, 'click', function () {
          infoWindow.open($scope.map, marker);
      });
    }


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
