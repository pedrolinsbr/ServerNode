module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // Transportadora

    objSchema.G024 = {
          table:    'G024'
        , key:      ['IDG024']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {

                    IDG024:     Joi.number().integer()
                ,   IDG023:     Joi.number().integer().required()
                ,   IDG003:     Joi.number().integer().required()
                ,   IDS001:     Joi.number().integer().required()

                ,   NMTRANSP:   Joi.string().min(1).max(50).required()
                ,   RSTRANSP:   Joi.string().min(1).max(50).required()

                ,   CJTRANSP:   Joi.string().min(1).max(14).required()
                ,   IETRANSP:   Joi.string().min(1).max(15).allow(null)
                ,   IMTRANSP:   Joi.string().min(1).max(15).allow(null)

                ,   TPPESSOA:   Joi.string().regex(/^[FJ]$/).required()
                ,   STCADAST:   Joi.string().regex(/^[AI]$/).required()

                ,   NRLATITU:   Joi.number().precision(8).required()
                ,   NRLONGIT:   Joi.number().precision(8).required()

                ,   DSENDERE:   Joi.string().min(1).max(40).required()
                ,   NRENDERE:   Joi.string().min(1).max(5).required()
                ,   DSCOMEND:   Joi.string().max(20).required()
                ,   BIENDERE:   Joi.string().min(1).max(40).required()
                ,   CPENDERE:   Joi.string().length(8).required()

                ,   SNDELETE:   Joi.number().integer().min(0).max(1)

                ,   IDLOGOS:    Joi.number().integer().min(0) //ID LOGOS

                ,   DTCADAST:   Joi.date()
            }
    }

    //-----------------------------------------------------------------------\\

    return objSchema;
}
