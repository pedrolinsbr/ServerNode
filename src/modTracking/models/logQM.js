module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // Log QM

    objSchema.G042 = {
        table:    'G042'
      , key:      ['IDG042']
      , vlKey:    {}
      , vlFields: {}
      , columns:
          {

              IDG042:   Joi.number().integer().label('ID da Tabela'),
              IDG043:   Joi.number().integer().required().label('ID da Delivery'),
              IDG015:   Joi.number().integer().label('ID do Motivo'),
              
              NRLATITU: Joi.number().precision(8).required().label('Latitude da localizaçao'),
              NRLONGIT: Joi.number().precision(8).required().label('Longitude da Localização'),

              DTPREATU: Joi.date().required().label('Data de Previsão/Entrega no QM'),
              DTHRATU:  Joi.date().required().label('Data da última atualização do QM'),

              DSLOCAL:  Joi.string().max(256).required().label('Descrição do local de atualização')

          }
    };

    //-----------------------------------------------------------------------\\

    objSchema.NF = {
        
            table:    ''
        ,   key:      []
        ,   vlKey:    {}
        ,   vlFields: {}
        ,   columns:
            {

                CJCLIENT:  Joi.number().integer().required().label('CNPJ do Cliente'),
                CJTRANSP:  Joi.number().integer().required().label('CNPJ do Transportador'),
                NRNOTA:    Joi.number().integer().required().label('Nota Fiscal'),
                    
                NRLATITU: Joi.number().precision(8).required().label('Latitude da localizaçao'),
                NRLONGIT: Joi.number().precision(8).required().label('Longitude da Localização'),

                DTHRATU:  Joi.date().required().label('Data da última atualização do QM'),
                DTENTPLA: Joi.date().required().label('Data da Previsão de Entrega'),
                DTENTREG: Joi.date().label('Data da Previsão de Entrega'),                

                DSLOCAL:  Joi.string().max(256).required().label('Descrição do local de atualização')
            }

    };

    //-----------------------------------------------------------------------\\    

    return objSchema;

}