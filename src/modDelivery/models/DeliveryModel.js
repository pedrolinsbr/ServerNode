/**
 * @file Inserção no banco de dados
 * @module modDelivery/models/DeliveryModel
 * 
 * @requires NPM:joi
*/
module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // Delivery ( CREATE / UPDATE )

    objSchema.G043 = {
          table:    'G043'
        , key:      ['IDG043']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {
                  IDG043:   Joi.number().integer().label('ID Delivery')
                , IDG043RF: Joi.number().integer().label('ID Delivery de Referência')
                , IDG005RC: Joi.number().integer().label('ID Recebedor')
                , IDG074:   Joi.number().integer().label('ID Motivo de Devolução')
                , IDS001:   Joi.number().integer().required().label('ID Usuário')
                , IDG014:   Joi.number().integer().required().label('ID da Operação')
                
                , IDG005RE: Joi.number().integer().required().label('ID do Remetente')
                , IDG005DE: Joi.number().integer().required().label('ID do Destinatário')
                , IDG009PS: Joi.number().integer().required().label('ID da unidade de peso')

                , CDDELIVE: Joi.string().min(1).max(20).required().label('Código da Delivery') 
                
                , TPDELIVE: Joi.number().integer().min(1).max(4).required().label('Tipo de Operação da Delivery') // 1 - Transf. / 2 - Dist. / 3 - Dev. / 4 - Recusa
                , STDELIVE: Joi.string().regex(/^[CDR]$/).required().label('Tipo de Função da Delivery') // C - CREATE / D - CANCEL / R - REPLACE
                , SNINDSEG: Joi.string().regex(/^[SN]$/).required().label('Carga segregada')

                , STETAPA:  Joi.number().integer().min(0).max(30).required().label('Etapa da Delivery')
                , STULTETA: Joi.number().integer().min(0).max(30).required().label('Última etapa válida')

                , SNLIBROT: Joi.number().integer().min(0).max(1).required().label('Liberada para otimização')
                , CDPRIORI: Joi.number().integer().min(0).default(3).label('Prioridade da Delivery')
                , CDPRIINI: Joi.number().integer().min(0).label('Prioridade da Delivery')

                , DTDELIVE: Joi.date().required().label('Data da emissão da delivery') 
                , DTLANCTO: Joi.date().label('Data da entrada da Delivery')
                , DTFINCOL: Joi.date().label('Data da Entrega esperada')
                , DTENTCON: Joi.date().label('Data de Entrega calculada')
                , DTENTREG: Joi.date().allow(null).label('Data de Entrega efetivada')   
                
                , CDG46ETA: Joi.string().regex(/^([A-Z])\d{6}\-\d{2}$/).label('Shipment') 

                , DSEMACLI: Joi.string().email().max(1000).label('Email do Cliente')
                , DSEMARTV: Joi.string().email().max(1000).label('Email do Faturista')

                , CDFILIAL: Joi.string().max(5).required().label('Código da Filial')
                , IDEXTCLI: Joi.string().max(20).required().label('ID Externo do Cliente')
                , NRDIVISA: Joi.string().max(5).required().label('Número da Divisão')
                
                , NRNOTA:   Joi.number().integer().allow(null).label('Número da NF')
                , NREMBSEC: Joi.number().integer().required().label('Total de Embalagens')

                , PSBRUTO:   Joi.number().precision(3).max(40000).label('Peso Bruto Total')
                , PSLIQUID:  Joi.number().precision(3).label('Peso Líquido Total')

                , VRVOLUME:  Joi.number().precision(2).label('Volume Total')
                , VRDELIVE:  Joi.number().precision(2).min(1).label('Valor Total da Delivery')
            
                , TXINSTRU:  Joi.string().allow(null).label('Texto de Instrução')

                , item:      Joi.array().min(1).required().label('Itens da Delivery')                
            }
    }

    //-----------------------------------------------------------------------\\
    // Itens da Delivery

    objSchema.G045 = {
        table: 'G045'
        , key: ['IDG045']
        , vlKey: {}
        , vlFields: {}
        , columns:
            {
                  IDG045:   Joi.number().integer().label('ID Item')
                , IDG043:   Joi.number().integer().required().label('ID Delivery')
                , IDG010:   Joi.number().integer().required().label('ID Produto')
                , IDG009PS: Joi.number().integer().required().label('ID unidade de Peso')
                , IDG009UM: Joi.number().integer().required().label('ID unidade de Medida')

                , NRORDITE: Joi.number().integer().max(9999).required().label('Ordem do Item')
                , NRONU:    Joi.number().integer().required().label('Número ONU do Produto')

                , DSREFFAB: Joi.string().min(1).required().label('Código do Produto do Fabricante')
                , DSPRODUT: Joi.string().min(1).required().label('Descrição do Produto')
                
                , VRUNIPRO: Joi.number().precision(2).required().label('Valor unitário do Produto')
                , VRVOLUME: Joi.number().precision(2).required().label('Volume do Item')
                , PSBRUTO:  Joi.number().precision(3).required().label('Peso do Item') 

                , CDLOCVEN: Joi.string().max(20).label('Código do Local de Venda')
                
                , lote:     Joi.array().min(1).required().label('Lotes do Item')
            }
    }
    
    //-----------------------------------------------------------------------\\
    // Lotes da Delivery

    objSchema.G050 = {
          table: 'G050'
        , key: ['IDG050']
        , vlKey: {}
        , vlFields: {}
        , columns:
            {
                  IDG050:   Joi.number().integer().label('ID Lote')
                , IDG045:   Joi.number().integer().required().label('ID Item')
                , QTPRODUT: Joi.number().precision(2).required().label('Quantidade do Produto')
                , DSLOTE:   Joi.string().min(1).max(20).default('0').label('Descrição do Lote')
            }
    }

    //-----------------------------------------------------------------------\\
    // Registro de eventos

    objSchema.I008 = {
          table: 'I008'
        , key: ['IDI008']
        , vlKey: {}
        , vlFields: {}
        , columns:
            {        
                  IDI008:   Joi.number().integer().label('ID Registro')  
                , IDI001:   Joi.number().integer().required().label('ID Evento')
                , IDG043:   Joi.number().integer().required().label('ID Delivery') 

                , DTEVENTO: Joi.date().required().label('Data do Evento')

                , SNDELETE: Joi.number().integer().min(0).max(1).label('Soft Delete') 
            }
    }

    //-----------------------------------------------------------------------\\
    // Registro de ocorrências

    objSchema.I010 = {
         table: 'I010'
        , key: ['IDI010']
        , vlKey: {}
        , vlFields: {}
        , columns:
            {
                  IDI010: Joi.number().integer().label('ID Registro')
                , IDI009: Joi.number().integer().required().label('Tipo da Ocorrência')

                , CDDELIVE: Joi.string().min(1).max(20).required().label('Código da Delivery')
                , NMCAMPO:  Joi.string().min(1).max(20).required().label('Nome do Campo')
                , OBOCORRE: Joi.string().max(200).required().label('Descrição da Ocorrência')
                , DSSHIPOI: Joi.string().max(20).allow(null).label('Shipping Point')

                , DTCADAST: Joi.date().required().label('Data da Importação')

                , SNDELETE: Joi.number().integer().min(0).max(1).label('Soft Delete')
            }
    }

    //-----------------------------------------------------------------------\\
    // Registro de importação

    objSchema.I012 = {
          table: 'I012'
        , key: ['IDI012']
        , vlKey: {}
        , vlFields: {}
        , columns:
            {
                  IDI012:   Joi.number().integer().label('ID Registro')

                , CDDELIVE: Joi.string().min(1).max(20).required().label('Código da Delivery')
                , NMARQUIV: Joi.string().min(1).max(255).required().label('Nome do Arquivo')                
                , DTCADAST: Joi.date().required().label('Data da Importação')

                , SNDELETE: Joi.number().integer().min(0).max(1).label('Soft Delete')
            }
    }
    
    //-----------------------------------------------------------------------\\

    return objSchema;
}
