module.exports = function (app, cb) {

    const joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\

    objSchema.statusCarga = {

        table:      'G046',
        key:        ['IDG046'],
        vlKey:      {},
        vlFields:   {},

        columns:    {
            IDG046:     joi.number().integer().required().label('ID Carga'),
            IDG024:     joi.number().integer().allow(null).label('ID Transportadora'),
            STCARGA:    joi.string().regex(/^[BROXASP]$/).required().label('Status Carga')
        }

    }

    //-----------------------------------------------------------------------\\

    objSchema.statusOferec = {

        table:      'O005',
        key:        ['IDG046', 'IDG024'],
        vlKey:      {},
        vlFields:   {},

        columns:    {
            IDG046:     joi.number().integer().required().label('ID Carga'),
            IDG024:     joi.number().integer().required().label('ID Transportadora'),
            IDS001OF:   joi.number().integer().required().label('ID Usuário Aprovação'),
            STOFEREC:   joi.string().regex(/^[BROXASP]$/).required().label('Status Oferecimento')
        }

    }

    //-----------------------------------------------------------------------\\

    objSchema.postStatus = {

        columns:    {         

            IDS001OF:   joi.number().integer().required().label('ID Usuário Aprovação'),
            STCARGA:    joi.string().regex(/^[BROXASP]$/).required().label('Status Carga'),
            IDG046:     joi.array().min(1).items(
                            joi.number().integer().required().label('ID Carga')
                        ).required().label('Array de Cargas')

        }

    }

    //-----------------------------------------------------------------------\\

    objSchema.motivoAprova = {

        table:      'O005',
        key:        ['IDO005'],
        vlKey:      {},
        vlFields:   {},

        columns:    {         

            IDO005:     joi.number().integer().required().label('ID Oferecimento'),
            DSMOTPRE:   joi.string().max(200).required().label('Status Carga')

        }

    }

    //-----------------------------------------------------------------------\\

    return objSchema;

}
