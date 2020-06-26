module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\

    objSchema.G005 = {

            table:    'G005'
        ,   key:      ['IDG005']
        ,   vlKey:    {}
        ,   vlFields: {}
        ,   columns:
            {
                IDG005:     Joi.number().integer().label('ID Cliente'),
                IDG003:     Joi.number().integer().required().label('ID Cidade'),
                IDS001:     Joi.number().integer().required().label('ID Usuário'),
                IDG040:     Joi.number().integer().label('ID Grupo de Clientes'),
                IDG028:     Joi.number().integer().label('ID Armazém'),

                NMCLIENT:   Joi.string().max(150).required().label('Nome'),
                RSCLIENT:   Joi.string().max(150).required().label('Razão Social'),
                TPPESSOA:   Joi.string().regex(/^[JF]$/).required('Tipo de Pessoa'),
                CJCLIENT:   Joi.string().regex(/^[0-9]+$/).max(14).required().label('CPF / CNPJ'),
                IECLIENT:   Joi.string().max(15).label('Inscrição Estadual'), //Checar
                IMCLIENT:   Joi.string().regex(/^[0-9]+$/).max(15).label('Inscrição Estadual'),

                DSEMAIL:    Joi.string().email().max(150).label('Email'),

                CPENDERE:   Joi.string().regex(/^[0-9]{8}$/).required().label('CEP'),
                DSENDERE:   Joi.string().max(140).required().label('Endereço'),
                NRENDERE:   Joi.string().max(15).required().label('Número do Local'),
                BIENDERE:   Joi.string().max(150).required().label('Bairro'),
                DSCOMEND:   Joi.string().max(50).label('Complemento do Endereço'),
                                
                NRLATITU:   Joi.number().precision(8).label('Latitude'),
                NRLONGIT:   Joi.number().precision(8).label('Longitude'),

                STENVOTI:   Joi.number().integer().min(0).max(1).label('Enviado ao Otimizador'),

                STCADAST:   Joi.string().regex(/^[AI]$/).required().label('Situação do Cadastro'),
                DTCADAST:   Joi.date().required().label('Data do Cadastro'),                
                SNDELETE:   Joi.number().integer().min(0).max(1).required().label('Soft Delete'),

                NRDEPART:   Joi.string().max(20).required().label('Número do Departamento'),
                NRSELLER:   Joi.string().max(20).label('Número do Vendedor'),

                SNSATISF:   Joi.number().integer().min(0).max(1).label('Recebe satisfação'),
                SNRASTRE:   Joi.number().integer().min(0).max(1).label('Recebe rastreio')
                
            }
    }

    //-----------------------------------------------------------------------\\

    return objSchema;
}