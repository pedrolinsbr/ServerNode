module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // Transportadora

    objSchema.G082 = {
          table:    'G082'
        , key:      ['IDG082']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                  IDG082:       Joi.number().integer().label('ID Tabela')
                , IDS001:       Joi.number().integer().required().label('ID Usuário')
                , IDS007:       Joi.number().integer().required().label('ID Tabela Referência')
                , PKS007:       Joi.number().integer().required().label('PK Tabela Referência')
                , STDOCUME:     Joi.number().integer().default(0).label('Status do Documento')
                , TMDOCUME:     Joi.number().precision(2).default(0).label('Tamanho do Arquivo')
                , TPDOCUME:     Joi.string().min(2).max(5).required().label('Tipo do Arquivo')
                , DTDOCUME:     Joi.date().required().label('Data do Documento')
                , NMDOCUME:     Joi.string().min(4).max(250).required().label('Nome do Documento')
                , CTDOCUME:     Joi.binary().required().label('Conteúdo do Arquivo')
                , DSMIMETP:     Joi.string().max(100).label('MIME TYPE')
                , SNDELETE:     Joi.number().integer().min(0).max(1).default(0).label('Soft Delete')
            }
    }

    //-----------------------------------------------------------------------\\

    return objSchema;

}
