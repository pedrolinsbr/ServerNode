module.exports = function (app, cb) {

    const joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // Regras de Oferecimento

    objSchema.O008 = {
        table:    'O008',
        key:      ['IDO008'],
        vlKey:    {},
        vlFields: {},
        columns:
            {

                IDO008:   joi.number().integer().label('ID Regra'),
                IDS001:   joi.number().integer().required().label('ID Usuário'),
                IDG014:   joi.number().integer().required().label('ID Cliente 4PL'),
                IDG028:   joi.number().integer().required().label('ID Armazém'),
                IDG002:   joi.number().integer().required().label('ID Estado'),

                IDG003:   joi.number().integer().allow(null).label('ID Cidade'),
                IDG005:   joi.number().integer().allow(null).label('ID Cliente'),

                SNCARPAR: joi.string().regex(/^[SN]$/).required().label('Ocupação parcial'),
                TPTRANSP: joi.string().regex(/^[TVG]$/).required().label('Tipo de Operação'),
                DSREGRA:  joi.string().min(1).max(70).required().label('Descrição da Regra'),

                SNDELETE: joi.number().integer().min(0).max(1).label('Soft Delete'),
                DTCADAST: joi.date().label('Data do Cadastro')
            }
    }

    //-----------------------------------------------------------------------\\
    // Participantes da Regra

    objSchema.part = {
        table:    'O009',
        key:      ['IDO009'],
        vlKey:    {},
        vlFields: {},
        columns:
            {

                IDO009:     joi.number().integer().label('ID Participação'),
                IDO008:     joi.number().integer().required().label('ID Regra'),
                IDS001:     joi.number().integer().required().label('ID Usuário'),

                SNDELETE:   joi.number().integer().min(0).max(1).label('Soft Delete'),

                ARPARTIC:   joi.array().min(1).items(
                    joi.object().keys({ 
                        IDG024:     joi.number().integer().required().label('ID Transportadora'),
                        PCATENDE:   joi.number().precision(2).min(0).max(100).required().label('Margem de atuação')
                    }) 
                ).required().label('Array participação'),

                DTCADAST:   joi.date().label('Data do Cadastro') 
            }
    }

    //-----------------------------------------------------------------------\\
    // Frota permitida

    objSchema.frota = {
        table:    'O010',
        key:      ['IDO010'],
        vlKey:    {},
        vlFields: {},
        columns:
            {

                IDO010:     joi.number().integer().label('ID Participação'),
                IDO009:     joi.number().integer().required().label('ID Regra'),
                IDS001:     joi.number().integer().required().label('ID Usuário'),

                IDG030:     joi.array().min(1).items(
                                joi.number().integer().required().label('ID Tipo do Veículo') 
                            ).required().label('Array participação'),

                DTCADAST:   joi.date().label('Data do Cadastro') 
            }
    }

    //-----------------------------------------------------------------------\\    
    // Busca por especialidade

    objSchema.buscaEspec = {
        columns:
            {
                IDG002:   joi.number().integer().required().label('ID Estado'), 
                TPBUSCA:  joi.number().integer().min(1).max(2).required().label('Tipo da Busca'),
                BUSCA:    joi.string().required().label('String de Busca')
            }            
    }    

    //-----------------------------------------------------------------------\\

    return objSchema;

}
