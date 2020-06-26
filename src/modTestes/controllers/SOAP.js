var soap = require('soap');
 
module.exports = function (app) {
  // var url = 'http://localhost:3000/wscalc1?wsdl';

  // /* soap.createClient(url, function(err, client) {
  //     if (err) throw err;
  //     console.log(client.describe().ws.calc);
  //     client.multiplicar({a: 4,b: 5},function(err,res){
  //         if (err) throw err;
  //         console.log(res);
  //     });
  //     client.sumar({a: 4,b: 5},function(err,res){
  //         if (err) throw err;
  //         console.log(res);
  //     });
  // }); */

  /*  var url = 'http://localhost:3000/mockpublishCancelServiceRequestBinding?wsdl';
  
   soap.createClient(url, function(err, client) {
     if (err) throw err;
     console.log(client.describe().publishCancelServiceRequestService.publishCancelServiceRequestPort);
  
     client.publishCancelServiceRequest(
       {
         basketSourceId: '10A',
         regionSourceId: '20B',
         trips: [
           {
             trip: {
               tripId: 10,
               loads: {
                 loadId: 11,
                 loadSourceId: '30B'
               }
             }
           },
           {
             trip: {
               tripId: 10,
               loads: {
                 loadId: 11,
                 loadSourceId: '30B'
               }
             }
           }
         ]
      
       }, function (err, res) {
         if (err) {
           console.log(err.mensage);
           throw err;
         }
         console.log(res);
     });
   }); */
  /* trips: `
          <trips>
            <trip>
              <tripId>203</tripId>
              <loads>
                <load>
                  <loadId>34</loadId>
                  <loadSourceId>30C</loadSourceId>
                </load>
              </loads>
            </trip>
          </trips>
        ` */


  /* var url = 'http://localhost:3000/mockpublishReleasedTripRequestBinding?wsdl';
  
  
   var url = 'http://localhost:3000/mockpublishReleasedTripRequestBinding?wsdl';
  
  
  /*  soap.createClient(url, {
     returnFault: true
   }, function(err, client) {
     if (err) throw err;
     console.log(client.describe().publishReleasedTripRequestService.publishReleasedTripRequestPort);
     var xml = require('fs').readFileSync('./src/modIntegrador/wsdl/publishCancelService.xml', 'utf8');
     var json = require('xml2json').toJson(xml, {object: true});
     //console.log(json);
     client.publishReleasedTripRequest(
       json['soap:Envelope']['soap:Body']['ns2:publishReleasedTrip'],
       function (err, res) {
         if (err) {
           console.log(err.body);
           throw err;
         }
         console.log(res);
     });
   }); */

 /*  const Joi = require('joi');
  var log = app.config.logger;
 
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
    access_token: [Joi.string(), Joi.number()],
    birthyear: Joi.number().integer().min(1900).max(2013),
    email: Joi.string().email()
  });//.with('username', 'birthyear').without('password', 'access_token');
 
  // Return result.
  const result = Joi.validate({ username: 'abc', birthyear: 1994, access_token: 'aaa', password: 'ss' }, schema, {
    abortEarly: false,
    convert: false,
    language: {
      string : {
        alphanum: 'deve conter apenas caracteres alfanuméricos'
      }
    }
  });
  console.log(result); */
  // result.error === null -> valid
 
  // You can also pass a callback which will be called synchronously with the validation result.
  /* Joi.validate({ username: 'abc', birthyear: 1994 }, schema, function (err, value) {
    log.debug(err);
    log.debug(value);
  }); */  // err === null -> valid

} 