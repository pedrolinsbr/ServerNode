module.exports = function (app, cb) {

    const joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\

    objSchema.stOcorrencia = {

        table:      'G046',
        key:        ['IDG046'],
        vlKey:      {},
        vlFields:   {},

        columns:     {
            IDG046:     joi.number().integer().required().label('ID Carga'),
            STCARGA:    joi.string().default('E').label('Status Carga')
        }

    }

    //-----------------------------------------------------------------------\\

    objSchema.T004 = {

        table:      'T004',
        key:        ['IDT004'],
        vlKey:      {},
        vlFields:   {},

        columns:     {
            IDT004:     joi.number().integer().label('ID Ocorrência'),
            IDG046:     joi.number().integer().required().label('ID Cotação'),
            IDG067:     joi.number().integer().default(4).label('Tipo da Ocorrência'),
            IDG012:     joi.number().integer().allow(null).label('ID Histórico'),
            IDS001:     joi.number().integer().required().label('ID Usuário'),
            TXVALIDA:   joi.string().required().label('Texto da Ocorrência'),
            STSITUAC:   joi.string().default('P').label('Situação da Ocorrência'),
            DTVALIDA:   joi.date().label('Data de Validade'),
            DTCADAST:   joi.date().required().label('Data de Cadastro')
        }

    }

    //-----------------------------------------------------------------------\\

    objSchema.cotacao = {

        columns:    {
            IDT017:     joi.number().integer().label('ID Cotação'),
            IDG046:     joi.number().integer().required().label('ID Carga'),
            IDG085:     joi.number().integer().label('ID Tabela de Preço'),
            IDG024:     joi.number().integer().label('ID Transportadora'),
            TPCOTACA:   joi.string().regex(/^[CTF]$/).required().label('Status Carga'),
            DTCOTACA:   joi.date().required().label('Data da Cotação'),

            arTarifa:   joi.array().min(1).required().items(

                            joi.object().keys({ 
                                IDG043:     joi.number().integer().required().label('ID Delivery'),
                                IDG087:     joi.number().integer().required().label('ID Tarifa'),
                                IDG089:     joi.number().integer().required().label('ID Tipo de Tarifa'),
                                QTENTREG:   joi.number().integer().required().label('Cobrança por entrega'),
                                VRMINCOB:   joi.number().precision(6).required().label('Valor mínimo cobrança'),
                                VRTABELA:   joi.number().precision(6).required().label('Valor unitário'),
                                VRTARIFA:   joi.number().precision(2).required().label('Valor calculado'),
                                TPAPLICA:   joi.string().regex(/^[FPV]$/).required().label('Tipo de aplicação')
                            })

                        ).required().label('Array de Tarifas')

        }

    }

    //-----------------------------------------------------------------------\\

    objSchema.T017 = {

        table:      'T017',
        key:        ['IDT017'],
        vlKey:      {},
        vlFields:   {},

        columns:    {
            IDT017:     joi.number().integer().label('ID Cotação'),
            IDG046:     joi.number().integer().required().label('ID Carga'),
            IDG085:     joi.number().integer().label('ID Tabela de Preço'),
            IDG024:     joi.number().integer().label('ID Transportadora'),
            TPCOTACA:   joi.string().regex(/^[CTF]$/).required().label('Status Carga'),
            DTCOTACA:   joi.date().required().label('Data da Cotação')
        }

    }
    
    //-----------------------------------------------------------------------\\

    objSchema.T018 = {

        table:      'T018',
        key:        ['IDT018'],
        vlKey:      {},
        vlFields:   {},

        columns:    {
            IDT018:     joi.number().integer().label('ID Tabela'),
            IDT017:     joi.number().integer().required().label('ID Cotação'),
            IDG043:     joi.number().integer().required().label('ID Delivery'),
            IDG087:     joi.number().integer().required().label('ID Tarifa'),
            IDG089:     joi.number().integer().required().label('ID Tipo de Tarifa'),
            QTENTREG:   joi.number().integer().required().label('Cobrança por entrega'),
            VRMINCOB:   joi.number().precision(6).required().label('Valor mínimo cobrança'),
            VRTABELA:   joi.number().precision(6).required().label('Valor unitário'),
            VRTARIFA:   joi.number().precision(2).required().label('Valor calculado'),
            TPAPLICA:   joi.string().regex(/^[FPV]$/).required().label('Tipo de aplicação')
        }

    }
    
    //-----------------------------------------------------------------------\\

    return objSchema;

}