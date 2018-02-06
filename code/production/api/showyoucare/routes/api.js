var express = require('express');
var router = express.Router();
var incident = require('../helpers/incident');

//push incident to restlet
router.post('/push', function (req, res) {
  var pushid = req.body.pushid;
  var descriptionid = req.body.descriptionid;
  incident.push(pushid, descriptionid, function(data){
    res.send(data)
  })
})

//get an incident from restlet
router.get('/get', function(req, res) {
  var uuid = req.query.uuid;
  incident.get(uuid, function(data){
    res.send(data)
  });
});

module.exports = router;
