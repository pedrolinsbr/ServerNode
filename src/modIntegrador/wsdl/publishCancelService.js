module.exports = {
  publishCancelServiceRequestService: {
    publishCancelServiceRequestPort: {
      publishCancelServiceRequest: function (args) {
        return {
          result: {
            regionSourceId: '10A',
            tripId: 10,
            status: 1
          }
        };
        
      }
    }
  }
};