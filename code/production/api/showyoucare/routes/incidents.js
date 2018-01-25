var express = require('express');
var router = express.Router();
var unirest = require('unirest');

/* GET incidents listing. Use push id to get previously submitted */
router.get('/:pushID', function(req, res, next) {

  var req = unirest("GET", "http://showyoucare.restlet.net/v1/eventToStates/");

  req.headers({
    "authorization": "Basic YzNhMmFiMDQtNDc1YS00MWE2LWIxM2UtY2FkM2U2YTA0ZDc1Ojc1NGQ5ZDYxLTE0NzAtNDEyNy04MWFkLTdhY2U3NmVhMzE5YQ==",
    "content-type": "application/json",
    "accept": "application/json",
    "host": "showyoucare.restlet.net"
  });


  req.end(function (res) {
    if (res.error) throw new Error(res.error);

    console.log(res.body);

    res.send('respond with a resource');
  });

});

/* GET single incident. Use params to get single incident */
router.get('/:guid', function(req, res, next) {
  res.send('respond with a resource');
});

// POST update incident
router.post('/:guid', function(req, res, next) {
  res.send('respond with a resource');
});

// POST new incidents
router.post('/:pushID', function(req, res, next) {
  res.send('respond with a resource');
});


module.exports = router;
