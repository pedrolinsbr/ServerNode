module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // CARGA

    objSchema.carga = {
        
          table:    'G046'
        , key:      ['IDG046']
        , vlKey:    {}
        , vlFields: {}
        , columns:  {

              IDG046:   Joi.number().integer().label('ID carga')
            , IDG024:   Joi.number().integer().label('ID transportadora')
            , IDG028:   Joi.number().integer().allow(null).label('ID armazém')
            , IDG030:   Joi.number().integer().required().label('ID tipo veículo')
            , IDS001:   Joi.number().integer().required().label('ID usuário')

            , IDG031M1: Joi.number().integer().allow(null).label('ID Motorista #1')
            , IDG031M2: Joi.number().integer().allow(null).label('ID Motorista #2')
            , IDG031M3: Joi.number().integer().allow(null).label('ID Motorista #3')

            , IDG032V1: Joi.number().integer().allow(null).label('ID Veículo #1')
            , IDG032V2: Joi.number().integer().allow(null).label('ID Veículo #2')
            , IDG032V3: Joi.number().integer().allow(null).label('ID Veículo #3')

            , CDVIAOTI: Joi.number().integer().allow(null).required().label('Código da viagem no otimizador')
            , TPCARGA:  Joi.number().integer().min(0).required().label('Tipo da carga')

            , QTDISPER: Joi.number().precision(2).required().label('Distância percorrida')
            , QTVOLCAR: Joi.number().precision(2).required().label('Volume da carga')
            , VRPOROCU: Joi.number().precision(2).required().label('Porcentagem de ocupação')
            , VRCARGA:  Joi.number().precision(2).required().label('Valor da carga')
            , PSCARGA:  Joi.number().precision(2).required().label('Peso da carga')

            , DSCARGA:  Joi.string().min(1).max(150).required().label('Descrição da carga')

            , TPMODCAR: Joi.number().integer().min(1).max(3).required().label('Modelo de Carregamento')
            , TPORIGEM: Joi.string().regex(/^[12]$/).required().label('Origem da carga')
            , TPTRANSP: Joi.string().regex(/^[TVDRG]$/).required().label('Operação de Transporte')
            , SNCARPAR: Joi.string().regex(/^[SN]$/).required().label('Carga parcial')
            , SNESCOLT: Joi.string().regex(/^[SN]$/).required().label('Escolta')
            , STCARGA:  Joi.string().regex(/^[BROXASTCD]$/).required().label('Status da carga')

            , DTCOLORI: Joi.date().required().label('Data de coleta original')
            , DTCOLATU: Joi.date().required().label('Data de coleta atualizada')            
            , DTCARGA:  Joi.date().required().label('Data da carga')
            , DTPRESAI: Joi.date().label('Data de previsão de saída da carga')
            , DTSAICAR: Joi.date().label('Data de saída da carga')
            , DTAGENDA: Joi.date().label('Data do Agendamento da carga')

            , etapa:    Joi.array().min(1).items(

                Joi.object().keys({ 

                      IDG048:   Joi.number().integer().label('ID etapa')
                    , IDG046:   Joi.number().integer().label('ID carga')
                    , IDG005OR: Joi.number().integer().required().label('ID cliente origem')
                    , IDG005DE: Joi.number().integer().required().label('ID cliente destino')

                    , NRSEQETA: Joi.number().integer().min(1).required().label('Sequência da etapa')

                    , QTDISPER: Joi.number().precision(2).required().label('Distância percorrida na etpa')
                    , QTDISTOD: Joi.number().precision(2).required().label('Distância Calculada')
                    , QTVOLCAR: Joi.number().precision(2).required().label('Volume da carga na etapa')
                    , PSDELETA: Joi.number().precision(2).required().label('Peso da carga na etapa')

                    , DTINIETA: Joi.date().required().label('Início da etapa')
                    , DTFINETA: Joi.date().required().label('Fim da etapa')
                    , DTPREORI: Joi.date().required().label('Previsão de chegada original')
                    , DTPREATU: Joi.date().required().label('Previsão de chegada atualizada')
                    //, DTENTCON: Joi.date().required().label('Data de entrega contratada') 

                    , STINTCLI: Joi.number().integer().min(0).max(1).label('Status de interação carga')
                    , STINTINV: Joi.number().integer().min(0).max(2).label('Status de interação CTe')

                    , pedido:   Joi.array().min(1).items(

                        Joi.object().keys({ 

                              IDG049:  Joi.number().integer().label('ID delivery x etapa')
                            , IDG048:  Joi.number().integer().label('ID etapa')
                            , IDG043:  Joi.number().integer().required('ID delivery')
                            , NRORDEM: Joi.number().integer().min(1).required().label('Ordenação de embarque')

                        })
                
                    ).required().label('Array de pedidos')
                
                })

            ).required().label('Array de Etapas')
        }
    };

    //-----------------------------------------------------------------------\\

    return objSchema;
}
