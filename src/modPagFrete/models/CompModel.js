module.exports = function (app, cb) {

	const Joi = require('joi');
	var objSchema = {};

	//-----------------------------------------------------------------------\\
	// Componentes da Prestação de Serviço por 3PL

	objSchema.G063 = {
		table: 'G063',
		key: ['IDG063'],
		vlKey: {},
		vlFields: {},
		columns:
		{

			IDG063: Joi.number().integer().label('ID da Tabela'),
			IDG062: Joi.number().integer().required().label('ID do Componente Padrão'),
			IDG024: Joi.number().integer().required().label('ID da Transportadora'),
			SNDELETE: Joi.number().integer().min(0).max(1).default(0).label('Soft Delete'),
			NMCOMVAR: Joi.string().max(15).required().label('Nome do Componente Variável'),

		}
	};

    //-----------------------------------------------------------------------\\    
	// Array de Componentes de Preço 

	objSchema.arComponente = {

		IDG024: Joi.number().integer().required().label('ID da Transportadora'),

		arComp: Joi.array().min(1).max(3).items(

					Joi.object().keys(
						{

							IDG062: Joi.number().integer().required().label('ID do Componente Padrão'),

							NMCOMVAR: Joi.string().max(15).required().label('Nome do Componente Variável')

						}
					).required().label('Objeto do Componente')

				).required().label('Array de Compoenentes')
	}

    //-----------------------------------------------------------------------\\

    return objSchema;

}