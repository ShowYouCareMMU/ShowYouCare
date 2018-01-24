var express = require('express');
var router = express.Router();

/* GET response page page. */
router.get('/:id', function(req, res, next) {
  console.log(req.params)
  res.render('index', { title: 'Whoops, park eleswhere : ' + req.params.id  });
});

module.exports = router;
