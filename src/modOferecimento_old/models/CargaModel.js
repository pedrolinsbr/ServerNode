module.exports = function (app, cb) {

    const joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // TrocaStaus

    objSchema.status = {

        columns:
            {
                IDS001:     joi.number().integer().required().label('ID Usuário'),
                STCARGA:    joi.string().regex(/^[BROXASP]$/).required().label('Novo status da carga'),
                IDG046:     joi.array().min(1).items(
                                joi.number().integer().min(1).required().label('ID da Carga')
                            ).required().label('Array de Cargas')
            }

    }

    //-----------------------------------------------------------------------\\
    // Distribuição de Cargas

    objSchema.distribuicao = {

        columns:
            {
                TPOFEREC:   joi.string().regex(/^[BSO]$/).required().label('Tipo de Oferecimento'),
                IDS001:     joi.number().integer().required().label('ID Usuário'),
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
            IDG024:     joi.number().integer().allow(null).label('ID Transportadora'),
            IDG024SV:   joi.number().integer().label('ID Transportadora mais barata'),
            IDG085:     joi.number().integer().label('ID Tabela de Preço'),
            STCARGA:    joi.string().regex(/^[BROXASP]$/).required().label('Status Carga'),
            VRFREREC:   joi.number().precision(2).label('Valor do Frete a Receber'),
            VRFREMIN:   joi.number().precision(2).label('Valor Mínimo do Frete a Pagar')
        }

    }

    //-----------------------------------------------------------------------\\

    objSchema.O005 = {

        table:      'O005',
        key:        ['IDO005'],
        vlKey:      {},
        vlFields:   {},

        columns:    {
            IDO005:     joi.number().integer().label('ID Oferecimento'),
            IDG024:     joi.number().integer().label('ID Transportadora'),
            IDG046:     joi.number().integer().label('ID Carga'),
            IDO009:     joi.number().integer().label('ID Participante'),
            IDO004:     joi.number().integer().label('ID Motivo'),
            IDG085:     joi.number().integer().allow(null).label('ID Tabela de Preço'),
            
            IDS001OF:   joi.number().integer().label('ID Usuário Oferecimento'),
            IDS001RE:   joi.number().integer().label('ID Usuário Resposta'), 

            STOFEREC:   joi.string().regex(/^[BROXASP]$/).required().label('Status Oferecimento'),

            TPOFEREC:   joi.string().regex(/^[BSO]$/).label('Tipo de Oferecimento'),

            VRFREPAG:   joi.number().precision(2).min(1).label('Valor do Frete a Pagar'),

            DTOFEREC:   joi.date().label('Data de Oferecimento'),
            DTRESOFE:   joi.date().label('Data da Resposta')
        }

    }

    //-----------------------------------------------------------------------\\

    objSchema.spot = {

        columns:    {
            IDG046:     joi.number().integer().required().label('ID Carga'),            
            IDG024:     joi.number().integer().required().label('ID Transportadora'),
            IDO008:     joi.number().integer().required().label('ID Regra'), 
            IDO009:     joi.number().integer().required().label('ID Participante'),            
            IDS001:     joi.number().integer().required().label('ID Usuário Oferecimento'),
            IDG085:     joi.number().integer().allow(null).required().label('ID Tabela de Preço'),
            VRFREPAG:   joi.number().precision(2).min(1).required().label('Valor do Frete a Pagar'),
            PCPREFRE:   joi.number().precision(2).required().label('Limite de pré aprovação')
        }

    }

    //-----------------------------------------------------------------------\\

    return objSchema;

}
