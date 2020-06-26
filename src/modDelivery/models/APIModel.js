/**
 * @file Inserção no banco de dados
 * @module modDelivery/models/APIModel
 * 
 * @requires NPM:joi
*/

module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\

    objSchema.delivery = {
        
            table:  'G043'
        ,   key:    ['IDG043']

        ,   columns: {

                IDG043:     Joi.number().integer().label('ID Delivery')
            ,   IDG043RF:   Joi.number().integer().label('ID Referencia Delivery')
            ,   IDS001:     Joi.number().integer().required().label('ID Usuário')
            ,   IDG014:     Joi.number().integer().required().label('ID da Operação')

            ,   IDG005RE:   Joi.number().integer().required().label('ID do Remetente')
            ,   IDG005DE:   Joi.number().integer().required().label('ID da Destinatário')
            ,   IDG009PS:   Joi.number().integer().required().label('ID da unidade de peso')

            ,   CDDELIVE:   Joi.string().min(1).max(20).required().label('Código da Delivery')

            ,   TPDELIVE:   Joi.number().integer().min(1).max(5).required().label('Tipo de Operação da Delivery') // 1 - Transf. / 2 - Dist. / 3 - Dev. / 4 - Recusa / 5 - AG
            ,   STDELIVE:   Joi.string().regex(/^[CDR]$/).required().label('Tipo de Função da Delivery') // C - CREATE / D - CANCEL / R - REPLACE
            ,   SNINDSEG:   Joi.string().regex(/^[SN]$/).required().label('Carga segregada')

            ,   STETAPA:    Joi.number().integer().min(0).max(30).default(0).label('Etapa da Delivery')
            ,   STULTETA:   Joi.number().integer().min(0).max(30).default(0).label('Última etapa válida')

            ,   SNLIBROT:   Joi.number().integer().min(0).max(1).required().label('Liberada para otimização')
            ,   CDPRIORI:   Joi.number().integer().min(0).required().label('Prioridade da Delivery')

            ,   SNDELETE:   Joi.number().integer().min(0).max(1).default(0).label('Soft Delete')

            ,   DTDELIVE:   Joi.date().label('Data da emissão da delivery')
            ,   DTLANCTO:   Joi.date().label('Data da entrada da Delivery')
            ,   DTFINCOL:   Joi.date().label('Data da Entrega esperada')
            ,   DTENTCON:   Joi.date().label('Data de Entrega calculada')

            ,   CDFILIAL:   Joi.string().max(5).label('Código da Filial')
            ,   IDEXTCLI:   Joi.string().max(20).allow(null).label('ID Externo do Cliente')

            ,   NRNOTA:     Joi.number().integer().allow(null).label('Número da NF')
            ,   NRSERINF:   Joi.number().integer().label('Número de série da NF')
            ,   DSMODENF:   Joi.number().integer().label('Modelo da NF')
            ,   DTEMINOT:   Joi.date().label('Data da Emissão da NF')

            ,   NREMBSEC:   Joi.number().integer().required().label('Total de Embalagens')
            ,   PSBRUTO:    Joi.number().precision(3).label('Peso Bruto Total')
            ,   PSLIQUID:   Joi.number().precision(3).label('Peso Líquido Total')

            ,   VRVOLUME:   Joi.number().precision(2).label('Volume Total')
            ,   VRDELIVE:   Joi.number().precision(2).label('Valor Total da Delivery')

            ,   TXINSTRU:   Joi.string().max(1000).allow(null).label('Texto de Instrução')

            ,   item:       Joi.array().min(1).required().items(

                Joi.object().keys({ 

                        IDG045:     Joi.number().integer().label('ID Item')
                    ,   IDG043:     Joi.number().integer().label('ID Delivery')
                    ,   IDG010:     Joi.number().integer().required().label('ID Produto')
                    ,   IDG009PS:   Joi.number().integer().required().label('ID unidade de Peso')
                    ,   IDG009UM:   Joi.number().integer().required().label('ID unidade de Medida')
        
                    ,   NRORDITE:   Joi.number().integer().required().label('Ordem do Item')
                    ,   NRONU:      Joi.number().integer().allow(null).label('Número ONU do Produto')
        
                    ,   DSREFFAB:   Joi.string().max(50).label('Código do Produto do Fabricante')
                    ,   DSPRODUT:   Joi.string().max(150).label('Descrição do Produto')
        
                    ,   VRUNIPRO:   Joi.number().precision(2).required().label('Valor unitário do Produto')
                    ,   PSBRUTO:    Joi.number().precision(3).label('Peso do Item')
                            
                    ,   lote: Joi.array().min(1).items(

                            Joi.object().keys({ 

                                    IDG050:     Joi.number().integer().label('ID Lote')
                                ,   IDG045:     Joi.number().integer().label('ID Item')
                                ,   QTPRODUT:   Joi.number().precision(2).required().label('Quantidade do Produto')
                                ,   DSLOTE:     Joi.string().min(1).max(20).required().label('Descrição do Lote')

                            })

                        ).required().label('Lotes do Item')        

                })

            ).required().label('Itens da Delivery')

        }

    }

    //-----------------------------------------------------------------------\\

    objSchema.AG = {

            IDG014:   Joi.number().integer().required().label('ID Operação')

        ,   CJREMETE: Joi.string().regex(/^[0-9]{11,44}$/).required().label('CPF/CNPJ Remetente')
        ,   IEREMETE: Joi.string().regex(/^[0-9]{5,}$/).required().label('I.E. Remetente')

        ,   CJDESTIN: Joi.string().regex(/^[0-9]{11,44}$/).required().label('CPF/CNPJ Destinatário')
        ,   IEDESTIN: Joi.string().regex(/^[0-9]{5,}$/).required().label('I.E. Destinatário')

        ,   CJPAGADO: Joi.string().regex(/^[0-9]{11,44}$/).required().label('CPF/CNPJ Tomador')
        ,   IEPAGADO: Joi.string().regex(/^[0-9]{5,}$/).required().label('I.E. Tomador')
        
        ,   item: Joi.array().min(1).required().items(
            
                Joi.object().keys({ 
                        DSREFFAB:     Joi.string().min(1).max(30).required().label('Cód. Ref. Fabricante')
                    ,   DSUNIDAD:     Joi.string().min(1).max(50).required().label('Unidade de Medida')
                    ,   DSUNIPES:     Joi.string().min(1).max(50).required().label('Unidade de Peso')
                })

            ).required().label('Itens da Delivery')  

    }

    //-----------------------------------------------------------------------\\

    objSchema.produto = {

            table:  'G010'
        ,   key:    ['IDG010']

        ,   columns: {
            
                IDG010:     Joi.number().integer().label('ID Table')        
            ,   IDG015:     Joi.number().integer().label('ID Código ONU')
            ,   IDG037:     Joi.number().integer().label('ID Categoria do Produto')
            ,   IDG038:     Joi.number().integer().label('ID Grupo do Produto')
            ,   IDG014:     Joi.number().integer().required().label('ID Operação')        
            ,   IDS001:     Joi.number().integer().required().label('ID Usuário')

            ,   DSREFFAB:   Joi.string().max(30).required().label('Referência do Fabricante')
            ,   DSPRODUT:   Joi.string().max(50).required().label('Descrição do Produto')        
            
            ,   CDNCM:      Joi.string().max(10).label('Código NCM')
            ,   SNINFLAM:   Joi.string().regex(/^[SN]$/).default('N').label('Inflamável')
            ,   STCADAST:   Joi.string().regex(/^[AI]$/).default('A').label('Situação do Cadastro')
            
            ,   TPORIPRO:   Joi.number().integer().default(0).label('Tipo de Origem do Produto')
            ,   STENVOTI:   Joi.number().integer().min(0).max(1).default(0).label('Enviado ao Otimizador')
            ,   SNDELETE:   Joi.number().integer().min(0).max(1).default(0).label('Soft Delete')

            ,   DTCADAST:   Joi.date().required().label('Data do Cadastro')

        }

    }


    //-----------------------------------------------------------------------\\

    objSchema.cliente = {

            table:  'G005'
        ,   key:    ['IDG005']

        ,   columns: {

                IDG005:     Joi.number().integer().label('ID Table')
            ,   IDG040:     Joi.number().integer().label('ID Grupo de Clientes')
            ,   IDG028:     Joi.number().integer().label('ID Armazém')
            ,   IDG003:     Joi.number().integer().required().label('ID Cidade')
            ,   IDS001:     Joi.number().integer().required().label('ID Usuário')

            ,   TPPESSOA:   Joi.string().regex(/^[FJ]$/).required().label('Tipo de Pessoa')

            ,   NMCLIENT:   Joi.string().max(150).required().label('Nome da Pessoa')
            ,   RSCLIENT:   Joi.string().max(150).label('Razão Social da Pessoa')

            ,   CJCLIENT:   Joi.string().regex(/^(\d{11}|\d{14})$/).required().label('CNPJ / CPF')
            ,   IECLIENT:   Joi.number().integer().label('Inscrição Estadual')
            ,   IMCLIENT:   Joi.number().integer().label('Inscrição Municipal')

            ,   DSEMAIL:    Joi.string().email().label('Email')

            ,   DSENDERE:   Joi.string().max(140).required().label('Logradouro')            
            ,   NRENDERE:   Joi.string().max(15).required().label('Número do Local')
            ,   DSCOMEND:   Joi.string().max(50).required().label('Complemento do Endereço')
            ,   BIENDERE:   Joi.string().max(150).required().label('Bairro')
            ,   CPENDERE:   Joi.string().regex(/^\d{8}$/).required().label('CEP')
            
            ,   NRLATITU:   Joi.number().precision(8).label('Latitude')
            ,   NRLONGIT:   Joi.number().precision(8).label('Longitude')

            ,   SNSATISF:   Joi.string().regex(/^[SN]$/).label('Resposta de Satisfação')
            ,   SNRASTRE:   Joi.string().regex(/^[SN]$/).label('Rastreado')
            ,   SNENVRAS:   Joi.string().regex(/^[SN]$/).label('Envio de Rastreamento')

            ,   SNDELETE:   Joi.number().integer().min(0).max(1).default(0).label('Soft Delete')
            ,   STENVOTI:   Joi.number().integer().min(0).max(1).default(0).label('Enviado ao Otimizador')
            ,   STCADAST:   Joi.string().regex(/^[AI]$/).default('A').label('Situação do Cadastro')
            ,   DTCADAST:   Joi.date().default(new Date()).label('Data do Cadastro')

        }

    }

    //-----------------------------------------------------------------------\\

    objSchema.ocorrencia = {

            table: 'I010'
        ,   key: ['IDI010']

        ,   columns: {

                IDI010:     Joi.number().integer().label('ID Registro')
            ,   IDI009:     Joi.number().integer().required().label('Tipo da Ocorrência')

            ,   CDDELIVE:   Joi.string().min(1).max(20).required().label('Código da Delivery')
            ,   NMCAMPO:    Joi.string().min(1).max(20).required().label('Nome do Campo')
            ,   OBOCORRE:   Joi.string().max(100).required().label('Descrição da Ocorrência')

            ,   DTCADAST:   Joi.date().required().label('Data da Importação')

            ,   SNDELETE:   Joi.number().integer().min(0).max(1).default(0).label('Soft Delete')
            
        }

    }

   //-----------------------------------------------------------------------\\    

    return objSchema;

}