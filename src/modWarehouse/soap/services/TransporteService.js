const fs	  = require('fs');
const moment = require('moment')
 
 module.exports = {
   
    TransporteService: {
      MyPort: {
        MyFunction: function (args) {

          var xml = args.testParam.$value
          var nome = moment().format('YYYYMMDDHHmmSS');
          
          fs.writeFileSync(`../xml/warehouse/deliveries/${nome}.xml`, xml);

          return {
            result: {
              bravo: args.testParam.$value
            }
          };
        }
      }
    }
  };