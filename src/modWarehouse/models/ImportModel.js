module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\

	objSchema.shipment = {

		columns: {

				IDW002:   Joi.number().integer().label('ID shipment')
			, 	IDT013:   Joi.number().integer().label('ID motivo cancelamento')
			, 	IDS001:   Joi.number().integer().label('ID usuário')
			, 	IDG046:   Joi.number().integer().label('ID carga')
			, 	IDS001CA: Joi.number().integer().label('ID usuário cancelamento')

			, 	CDSHIPME: Joi.string().required().label('Código do shipment')
			, 	SNDELETE: Joi.number().integer().default(0).label('Flag soft delete')
			, 	DTCANCEL: Joi.date().label('Data de cancelamento do shipment')
			, 	DTLANCTO: Joi.date().label('Data da criação do shipment') 
			, 	DTULTATU: Joi.date().label('Data da última atualização do shipment') 
			, 	TPTRANSP: Joi.string().max(1).label('Tipo de transporte')
			, 	STETAPA:  Joi.number().integer().label('Status da etapa do shipment')
			, 	TPPROCES: Joi.string().regex(/^(I|O)$/).label('Tipo de Processo')

		}

	}

	objSchema.delivery = {

		columns: {

				DTDELIVE: Joi.string().required().label('Data da delivery')
			, 	TPDELIVE: Joi.string().regex(/^(TFDT|LF|ZL1|YTFD|TP|YA|AG)$/).required().label('Tipo da delivery')
			, 	PSBRUTO:  Joi.number().precision(2).required().label('Peso Bruto')
			, 	VRDELIVE: Joi.number().precision(2).required().label('Valor da delivery')
			, 	TPPROCES: Joi.string().regex(/^(I|O)$/).required().label('Tipo de Processo')
			, 	STATUALI: Joi.string().regex(/^(ORI|CHA)$/).required().label('Trigger')
			, 	VRVOLUME: Joi.number().precision(2).required().label('Volume da delivery')
			, 	CDINBOUN: Joi.string().label('Código da Delivery - Inbound')
			, 	CDOUBOUN: Joi.string().required().label('Código da Delivery - Outbound' )
			, 	CDPLAFOR: Joi.string().label('Código da Planta do Fornecedor')
			, 	CDARMFOR: Joi.string().label('Código do Armazém do Fornecedor')

			, 	CJDESTIN: Joi.string().required().label('CNPJ Destinatário')
			, 	IEDESTIN: Joi.string().label('Insc. Estadual Destinatário')
			, 	IMDESTIN: Joi.string().label('Insc. Municipal Destinatário')
			, 	NMCLIDE:  Joi.string().label('Nome da Destinatário')
			, 	NRCEPDE:  Joi.string().label('CEP Destinatário')
			, 	NRSAPDE:  Joi.string().max(20).label('Número SAP Destino')
			, 	NMESTDE:  Joi.string().min(2).label('Estado de destino')
			, 	NMCIDDE:  Joi.string().min(2).label('Cidade de destino')

			, 	CJREMETE: Joi.string().required().label('CNPJ Remetente')
			, 	IEREMETE: Joi.string().label('Insc. Estadual Remetente')
			, 	IMREMETE: Joi.string().label('Insc. Municipal Remetente')
			, 	NMCLIRE: Joi.string().label('Nome do Remetente')
			, 	NRCEPRE: Joi.string().label('CEP Remetente')
			, 	NRSAPRE: Joi.string().max(20).label('Número SAP Remetente')
			, 	NMESTRE: Joi.string().min(2).label('Estado de origem')
			, 	NMCIDRE: Joi.string().min(2).label('Cidade de origem')

			//, 	CJTRANSP: Joi.string().required().label('CNPJ Transportadora')
			, 	IETRANSP: Joi.string().label('Insc. Estadual Transportadora')
			, 	IMTRANSP: Joi.string().label('Insc. Municipal Transportadora')
			, 	NMCLITR:  Joi.string().label('Nome da Transportadora')
			, 	NRCEPTR:  Joi.string().label('CEP Transportadora')
			, 	NRSAPTR:  Joi.string().max(20).label('Número SAP Transportadora')
			, 	NMESTTR:  Joi.string().min(2).label('Estado da Transportadora')
			, 	NMCIDTR:  Joi.string().min(2).label('Cidade da Transportadora')

			, 	CJCLIENT: Joi.string().label('CNPJ Cliente')
			, 	IECLIENT: Joi.string().label('Insc. Estadual Cliente')
			, 	IMCLIENT: Joi.string().label('Insc. Municipal Cliente')
			, 	NMCLICL:  Joi.string().label('Nome do Cliente')
			, 	NRCEPCL:  Joi.string().label('CEP Cliente')
			, 	NRSAPCL:  Joi.string().max(20).label('Número SAP Cliente')
			, 	NMESTCL:  Joi.string().min(2).label('Estado do cliente')
			, 	NMCIDCL:  Joi.string().min(2).label('Cidade do cliente')

			, 	IMCLIAG: Joi.string().label('Insc. Municipal AG')
			, 	NMCLIAG:  Joi.string().label('Nome do AG')
			, 	NRCEPAG:  Joi.string().label('CEP AG')
			, 	NMESTAG:  Joi.string().min(2).label('Estado do AG')
			, 	NMCIDAG:  Joi.string().min(2).label('Cidade do AG')

			, 	IDW001:   Joi.number().integer().label('ID delivery')
			, 	IDW002:   Joi.number().label('ID shipment')
			, 	IDW005:   Joi.number().integer().label('ID motivo arquivar delivery')
			, 	IDG043:   Joi.number().integer().label('ID delivery 4PL')
			, 	IDT013:   Joi.number().integer().label('ID motivo cancelamento')
			, 	IDS001:   Joi.number().integer().label('ID usuário')
			, 	IDS001CA: Joi.number().integer().label('ID usuário cancelamento')

			, 	DTCANCEL: Joi.date().label('Data de cancelamento da delivery')
			, 	DTLANCTO: Joi.date().label('Data da importação da delivery')
			, 	DTGRB:    Joi.date().label('Data do milestone GRB')
			, 	DTGRL:    Joi.date().label('Data do milestone GRL')
			, 	DTGRW:    Joi.date().label('Data do milestone GRW')

			, 	STENVGR:  Joi.number().integer().default(0).label('Status de envio do PGR')
			, 	SNDELETE: Joi.number().integer().default(0).label('Flag soft delete')
			, 	STETAPA:  Joi.number().integer().label('Status da etapa da delivery')
			, 	STRESERV: Joi.number().integer().default(0).label('Status de reserva de saldo')
			, 	DELICOMP: Joi.number().integer().default(0).label('Status de delivery de compra industrial')
			, 	CDDEPOSI: Joi.string().label('Código do Depósito')
			,	NRDELREF: Joi.string().label('Número da delivery de referência')
		}
	}

	objSchema.item = {

		columns: {

				IDW003:   Joi.number().integer().label('ID item')
			, 	IDW004:   Joi.number().integer().label('ID nota fiscal')
			, 	IDS001:   Joi.number().integer().label('ID usuário')
			, 	IDW001:   Joi.number().integer().label('ID delivery')
			, 	SNDELETE: Joi.number().integer().default(0).label('Flag soft delete')
			
			, 	CDMATERI: Joi.string().required().label('Código do material')
			, 	DSMATERI: Joi.string().required().label('Descrição do material')
			, 	NMMATGRO: Joi.string().required().label('Grupo do material')
			, 	NRLOTE:   Joi.number().label('Lote numérico')
			, 	NRMAPA:   Joi.string().label('Lote MAPA')
			, 	DSALFANU: Joi.string().required().label('Lote Alfanumérico')
			, 	DTVALIDA: Joi.string().label('Data de validade')
			, 	DTFABRIC: Joi.string().label('Data de fabricação')
			, 	QTITEMBA: Joi.number().required().precision(2).label('Quantidade de item básica')
			//, 	QTMEDIBA: Joi.number().precision(2).required().label('Unidade de medida básica')
			, 	QTITEMVE: Joi.number().required().precision(2).label('Quantidade de item de venda')
			//, 	QTMEDIVE: Joi.string().required().label('Unidade de medida de venda')
			, 	NMPLAORI: Joi.string().required().label('Nome da Planta de Origem')
			, 	NMSTOLOC: Joi.string().required().label('Nome do armazém')
			, 	NRITEM:   Joi.number().required().label('Número do item')
			, 	STITEM:   Joi.number().label('Status do item - livre ou bloqueado') //compra industrial
			, 	NMARMITE: Joi.string().label('Nome do depósito - DEWM ou BEWM') //compra industrial
			, 	NRREFERE: Joi.string().label('Referência na partição - HIPOS')
			,	NRPOLNIT: Joi.string().required().label('PO Line item')
			, 	NRPONMBR: Joi.string().required().label('PO number')
		}

	}

	objSchema.notaFiscal = {

		columns: {

				IDW004:   Joi.number().integer().label('ID nota fiscal')
			, 	IDS001:   Joi.number().integer().label('ID usuário')
			, 	SNDELETE: Joi.number().integer().default(0).label('Flag soft delete')
			
			, 	NRNOTA:   Joi.string().label('Número da Nota Fiscal')
			, 	NRSERINF: Joi.string().label('Número de série da Nota Fiscal')
			, 	NRCHADOC: Joi.string().label('Número da chave da Nota Fiscal')
			, 	DSMODENF: Joi.string().label('Modelo da Nota Fiscal')
			, 	NRNFREF:  Joi.string().label('Número de Referência da Nota Fiscal')
			, 	STNOTA:   Joi.string().label('Status da Nota - livre ou bloqueada')
			, 	VRNOTA:   Joi.number().precision(2).label('Valor da Nota Fiscal')
			, 	PSNOTA:   Joi.number().precision(2).label('Peso da Nota Fiscal')
			, 	NMPLADES: Joi.string().label('Nome da Planta de Destino')
		
		}

	}

	objSchema.motivoArquivamento = {

		columns: {

				IDW005  : Joi.number().integer().label('ID Motivo de Arquivamento')
			, 	DSMOTIVO: Joi.string().label('Descrição do Motivo de Arquivamento')
			, 	STCADAST: Joi.string().max(1).label('Status do Cadastro')
			, 	DTCADAST: Joi.date().label('Data de Cadastro')
			, 	IDS001:   Joi.number().integer().label('ID usuário')
			, 	SNDELETE: Joi.number().integer().default(0).label('Flag soft delete')

  		}
	}

	

   return objSchema;

}
