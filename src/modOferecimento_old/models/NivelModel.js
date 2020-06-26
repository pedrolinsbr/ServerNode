module.exports = function (app, cb) {

    const joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\

    objSchema.O011 = {

        table:      'O011',
        key:        ['IDO011'],
        vlKey:      {},
        vlFields:   {},

        columns:    {
            IDO011:     joi.number().integer().label('ID Nível de Aprovação'),
            PCNIVEL:    joi.number().precision(2).min(0).max(9999).required().label('Porcentagem do Nível de Aprovação'),
            DSNIVEL:    joi.string().max(30).required().label('Descrição do Nível'),
            SNDELETE:   joi.number().integer().min(0).min(1).label('Soft Delete')
        }

    }

    //-----------------------------------------------------------------------\\

    objSchema.usuarios = {

        columns:    {
            IDO011:     joi.number().integer().required().label('ID Nível de Aprovação'),
            IDS001:     joi.number().integer().required().label('ID Usuário')
        }

    }

    //-----------------------------------------------------------------------\\

    return objSchema;

}
