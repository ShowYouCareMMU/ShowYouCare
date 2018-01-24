var express = require('express');
var router = express.Router();

/* GET incidents listing. Use push id to get previously submitted */
router.get('/all', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET incidents listing. Use params to get single incident */
router.get('/single', function(req, res, next) {
  res.send('respond with a resource');
});

// POST new incidents
router.post('/', function(req, res, next) {
  res.send('respond with a resource');
});


module.exports = router;
