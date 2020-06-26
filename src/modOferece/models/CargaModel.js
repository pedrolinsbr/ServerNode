module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // Roteirização Carga

    objSchema.G046 = {

          table:    'G046'
        , key:      ['IDG046']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                  IDG046: Joi.number().integer()
                //, IDS001: Joi.number().integer().required()
                , IDG024: Joi.number().integer().required()
                , STCARGA: Joi.string().regex(/^[R]$/).required()
            }
    }

    //-----------------------------------------------------------------------\\
    // Alteração TPV

    objSchema.G046_TPV = {

          table:    'G046'
        , key:      ['IDG046']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                  IDG046: Joi.number().integer()
                , IDS001: Joi.number().integer().required()
                , IDG030: Joi.number().integer().required()
            }
    }

    //-----------------------------------------------------------------------\\
    // Alteração DTCOLATU

    objSchema.G046_COL = {

          table:    'G046'
        , key:      ['IDG046']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                  IDG046: Joi.number().integer()
                , IDS001: Joi.number().integer().required()
                , DTCOLATU: Joi.date().required()
            }
    }


    //-----------------------------------------------------------------------\\
    // Inserir Oferecimento

    objSchema.O005 = {
          table:    'O005'
        , key:      ['IDO005']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                  IDO005: Joi.number().integer()
                , IDO009: Joi.number().integer().allow(null)
                , IDG046: Joi.number().integer().required()
                , IDG024: Joi.number().integer().required()

                , IDS001OF: Joi.number().integer().required()
                , STOFEREC: Joi.string().regex(/^[R]$/).required()

                , DTOFEREC: Joi.date().required()
            }
    }

    //-----------------------------------------------------------------------\\
    // Oferecimento ( Recusa )

    objSchema.O005_RECUSA = {
          table:    'O005'
        , key:      ['IDO005']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                  IDO005:   Joi.number().integer()
                , IDO004:   Joi.number().integer().required()
                , STOFEREC: Joi.string().regex(/^[X]$/).required()
            }
    }

    //-----------------------------------------------------------------------\\
    // Oferecimento ( Remoção oferecimento prévio )

    objSchema.O005_DEL = {
          table:    'O005'
        , key:      ['IDG046', 'IDG024']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                    IDG046: Joi.number().integer().required()
                ,   IDG024: Joi.number().integer().required()
            }
    }

    //-----------------------------------------------------------------------\\

    return objSchema;
}
