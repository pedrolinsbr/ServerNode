module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // CTe

    objSchema.CTe = {
        columns:
            {

                filename: Joi.string().required().label('Nome do Arquivo'),
                arOcorre: Joi.array().required().label('Array de ocorrências'),

                TPTOMADO: Joi.number().integer().min(0).max(4).required().label('Tipo do Tomador'),

                CJEMITEN: Joi.string().regex(/^[0-9]{14}$/).required().label('CNPJ do Emitente'), 
                IEEMITEN: Joi.number().integer().required().label('IE do Emitente'), 
                NMEMITEN: Joi.string().required().label('Nome do Emitente'),                
                NMLOGEMI: Joi.string().required().label('Logradouro do Emitente'),
                NRENDEMI: Joi.string().max(15).required().label('Número do Endereço do Emitente'), 
                NMBAIEMI: Joi.string().required().label('Bairro do Emitente'),
                CDMUNEMI: Joi.number().integer().required().label('Código do Município do Emitente'), 
                NMMUNEMI: Joi.string().required().label('Nome do Município do Emitente'),
                CDESTEMI: Joi.string().length(2).required().label('Sigla do Estado do Emitente'),
                NRCEPEMI: Joi.number().integer().required().label('CEP do Emitente'),
                NRTELEMI: Joi.number().integer().label('Número do Telefone do Emitente'),

                CJREMETE: Joi.string().regex(/^[0-9]{14}$/).required().label('CNPJ do Remetente'), 
                IEREMETE: Joi.number().integer().required().label('IE do Remetente'), 
                NMREMETE: Joi.string().required().label('Nome do Remetente'),                
                NMLOGREM: Joi.string().required().label('Logradouro do Remetente'),
                NRENDREM: Joi.string().max(15).required().label('Número do Endereço do Remetente'), 
                NMBAIREM: Joi.string().required().label('Bairro do Remetente'),
                CDMUNREM: Joi.number().integer().required().label('Código do Município do Remetente'), 
                NMMUNREM: Joi.string().required().label('Nome do Município do Remetente'),
                CDESTREM: Joi.string().length(2).required().label('Sigla do Estado do Remetente'),
                NRCEPREM: Joi.number().integer().required().label('CEP do Remetente'), 
                NRTELREM: Joi.number().integer().label('Número do Telefone do Remetente'),

                CJDESTIN: Joi.string().regex(/^[0-9]{11,14}$/).required().label('CPF/CNPJ do Destinatário'), 
                IEDESTIN: Joi.number().integer().required().label('IE do Destinatário'), 
                NMDESTIN: Joi.string().required().label('Nome do Destinatário'),                
                NMLOGDES: Joi.string().required().label('Logradouro do Destinatário'),
                NRENDDES: Joi.string().max(15).required().label('Número do Endereço do Destinatário'), 
                NMBAIDES: Joi.string().required().label('Bairro do Destinatário'),
                CDMUNDES: Joi.number().integer().required().label('Código do Município do Destinatário'), 
                NMMUNDES: Joi.string().required().label('Nome do Município do Destinatário'),
                CDESTDES: Joi.string().length(2).required().label('Sigla do Estado do Destinatário'),
                NRCEPDES: Joi.number().integer().required().label('CEP do Destinatário'), 
                NRTELDES: Joi.number().integer().label('Número do Telefone do Remetente'),

                CJTOMADO: Joi.string().regex(/^[0-9]{14}$/).required().label('CNPJ do Tomador'), 
                IETOMADO: Joi.number().integer().required().label('IE do Tomador'), 
                NMTOMADO: Joi.string().required().label('Nome do Tomador'),                
                NMLOGTOM: Joi.string().required().label('Logradouro do Tomador'),
                NRENDTOM: Joi.string().max(15).required().label('Número do Endereço do Tomador'), 
                NMBAITOM: Joi.string().required().label('Bairro do Tomador'),
                CDMUNTOM: Joi.number().integer().required().label('Código do Município do Tomador'), 
                NMMUNTOM: Joi.string().required().label('Nome do Município do Tomador'),
                CDESTTOM: Joi.string().length(2).required().label('Sigla do Estado do Tomador'),
                NRCEPTOM: Joi.number().integer().label('CEP do Tomador'), 

                CJEXPEDI: Joi.string().regex(/^[0-9]{14}$/).label('CNPJ do Expedidor'), 
                IEEXPEDI: Joi.number().integer().label('IE do Expedidor'), 
                NMEXPEDI: Joi.string().label('Nome do Expedidor'),                
                NMLOGEXP: Joi.string().label('Logradouro do Expedidor'),
                NRENDEXP: Joi.string().max(15).label('Número do Endereço do Expedidor'), 
                NMBAIEXP: Joi.string().label('Bairro do Expedidor'),
                CDMUNEXP: Joi.number().integer().label('Código do Município do Expedidor'), 
                NMMUNEXP: Joi.string().label('Nome do Município do Expedidor'),
                CDESTEXP: Joi.string().length(2).label('Sigla do Estado do Expedidor'),
                NRCEPEXP: Joi.number().integer().label('CEP do Expedidor'), 
                NRTELEXP: Joi.number().integer().label('Número do Telefone do Expedidor'),

                CJRECEBE: Joi.string().regex(/^[0-9]{14}$/).label('CNPJ do Recebedor'), 
                IERECEBE: Joi.number().integer().label('IE do Recebedor'), 
                NMRECEBE: Joi.string().label('Nome do Recebedor'),                
                NMLOGREC: Joi.string().label('Logradouro do Recebedor'),
                NRENDREC: Joi.string().max(15).label('Número do Endereço do Recebedor'), 
                NMBAIREC: Joi.string().label('Bairro do Recebedor'),
                CDMUNREC: Joi.number().integer().label('Código do Município do Recebedor'), 
                NMMUNREC: Joi.string().label('Nome do Município do Recebedor'),
                CDESTREC: Joi.string().length(2).label('Sigla do Estado do Recebedor'),
                NRCEPREC: Joi.number().integer().label('CEP do Recebedor'), 
                NRTELREC: Joi.number().integer().label('Número do Telefone do Recebedor'),
                
                CFOP:     Joi.number().integer().required().label('Código Fiscal de Operação'),
                DSMODENF: Joi.number().integer().required().label('Modelo do Documento CTe'),
                NRSERINF: Joi.number().integer().required().label('Série do Documento CTe'),
                CDCTRC:   Joi.number().integer().required().label('Número do Documento CTe'),
                DTEMICTR: Joi.date().required().label('Data da Emissão do CTe'),                                
                NRCHADOC: Joi.string().regex(/^[0-9]{44}$/).required().label('Chave do CTe atual'),
                
                NRCHAANT: Joi.string().regex(/^[0-9]{44}$/).required().label('Chave do CTe anterior'),
                NMEMIANT: Joi.string().required().label('Nome do Emitente Anterior'),               
                CJEMIANT: Joi.string().regex(/^[0-9]{14}$/).required().label('CNPJ do Emitente Anterior'), 
                IEEMIANT: Joi.number().integer().required().label('IE do Emitente Anterior'), 
                UFEMIANT: Joi.string().length(2).required().label('Sigla do Estado do Emitente Anterior'),                

                NRDOCANT: Joi.number().integer().label('Código do Documento Anterior'),
                DTDOCANT: Joi.date().label('Data de Emissão do Documento Anterior'),
                VRDOCANT: Joi.number().precision(2).label('Valor do Documento Anterior'),
                
                NRRNTRC:  Joi.number().integer().required().label('Registro do Transportador na ANTT'),
                STCTRC:   Joi.number().integer().min(100).max(999).required().label('Status do CTe'),
                
                VRMERCAD: Joi.number().precision(2).required().label('Valor da Carga'),
                VRTOTPRE: Joi.number().precision(2).required().label('Valor Cobrado'),
                
                VRBASECA: Joi.number().precision(2).label('Valor da Base de Cálculo do ICMS'),
                PCALIICM: Joi.number().precision(2).label('Alíquota do ICMS'),                
                VRICMS:   Joi.number().precision(2).label('Valor do ICMS'),

                DSINFCPL: Joi.string().label('Observação da CTe'),

                ARCOMPON: Joi.array().min(1).items(
                    Joi.object().keys({
                        NMCOMPON:   Joi.string().max(15).label('Nome do Campo do Componente'),
                        VRCOMPON:   Joi.number().precision(2).label('Valor do Campo do Componente')
                    })
                ).required().label('Componentes do Valor Prestação do Serviço')            
            }
    };

    //-----------------------------------------------------------------------\\

    objSchema.G051 = {
          table:    'G051'
        , key:      ['IDG051']
        , vlKey:    {}
        , vlFields: {}
        , columns:
            {

                IDG024:     Joi.number().integer().required().label('Código do Emitente (Transportador)'),
                IDG059:     Joi.number().integer().required().label('Código Fiscal de Operação'),
                IDG005RE:   Joi.number().integer().required().label('Código do Remetente'),
                IDG005DE:   Joi.number().integer().required().label('Código do Destinatário'),
                IDG005CO:   Joi.number().integer().required().label('Código do Tomador (Consignatário)'),
                IDG005EX:   Joi.number().integer().required().label('Código do Expedidor'),
                IDG005RC:   Joi.number().integer().required().label('Código do Recebedor'),
                
                NRCHADOC:   Joi.string().regex(/^[0-9]{44}$/).required().label('Chave do CTe atual'),
                DSMODENF:   Joi.number().integer().required().label('Modelo do Documento CTe'),
                NRSERINF:   Joi.number().integer().required().label('Série do Documento CTe'),
                CDCTRC:     Joi.number().integer().required().label('Número do Documento CTe'),

                VRMERCAD:   Joi.number().precision(2).required().label('Valor da Carga'),
                VRTOTPRE:   Joi.number().precision(2).required().label('Valor Cobrado I'),
                VRTOTFRE:   Joi.number().precision(2).required().label('Valor Cobrado II'),
                
                STCTRC:     Joi.string().regex(/^[AC]$/).required().label('Status do CTe'),

                DTEMICTR:   Joi.date().required().label('Data da Emissão do CTe'),
                DTLANCTO:   Joi.date().required().label('Data do Lançamento do Registro'),
                
                SNDELETE:   Joi.number().integer().max(0).required().label('Soft Delete'),
                
                VRFRETEP:   Joi.number().precision(2).required().label('Cálculo do Peso do Frete'),
                VRFRETEV:   Joi.number().precision(2).required().label('Valor do Frete'),
                VRPEDAGI:   Joi.number().precision(2).required().label('Valor do Pedágio'),
                VROUTROS:   Joi.number().precision(2).required().label('Outras Despesas'),

                VRBASECA:   Joi.number().precision(2).label('Valor da Base de Cálculo'),
                PCALIICM:   Joi.number().precision(2).label('Alíquota de ICMS'),
                VRICMS:     Joi.number().precision(2).label('Valor do ICMS'),

                DSINFCPL:   Joi.string().label('Informação Complementar')
            }
    };

    //-----------------------------------------------------------------------\\

    objSchema.G064 = {
          table: 'G064'
        , key: []
        , vlKey: {}
        , vlFields: {}
        , columns:
            {
                IDG051AT: Joi.number().integer().required().label('ID do CTe Atual'),
                IDG051AN: Joi.number().integer().required().label('ID do CTe de referência')
            }
    }

    //-----------------------------------------------------------------------\\

    objSchema.I016 = {
          table: 'I016'
        , key: ['IDI016']
        , vlKey: {}
        , vlFields: {}
        , columns:
            {
                IDI009:   Joi.number().integer().required().label('Tipo de Ocorrência'),

                SNDELETE: Joi.number().integer().min(0).max(1).required().label('Soft Delete'),

                DTCADAST: Joi.date().required().label('Data do Registro'),

                NMCAMPO:  Joi.string().max(20).required().label('Nome do Campo da Ocorrência'),
                OBOCORRE: Joi.string().max(100).required().label('Descrição da Ocorrência'),
                NRCHADOC: Joi.string().regex(/^[0-9]{44}$/).required().label('Chave do Documento CTe')

            }
    };

  //-----------------------------------------------------------------------\\

    return objSchema;
}