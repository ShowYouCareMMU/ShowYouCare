var express = require('express');
var router = express.Router();
var incident = require('../helpers/incident');

/* GET response page page. */
router.get('/:id', function(req, res, next) {
  incident.get(req.params.body, function(data){
    res.render('incident', { incident: data });
  })
});

module.exports = router;
