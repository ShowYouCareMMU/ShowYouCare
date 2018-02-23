var express = require('express');
var router = express.Router();
var { Client } = require('pg');
var moment = require('moment');

const connectionString = process.env.DATABASE_URL || "postgres://lrwxrprpllqdri:4c6a84d0ec6ab6a24202b34345f904e6d24e03c961c0c835612592fba34846ba@ec2-23-21-198-69.compute-1.amazonaws.com:5432/d6k3s72pj066im";

/* GET response page. */
router.get('/:eventId', function(req, res, next) {

  var client = new Client({
    connectionString: connectionString,
    ssl: true
  })

  client.connect()

  client.query("SELECT * FROM Event WHERE eventId = '" + req.params.eventId + "';", (err, eventResult) => {
    if(err){ throw err; res.status(500).send(err) }

    client.query("SELECT * FROM EventToState WHERE eventId = '" + req.params.eventId + "' ORDER BY time DESC;", (err, eventStateResult) => {
      if(err){ throw err; res.status(500).send(err) }

      if(eventResult.rows[0].time){
        eventResult.rows[0].time = moment(eventResult.rows[0].time).calendar()
      }

      if(eventStateResult.rowCount === 0){
        res.render('incident', {
          event: eventResult.rows[0]
        });
      } else {
        res.render('incident', {
          event: eventResult.rows[0],
          state: eventStateResult.rows[0]
        });
      }
      client.end()
    })
  })
});

module.exports = router;
