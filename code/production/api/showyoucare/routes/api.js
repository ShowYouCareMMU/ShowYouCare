var express = require('express');
var router = express.Router();
var { Client } = require('pg');
var onesignal = require('simple-onesignal');

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
      res.send(eventsResult.rows)
    }
    client.end()
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
      if(err.code == 23505){
        res.status(409).json({ message: "fail" })
      } else {
        res.status(500).json({ message: err})
      }
    } else {
      res.status(204).json({ message: "success" })
    }
    client.end();
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
      client.close()
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

  if(req.params.stateId === 'APOLOGISE'){
    client.query("SELECT stateid FROM EventToState WHERE eventid = '" + req.params.eventId + "' AND stateid = 'APOLOGISE';", (err, statesResult) => {
      if(err) {
        res.send(err)
        client.close()
        throw err
      }

      if(statesResult.rowCount == 0){
        insertState()
        client.query("SELECT playerid FROM Event WHERE eventid = '" + req.params.eventId + "';", (err, eventResult) => {
          if(err) {
            res.send(err)
            client.end()
            throw err
          }

          onesignal.configure('2d327c1f-f855-4163-aac7-c8724674deca', 'ZTIzOWZiOTEtNmJkYy00MDI5LThiZGQtYWI4ODJmOTc3YTgw');
          onesignal.sendMessage({
            contents: { en:' Someone parked for their bad parking!' },
            include_player_ids: [ eventResult.rows[0].playerid ]
          }, function(err, resp) {
              if(err) {
                console.error(err)
              } else {
                console.log(resp)
              }
          });
        })
      } else {
        res.status(200).send({ message: 'Success' })
      }
    })
  } else {
    insertState()
  }

  function insertState(){
    var client = new Client({
      connectionString: connectionString,
      ssl: true
    })

    client.connect()

    client.query("INSERT INTO EventToState (eventId, stateId, time) VALUES ('" + req.params.eventId + "', '" + req.params.stateId + "', '" + new Date().toISOString() + "');", (err, insertResult) => {
      client.end()
    })
  }
});


router.get('/notification', function(req, res) {
  onesignal.configure('2d327c1f-f855-4163-aac7-c8724674deca', 'ZTIzOWZiOTEtNmJkYy00MDI5LThiZGQtYWI4ODJmOTc3YTgw');
  onesignal.sendMessage({
    contents: { en:' Someone parked for their bad parking!' },
    include_player_ids: [ 'a79da045-b457-4c9e-b538-3f8a3c0accc7' ]
  }, function(err, resp) {
      if(err) {
        console.error(err)
      } else {
        console.log(resp)
      }
  });

  res.send('Done')
})

module.exports = router;
