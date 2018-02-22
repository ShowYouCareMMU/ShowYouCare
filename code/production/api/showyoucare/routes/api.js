var express = require('express');
var router = express.Router();
var { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgres://lrwxrprpllqdri:4c6a84d0ec6ab6a24202b34345f904e6d24e03c961c0c835612592fba34846ba@ec2-23-21-198-69.compute-1.amazonaws.com:5432/d6k3s72pj066im";

router.all('*', function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
})

router.get('/event', function (req, res) {
  var client = new Client({
    connectionString: connectionString,
    ssl: true
  })

  client.connect()

  client.query("SELECT * FROM Event ORDER BY time DESC LIMIT 5;", (err, eventsResult) => {
    if(err) {
      res.status(500).json({ message: err})
    } else {
      res.send({
        event: eventsResult.rows
      })
    }
  })
})

router.post('/event/:eventId', function (req, res) {
  var client = new Client({
    connectionString: connectionString,
    ssl: true
  })

  client.connect()

  client.query("INSERT INTO Event (eventId, location, time, playerId) VALUES ('" + req.params.eventId + "', POINT(" + req.body.location.latitude + "," + req.body.location.longitude + ") ,'" + new Date().toISOString() + "', '" + req.body.playerId + "');", (err, insertResult) => {
    if(err) {
      console.log(err)
      if(err.code == 23505){
        res.status(409).json({ message: "fail" })
      } else {
        res.status(500).json({ message: err})
      }
    } else {
      res.status(204).json({ message: "success" })
    }
  })
})

router.get('/event/:eventId', function (req, res) {
  var client = new Client({
    connectionString: connectionString,
    ssl: true
  })

  client.connect()

  client.query("SELECT * FROM Event WHERE eventId = '" + req.params.eventId + "';", (err, eventResult) => {
    if(err) {
      res.send(err)
      throw err
    }

    client.query("SELECT * FROM EventToState WHERE eventId = '" + req.params.eventId + "' ORDER BY time DESC;", (err, eventStateResult) => {
      res.send({
        event: eventResult.rows[0],
        states: eventStateResult.rows
      })
    })
  })
})

// UPDATE eventId with stateId
router.post('/event/:eventId/state/:stateId', function(req, res) {
  var client = new Client({
    connectionString: connectionString,
    ssl: true
  })

  client.connect()

  client.query("INSERT INTO EventToState (eventId, stateId, time) VALUES ('" + req.params.eventId + "', '" + req.params.stateId + "', '" + new Date().toISOString() + "');", (err, insertResult) => {
    if(err) {
      res.send(err)
      throw err
    }
    res.send(insertResult)
  })
});

module.exports = router;
