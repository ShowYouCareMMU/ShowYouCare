angular.module('syc.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  // $scope.$on('$ionicView.enter', function(e) {
  //});

})

.controller('BrowseCtrl', function($scope) {

  // Andreas:
  // Pull in the incidents here and put them in an array
  // similar to below. There'll be other bits of data
  // coming back from the server that you might want to
  // display as well so you might want to display them.
  // Let Backend know if there's any other bits of data
  // you want included.

  // Good luck and shout out if you're struggling

  $scope.incidents = [
    { id: 1, datetime: new Date(2017, 11, 1, 11, 6) },
    { id: 2, datetime: new Date(2017, 11, 5, 16, 12) },
    { id: 3, datetime: new Date(2017, 12, 7, 9, 43) },
    { id: 4, datetime: new Date(2017, 12, 28, 13, 21) },
    { id: 5, datetime: new Date(2018, 1, 12, 19, 6) }
  ];
})

.controller('NewIncidentCtrl', function($scope) {

  // Nat: https://www.npmjs.com/package/cordova-plugin-qrscanner
  // The above library has been included and some starter
  // code has been included below. You'll have to test your
  // bit from an actual device so you can scan an actual QR code
  // Find some examples of QR codes here https://trello.com/c/maYHlUVm

  // The data from the QR code should be:
  // https://showyoucare.herokuapp.com/ABCDEF123GHIJ (or similar to)
  // Try and strip out the host so it's just ABCDEF123GHIJ

  // Good luck and shout out if you're struggling


  // Start a scan. Scanning will continue until something is detected or
  // `QRScanner.cancelScan()` is called.
  QRScanner.scan(displayContents);

  function displayContents(err, text){
    if(err){
      // an error occurred, or the scan was canceled (error code `6`)
    } else {
      // The scan completed, display the contents of the QR code:
      alert(text);


      // Alex:
      // Post the data to the server here. Backend will give you
      // a URL to post the data to. Try just using the format
      // below for now. playedId is what we use to relate user data
      // back to OneSignal (for Push Notifications). The code to get
      // the player ID is below so try and push that to the server
      // as well


      window.plugins.OneSignal.getPermissionSubscriptionState(function(status) {
        playerId: status.subscriptionStatus.userId
      })

      // {
      //  id: "[string from nat found above]",
      //  playerId: [see above],
      //  datetime: new Date()
      // }


    }
  }

  // Make the webview transparent so the video preview is visible behind it.
  QRScanner.show();
  // Be sure to make any opaque HTML elements transparent here to avoid
  // covering the video.

})


.controller('IncidentCtrl', function($scope, $stateParams) {
});
