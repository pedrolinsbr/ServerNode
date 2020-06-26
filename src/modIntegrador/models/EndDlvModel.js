module.exports = function (app, cb) {

    const joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // Check Post

    objSchema.chkEndDlv = {

        columns: {
            IDS001:     joi.number().integer().required().label('ID Usuário'),
            IDG043:     joi.number().integer().required().label('ID Delivery'),
            IDI007:     joi.number().integer().allow(null).label('ID Reason Code'),            
            DTENTREG:   joi.date().required().label('Data da Entrega')
        }

    }

    //-----------------------------------------------------------------------\\
    // Save Info

    objSchema.endDlv = {

        table:    'G043',
        key:       ['IDG043'],
        vlKey:    {},
        vlFields: {},

        columns: {
            IDG043:     joi.number().integer().required().label('ID Delivery'),
            STETAPA:    joi.number().integer().required().label('Status da Etapa'),
            DTENTREG:   joi.date().required().label('Data da Entrega')
        }

    }

    //-----------------------------------------------------------------------\\   

    return objSchema;

}
