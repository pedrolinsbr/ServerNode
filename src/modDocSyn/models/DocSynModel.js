module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\

    objSchema.ASN = {

            IDMSG:      Joi.number().integer().required().label('ID da Mensagem')
        ,   IDCARGA:    Joi.number().integer().required().label('ID da Carga')
        ,   NRETAPA:    Joi.number().integer().min(1).required().label('Número da Etapa')
        ,   STINTCLI:   Joi.number().integer().min(0).required().label('Tipo de ASN')
        ,   CONTLOAD:   Joi.string().regex(/^(LTL|FTL)$/).required().label('Ocupação da Carga')
        ,   IDVEICUL:   Joi.string().required().label('ID do Veículo')
        ,   DISTANCE:   Joi.number().integer().required().label('Distância percorrida')
        ,   NRPLACA1:   Joi.string().required().label('Placa do Truck')
        // ,   NRPLACA2:   Joi.string().regex(/^[A-Z]{3}\-[0-9]{4}$/).allow(null).label('Placa do Reboque 1')
        // ,   NRPLACA3:   Joi.string().regex(/^[A-Z]{3}\-[0-9]{4}$/).allow(null).label('Placa do Reboque 2')
        ,   NRPLACA2:   Joi.string().allow(null).label('Placa do Reboque 1')
        ,   NRPLACA3:   Joi.string().allow(null).label('Placa do Reboque 2')
        ,   CDFILIAL:   Joi.string().required().max(5).label('Start Shipping Point')
        ,   IDDESTIN:   Joi.string().required().max(8).label('Customer / End Shipping Point')
        ,   IDTRANSF:   Joi.number().integer().required().label('ID da Transferência')
        ,   NMTRANSP:   Joi.string().required().label('Nome da Transportadora')
        ,   WEIGHT:     Joi.number().precision(2).required().label('Peso da Carga')
        ,   VOLUME:     Joi.number().precision(2).required().label('Volume da Carga')
        ,   DTINIETA:   Joi.date().required().label('Início da Etapa')
        ,   DTFINETA:   Joi.date().required().label('Final da Etapa')
        ,   DTEAD:      Joi.date().required().label('Data do ACP')
        ,   DTAGP:      Joi.date().required().label('Data do AGP')
        ,   DTACP:      Joi.date().required().allow(null).label('Data do ACP')

        ,   item:       Joi.array().min(1).items(

            Joi.object().keys({ 

                    LOADORD:    Joi.number().integer().min(1).required().label('Ordem de Embarque')
                ,   CDDELIVE:   Joi.string().required().label('Código da Delivery')
                ,   ITEMORD:    Joi.number().integer().required().label('Ordem do Item na Delivery')
                ,   ITEMQTD:    Joi.number().precision(2).required().label('Quantidade do Produto')
                ,   QTUNIT:     Joi.string().required().label('Unidade do Produto')
                ,   ITEMWGT:    Joi.number().precision(2).required().label('Peso do Produto')
                ,   WGUNIT:     Joi.string().required().label('Unidade de Peso')
                ,   IDCASA:     Joi.string().allow(null).label('ID do Chamado')

            })

        ).required().label('Deliveries da Etapa')

    }

   //-----------------------------------------------------------------------\\

   objSchema.MS = {
       
            IDMSG:      Joi.number().integer().required().label('ID da Mensagem')
        ,   IDCARGA:    Joi.number().integer().required().label('ID da Carga')
        ,   NRETAPA:    Joi.number().integer().min(1).required().label('Número da Etapa')
        ,   CITYNAME:   Joi.string().required().label('Cidade de destino da Etapa')
        ,   MSPURPOS:   Joi.string().regex(/^(C|A|R)$/).required().label('Sigla do MS Purpose')
        ,   MSTYPE:     Joi.string().length(3).required().label('Tipo de MS')        
        ,   MSDATE:     Joi.date().required().label('Data informada no MS')        
        ,   DTCREATE:   Joi.date().required().label('Data de registro do MS') 
        ,   REASCODE:   Joi.string().regex(/^[0-9]{8}$/).allow(null).label('Reason Code')
        
   }

   //-----------------------------------------------------------------------\\

   objSchema.INVOICE = {

            IDMSG:      Joi.number().integer().required().label('ID da Mensagem')
        ,   IDCARGA:    Joi.number().integer().required().label('ID da Carga')
        ,   NRETAPA:    Joi.number().integer().min(1).required().label('Número da Etapa')
        ,   STINTINV:   Joi.number().integer().min(0).max(2).required().label('Tipo de Invoice')
        ,   VRFEE:      Joi.number().precision(2).required().label('Valor das Taxas')        
        ,   VRFREIGH:   Joi.number().precision(2).required().label('Valor do Frete')

   }

   //-----------------------------------------------------------------------\\

    objSchema.I013 = {

            table: 'I013'
        ,   key:   ['IDI013']

        ,   columns:
                {
                        IDI013:     Joi.number().integer().label('ID Milestone')
                    ,   IDG048:     Joi.number().integer().required().label('ID Etapa')
                    ,   IDI001:     Joi.number().integer().min(1).required().label('ID Evento')
                    ,   IDI007:     Joi.number().integer().allow(null).label('ID Reason Code')                                        
                    ,   STPROPOS:   Joi.string().regex(/^(C|A|R)$/).required().label('Sigla do MS Purpose')
                    ,   OBMILEST:   Joi.string().label('Observações do Milestone')
                    ,   DTALTEVE:   Joi.date().required().label('Data informada no Milestone')
                    ,   DTEVENTO:   Joi.date().required().label('Data de criação do Milestone')
                }
    }

   //-----------------------------------------------------------------------\\

   return objSchema;

}