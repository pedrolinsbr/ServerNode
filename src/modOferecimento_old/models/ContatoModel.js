module.exports = function (app, cb) {

    const joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\
    // Contato

    objSchema.G007 = {
    	table:    'G007',
    	key:       ['IDG007'],
    	vlKey:    {},
    	vlFields: {},
    	columns:
            {
        		IDG007: joi.number().integer().label('ID Contato'),
            	IDG006: joi.number().integer().required().label('ID Setor'),
            	IDG039: joi.number().integer().required().label('ID Cargo'),
                IDS001: joi.number().integer().required().label('ID Usuário'),

            	NMCONTAT: joi.string().min(1).max(30).required().label('Nome do Contato'),
                SNDELETE: joi.number().integer().min(0).max(1).label('Soft Delete'),

            	DTNASCIM: joi.date().label('Data de Nascimento'),
            	DTCADAST: joi.date().label('Data de Cadastro'),
            }
    }

    //-----------------------------------------------------------------------\\
    // Contato x Tipo

    objSchema.G008 = {
    	table:    'G008',
    	key:      ['IDG008'],
    	vlKey:    {},
    	vlFields: {},
    	columns:
            {
            	IDG008: joi.number().integer(),
            	IDG007: joi.number().integer().required().label('ID Contato'),
            	IDS001: joi.number().integer().required().label('ID Usuário'),

            	DSCONTAT: joi.string().min(1).max(40).required().label('Descrição do Contato'),
            	TPCONTAT: joi.string().regex(/^[CTEO]$/).required().label('Tipo do Contato'),

            	SNDELETE: joi.number().integer().min(0).max(1).label('Soft Delete'),
                DTCADAST: joi.date().label('Data do Cadastro')
            }
    }

    //-----------------------------------------------------------------------\\
    // Contato x Transportadora

    objSchema.G025 = {
    	table:    'G025',
    	key:      ['IDG025'],
    	vlKey:    {},
    	vlFields: {},
    	columns:
            {
            	IDG025: joi.number().integer(),
                IDG024: joi.number().integer().required().label('ID Transportadora'),
            	IDG007: joi.number().integer().required().label('ID Contato')
            }
    }

	//-----------------------------------------------------------------------\\
	
	objSchema.contato = {

		columns:
			{
				IDG007:		joi.number().integer().label('ID Contato'),
				IDG006:		joi.number().integer().required().label('ID Setor'),
            	IDG039:		joi.number().integer().required().label('ID Cargo'),
				IDS001: 	joi.number().integer().required().label('ID Usuário'),
                IDG024: 	joi.number().integer().required().label('ID Transportadora'),
            	NMCONTAT:	joi.string().min(1).max(30).required().label('Nome do Contato')
			}

	}

	//-----------------------------------------------------------------------\\
	
	return objSchema;
	
}
