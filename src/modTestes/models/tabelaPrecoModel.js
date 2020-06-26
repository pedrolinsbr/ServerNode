module.exports = function (app, cb) {

    const joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\

    objSchema.G085 = {

        table:      'G085',
        key:        ['IDG085'],
        vlKey:      {},
        vlFields:   {},

        columns:    {
            IDG085:     joi.number().integer().label('ID Tabela Preço'),
            DSPREFRE:   joi.string().max(100).required().label('Descrição tabela de preço'),
            DTINIVIG:   joi.date().required().label('Data início vigência'),
            DTFIMVIG:   joi.date().required().label('Data início vigência'),
            IDG014:     joi.number().required().label('ID Tabela Operação'),
            TPTABELA:   joi.string().regex(/^[PV]$/).required().label('Tipo de tabela de preço') //P - Peso, V - Veículo
        }

    }

    //-----------------------------------------------------------------------\\

    objSchema.G088 = {

        table:      'G088',
        key:        ['IDG088'],
        vlKey:      {},
        vlFields:   {},

        columns:    {
            IDG088:     joi.number().integer().label('ID Tabela'),
            IDG085:     joi.number().integer().required().label('ID Tabela de Preço'),
            IDG024:     joi.number().integer().required().label('ID de Transportadora'),
            IDG005:     joi.number().integer().label('ID de Cliente')
        }

    }

    //-----------------------------------------------------------------------\\

    objSchema.G086 = {

        table:      'G086',
        key:        ['IDG086'],
        vlKey:      {},
        vlFields:   {},

        columns:    {
            IDG086:     joi.number().integer().label('ID Tabela'),
            IDG085:     joi.number().integer().required().label('ID Tabela de Preço'),
            IDG030:     joi.number().integer().allow(null).required().label('ID Tipo do Veículo'),
            IDG003OR:   joi.number().integer().required().label('ID Cidade de Origem'),
            IDG003DE:   joi.number().integer().required().label('ID Cidade de Destino'),
            NRPESO:     joi.number().precision(2).allow(null).required().label('Valor do Peso'),
            TPTRANSP:   joi.string().regex(/^[CDIOSTV]$/).required().label('Tipo de Op. de Transporte'), // Compl., Dev., Ind., Outros, Subst., Transf., Vendas
            TPDIAS:     joi.string().regex(/^[CU]$/).required().label('Tipo de Cálculo de SLA'), //C - Corridos, U - Úteis
            QTDIAENT:   joi.number().allow(null).required().label('Qtd dias entrega'),
            QTDIENLO:   joi.number().allow(null).required().label('Qtd dias entrega local'),
            QTDIACOL:   joi.number().allow(null).required().label('Qtd dias coleta')            
        }

    }

    //-----------------------------------------------------------------------\\
    
    objSchema.G087 = {

        table:      'G087',
        key:        ['IDG087'],
        vlKey:      {},
        vlFields:   {},

        columns:    {
            IDG087:     joi.number().integer().label('ID Tabela'),
            IDG086:     joi.number().integer().required().label('ID Tabela G086'),
            IDG089:     joi.number().integer().required().label('ID Tipo de Tarifa'),
            DSDETFRE:   joi.string().max(100).default('-').label('Descrição G086'),
            TPAPLICA:   joi.string().regex(/^[FPV]$/).required().label('Tipo de cálculo do índice'), //F - Fixo, P - Peso, V - Valor
            VRTABELA:   joi.number().precision(6).required().label('Valor do índice de cálculo'),
            QTENTREG:   joi.number().required().label('Qunantidade mínima')
        }

    }    

    //-----------------------------------------------------------------------\\

    return objSchema;

}