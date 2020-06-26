module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // Regras de Oferecimento

    objSchema.O008 = {
          table:    'O008'
        , key:      ['IDO008']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {

                  IDO008:   Joi.number().integer().label('ID Regra')
                , IDS001:   Joi.number().integer().required().label('ID Usuário')
                , IDG028:   Joi.number().integer().required().label('ID Armazém')

                , IDG002:   Joi.number().integer().required().label('ID Estado')
                , IDG003:   Joi.number().integer().label('ID Cidade')
                , IDG005:   Joi.number().integer().label('ID Cliente')

                , SNCARPAR: Joi.string().regex(/^[SN]$/).required().label('Ocupação parcial')
                , TPTRANSP: Joi.string().regex(/^[TVG]$/).required().label('Tipo de Operação')

                , DSREGRA:  Joi.string().min(1).max(70).required().label('Descrição da Regra')

                , SNDELETE: Joi.number().integer().min(0).max(1).label('Soft Delete')

                , DTCADAST: Joi.date()
            }
    }

    //-----------------------------------------------------------------------\\
    // Regras x 3PL

    objSchema.O009 = {
          table:    'O009'
        , key:      ['IDO009']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {

                  IDO009: Joi.number().integer()

                , IDO008: Joi.number().integer().required()
                , IDG024: Joi.number().integer().required()
                , IDS001: Joi.number().integer().required()
                , PCATENDE: Joi.number().precision(2).required()
                
                , DTCADAST: Joi.date()
            }
    }

    //-----------------------------------------------------------------------\\    
    // Restrições de Veículos x Regra ( Insere )

    objSchema.O010 = {
          table:    'O010'
        , key:      ['IDO010']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {

                  IDO010: Joi.number().integer()

                , IDO009: Joi.number().integer().required()
                , IDG030: Joi.number().integer().required()
                , IDS001: Joi.number().integer().required()

                , DTCADAST: Joi.date()
            }
    }

    //-----------------------------------------------------------------------\\    
    // Regras x 3PL ( Remove )

    objSchema.O009_DEL = {
          table:    'O009'
        , key:      ['IDO008']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                IDO008: Joi.number().integer()
            }
    }

    //-----------------------------------------------------------------------\\  
    // Regras x 3PL ( Remove )

    objSchema.O010_DEL = {
          table:    'O010'
        , key:      ['IDO009']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                IDO009: Joi.number().integer()
            }
    }

    //-----------------------------------------------------------------------\\    
  
    return objSchema;
}
