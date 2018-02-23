angular.module('syc.controllers', ['angularMoment'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

})

.controller('BrowseCtrl', function($scope, $http) {

  var mcr = { lat: 53.4808, lng: -2.2426 };

  $scope.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: mcr
  });

  $http.get('https://showyoucare.herokuapp.com/api/event')
  .then(function(response){
    var events = response.data;

    for(e of events){
      if(e.location){
        marker = new google.maps.Marker({
          position: {
            lat: e.location.x,
            lng: e.location.y
          },
          map: $scope.map,
          contentString: `
            <div class="map_infowindow">
              ` + moment(e.time).calendar() + `
            </div>`
        });

        var infowindow = new google.maps.InfoWindow({});

        marker.addListener('click', function() {
          infowindow.setContent(this.contentString);
          infowindow.open(map, this);
          map.setCenter(this.getPosition());
        });
       }
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

        $http.post('https://showyoucare.herokuapp.com/api/event/' + uuid, postData)
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
