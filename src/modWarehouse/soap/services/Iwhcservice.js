const fs	  = require('fs');
const moment = require('moment');

module.exports = function (app) {
  
  let ctrl = app.src.modWarehouse.controllers.XMLController;

  return {
    Iwhcservice: {
      IwhcPort: {
        SendDelivery: function (args, cb, headers, req) {
          
          ctrl.importDocSap(args, req).then((result) => {
              cb(result)
          })
          
        }
      }
    }
  }
}
