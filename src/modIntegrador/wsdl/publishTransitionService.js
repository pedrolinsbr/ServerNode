
module.exports = function (app) {
  
  let publishTransitionController = app.src.modIntegrador.wsdl.publishTransitionController;

  return {publishTransitionService: {
    publishTransitionServiceHttpPort: {
      publishTransition: function (transition, callback) {
        
        publishTransitionController.processarXML(transition)
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