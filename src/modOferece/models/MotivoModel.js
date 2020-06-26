module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // Motivos de Recusa da Carga

    objSchema.O004 = {
          table:    'O004'
        , key:      ['IDO004']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                  IDO004: Joi.number().integer()
                , IDS001: Joi.number().integer().required()

                , DSMOTIVO: Joi.string().min(1).max(100).required()
                , VRSCORE: Joi.number().integer().min(0).max(999).required()

                , STCADAST: Joi.string().regex(/^[AI]$/).required()
                , SNDELETE: Joi.number().integer().min(0).max(1)

                , DTCADAST: Joi.date()
            }
    };

    //-----------------------------------------------------------------------\\

    return objSchema;
}
