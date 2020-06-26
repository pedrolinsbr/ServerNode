module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // Carga
    
    objSchema.G046 = {
        table:      'G046'
      , key:        ['IDG046']
      , vlKey:      {}
      , vlFields:   {}
      , columns:
          {     
                IDG046:   Joi.number().integer()
              //, IDS001:   Joi.number().integer().required()            
              , STCARGA:  Joi.string().regex(/^[O]$/).required()
          }
    }

    //-----------------------------------------------------------------------\\
    // Oferecimento ( Resposta 3PL )

    objSchema.O005 = {
          table:    'O005'
        , key:      ['IDO005']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {     
                  IDO005:   Joi.number().integer()
                , IDS001OF: Joi.number().integer().required()
                , STOFEREC: Joi.string().regex(/^[O]$/).required()     
                , DTOFEREC: Joi.date().required()
            }
    }

    //-----------------------------------------------------------------------\\

    return objSchema;
}
