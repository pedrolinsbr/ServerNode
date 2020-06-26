module.exports = function (app, cb) {

    const joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // Feriados

    objSchema.G054 = {
        table:    'G054',
        key:      ['IDG054'],
        vlKey:    {},
        vlFields: {},
        columns:
            {

                IDG054:     joi.number().integer().label('ID Feriado'),
                IDS001:     joi.number().integer().required().label('ID do Usuário'),

                DSFERIAD:   joi.string().max(30).required().label('Descrição do Ferado'),
                DTDIAFER:   joi.number().integer().min(1).max(31).required().label('Dia do Feriado'),
                DTMESFER:   joi.number().integer().min(1).max(12).required().label('Mês do Feriado'),
                DTANOFER:   joi.number().integer().min(1900).allow(null).label('Ano do Feriado'),

                STCADAST:   joi.string().regex(/^[AI]$/).required().label('Situação do Cadastro'),
                SNRECORR:   joi.number().integer().min(0).max(1).required().label('Feriado recorrente'),
                SNDELETE:   joi.number().integer().min(0).max(1).label('Soft Delete'),

                DTCADAST:   joi.date().label('Data do Cadastro')

            }
    }

    //-----------------------------------------------------------------------\\

    objSchema.feriado = {

        columns:
            {

                IDS001:     joi.number().integer().required().label('ID do Usuário'),

                DSFERIAD:   joi.string().max(30).required().label('Descrição do Ferado'),
                DTDIAFER:   joi.number().integer().min(1).max(31).required().label('Dia do Feriado'),
                DTMESFER:   joi.number().integer().min(1).max(12).required().label('Mês do Feriado'),
                DTANOFER:   joi.number().integer().min(1900).allow(null).label('Ano do Feriado'),

                SNRECORR:   joi.number().integer().min(0).max(1).required().label('Feriado recorrente'),
                STCADAST:   joi.string().regex(/^[AI]$/).required().label('Situação do Cadastro'),
                
                TPFERIAD:   joi.number().integer().min(0).max(2).required().label('Tipo de Feriado'),

                IDG001:     joi.array().min(1).items(                 
                                joi.object().keys({
                                    id: joi.number().integer().required().label('ID País')
                                })                  
                            ).allow(null).label('Array ID País'),

                IDG002:     joi.array().min(1).items(                 
                                joi.object().keys({
                                    id: joi.number().integer().required().label('ID Estado')
                                })                    
                            ).allow(null).label('Array ID do Estado'),
                
                IDG003:     joi.array().min(1).items(                 
                                joi.object().keys({
                                    id: joi.number().integer().required().label('ID Cidade')
                                })                   
                            ).allow(null).label('Array ID da Cidade'),

            }

    }

    //-----------------------------------------------------------------------\\


    return objSchema;
}
