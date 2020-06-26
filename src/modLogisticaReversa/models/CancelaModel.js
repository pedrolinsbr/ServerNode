module.exports = (app, cb) => {

    const joi = require('joi');

    var objSchema = {};

    //-----------------------------------------------------------------------\\

    objSchema.cancelaRecusa = {
        table:      'G046',
        key:        ['IDG046'],
        vlKey:      {},
        vlFields:   {},

        columns:    {
            IDG046:     joi.number().integer().required().label('ID Carga'),
            IDS001CA:   joi.number().integer().required().label('ID Usuário'),
            STCARGA:    joi.string().regex(/^[C]$/).label('Status Carga'),
            OBCANCEL:   joi.string().required().label('Motivo do Cancelamento'),        
            DTCANCEL:   joi.date().label('Data do Cancelamento')
        }

    }

    //-----------------------------------------------------------------------\\
    
    return objSchema;

}