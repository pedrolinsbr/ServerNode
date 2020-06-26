module.exports = function (app, cb) {

    const joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
   
    objSchema.O004 = {

        table:      'O004',
        key:        ['IDO004'],
        vlKey:      {},
        vlFields:   {},
        columns:
            {
                IDO004:     joi.number().integer().label('ID Motivo'),
                IDS001:     joi.number().integer().required().label('ID Usuário'),
                DSMOTIVO:   joi.string().min(1).max(100).required().label('Descrição do Motivo'),
                VRSCORE:    joi.number().integer().min(0).max(999).required().label('Pontuação'),
                STCADAST:   joi.string().regex(/^[AI]$/).required().label('Status do Cadastro'),
                DTCADAST:   joi.date().label('Data do Cadastro'),
                SNDELETE:   joi.number().integer().min(0).max(1).label('Soft Delete')                
            }

    };

    //-----------------------------------------------------------------------\\

    objSchema.postRecusa = {

        columns:
            {
                IDG046:     joi.number().integer().required().label('ID Carga'),
                IDO005:     joi.number().integer().required().label('ID Oferecimento'),
                IDO004:     joi.number().integer().required().label('ID Motivo')
            }

    };

    //-----------------------------------------------------------------------\\

    objSchema.recusa = {

        table:      'O005',
        key:        ['IDO005'],
        vlKey:      {},
        vlFields:   {},
        columns:
            {
                IDO005:     joi.number().integer().required().label('ID Oferecimento'),
                IDO004:     joi.number().integer().required().label('ID Motivo')
            }

    };

    //-----------------------------------------------------------------------\\

    return objSchema;
}
