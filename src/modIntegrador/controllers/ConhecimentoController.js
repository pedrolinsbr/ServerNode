/**
 * @description Possui os métodos para interação com conhecimentos na G051.
 * @author Filipe Freitas Tozze
 * @since 29/11/2017
*/

/**
 * @module controller/Conhecimento
 * @description Função para realizar o CRUD da tabela G051.
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires dao/Conhecimento
*/
module.exports = function (app, cb) {

	const axios = require('axios');
	var api = {};
	var tmz = app.src.utils.DataAtual;
	var moment = require('moment');
	moment.locale('pt-br');
	
	var dao = app.src.modIntegrador.dao.ConhecimentoDAO;
	var cargaController = app.src.modIntegrador.controllers.CargasController;
	var deliveryCtrl = app.src.modIntegrador.controllers.DeliveryController;
	var clienteCtrl = app.src.modIntegrador.controllers.ClienteController;

	
	/**
	* @description Lista todos os dados de conhecimento.
	*
	* @async
	* @function api/listar
	* @param {request} req - Possui as requisições para a função.
	* @param {response} res - A resposta gerada na função.
	* @param {next} next - Caso haja algum erro na rota.
	* @return {JSON} Retorna um objeto JSON.
	* @throws Caso falso, o número do log de erro aparecerá no console.
	*/
	api.listar = async function (req, res, next) {
		await dao.listar(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				next(err);
			});
	};

	/**
	* @description Salva os dados de conhecimento.
	*
	* @async
	* @function api/salvar
	* @param {request} req - Possui as requisições para a função.
	* @param {response} res - A resposta gerada na função.
	* @param {next} next - Caso haja algum erro na rota.
	* @return {JSON} Retorna um objeto JSON.
	* @throws Caso falso, o número do log de erro aparecerá no console.
	*/
	api.salvar = async function (req, res, next) {
		
		var objRequest = {};
		var operationSuccess = true;
		var resultObj = {};
		/* Validando se remetente existe */
		var objRemetente = {};
		objRemetente.cjparcei = req.body.cjremete;
		objRemetente.ieparcei = req.body.ieremete;

		await clienteCtrl.validaParceiro(objRemetente)
			.then((result) => {
				objRequest.cdremete = result.result.IDG005 ? result.result.IDG005 : null;
			})
			.catch((err) => {
				next(err);
			});

		if (!objRequest.cdremete) {

			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Remetente não localizado (' + objRemetente.cjparcei + '/' + objRemetente.ieparcei + ')';
			res.json(resultObj);
			operationSuccess = false;

			return;
		}

		/* Validando se tomador existe */
		var objTomado = {};

		objTomado.cjparcei = req.body.cjtomado;
		objTomado.ieparcei = req.body.ietomado;

		await clienteCtrl.validaParceiro(objTomado)
			.then((result) => {
				objRequest.cdtomado = result.result.IDG005 ? result.result.IDG005 : null;
			})
			.catch((err) => {
				next(err);
			});

		if (!objRequest.cdtomado) {
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Tomador não localizado (' + objTomado.cjparcei + '/' + objTomado.ieparcei + ')';
			res.json(resultObj);
			operationSuccess = false;

			return;
		}

		/* Validando se Destinatário existe */
		var objDestin = {};

		objDestin.cjparcei = req.body.cjdestin;
		objDestin.ieparcei = req.body.iedestin;

		await clienteCtrl.validaParceiro(objDestin)
			.then((result) => {
				objRequest.cddestin = result.result.IDG005 ? result.result.IDG005 : null;
			})
			.catch((err) => {
				next(err);
			});

		if (!objRequest.cddestin) {
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Destinatário não localizado (' + objDestin.cjparcei + '/' + objDestin.ieparcei + ')';
			res.json(resultObj);
			operationSuccess = false;

			return;
		}

		/* Validando se Expedidor existe */
		var objExpedi = {};

		objExpedi.cjparcei = req.body.cjexpedi;
		objExpedi.ieparcei = req.body.ieexpedi;

		await clienteCtrl.validaParceiro(objExpedi)
			.then((result) => {
				objRequest.cdexpedi = result.result.IDG005 ? result.result.IDG005 : null;
			})
			.catch((err) => {
				next(err);
			});

		if (!objRequest.cdexpedi) {
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Expedidor não localizado (' + objExpedi.cjparcei + '/' + objExpedi.ieparcei + ')';
			res.json(resultObj);
			operationSuccess = false;

			return;
		}

		/* Validando se Recebedor existe */
		var objRecebe = {};

		objRecebe.cjparcei = req.body.cjrecebe;
		objRecebe.ieparcei = req.body.ierecebe;

		await clienteCtrl.validaParceiro(objRecebe)
			.then((result) => {
				objRequest.cdrecebe = result.result.IDG005 ? result.result.IDG005 : null;
			})
			.catch((err) => {
				next(err);
			});

		if (!objRequest.cdrecebe) {
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Recebedor não localizado (' + objRecebe.cjparcei + '/' + objRecebe.ieparcei + ')';
			res.json(resultObj);
			operationSuccess = false;

			return;
		}

		/* Validando se Transportadora existe */
		var objTransp = {};

		objTransp.cjtransp = req.body.cjtransp;
		objTransp.ietransp = req.body.ietransp;

		await api.validaTransportadora(objTransp)
			.then((result) => {
				objRequest.cdtransp = result.result.IDG024 ? result.result.IDG024 : null;
			})
			.catch((err) => {
				next(err);
			});

		if (!objRequest.cdtransp) {
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Transportadora não localizado (' + objTransp.cjparcei + '/' + objTransp.ieparcei + ')';
			res.json(resultObj);
			operationSuccess = false;

			return;
		}

		/* Validando notas enviadas */
		if (!req.body.notas && req.body.notas != '') {
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Nota(s) não informada(s)';
			res.json(resultObj);
			operationSuccess = false;

			return;
		}

		/* Validando se data de entrega planejada existe - DTENTPLA */
		if ((req.body.dtentpla == null) || (req.body.dtentpla == '')) {
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Data de entrega planejada não informada';
			res.json(resultObj);
			operationSuccess = false;

			return;
		}

		var objNotas = req.body.notas;
		var vrTotDel = 0;
		var vrDelive = 0;
		var vrDelAux = 0;
		var vrTotPes = 0;
		var vrPesBru = 0;
		var vrPesAux = 0;
		var objDelivery = [];
		var deliveAux = '';
		var qtdNotaCarga = 0;
		var idDeliverys = null;
		var idCarga = null;

		//monta objeto com as deloverys
		for (var delive = 0; delive < objNotas.length; delive++) {
			deliveAux = "'"+objNotas[delive].cddelive+"'";
			objDelivery.push(deliveAux);
			deliveAux = '';
		}
		
		await cargaController.countCargaNotaPorDelivery(objDelivery, null, next)
			.then((result) => {
				if(result.length > 0){
					qtdNotaCarga = result[0];
					idCarga = qtdNotaCarga.IDG046;
				}else{
					qtdNotaCarga.QTD_NF = 0;
					qtdNotaCarga.QTD_CARGA = 0;
					idCarga = null;
				}
				
			})
			.catch((err) => {
				next(err);
			});

		await deliveryCtrl.buscaDeliveryEmMassaPorCd(objDelivery,next)
			.then((result) => {
				idDeliverys = result;
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});	
		
		if(qtdNotaCarga.QTD_NF != objNotas.length){
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Quantidade de notas encontradas diferente da enviada.';
			res.json(resultObj);
			operationSuccess = false;
			return;
		}
		if(qtdNotaCarga.QTD_CARGA != 1){
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Carga não encontrada ou em duplicidade.';
			res.json(resultObj);
			operationSuccess = false;
			return;
		}

		for (var count = 0; count < objNotas.length; count++) {

			/* Validando se nota existe */
			if (!objNotas[count].nrnota && objNotas[count].nrnota != '') {
				resultObj.operationSuccess = 'false';
				resultObj.msgreturn = 'Código da nota não informada';
				res.json(resultObj);
				operationSuccess = false;

				return;
			}

			/* Validando se série da nota existe */
			if (!objNotas[count].nrserinf && objNotas[count].nrserinf != '') {
				resultObj.operationSuccess = 'false';
				resultObj.msgreturn = 'Código da série da nota não informada';
				res.json(resultObj);
				operationSuccess = false;

				return;
			}

			/* Validando se data da emissão da nota existe */
			if (!objNotas[count].dteminot && objNotas[count].dteminot != '') {
				resultObj.operationSuccess = 'false';
				resultObj.msgreturn = 'Código da data da emissão da nota não informada';
				res.json(resultObj);
				operationSuccess = false;

				return;
			}

			/* Validando se Delivery existe */
			if (!objNotas[count].cddelive && objNotas[count].cddelive != '') {
				resultObj.operationSuccess = 'false';
				resultObj.msgreturn = 'Código da delivery não informada';
				res.json(resultObj);
				operationSuccess = false;

				return;
			}

			await deliveryCtrl.buscaDeliveryPorCd(objNotas[count].cddelive)
				.then((result) => {
					vrDelive = result && result.VRDELIVE ? result.VRDELIVE : null;
					vrPesBru = result && result.PSBRUTO ? result.PSBRUTO : null;
					// grava o id da tabela de delivery no objeto de notas
					objNotas[count].idg043 = result && result.IDG043 ? result.IDG043 : null;
				})
				.catch((err) => {

					next(err);
				});

			if (!vrDelive) {
				resultObj.operationSuccess = 'false';
				resultObj.msgreturn = 'Delivery ' + objNotas[count].cddelive + ' não localizada';
				res.json(resultObj);
				operationSuccess = false;

				return;
			}
			
			if (!objNotas[count].idg043) {
				resultObj.operationSuccess = 'false';
				resultObj.msgreturn = 'Código da delivery ' + objNotas[count].cddelive + ' não localizado na base de dados';
				res.json(resultObj);
				operationSuccess = false;

				return;
			}

			//soma valor da linha da delivery
			vrDelAux = String(vrDelive).replace(',', '.');
			vrTotDel = parseFloat(vrTotDel) + parseFloat(vrDelAux);

			//soma valor do peso da delivery
			vrPesAux = String(vrPesBru).replace(',', '.');
			vrTotPes = parseFloat(vrTotPes) + parseFloat(vrPesAux);
		}

		//corrigindo para 2 casas decimais
		vrTotDel = parseFloat(vrTotDel).toFixed(2);
		vrTotPes = parseFloat(vrTotPes).toFixed(2);
		console.log('vr tot delivery', vrTotDel);

		/* Somatória do valor total de frete */
		var vrTotFre = 0;
		vrTotFre = parseFloat(String(req.body.vrfretep).replace(',', '.')) + parseFloat(String(req.body.vrfretev).replace(',', '.')) +
			parseFloat(String(req.body.vrpedagi).replace(',', '.')) + parseFloat(String(req.body.vroutros).replace(',', '.')) +
			parseFloat(String(req.body.vrseccat).replace(',', '.'));

		vrTotFre = parseFloat(vrTotFre).toFixed(2);

		var vrFrePesAux = parseFloat(String(vrTotPes).replace(',', '.'));
		var novaTaxaFee = (vrFrePesAux * 0.20) / 1000;
		novaTaxaFee = parseFloat(novaTaxaFee).toFixed(2);

		console.log('valor tot frete', vrTotFre);

		var dtentplaAux = req.body.dtentpla;
		    dtentplaAux = dtentplaAux.split('/');
		var newDtentpla = dtentplaAux[2]+'-'+ dtentplaAux[1]+'-'+ dtentplaAux[0]+' 00:00:00';
		
		var newDtemissa = null;
		if((typeof objNotas[0].dtemissa != 'undefined') && objNotas[0].dtemissa != ''){
			var dtemissaAux = objNotas[0].dtemissa;
			dtemissaAux = dtemissaAux.split('/');
			newDtemissa = dtemissaAux[2]+'-'+ dtemissaAux[1]+'-'+ dtemissaAux[0]+' 00:00:00';
		}
		
		/* Montando objeto para gravar o conhecimento */
		var objConhecimento = {
			"IDG005RE": objRequest.cdremete,
			"IDG005DE": objRequest.cddestin,
			"IDG005RC": objRequest.cdrecebe,
			"IDG005EX": objRequest.cdexpedi,
			"IDG005CO": objRequest.cdtomado,
			"IDG024"  : objRequest.cdtransp,
			"NRCHADOC": req.body.nrchadoc,
			"DSMODENF": req.body.dsmodenf,
			"NRSERINF": req.body.nrserinf,
			"CDCTRC"  : req.body.cdctrc,
			"VRTOTFRE": vrTotFre,
			"VRFRETEP": String(req.body.vrfretep).replace(',', '.'),
			"VRFRETEV": String(req.body.vrfretev).replace(',', '.'),
			"VRPEDAGI": String(req.body.vrpedagi).replace(',', '.'),
			"VROUTROS": String(req.body.vroutros).replace(',', '.'),
			"VRSECCAT": String(req.body.vrseccat).replace(',', '.'),
			"VROPERAC": novaTaxaFee,
			"DTEMICTR": tmz.retornaData(req.body.dtemictr,'YYYY-MM-DD'),
			"VRMERCAD": vrTotDel,
			"STCTRC"  : 'A',
			"VRTOTPRE": vrTotFre,
			"VRBASECA": req.body.vrbaseca ? String(req.body.vrbaseca).replace(',', '.') : null,                          
			"PCALIICM": req.body.pcaliicm ? String(req.body.pcaliicm).replace(',', '.') : null,
			"VRICMS"  : req.body.vricms   ? String(req.body.vricms).replace(',', '.')   : null,
			"BSISSQN" : req.body.bsissqn  ? String(req.body.bsissqn).replace(',', '.')  : null,
			"VRISSQN" : req.body.vrissqn  ? String(req.body.vrissqn).replace(',', '.')  : null,
			"VRISSQST": req.body.vrissqst ? String(req.body.vrissqst).replace(',', '.') : null,
			"PCALIISS": req.body.pcaliiss ? String(req.body.pcaliiss).replace(',', '.') : null,
			"VRDESCON": req.body.vrdescon ? String(req.body.vrdescon).replace(',', '.') : null,
			"DSINFCPL":	req.body.dsinfcpl.substr(0, 4000),
			"DTENTPLA":	moment(newDtentpla).toDate(),
			"TPTRANSP":	req.body.tptransp,
			"SNLOTACA":	req.body.snlotaca,
			"IDG059":	req.body.idg059 ? req.body.idg059 : null,
			"STINTCLI":	0,
			"DTCOLETA" : newDtemissa ? tmz.retornaData(newDtemissa,'YYYY-MM-DD 00:00:00') : null,
			"IDG024AT": objRequest.cdtransp, // Alteração 4PL
			"NRPESO":	String(req.body.nrpeso).replace(',', '.'), // Alteração 4PL
			"IDG046":   idCarga, // Alteração 4PL
		}

		/* Gravando o conhecimento */
		var idConhecimento = 
		await dao.salvar(objConhecimento, res, next)
			.catch((err) => {
				resultObj.msgreturn = err.message;
			});

		console.log('idConhecimento', idConhecimento);

		/* Vincular delivery ao conhecimento */
		var vinculaDelivery = null;
		var atualizaDelivery = null;
		var vincularCteCarga = null;
		if (idConhecimento) {

			await api.vincularCteComCarga(idConhecimento, idDeliverys, idCarga)
				.then((result) => {
					vincularCteCarga = result;
				})
				.catch((err) => {

					next(err);
				});

			for (var count2 = 0; count2 < objNotas.length; count2++) {
				objNotas[count2].idg051 = idConhecimento;
				objNotas[count2].dteminot = tmz.retornaData(objNotas[count2].dteminot,'YYYY-MM-DD');
				vinculaDelivery = await dao.vincularDeliveryAoConhecimento(objNotas[count2], res, next);

				if (!vinculaDelivery) {
					resultObj.operationSuccess = 'false';
					resultObj.msgreturn = 'Ocorreu um erro ao vincular delivery ao conhecimento (' + idConhecimento + '/' + objNotas[count2].idg043 + ')';
					res.json(resultObj);
					operationSuccess = false;

					return;
				} else {
					atualizaDelivery = await deliveryCtrl.atualizaDeliveryConhecimento(objNotas[count2], res, next);
				}
			}
		} else {			
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = resultObj.msgreturn ? resultObj.msgreturn : "Ocorreu um erro ao gravar conhecimento";
			res.json(resultObj);
			operationSuccess = false;

			return;
		}

		if (operationSuccess) {
			resultObj.operationSuccess = 'true'
			resultObj.msgreturn = "Conhecimento inserido com sucesso";
			res.json(resultObj);

			console.log('Conhecimento inserido com sucesso.');
		}

	};

	/**
	 * @description Possui os métodos para interação com conhecimentos na G051.
	 * @author João Eduardo Saad
	 * @since 24/01/2018
	*/
	api.cancelar = async function (req, res, next) {

		var transportadoraDAO = app.src.modIntegrador.dao.TransportadoraDAO;
		var erroIncompleto = {
			status: 1,
			arr: ["1x00002"]
		};

		if (req.body.CNPJ == (undefined || null)) {

			res.status(500);
			res.json(erroIncompleto);

			return erroIncompleto;

		} else if (req.body.INSCRICAO_ESTADUAL == (undefined || null)) {

			res.status(500);
			res.json(erroIncompleto);

			return erroIncompleto;

		} else if (req.body.NR_CONHECIMENTO == (undefined || null)) {

			res.status(500);
			res.json(erroIncompleto);

			return erroIncompleto;

		} else if (req.body.SERIE == (undefined || null)) {

			res.status(500);
			res.json(erroIncompleto);

			return erroIncompleto;

		} else if (req.body.MODELO == (undefined || null)) {

			res.status(500);
			res.json(erroIncompleto);

			return erroIncompleto;

		} else {

			var cnpj = req.body.CNPJ;
			var inscr = req.body.INSCRICAO_ESTADUAL;
			var nrConhe = req.body.NR_CONHECIMENTO;     //CDCTRC
			var serie = req.body.SERIE;                 //NRSERINF
			var modelo = req.body.MODELO;
			
			var requisition = {
				cjtransp: req.body.CNPJ,
				ietransp: req.body.INSCRICAO_ESTADUAL,
				nrConhe: req.body.NR_CONHECIMENTO,     //CDCTRC
				serie: req.body.SERIE,                //NRSERINF
				modelo: req.body.MODELO
			}

			// Buscando transportadora para validar entrada dos dados
			var transportadora = await dao.buscaTranspPorCj(requisition)
				.then((result) => {
					var erroTransportadora = {
						status: 1,
						arr: ["1x00001"]
					};

					if (result.length == 0) {    //Caso não existe nenhum retorno , responde erro e status 500
						res.status(500);
						res.json(erroTransportadora);

						return erroTransportadora;

					} else {
						return result;
					}
				}).catch((err) => {
					next(err);
				});

			if (transportadora.status != undefined) { // Valida erro e caso exista erro finaliza execução da função

				return transportadora;

			} else {
				// Caso exista transportadora continua execução;

				// Busca o CTE informado por parâmetro para validar existência
				var cteValidate = await dao.buscarCTEpersonalizado(requisition)
					.then((result) => {
						var erroConhecimento = {
							status: 1,
							arr: ["1x00003"]
						};

						if (result.length == 0) { //Caso não exista nenhum , retorna erro e status 500
							res.status(500);
							res.json(erroConhecimento);
							
							return erroConhecimento;

						} else {
							return result[0];
						}

					}).catch((err) => {
						next(err);
					});

				if (cteValidate.status != undefined) { //Valida erro de existência: Caso erro, finaliza execução :: 

					return cteValidate;

				} else {

					await dao.cancelar(cteValidate.ID_CONHECIMENTO)
						.then((result) => {
							var erroAtualizar = {
								status: 1,
								arr: ["1x00004"]
							};

							if (result != true) {
								res.status(500);
								res.json(erroAtualizar);

								return erroAtualizar;

							} else {
								return true;
							}
						}).catch((err) => {
							next(err);
						});


						// await dao.removeVinculoConhecimento(cteValidate.ID_CONHECIMENTO)
                        // .then((result) => {
                        //     var erroAtualizar = {
                        //         status: 1,
                        //         arr: ["1x00004"]
                        //     };

                        //     if (result != true) {
                        //         res.status(500);
                        //         res.json(erroAtualizar);
                        //         return erroAtualizar;
                        //     } else {
                        //         return true;
                        //     }

                        // }).catch((err) => {
                        //     next(err);
                        // }); 

					var idEtapa = await dao.etapaPorConhecimento(cteValidate.ID_CONHECIMENTO)
						.then((result) => {

							if (result) {
								
								if (result.length > 0) {

									return result[0];

								} else {

									return false;

								}
							} else {

								return false;

							}
						}).catch((err) => {
							next(err);
						});

					if(idEtapa.ID_PARADA == undefined){
						var erroAtualizar = {
							status: 1,
							arr: ["1x00004"]
						};
						res.status(500);
						res.json(erroAtualizar);
						return erroAtualizar;
					}

					return await dao.mudarFlagInvoice({stInteracao: 2,	idParada: idEtapa.ID_PARADA})
						.then((result) => {
							res.status(200);
							res.json({
								status: 0,
								arr: ["0x00001"]
							});

							return true;

						}).catch((err) => {
							next(err);
						});
				}
			}
		}
	}


	/**
	 * Função de intergrar conhecimento do logos versão dois
	 * Nessa versão se o conhecimento já estiver criado, apenas atualiza as informações 
	 * e faz os vínculos necessário
	*/
	api.salvarConhecimentoV2 = async function (req, res, next) {

		var deliveryCtrl     = app.src.modIntegrador.controllers.DeliveryController;

		var objRequest       = {};
		var operationSuccess = true;
		var resultObj        = {};

		/* Validando se remetente existe */
		var objRemetente = {};
		
		objRemetente.cjparcei = req.body.cjremete;
		objRemetente.ieparcei = req.body.ieremete;
		objRemetente.cpparcei = req.body.cpremete;
		var remetentes        = [];
		await clienteCtrl.validaParceiro(objRemetente,null,next)
			.then((result) => {
					//monta objeto com as deliverys
					for (var i = 0; i < result.result.length; i++) {
						remetentes.push(result.result[i].IDG005);
					}
					objRequest.cdremete = result.result[0].IDG005 ? result.result[0].IDG005 : null;
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});

		if (!objRequest.cdremete) {

			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Remetente não localizado (CNPJ: ' + objRemetente.cjparcei + '/ IE: ' + objRemetente.ieparcei + ').';
			res.json(resultObj);
			operationSuccess = false;

			return;
		}

		/* Validando se remetente original existe */
		var objRemetenteO = {};
		
		objRemetenteO.cjparcei = req.body.cjremeto;
		objRemetenteO.ieparcei = req.body.ieremeto;
		objRemetenteO.cpparcei = req.body.cpremeto;
		objRemetenteO.sndelete = 0;

		await clienteCtrl.validaParceiro(objRemetenteO,null,next)
			.then((result) => {
					//monta objeto com as deliverys
					objRequest.cdremeto = result.result[0].IDG005 ? result.result[0].IDG005 : null;
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});

		if (!objRequest.cdremeto) {

			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Remetente Original não localizado (CNPJ: ' + objRemetenteO.cjparcei + '/ IE: ' + objRemetenteO.ieparcei + ').';
			res.json(resultObj);
			operationSuccess = false;

			return;
		}
		

		/* Validando se tomador existe */
		var objTomado = {};

		objTomado.cjparcei = req.body.cjtomado;
		objTomado.ieparcei = req.body.ietomado;
		objTomado.cpparcei = req.body.cptomado;

		await clienteCtrl.validaParceiro(objTomado,null,next)
			.then((result) => {
				objRequest.cdtomado = result.result[0].IDG005 ? result.result[0].IDG005 : null;
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});

		if (!objRequest.cdtomado) {
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Tomador não localizado (CNPJ: ' + objTomado.cjparcei + '/ IE: '+ objTomado.ieparcei + ').';
			res.json(resultObj);
			operationSuccess = false;

			return;
		}

		/* Validando se Destinatário existe */
		var objDestin = {};

		objDestin.cjparcei = req.body.cjdestin;
		objDestin.ieparcei = req.body.iedestin;
		objDestin.cpparcei = req.body.cpdestin;

		await clienteCtrl.validaParceiro(objDestin,null,next)
			.then((result) => {
				objRequest.cddestin = result.result[0].IDG005 ? result.result[0].IDG005 : null;
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});

		if (!objRequest.cddestin) {
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Destinatário não localizado (CNPJ: ' + objDestin.cjparcei + '/ IE: ' + objDestin.ieparcei + ').';
			res.json(resultObj);
			operationSuccess = false;

			return;
		}

		/* Validando se Expedidor existe */
		var objExpedi = {};

		objExpedi.cjparcei = req.body.cjexpedi;
		objExpedi.ieparcei = req.body.ieexpedi;
		objExpedi.cpparcei = req.body.cpexpedi;

		await clienteCtrl.validaParceiro(objExpedi,null,next)
			.then((result) => {
				objRequest.cdexpedi = result.result[0].IDG005 ? result.result[0].IDG005 : null;
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});

		if (!objRequest.cdexpedi) {
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Expedidor não localizado (CNPJ: ' + objExpedi.cjparcei + '/ IE: ' + objExpedi.ieparcei + ').';
			res.json(resultObj);
			operationSuccess = false;

			return;
		}

		/* Validando se Recebedor existe */
		var objRecebe = {};

		objRecebe.cjparcei = req.body.cjrecebe;
		objRecebe.ieparcei = req.body.ierecebe;
		objRecebe.cpparcei = req.body.cprecebe;

		await clienteCtrl.validaParceiro(objRecebe,null,next)
			.then((result) => {
				objRequest.cdrecebe = result.result[0].IDG005 ? result.result[0].IDG005 : null;
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});

		if (!objRequest.cdrecebe) {
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Recebedor não localizado (CNPJ: ' + objRecebe.cjparcei + '/ IE: ' + objRecebe.ieparcei + ').';
			res.json(resultObj);
			operationSuccess = false;

			return;
		}

		/* Validando se Transportadora existe */
		var objTransp = {};

		objTransp.cjtransp = req.body.cjtransp;
		objTransp.ietransp = req.body.ietransp;

		await api.validaTransportadora(objTransp,null,next)
			.then((result) => {
				objRequest.cdtransp = result.result.IDG024 ? result.result.IDG024 : null;
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});

		if (!objRequest.cdtransp) {
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Transportadora não localizado (CNPJ: ' + objTransp.cjparcei + '/ IE: ' + objTransp.ieparcei + ').';
			res.json(resultObj);
			operationSuccess = false;

			return;
		}

		/* Validando notas enviadas */
		if (!req.body.notas && req.body.notas != '') {
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Nota(s) não informada(s) pelo Logos.';
			res.json(resultObj);
			operationSuccess = false;

			return;
		}

		/* Validando se data de entrega planejada existe - DTENTPLA */
		// if ((req.body.dtentpla == null) || (req.body.dtentpla == '')) {
		// 	resultObj.operationSuccess = 'false';
		// 	resultObj.msgreturn = 'Data de entrega planejada (Data SLA) não informada.';
		// 	res.json(resultObj);
		// 	operationSuccess = false;

		// 	return;
		// }

		var objNotas       = req.body.notas;
		var vrTotDel       = 0;
		var vrDelive       = 0;
		var vrDelAux       = 0;
		var vrTotPes       = 0;
		var vrPesBru       = 0;
		var vrPesAux       = 0;
		var objDelivery    = [];
		var objDeliveryCom = [];
		var objNota        = [];
		var deliveAux      = '';
		var notaAux        = '';
		var qtdNotaCarga   = 0;
		var idDeliverys    = null;
		var idCarga        = null;
		var objDeliveryAux = null;
		var resultpDelivery= null;
		//var codDeliveriesAux  = '';
		var codDeliveries     = '';/* Código das deliveries, apenas com números*/
		var codDeliveriesCom  = '';/* Código das deliveries completa*/
		var snag = null;

		//monta objeto com as deliverys
		for (var delive = 0; delive < objNotas.length; delive++) {
			//deliveAux = "'"+objNotas[delive].cddelive+"'";
			if(snag == null){
				snag = objNotas[delive].snag;
			}
			
			codDeliveries     += ""+objNotas[delive].cddelive+",";
			codDeliveriesCom  += "'"+objNotas[delive].dsrascl3+"',";
			objDelivery.push("'"+objNotas[delive].cddelive+"'");
			objDeliveryCom.push("'"+objNotas[delive].dsrascl3+"'");
			deliveAux = '';
		}

		codDeliveries    = codDeliveries.substring(0,(codDeliveries.length - 1));
		codDeliveriesCom = codDeliveriesCom.substring(0,(codDeliveriesCom.length - 1));

		objDeliveryAux = objDelivery.filter( function( elem, i, objDelivery ) {
			return objDelivery.indexOf( elem ) === i;
		} );

		objDeliveryCom = objDeliveryCom.filter( function( elem, i, objDeliveryCom ) {
			return objDeliveryCom.indexOf( elem ) === i;
		} );


		//monta objeto com as notas
		var notasAux = '';
		for (var nota = 0; nota < objNotas.length; nota++) {
			notaAux = "'"+objNotas[nota].nrnota+"'";
			notasAux  += ""+objNotas[nota].nrnota+",";
			objNota.push(notaAux);
			notaAux = '';
		}
		var notas = notasAux.substring(0,(notasAux.length - 1));

		objNotaAux = objNota.filter( function( elem, i, objNota ) {
			return objNota.indexOf( elem ) === i;
		} );

		// pesquisando delivery por cddelive e por nrnota
		await deliveryCtrl.buscaDeliveryNotaEmMassaPorCd({delivery:objDelivery,dsrascl3:objDeliveryCom,nota:objNota,remetente:remetentes,tptransp:req.body.tptransp,snag:snag},next)
			.then((result) => {
				idDeliverys = result.IDG043;

				if(req.body.cjremeto == req.body.cjremete && req.body.ieremeto == req.body.ieremete){
					objRequest.cdremete = result.IDG005RE;
				}else{
					objRequest.cdremete = objRequest.cdremeto;
				}

			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});	

			if(idDeliverys.length == 0 || idDeliverys == undefined){
				resultObj.operationSuccess = 'false';
				resultObj.msgreturn = 'Não foi possível encontrar nenhuma NF no Evolog, através dos Códigos de Deliveries ('+ codDeliveries +'), e nem pelo número da nota (N° nota: '+notas+') com o remetente (CNPJ: ' + objRemetente.cjparcei + '/ IE: ' + objRemetente.ieparcei + ').';
				res.json(resultObj);
				operationSuccess = false;
				return;
			}
			

		//Esse count conta quantas idg043 tem na carga
		await cargaController.countCargaNotaPorIdDelivery(idDeliverys, null, next)
			.then((result) => {
				if(result.length > 0){
					qtdNotaCarga = result[0];
					idCarga      = qtdNotaCarga.IDG046;
					idCargas     = qtdNotaCarga.CARGAS;
				}else{
					qtdNotaCarga.QTD_NF = 0;
					qtdNotaCarga.QTD_CARGA = 0;
					idCarga = null;
				}
				
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});


		await deliveryCtrl.buscaTpDelivery(idDeliverys, null, next)
			.then((result) => {
				resultpDelivery = result[0];
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});	

		if(idDeliverys.length != objNotas.length && resultpDelivery.TPDELIVE != 5){
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Quantidade de NFs encontradas no Evolog ('+idDeliverys.length+' nota(s), com ID da Delivery: '+idDeliverys+') é diferente das enviadas pelo Logos ('+objNotas.length+' nota(s), N° nota: '+notas+') com o remetente (CNPJ: ' + objRemetente.cjparcei + '/ IE: ' + objRemetente.ieparcei + ').';
			res.json(resultObj);
			operationSuccess = false;
			return;
		}

		if(resultpDelivery.STETAPA == 8){
			resultObj.operationSuccess = '2';
			resultObj.msgreturn = 'Alguma delivery referente ao CTE esta cancelada (ID da Delivery: '+idDeliverys+').';
			res.json(resultObj);
			operationSuccess = false;
			return;
		}

		if(qtdNotaCarga.QTD_NF == undefined || qtdNotaCarga.QTD_NF == 0){
			/**
			 * Significa que já possui vinculo na G049 ou as notas não estão vínculadas a uma carga.
			 * A função a baixo irá verificar se o CTE vinculado nas notas no Evolog e o msm que estamos
			 * tentando subir.
			 * */ 
			await dao.verificarVinculoCte(idDeliverys, null, next)
			.then((result) => {
				if(result.length > 0){
					qtdNotaCarga = result[0];
					idCarga      = qtdNotaCarga.IDG046;
				}else{
					resultObj.operationSuccess = 'false';
					resultObj.msgreturn = 'As NFs encontradas no Evolog, não estão vínculadas a nenhuma carga no momento (ID da Delivery: '+idDeliverys+').';
					res.json(resultObj);
					operationSuccess = false;
					return;
				}
				
			}).catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});

		}

		if(qtdNotaCarga.QTD_CARGA > 1){
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = 'Carga em duplicidade (Shipments: '+idCargas+')';
			res.json(resultObj);
			operationSuccess = false;
			return;
		}

		if(qtdNotaCarga.QTD_NF != objNotas.length && resultpDelivery.TPDELIVE != 5){
			//As cargas que estão vínculadas com as idg043
			await cargaController.cargaPorIdDelivery(idDeliverys, null, next)
			.then((result) => {
				if(result.length > 0){
					cargas = result[0].CARGAS;
				}else{
					cargas = 'não encontrada';
				}
				
			}).catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
			resultObj.operationSuccess = '2';
			resultObj.msgreturn = 'As NFs de AG encontradas no Evolog estão em mais de uma carga (Shipment: '+cargas+' e ID da Delivery: '+idDeliverys+')';
			res.json(resultObj);
			operationSuccess = false;
			return;
		}

		if(qtdNotaCarga.QTD_NF != objDeliveryAux.length && resultpDelivery.TPDELIVE == 5){

			//As cargas que estão vínculadas com as idg043
			await cargaController.cargaPorIdDelivery(idDeliverys, null, next)
			.then((result) => {
				if(result.length > 0){
					cargas = result[0].CARGAS;
				}else{
					cargas = 'não encontrada';
				}
				
			}).catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
			resultObj.operationSuccess = '2';//Significa que a interface não precisa tentar enviar esse CTE novamente;
			resultObj.msgreturn = 'As NFs de AG encontradas no Evolog estão em mais de uma carga (Shipment: '+cargas+' e ID da Delivery: '+idDeliverys+')';
			res.json(resultObj);
			operationSuccess = false;
			return;
		}

		for (var count = 0; count < objNotas.length; count++) {

			/* Validando se nota existe */
			if (!objNotas[count].nrnota && objNotas[count].nrnota != '') {
				resultObj.operationSuccess = 'false';
				resultObj.msgreturn = 'Código da nota não informada.';
				res.json(resultObj);
				operationSuccess = false;

				return;
			}

			/* Validando se série da nota existe */
			if (!objNotas[count].nrserinf && objNotas[count].nrserinf != '') {
				resultObj.operationSuccess = 'false';
				resultObj.msgreturn = 'Código da série da nota não informada.';
				res.json(resultObj);
				operationSuccess = false;

				return;
			}

			/* Validando se data da emissão da nota existe */
			if (!objNotas[count].dteminot && objNotas[count].dteminot != '') {
				resultObj.operationSuccess = 'false';
				resultObj.msgreturn = 'Data da emissão da nota não informada.';
				res.json(resultObj);
				operationSuccess = false;

				return;
			}

			/* Validando se Delivery existe */
			if (!objNotas[count].cddelive && objNotas[count].cddelive != '') {
				resultObj.operationSuccess = 'false';
				resultObj.msgreturn = 'Código da delivery não informada.';
				res.json(resultObj);
				operationSuccess = false;

				return;
			}
			
			//# buscar delivery por cd delivery ou por nrnota
			await deliveryCtrl.buscaDeliveryPorCdOrNota({delivery:objNotas[count].cddelive,nota:objNotas[count].nrnota,remetente:remetentes,tptransp:req.body.tptransp,snag:snag,dsrascl3:"'"+objNotas[count].dsrascl3+"'"})
				.then((result) => {
					vrDelive = result && result.VRDELIVE ? result.VRDELIVE : null;
					vrPesBru = result && result.PSBRUTO ? result.PSBRUTO : null;
					// grava o id da tabela de delivery no objeto de notas
					objNotas[count].idg043 = result && result.IDG043 ? result.IDG043 : null;
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					next(err);
				});

			if (!vrDelive) {
				resultObj.operationSuccess = 'false';
				resultObj.msgreturn = 'Delivery ' + objNotas[count].cddelive + '/' + objNotas[count].nrnota + ' não localizada.';
				res.json(resultObj);
				operationSuccess = false;

				return;
			}
			
			if (!objNotas[count].idg043) {
				resultObj.operationSuccess = 'false';
				resultObj.msgreturn = 'Código da delivery ' + objNotas[count].cddelive + '/' + objNotas[count].nrnota + ' não localizado na base de dados';
				res.json(resultObj);
				operationSuccess = false;

				return;
			}

			//soma valor da linha da delivery
			vrDelAux = String(vrDelive).replace(',', '.');
			vrTotDel = parseFloat(vrTotDel) + parseFloat(vrDelAux);

			//soma valor do peso da delivery
			vrPesAux = String(vrPesBru).replace(',', '.');
			vrTotPes = parseFloat(vrTotPes) + parseFloat(vrPesAux);
		}

		//corrigindo para 2 casas decimais
		vrTotDel = parseFloat(vrTotDel).toFixed(2);
		vrTotPes = parseFloat(vrTotPes).toFixed(2);

		/* Somatória do valor total de frete */
		var vrTotFre = 0;
		vrTotFre = parseFloat(String(req.body.vrfretep).replace(',', '.')) + parseFloat(String(req.body.vrfretev).replace(',', '.')) +
			parseFloat(String(req.body.vrpedagi).replace(',', '.')) + parseFloat(String(req.body.vroutros).replace(',', '.')) +
			parseFloat(String(req.body.vrseccat).replace(',', '.'));

		vrTotFre = parseFloat(vrTotFre).toFixed(2);

		var vrFrePesAux = parseFloat(String(vrTotPes).replace(',', '.'));
		var novaTaxaFee = (vrFrePesAux * 0.20) / 1000;
		novaTaxaFee = parseFloat(novaTaxaFee).toFixed(2);

		var dtentplaAux = req.body.dtentpla;
		    dtentplaAux = dtentplaAux.split('/');
		var newDtentpla = dtentplaAux[2]+'-'+ dtentplaAux[1]+'-'+ dtentplaAux[0]+' 00:00:00';
		
		var newDtemissa = null;
		if((typeof objNotas[0].dtemissa != 'undefined') && objNotas[0].dtemissa != ''){
			var dtemissaAux = objNotas[0].dtemissa;
			dtemissaAux = dtemissaAux.split('/');
			newDtemissa = dtemissaAux[2]+'-'+ dtemissaAux[1]+'-'+ dtemissaAux[0]+' 00:00:00';
		}
		
		/* Montando objeto para gravar o conhecimento */
		var objConhecimento = {
			"IDG005RE": objRequest.cdremete,
			"IDG005DE": objRequest.cddestin,
			"IDG005RC": objRequest.cdrecebe,
			"IDG005EX": objRequest.cdexpedi,
			"IDG005CO": objRequest.cdtomado,
			"IDG024"  : objRequest.cdtransp,
			"NRCHADOC": req.body.nrchadoc,
			"DSMODENF": req.body.dsmodenf,
			"NRSERINF": req.body.nrserinf,
			"CDCTRC"  : req.body.cdctrc,
			"VRTOTFRE": vrTotFre,
			"VRFRETEP": String(req.body.vrfretep).replace(',', '.'),
			"VRFRETEV": String(req.body.vrfretev).replace(',', '.'),
			"VRPEDAGI": String(req.body.vrpedagi).replace(',', '.'),
			"VROUTROS": String(req.body.vroutros).replace(',', '.'),
			"VRSECCAT": String(req.body.vrseccat).replace(',', '.'),
			"VRDESPAC": String(req.body.vrdespac).replace(',', '.'),
			"CDFAIXA" : req.body.cdfaixa,
			"NRFATURA": req.body.nrfatura,
			"VROPERAC": novaTaxaFee,
			"DTEMICTR": tmz.retornaData(req.body.dtemictr,'DD/MM/YYYY'),
			"VRMERCAD": String(req.body.vrmercad).replace(',', '.'),
			"STCTRC"  : 'A',
			"VRTOTPRE": vrTotFre,
			"VRBASECA": req.body.vrbaseca ? String(req.body.vrbaseca).replace(',', '.') : null,                          
			"PCALIICM": req.body.pcaliicm ? String(req.body.pcaliicm).replace(',', '.') : null,
			"VRICMS"  : req.body.vricms   ? String(req.body.vricms).replace(',', '.')   : null,
			"BSISSQN" : req.body.bsissqn  ? String(req.body.bsissqn).replace(',', '.')  : null,
			"VRISSQN" : req.body.vrissqn  ? String(req.body.vrissqn).replace(',', '.')  : null,
			"VRISSQST": req.body.vrissqst ? String(req.body.vrissqst).replace(',', '.') : null,
			"PCALIISS": req.body.pcaliiss ? String(req.body.pcaliiss).replace(',', '.') : null,
			"VRDESCON": req.body.vrdescon ? String(req.body.vrdescon).replace(',', '.') : null,
			"DSINFCPL":	req.body.dsinfcpl.substr(0, 4000),
			//"DTENTPLA":	moment(newDtentpla).toDate(),
			"TPTRANSP":	req.body.tptransp,
			"SNLOTACA":	req.body.snlotaca,
			"IDG059":	req.body.idg059 ? req.body.idg059 : null,
			"STINTCLI":	0,
			"DTCOLETA" : newDtemissa ? tmz.retornaData(newDtemissa,'YYYY-MM-DD 00:00:00') : null,
			"IDG024AT": objRequest.cdtransp, // Alteração 4PL
			"NRPESO":	String(req.body.nrpeso).replace(',', '.'), // Alteração 4PL
			"IDG046":   idCarga, // Alteração 4PL
			"NRINTSUB": req.body.nrintsub,
			"QTDIAENT": req.body.qtdiaent,
			"DTEMIFAT": req.body.dtemifat ? tmz.retornaData(req.body.dtemifat,'DD/MM/YYYY') : null,
			"DTVENFAT": req.body.dtvenfat ? tmz.retornaData(req.body.dtvenfat,'DD/MM/YYYY') : null,
			"PSLOTACA": req.body.pslotaca,
			"CDOCORRE": req.body.cdocorre
		}

		var idConhecimento = null;

		let validaCteExistente = await dao.validaSeExiteCte(req, res, next)
									.catch((err) => {
										resultObj.msgreturn = err.message;
									});
		
	
		// se o conhecimento já existir, apenas atualiza algumas informações						
		if(validaCteExistente != null && validaCteExistente != ''){
			console.log('idConhecimento já existente', validaCteExistente);
			let atualizaCteExistente = await dao.atualizaCteInterface(validaCteExistente, objConhecimento)
									.catch((err) => {
										resultObj.msgreturn = err.message;
									});

			idConhecimento = validaCteExistente.IDG051;					
		}else{
			/* Gravando o conhecimento */
			idConhecimento = 
			await dao.salvar(objConhecimento, res, next)
				.catch((err) => {
					resultObj.msgreturn = err.message;
				});
			console.log('idConhecimento criado', idConhecimento);
		}

		/* Vincular delivery ao conhecimento */
		var vinculaDelivery  = null;
		//var atualizaDelivery = null;
		//var vincularCteCarga = null;
		let validaSeExiteVinculoNotaCte = null;
		if (idConhecimento) {

			await api.vincularCteComCarga(idConhecimento, idDeliverys, idCarga)
				.then((result) => {
					vincularCteCarga = result;
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					next(err);
				});

			for (var count2 = 0; count2 < objNotas.length; count2++) {
				objNotas[count2].idg051 = idConhecimento;
				
				objNotas[count2].dteminot = tmz.retornaData(objNotas[count2].dteminot,'YYYY-MM-DD');

				/**Verifico se existe vínculo da delivery com a nota na G083, se não existir, a função cadastra. */
				vincularDeliveryNotaAG = await deliveryCtrl.vincularDeliveryNotaAG(objNotas[count2], req)
				.catch((err) => {
					resultObj.msgreturn = err.message;
				});
				
				/**Verifico se existe vínculo da delivery com o cte na G052. */
				validaSeExiteVinculoNotaCte = await dao.validaSeExiteVinculoNotaCte(objNotas[count2], res, vincularDeliveryNotaAG)
				.catch((err) => {
					resultObj.msgreturn = err.message;
				});	
					
				if(validaSeExiteVinculoNotaCte.length == 0 && (vincularDeliveryNotaAG != null || vincularDeliveryNotaAG != undefined)){
					/**Cadastra vinculo na tabela G052 */
					vinculaDelivery = await dao.vincularDeliveryAoConhecimento(objNotas[count2], res, vincularDeliveryNotaAG);
				}else if(validaSeExiteVinculoNotaCte.length > 0 && (vincularDeliveryNotaAG != null || vincularDeliveryNotaAG != undefined)){
					/**Altera vinculo na tabela G052, referente ao campo idg083 */
					vinculaDelivery = await dao.vincularDeliveryAoConhecimentoUpdate(objNotas[count2], res, vincularDeliveryNotaAG);
				}
				
				if (!vinculaDelivery) {
					resultObj.operationSuccess = 'false';
					resultObj.msgreturn = 'Ocorreu um erro ao vincular delivery ao conhecimento (' + idConhecimento + '/' + objNotas[count2].idg043 + ').';
					res.json(resultObj);
					operationSuccess = false;

					return;
				} else {
					if(objNotas[count2].delrepete == 1){
						atualizaDelivery = await deliveryCtrl.atualizaDeliveryConhecimento(objNotas[count2], res, next);
					}

					if(snag == 1){
						atualizaSnag = await deliveryCtrl.atualizaSnag(objNotas[count2], res, next);
					}

				}
			}
		} else {			
			resultObj.operationSuccess = 'false';
			resultObj.msgreturn = resultObj.msgreturn ? resultObj.msgreturn : "Ocorreu um erro ao gravar conhecimento.";
			res.json(resultObj);
			operationSuccess = false;

			return;
		}

		if (operationSuccess) {
			var obj  = {};
			var path = '';
			obj.idg051 = idConhecimento;
			if (process.platform === "win32") {
        path = 'http://srvaplsl01.bravo.com.br';
      } else {
        // Caso se diferente ele vai para a pasta do Linux.
				path = 'http://200.170.131.76';
      }
			/** Alterar o DTPREENT do CTE no Logos, com o DTENTCON do Evologos */
			var optPost = 
			{
					method: 'post',
					url: path+'/prd/evologos/public/alterarDtpreentLogos',
					data: obj
			}
			var objResult = await axios(optPost);
			// var status    = '';
			// if (objResult.data) {
			// 		status = ' e previsão de entrega atualizada no Logos.';  
			// } else {
			// 	  status = ', porém houve algum problema na atualização da previsão de entrega no Logos.';  
			// }
			resultObj.operationSuccess = 'true'
			resultObj.msgreturn = "Conhecimento inserido com sucesso.";
			res.json(resultObj);

			console.log('Conhecimento inserido com sucesso.');
		}

	};

	api.vincularCteComCarga = async function (idConhecimento, idDeliverys) {
		return await dao.vincularCteComCarga(idConhecimento, idDeliverys)
		  .then((result) => {
			return result;
		  })
		  .catch((err) => {
			//next(err);
		  });
	  }

	  api.validaTransportadora = async function (req, res, next) {
		var objReturn = {};
	
		objReturn.result = '';
	
		if (typeof req.cjtransp == 'undefined' || typeof req.ietransp == 'undefined') {
		  objReturn.msgReturn = 'CNPJ e I.E da transportadora são obrigatórios';
		  return objReturn;
		}
	
		await dao.buscaTranspPorCj(req, res, next)
		  .then((result) => {
			if (Object.keys(result).length > 0) {
	
			  objReturn.result = result;
			} else {
			  objReturn.msgReturn = 'CNPJ e I.E do transportadora não encontrados';
			  objReturn.result = '';
			}
		  })
		  .catch((err) => {
			next(err);
		  });
	
		return objReturn;
	  }

	return api;

}