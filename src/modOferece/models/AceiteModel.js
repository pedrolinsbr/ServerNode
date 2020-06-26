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
                  IDG024: Joi.number().integer()
                , NMTRANSP: Joi.string()
                , CJTRANSP: Joi.string()
            }
    }

    //-----------------------------------------------------------------------\\
    // Carga

    objSchema.G046 = {
          table:    'G046'
        , key:      ['IDG046', 'IDG024']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                  IDG046: Joi.number().integer()
                , IDG024: Joi.number().integer()
                //, IDS001: Joi.number().integer().required()
                , STCARGA: Joi.string().regex(/^[AX]$/).required()
            }
    }

    //-----------------------------------------------------------------------\\
    // Parada ( Alteração de Previsão de entrega )

    objSchema.G048 = {
          table:    'G048'
        , key:      ['IDG048']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                  IDG048: Joi.number().integer()
                , DTPREATU: Joi.date().required()
            }
    }

    //-----------------------------------------------------------------------\\
    // Oferecimento ( Resposta 3PL )

    objSchema.O005 = {
          table:    'O005'
        , key:      ['IDO005', 'IDG024']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                  IDO005: Joi.number().integer()
                , IDG024: Joi.number().integer()
                , IDS001RE: Joi.number().integer().required()
                , STOFEREC: Joi.string().regex(/^[AX]$/).required()
                , DTRESOFE: Joi.date().required()
            }
    }

    //-----------------------------------------------------------------------\\

    return objSchema;
}
