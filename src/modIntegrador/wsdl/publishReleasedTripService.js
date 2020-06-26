
module.exports = function (app) {
  
  var publishReleasedTripController = app.src.modIntegrador.wsdl.publishReleasedTripController;

  return {publishReleasedTripRequestService: {
    publishReleasedTripRequestPort: {
      publishReleasedTripRequest: function (carga, callback) {
        
        publishReleasedTripController.processarXMLOtimizador(carga)
          .then((result) => {
            callback({ result: true });
          });
        
      }
    }
  }
}
};

/* throw {
          Fault: {
            statusCode: 500,
            faultcode: 500,
            faultstring: 'teste',
            detail: 'teste1'
          }
        };
 */