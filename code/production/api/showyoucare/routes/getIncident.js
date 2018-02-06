var unirest = require("unirest");

module.exports = {
  get: function(uuid){
    if(uuid != null){
      var req = unirest("GET", "https://showyoucareapi.restlet.net/v1/incidents/"+uuid);
    }else{
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

      console.log(res.body);
    });
  }
};
