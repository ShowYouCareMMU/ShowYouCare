angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

})

.controller('BrowseCtrl', function($scope) {
  $scope.incidents = [
    { id: 1, datetime: new Date(2017, 11, 1, 11, 6) },
    { id: 2, datetime: new Date(2017, 11, 5, 16, 12) },
    { id: 3, datetime: new Date(2017, 12, 7, 9, 43) },
    { id: 4, datetime: new Date(2017, 12, 28, 13, 21) },
    { id: 5, datetime: new Date(2018, 1, 12, 19, 6) }
  ];
})

.controller('NewIncidentCtrl', function($scope) {

  // Start a scan. Scanning will continue until something is detected or
  // `QRScanner.cancelScan()` is called.
  QRScanner.scan(displayContents);

  function displayContents(err, text){
    if(err){
      // an error occurred, or the scan was canceled (error code `6`)
    } else {
      // The scan completed, display the contents of the QR code:
      alert(text);
    }
  }

  // Make the webview transparent so the video preview is visible behind it.
  QRScanner.show();
  // Be sure to make any opaque HTML elements transparent here to avoid
  // covering the video.

})


.controller('IncidentCtrl', function($scope, $stateParams) {
});
