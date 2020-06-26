module.exports = function (app, cb) {

    const joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
 
    objSchema.aviso = {

        columns:
            {
                IDS001OF:   joi.number().integer().required().label('ID Usuário do Oferecimento'),
                IDG046:     joi.array().min(1).items(
                                joi.number().integer().min(1).required().label('ID da Carga')
                            ).required().label('Array de Cargas')
            }

    }

    //-----------------------------------------------------------------------\\

    objSchema.statusCarga = {

        table:      'G046',
        key:        ['IDG046'],
        vlKey:      {},
        vlFields:   {},

        columns:    {
            IDG046:     joi.number().integer().required().label('ID Carga'),
            STCARGA:    joi.string().regex(/^[BROXASP]$/).required().label('Status Carga')
        }

    }

    //-----------------------------------------------------------------------\\

    objSchema.O005 = {

        table:      'O005',
        key:        ['IDO005'],
        vlKey:      {},
        vlFields:   {},

        columns:    {
            IDO005:     joi.number().integer().required().label('ID Oferecimento'),            
            SNENVIO:    joi.number().integer().min(0).max(1).required('Boolean envio email oferecimento'),
            DTENVIO:    joi.date().required().label('Data de envio do email de oferecimento'),
            DSRESSRV:   joi.string().max(200).label('Resposta do Servidor de Email')
        }

    }

    //-----------------------------------------------------------------------\\

    return objSchema;

}
