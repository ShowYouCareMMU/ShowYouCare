var unirest = require("unirest");

module.exports = {
  get: function(uuId, cb){
    if(uuId != null){
      var req = unirest("GET", "https://showyoucareapi.restlet.net/v1/incidents/" + uuId);
    } else {
      var req = unirest("GET", "https://showyoucareapi.restlet.net/v1/incidents/");
    }

    req.headers({
      "authorization": "Basic YzNhMmFiMDQtNDc1YS00MWE2LWIxM2UtY2FkM2U2YTA0ZDc1OjQ2NTY0YmVmLTg0NTItNGFlZS04NzJjLWY5ZGI2YTAzOTQ0MQ==",
      "content-type": "application/json",
      "accept": "application/json",
      "host": "showyoucareapi.restlet.net"
    });

    req.end(function (res) {
      if (res.error) throw new Error(res.error);
      cb(res.body);
    });
  },
  push: function(pushId, descriptionId, cb){
    var req = unirest("POST", "https://showyoucareapi.restlet.net/v1/incidents/");

    req.headers({
      "authorization": "Basic YzNhMmFiMDQtNDc1YS00MWE2LWIxM2UtY2FkM2U2YTA0ZDc1OjQ2NTY0YmVmLTg0NTItNGFlZS04NzJjLWY5ZGI2YTAzOTQ0MQ==",
      "content-type": "application/json",
      "accept": "application/json",
      "host": "showyoucareapi.restlet.net"
    });

    req.type("json");
    req.send({
      "uuid": "",
      "postid": pushId,
      "descriptionID": descriptionId
    });

    req.end(function (res) {
      if (res.error) throw new Error(res.error);
      cb(res.body);
    });
  }
}
