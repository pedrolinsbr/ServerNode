module.exports = (app, cb) => {

    const joi = require('joi');

    var objSchema = {};

    //-----------------------------------------------------------------------\\

    objSchema.A001 = {
        table:      'A001',
        key:        ['IDA001'],
        vlKey:      {},
        vlFields:   {},

        columns:
            {
                IDA001:     joi.number().integer().label('ID Tabela'),
                IDA002:     joi.number().integer().default(18).label('ID Categoria Atendimento'),
                IDG024:     joi.number().integer().required().label('ID Transportadora'),
                IDSOLIDO:   joi.number().integer().label('ID Solicitante'),
                NMSOLITE:   joi.string().min(1).max(250).required().label('Nome Solicitante'),
                TFSOLITE:   joi.string().regex(/^\d{8,11}/).label('Telefone do Solicitante'),
                DTREGIST:   joi.date().required().label('Data do Registro'),
                DTFIM:      joi.date().label('Data do Fim do Atendimento'),
                SNDELETE:   joi.number().integer().min(0).max(1).default(0).label('Soft Delete'),
                STDATAS:    joi.string().regex(/^[ACBD]$/).allow(null).default('A').label('Status Datas'),
                SNDTALTE:   joi.number().integer().label('Boolean data alterada')
            }
    }

    //-----------------------------------------------------------------------\\
    
    objSchema.A003 = {
        table:      'A003',
        key:        ['IDA003'],
        vlKey:      {},
        vlFields:   {},

        columns:
            {
                IDA003:     joi.number().integer().label('ID Tabela'),
                IDA001:     joi.number().integer().required().label('ID Registro Contato'),
                IDA006:     joi.number().integer().default(4).label('ID Situaçao Contato'),
                IDI015:     joi.number().integer().allow(null).label('ID Reason Code'),
                DSOBSERV:   joi.string().max(4000).required().label('Descrição do Contato'),
                SNFEEDBK:   joi.number().integer().min(0).max(1).default(1).label('Tipo do Feedback'),
                IDS001RE:   joi.number().integer().required().label('ID Usuário do Cadastro'),
                DTMOVIME:   joi.date().required().label('Data do cadastro do contato')
            }
    }

    //-----------------------------------------------------------------------\\

    objSchema.A005 = {
        table:      'A005',
        vlFields:   {},

        columns:
            {
                IDA001:     joi.number().integer().required().label('ID Contato'),
                IDG043:     joi.number().integer().required().label('ID Delivery')
            }
    }

    //-----------------------------------------------------------------------\\

    objSchema.carga = {
        table:      'G046',
        key:        ['IDG046'],
        vlKey:      {},
        vlFields:   {},
        
        columns:    
            {
                IDG046:     joi.array().min(1).items(
                    joi.number().integer().required().label('ID da Carga')
                ).required().label('Array de Cargas'),  
                
                IDG030:     joi.number().integer().required().label('Tipo do Veículo'),
                DTAGENDA:   joi.date().required().label('Data do Agendamento'),
                DTPRESAI:   joi.date().required().label('Data de coleta atualizada'),
                NRPLAVEI:   joi.string().required().label('Número da placa do veículo'),
                STCARGA:    joi.string().regex(/^[S]$/).default('S').label('Status da Carga')
            }        
    }

    //-----------------------------------------------------------------------\\

    objSchema.postContato = 

        joi.alternatives().when(joi.object({ TPCONTAT: 'C' }), {

            then:
            joi.object({
                IDG046:     joi.array().min(1).items(
                                joi.number().integer().required().label('ID da Carga')
                            ).required().label('Array de Cargas'),  

                IDS001RE:     joi.number().integer().required().label('ID do Usuário'),
                DTREGIST:   joi.date().required().label('Data do Contato'),
                NMSOLITE:   joi.string().max(250).required().label('Nome do Solicitante'),
                DSOBSERV:   joi.string().max(4000).required().label('Descrição do Contato'),

                IDI015:     joi.number().integer().required().label('ID Motivo'),
                IDI007:     joi.number().integer().required().label('ID Reason Code')
                        
            }),

            otherwise:
            joi.object({
                IDG046:     joi.array().min(1).items(
                    joi.number().integer().required().label('ID da Carga')
                ).required().label('Array de Cargas'),  

                IDS001RE:   joi.number().integer().required().label('ID do Usuário Requisitante'),
                DTREGIST:   joi.date().required().label('Data do Contato'),
                NMSOLITE:   joi.string().max(250).required().label('Nome do Solicitante'),
                DSOBSERV:   joi.string().max(4000).required().label('Descrição do Contato'),

                DTPRESAI:   joi.date().required().label('Data da Previsão da Coleta'),
                IDG030:     joi.number().integer().required().label('ID do Tipo de Veículo'),
                NRPLAVEI:   joi.string().max(10).required().label('Placa do Veículo')
            })

        })

    //-----------------------------------------------------------------------\\

    objSchema.postEdicao = {

        columns:    
            {
                IDG046:     joi.array().min(1).items(
                    joi.number().integer().required().label('ID da Carga')
                ).required().label('Array de Cargas'),  

                IDG030:     joi.number().integer().required().label('ID Tipo do Veículo'),
                IDI015:     joi.number().integer().required().label('ID Motivo'),
                DTPRESAI:   joi.date().required().label('Data de coleta atualizada'),
                NRPLAVEI:   joi.string().required().label('Número da placa do veículo')
            }        

    }

    //-----------------------------------------------------------------------\\

    objSchema.putConfirmaColeta =  {

        columns:    
            {
                IDG046:     joi.array().min(1).items(
                                joi.number().integer().required().label('ID Carga')
                            ).required().label('Array Cargas')
            }

    }

    //-----------------------------------------------------------------------\\

    return objSchema;
}
