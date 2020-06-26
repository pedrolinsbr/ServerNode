module.exports = function (app, cb) {

    const joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // Transportadora

    objSchema.G024 = {
        table:    'G024',
        key:      ['IDG024'],
        vlKey:    {},
        vlFields: {},
        columns:
            {

                IDG024:     joi.number().integer().label('ID Transportadora'),
                IDG023:     joi.number().integer().required().label('ID Grupo de Transportadora'),
                IDG003:     joi.number().integer().required().label('ID Cidade'),
                IDS001:     joi.number().integer().required().label('ID Usuário'),

                NMTRANSP:   joi.string().min(1).max(100).required().label('Nome da Transportadora'),
                RSTRANSP:   joi.string().min(1).max(50).required().label('Razão Social da Transportadora'),

                CJTRANSP:   joi.string().min(1).max(14).required().label('CNPJ da Transportadora'),
                IETRANSP:   joi.string().min(1).max(15).allow(null).label('IE da Transportadora'),
                IMTRANSP:   joi.string().min(1).max(15).allow(null).label('IM da Transportadora'),

                TPPESSOA:   joi.string().regex(/^[FJ]$/).required().label('Tipo de Pessoa'),
                STCADAST:   joi.string().regex(/^[AI]$/).required().label('Situação do Cadastro'),

                NRLATITU:   joi.number().precision(8).required().label('Latitude'),
                NRLONGIT:   joi.number().precision(8).required().label('Longitude'),

                DSENDERE:   joi.string().min(1).max(100).required().label('Endereço'),
                NRENDERE:   joi.string().min(1).max(20).required().label('Número do Logradouro'),
                DSCOMEND:   joi.string().max(50).required().label('Complemento do Endereço'),
                BIENDERE:   joi.string().min(1).max(40).required().label('Bairro'),
                CPENDERE:   joi.string().length(8).required().label('CEP da Transportadora'),

                PCPREFRE:   joi.number().precision(2).min(0).max(9999).allow(null).label('Percentual de aprovação'),

                SNDELETE:   joi.number().integer().min(0).max(1).label('Soft Delete'),

                IDLOGOS:    joi.number().integer().label('ID Logos'),

                DTCADAST:   joi.date().label('Data do Cadastro')

            }
    }

    //-----------------------------------------------------------------------\\

    return objSchema;
}
