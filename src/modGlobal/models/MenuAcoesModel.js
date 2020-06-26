module.exports = function (app, cb) {

    const joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\

    objSchema.acoes = {
        columns:
            {

                IDS001:     joi.number().integer().required().label('ID Usuário'),
                IDS022:     joi.number().integer().required().label('ID Menu'),
                IDS023:     joi.number().integer().required().label('ID Ação')

            }
    }

    //-----------------------------------------------------------------------\\

    return objSchema;
}
