
module.exports = function (app) {
  
  let publishOccurrenceController = app.src.modIntegrador.wsdl.publishOccurrenceController;

  return {publishOccurrenceService: {
    publishOccurrenceServiceHttpPort: {
      publishOccurrence: function (occurrence, callback) {
        
        publishOccurrenceController.processarXML(occurrence)
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