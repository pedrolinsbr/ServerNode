module.exports = (app, cb) => {

    const joi = require('joi');

    var objSchema = {};

    //-----------------------------------------------------------------------\\

    objSchema.I020 = {
        table:      'I020',
        key:        ['IDI020'],
        vlKey:      {},
        vlFields:   {},

        columns:    
            {
                IDI020:     joi.number().integer().label('ID Tabela'), 
                IDS001:     joi.number().integer().required().label('ID Usuário'),
                IDG024:     joi.number().integer().required().label('ID Transportadora'),
                IDG002:     joi.number().integer().required().label('ID Estado'),
                IDG003:     joi.number().integer().allow(null).label('ID Cidade'),
                STCADAST:   joi.string().regex(/^[AI]$/).required().label('Status do Cadastro'),
                DTCADAST:   joi.date().label('Data do Cadastro')
            }

    }

    //-----------------------------------------------------------------------\\

    return objSchema;

}
