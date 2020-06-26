module.exports = function (app, cb) {

	const joi = require('joi');
	var objSchema = {};

	//-----------------------------------------------------------------------\\

	objSchema.G051 = {
		table: 		'G051',
		key:		['IDG051'],
		vlKey: 		{},
		vlFields: 	{},
		columns:
		{

			IDG051:		joi.number().integer().label('ID Tabela'),
			IDG024: 	joi.number().integer().required().label('Código do Emitente (Transportador)'),
			IDG059: 	joi.number().integer().required().label('Código Fiscal de Operação'),
			IDG005RE: 	joi.number().integer().required().label('Código do Remetente'),
			IDG005DE: 	joi.number().integer().required().label('Código do Destinatário'),
			IDG005CO: 	joi.number().integer().required().label('Código do Tomador (Consignatário)'),
			IDG005EX: 	joi.number().integer().required().label('Código do Expedidor'),
			IDG005RC: 	joi.number().integer().required().label('Código do Recebedor'),

			NRCHADOC: 	joi.string().regex(/^[0-9]{44}$/).required().label('Chave do CTe atual'),
			DSMODENF: 	joi.number().integer().required().label('Modelo do Documento CTe'),
			NRSERINF: 	joi.number().integer().required().label('Série do Documento CTe'),
			CDCTRC: 	joi.number().integer().required().label('Número do Documento CTe'),

			VRMERCAD: 	joi.number().precision(2).required().label('Valor da Carga'),
			VRTOTPRE: 	joi.number().precision(2).required().label('Valor Previsão Frete'),
			VRTOTFRE: 	joi.number().precision(2).required().label('Valor Cobrado Frete'),

			STCTRC: 	joi.string().regex(/^[AC]$/).required().label('Status do CTe'),

			DTEMICTR: 	joi.date().required().label('Data da Emissão do CTe'),
			DTLANCTO: 	joi.date().required().label('Data do Lançamento do Registro'),

			VRFRETEP: 	joi.number().precision(2).required().label('Cálculo do Peso do Frete'),
			VRFRETEV: 	joi.number().precision(2).required().label('Valor do Frete'),
			VRPEDAGI: 	joi.number().precision(2).required().label('Valor do Pedágio'),
			VROUTROS: 	joi.number().precision(2).required().label('Outras Despesas'),

			VRBASECA: 	joi.number().precision(2).label('Valor da Base de Cálculo'),
			PCALIICM:	joi.number().precision(2).label('Alíquota de ICMS'),
			VRICMS: 	joi.number().precision(2).label('Valor do ICMS'),

			DSINFCPL: 	joi.string().label('Informação Complementar'),

			SNDELETE: 	joi.number().integer().min(0).max(1).default(0).label('Soft Delete')
		}
	}

	//-----------------------------------------------------------------------\\

	objSchema.G064 = {
		table: 		'G064',
		key: 		[],
		vlKey: 		{},
		vlFields: 	{},
		columns:
		{
			IDG051AT: 	joi.number().integer().required().label('ID do CTe Atual'),
			IDG051AN: 	joi.number().integer().required().label('ID do CTe de referência')
		}
	}

	//-----------------------------------------------------------------------\\

	objSchema.I016 = {
		table: 		'I016',
		key: 		['IDI016'],
		vlKey: 		{},
		vlFields: 	{},
		columns:
		{
			IDI009: 	joi.number().integer().required().label('Tipo de Ocorrência'),

			NMCAMPO:	joi.string().max(20).required().label('Nome do Campo da Ocorrência'),
			OBOCORRE:	joi.string().max(200).required().label('Descrição da Ocorrência'),
			NRCHADOC:	joi.string().regex(/^[0-9]{44}$/).required().label('Chave do Documento CTe'),

			DTCADAST:	joi.date().required().label('Data do Registro'),

			SNDELETE:	joi.number().integer().min(0).max(1).default(0).label('Soft Delete')
		}
	}

	//-----------------------------------------------------------------------\\

	return objSchema;
}
