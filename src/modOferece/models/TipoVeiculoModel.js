module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // Tipos de Veículo

    objSchema.G030 = {
          table:    'G030'
        , key:      ['IDG030']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                  IDG030: Joi.number().integer()
                , IDS001: Joi.number().integer().required()

                , QTCAPPES: Joi.number().precision(2).required()
                , QTCAPVOL: Joi.number().precision(2).required()

                , DSTIPVEI: Joi.string().min(1).max(30).required()
                , STCADAST: Joi.string().regex(/^[AI]$/).required()

                , SNDELETE: Joi.number().integer().min(0).max(1)
                , PCPESMIN: Joi.number().integer()
                , IDVEIOTI: Joi.number().integer().allow(null)
                , DTCADAST: Joi.date()
            }
    };

    //-----------------------------------------------------------------------\\

    return objSchema;
}
