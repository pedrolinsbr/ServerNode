module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // Otimizador

    objSchema.O006 = {
          table:    'O006'
        , key:      ['IDO006']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                  IDO006: Joi.number().integer()
                , IDS001: Joi.number().integer().required()

                , SNDELETE: Joi.number().integer().min(0).max(1)
                , NMOTIMIZ: Joi.string().min(1).max(20).required()

                , STCADAST: Joi.string().regex(/^[AI]$/).required()
                , DTCADAST: Joi.date()

            }
    }

    //-----------------------------------------------------------------------\\
    // Tipos de Veículo x Otimizador

    objSchema.O007 = {
          table:    'O007'
        , key:      ['IDO007']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                  IDO007: Joi.number().integer()
                , IDO006: Joi.number().integer().required()
                , IDG030: Joi.number().integer().required()
                , IDS001: Joi.number().integer().required()

                , CDTIPVEI: Joi.string().min(1).max(30).required()
                , DTCADAST: Joi.date()
            }
    }

    //-----------------------------------------------------------------------\\

    objSchema.O007_DEL = {
          table: 'O007'
        , key: ['IDO006']
        , vlKey: {}
        , vlFields: {}
        , columns:
            {                  
                IDO006: Joi.number().integer()
            }
    }

    //-----------------------------------------------------------------------\\

    return objSchema;
}
