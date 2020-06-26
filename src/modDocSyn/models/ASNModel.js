module.exports = function (app, cb) {

    const Joi = require('joi');

    var objSchema = {};

    //-----------------------------------------------------------------------\\

    objSchema.flagASN = {

            table: 'G048'
        ,   key:   ['IDG048']

        ,   columns:
            {
                    IDG048:     Joi.number().integer().required().label('ID da Etapa')
                ,   STINTCLI:   Joi.number().integer().min(0).max(7).required().label('Status de interação')
            }
    }

    //-----------------------------------------------------------------------\\    

    return objSchema;

}