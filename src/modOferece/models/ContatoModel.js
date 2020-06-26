module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // Contato

    objSchema.G007 = {
          table:    'G007'
        , key:       ['IDG007']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                  IDG007: Joi.number().integer()
                , IDG006: Joi.number().integer().required()
                , IDG039: Joi.number().integer().required()
                , IDS001: Joi.number().integer().required()

                , NMCONTAT: Joi.string().min(1).max(30).required()
                , SNDELETE: Joi.number().integer().min(0).max(1)

                , DTNASCIM: Joi.date()
                , DTCADAST: Joi.date()
            }
    }

    //-----------------------------------------------------------------------\\
    // Contato x Tipo

    objSchema.G008 = {
          table:    'G008'
        , key:      ['IDG008']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                  IDG008: Joi.number().integer()
                , IDG007: Joi.number().integer().required()
                , IDS001: Joi.number().integer().required()

                , DSCONTAT: Joi.string().min(1).max(40).required()
                , TPCONTAT: Joi.string().regex(/^[CTEO]$/).required()

                , SNDELETE: Joi.number().integer().min(0).max(1)
                , DTCADAST: Joi.date()
            }
    }

    //-----------------------------------------------------------------------\\
    // Contato x Transportadora

    objSchema.G025 = {
          table:    'G025'
        , key:      ['IDG025']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                  IDG025: Joi.number().integer()
                , IDG024: Joi.number().integer().required()
                , IDG007: Joi.number().integer().required()
            }
    }

    //-----------------------------------------------------------------------\\
 
    return objSchema;
}
