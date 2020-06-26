const axios = require("axios");

module.exports = function (app) {

	const api = {}
	const dao = app.src.modIntegrador.dao.TrafegusDAO;
	const utils = app.src.utils.FuncoesObjDB;

	api.prepareMotoristas = async function (item) {
		let retorno = null;

		if (item.CJMOTORI1 != null) {
			retorno = [{ "cpf_moto": item.CJMOTORI1 }];
		}

		return retorno;
	}

	api.prepareAjudantes = async function (item) {
		let retorno = [];

		if (item.CJMOTORI2 != null) {
			retorno.push({ "cpf_ajudante": item.CJMOTORI2 });
		}

		if (item.CJMOTORI3 != null) {
			retorno.push({ "cpf_ajudante": item.CJMOTORI3 });
		}

		return await api.validateEmptyArray(retorno);
	}

	api.prepareVeiculos = async function (item) {
		let retorno = [];

		if (item.NRPLAVEI1 != null) {
			retorno.push({ "placa": item.NRPLAVEI1 });
		}

		if (item.NRPLAVEI2 != null) {
			retorno.push({ "placa": item.NRPLAVEI2 });
		}

		if (item.NRPLAVEI3 != null) {
			retorno.push({ "placa": item.NRPLAVEI3 });
		}


		if (item.NRPLACAR0 != undefined && item.NRPLACAR0 != null && item.NRPLACAR0 != "") {
			retorno.push({ "placa": item.NRPLACAR0 });
		}

		if (item.NRPLACAR1 != undefined && item.NRPLACAR1 != null && item.NRPLACAR1 != "") {
			retorno.push({ "placa": item.NRPLACAR1 });
		}

		if (item.NRPLACAR2 != undefined && item.NRPLACAR2 != null && item.NRPLACAR2 != "") {
			retorno.push({ "placa": item.NRPLACAR2 });
		}


		return await api.validateEmptyArray(retorno);
	}

	api.prepareOrigem = async function (item) {
		let retorno = {};

		retorno.vloc_descricao 	= item.NMCIDADEOR;
		// retorno.logradouro		= item.DSENDEREOR;
		// retorno.complemento 	= item.DSCOMENDOR;
		// retorno.numero 			= item.NRENDEREOR;
		// retorno.bairro 			= item.BIENDEREOR;
		// retorno.cep 			= item.CPENDEREOR;
		// retorno.sigla_estado 	= item.CDESTADOOR;
		// retorno.pais 			= item.NMPAISOR;
		retorno.refe_latitude 	= item.NRLATITUOR;
		retorno.refe_longitude 	= item.NRLONGITOR;

		return retorno;
	}

	api.prepareDestino = async function (item) {

		let retorno = {};
		let ctrc  = {};
		let nfe   = {};
		let nfes  = [];

		retorno.vloc_descricao 	= item.NMCIDADEDE;
		retorno.logradouro		= item.DSENDEREDE;
		retorno.complemento 	= item.DSCOMENDDE;
		retorno.numero 			= item.NRENDEREDE;
		retorno.bairro 			= item.BIENDEREDE;
		retorno.cep 			= item.CPENDEREDE;
		retorno.sigla_estado 	= item.CDESTADODE;
		retorno.pais 			= item.NMPAISDE;
		retorno.refe_latitude 	= item.NRLATITUDE;
		retorno.refe_longitude 	= item.NRLONGITDE;
		retorno.conhecimentos   = [];

		let objCtrc = await dao.getInfoCtrc(item.IDG048);

		for (let i = 0; i < objCtrc.length; i++) {

			//# init null
			ctrc = null;
			ctrc = {};

			ctrc.vlco_numero 	= objCtrc[i].CDCTRC;
			ctrc.vlco_valor 	= objCtrc[i].VRMERCAD;
			ctrc.vlco_cpf_cnpj  = objCtrc[i].CJCLIENT;
			ctrc.notas_fiscais  = [];

			let objNfe = await dao.getInfoNf(objCtrc[i].IDG051);

			for (let i = 0; i < objNfe.length; i++) {

				//# init null
				nfe = null;
				nfe = {};

				nfe.vnfi_numero 	= objNfe[i].NRNOTA;
				nfe.vnfi_pedido 	= objNfe[i].IDG043;
				nfe.vnfi_valor 		= objNfe[i].VRDELIVE;
				nfe.vnfi_data_fat 	= objNfe[i].DTSLA;
				nfe.vnfi_observacao = "";

				ctrc.notas_fiscais.push(nfe);
			}
			retorno.conhecimentos.push(ctrc);
		}

		return retorno;
	}

	api.prepareLocais = async function (idg046) {
		
		let local = {};
		let locais = [];
		let ctrc  = {};
		let nfe   = {};
		let nfes  = [];

		let objParadas = await dao.getDestinosViagens(idg046);

		for (let j = 0; j < objParadas.length; j++) {

			//# init null
			local = null;
			local = {};

			local.vloc_sequencia 	= objParadas[j].NRSEQETA;
			local.vloc_descricao 	= objParadas[j].NMCIDADEDE;
			local.tipo_parada 		= "3"; // Entrega
			local.tipo_local 		= "6"; // Entrega
			local.logradouro 		= objParadas[j].NMCIDADEDE;
			local.complemento 		= objParadas[j].DSCOMENDDE;
			local.cep 				= objParadas[j].CPENDEREDE;
			local.numero 			= objParadas[j].NRENDEREDE;
			local.bairro 			= objParadas[j].BIENDEREDE;
			local.sigla_estado 		= objParadas[j].CDESTADODE;
			local.pais 				= objParadas[j].NMPAISDE;
			local.refe_latitude 	= objParadas[j].NRLATITUDE;
			local.refe_longitude 	= objParadas[j].NRLONGITDE;

			local.cida_descricao_ibge 		= objParadas[j].CDMUNICI;
			local.refe_raio 				= "500";
			local.associar_transportador 	= "S";
			local.conhecimentos = [];

			let objCtrc = await dao.getInfoCtrc( objParadas[j].IDG048);

			for (let i = 0; i < objCtrc.length; i++) {
				//# init null
				ctrc = null;
				ctrc = {};

				ctrc.vlco_numero 	= objCtrc[i].CDCTRC;
				ctrc.vlco_valor 	= objCtrc[i].VRMERCAD;
				ctrc.vlco_cpf_cnpj  = objCtrc[i].CJCLIENT;
				ctrc.notas_fiscais  = [];

				let objNfe = await dao.getInfoNf(objCtrc[i].IDG051);

				for (let i = 0; i < objNfe.length; i++) {

					//# init null
					nfe = null;
					nfe = {};

					nfe.vnfi_numero 	= objNfe[i].NRNOTA;
					nfe.vnfi_pedido 	= objNfe[i].IDG043;
					nfe.vnfi_valor 		= objNfe[i].VRDELIVE;
					nfe.vnfi_data_fat 	= objNfe[i].DTSLA;
					nfe.vnfi_observacao = "";

					ctrc.notas_fiscais.push(nfe);
				}
				local.conhecimentos.push(ctrc);
			}
			locais.push(local);
		}

		return locais;
	}

	api.validateFields = async function (item) {
		if (item.IDG046 	!= null &&
			item.IDG003OR	!= null &&
			item.IDG003DE 	!= null &&
			item.CJTRANSP != null &&
			(item.NRPLAVEI1 != null || item.NRPLAVEI2 || item.NRPLAVEI3)) {
			return true;
		} else {
			return true;
			return false;
		}		
	}

	api.validateEmptyArray = async function (array) {
		if (array.length == 0) {
			array = null;
		}

		return array;
	}

	api.formatObjTransportadora = async function (objTransportadora) {
		let retorno = {};
		retorno.documento_transportador = objTransportadora.CJTRANSP;
		retorno.nome 		 = objTransportadora.NMTRANSP;
		retorno.razao_social = objTransportadora.RSTRANSP;
		retorno.ie_rg		 = objTransportadora.IETRANSP;
		retorno.logradouro	 = objTransportadora.DSENDERE;
		retorno.cep			 = objTransportadora.CPENDERE;
		retorno.numero		 = objTransportadora.NRENDERE;
		retorno.complemento	 = objTransportadora.CPENDERE;
		retorno.bairro		 = objTransportadora.BIENDERE;
		retorno.cidade		 = objTransportadora.NMCIDADE;
		retorno.sigla_estado = objTransportadora.CDESTADO;
		retorno.pais = objTransportadora.NMPAIS;
		return {"transportador": [retorno]}
	}

	api.formatObjMotorista = async function (objMotorista) {
		let retorno = {};
		retorno.cpf_motorista						=	objMotorista.CJMOTORI;
		retorno.nome										=	objMotorista.NMMOTORI;
		retorno.rg											=	objMotorista.RGMOTORI;
		retorno.validade_cnh						=	objMotorista.DTVALCNH;
		retorno.documento_transportador =	objMotorista.CJTRANSP;

		//# logradouro ou cep obrigatorio se informado cidade, estado, pais ou bairro
		if(objMotorista.CPENDERE == null && objMotorista.DSENDERE == null ){
			//# nada...
		}else{
			retorno.bairro									=	objMotorista.BIENDERE;
			retorno.cidade									=	objMotorista.CDMUNICI;
			retorno.sigla_estado							=	objMotorista.CDESTADO;
			retorno.pais									=	objMotorista.NMPAIS;
			retorno.logradouro								=	objMotorista.DSENDERE;
			retorno.cep										=	objMotorista.CPENDERE;
			retorno.numero									=	objMotorista.NRENDERE;
			retorno.complemento							    =	objMotorista.DSCOMEND;
		}



		return {"motorista": [retorno]}
	}

	api.formatObjVeiculo = async function (objVeiculo) {
		let retorno = {};

		retorno.placa                    	= objVeiculo.PLACA.replace(" ", "");
		retorno.renavan            				= objVeiculo.RENAVAN;
		retorno.chassi 										= objVeiculo.CHASSI;
		retorno.documento_transportador 	= objVeiculo.DOCUMENTO_TRANSPORTADOR;
		//retorno.modelo						 				= objVeiculo.MODELO;
		//retorno.cidade_emplacamento 			=	objVeiculo.CIDADE_EMPLACAMENTO;
		retorno.sigla_estado 							= objVeiculo.SIGLA_ESTADO;
		retorno.pais 											= objVeiculo.PAIS;
		retorno.tipo_veiculo	=	1;

		return {"veiculo": [retorno]}
	}

	api.getTransportadoraTrafegus = async function (CJTRANSP) {
		let transportadoraObj = await axios({
			method: 'get',
			url: process.env.TRAFEGUS_URL + `transportador/` + CJTRANSP,
			headers: {
				'Content-Type': 'application/json',
				'authorization' : 'Basic ' + utils.cript(process.env.TRAFEGUS_LOGIN + `:` + process.env.TRAFEGUS_PASSWORD)
			}
		}).then((result) => {
			return result;
		}).catch(function (err) {
			err.stack = new Error().stack + `\r\n` + err.stack;
		});
		
		return transportadoraObj;
	}

	api.getMotoristaTrafegus = async function (CJTRANSP) {
		let motoristaObj = await axios({
			method: 'get',
			url: process.env.TRAFEGUS_URL + `motorista/` + CJTRANSP,
			headers: {
				'Content-Type': 'application/json',
				'authorization' : 'Basic ' + utils.cript(process.env.TRAFEGUS_LOGIN + `:` + process.env.TRAFEGUS_PASSWORD)
			}
		}).then((result) => {
			return result;
		}).catch(function (err) {
			err.stack = new Error().stack + `\r\n` + err.stack;
		});
		
		return motoristaObj;
	}

	api.getVeiculoTrafegus = async function (NRPLACA) {
		let veiculoObj = await axios({
			method: 'get',
			url: process.env.TRAFEGUS_URL + `veiculo/` + NRPLACA.replace('-', ''),
			headers: {
				'Content-Type': 'application/json',
				'authorization' : 'Basic ' + utils.cript(process.env.TRAFEGUS_LOGIN + `:` + process.env.TRAFEGUS_PASSWORD)
			}
		}).then((result) => {
			return result;
		}).catch(function (err) {
			err.stack = new Error().stack + `\r\n` + err.stack;
		});
		
		return veiculoObj;
	}

	api.postTransportadoraTrafegus = async function (objTransportadora) {

		let objRetorno = await api.formatObjTransportadora(objTransportadora);
		
		let transportadoraObj = await axios({
			method: 'post',
			url: process.env.TRAFEGUS_URL + `transportador`,
			headers: {
				'Content-Type': 'application/json',
				'authorization' : 'Basic ' + utils.cript(process.env.TRAFEGUS_LOGIN + `:` + process.env.TRAFEGUS_PASSWORD)
			},
			data: objRetorno
		}).then((result) => {
			return result;
		}).catch(function (err) {
			err.stack = new Error().stack + `\r\n` + err.stack;
		});
		
		return transportadoraObj;
	}

	api.postMotoristaTrafegus = async function (objMotorista) {

		let objRetorno = await api.formatObjMotorista(objMotorista);
		
		let motoristaObj = await axios({
			method: 'post',
			url: process.env.TRAFEGUS_URL + `motorista`,
			headers: {
				'Content-Type': 'application/json',
				'authorization' : 'Basic ' + utils.cript(process.env.TRAFEGUS_LOGIN + `:` + process.env.TRAFEGUS_PASSWORD)
			},
			data: objRetorno
		}).then((result) => {
			return result;
		}).catch(function (err) {
			err.stack = new Error().stack + `\r\n` + err.stack;
		});
		
		return motoristaObj;
	}

	api.postVeiculoTrafegus = async function (objVeiculo) {

		let objRetorno = await api.formatObjVeiculo(objVeiculo);
		
		let veiculoObj = await axios({
			method: 'post',
			url: process.env.TRAFEGUS_URL + `veiculo`,
			headers: {
				'Content-Type': 'application/json',
				'authorization' : 'Basic ' + utils.cript(process.env.TRAFEGUS_LOGIN + `:` + process.env.TRAFEGUS_PASSWORD)
			},
			data: objRetorno
		}).then((result) => {
			return result;
		}).catch(function (err) {
			err.stack = new Error().stack + `\r\n` + err.stack;
		});
		
		return veiculoObj;
	}

	api.formatRetornoToJson = async function (retorno) {
		// - Remove a barra inicial inserida pela API do Trafegus (?)
		if(retorno != undefined){
			if ((typeof retorno.data) != 'object' ){
				if(retorno.data.charAt(0) == '/') {
					retorno.data = retorno.data.substring(1);
				}
			}else{
				return retorno.data;
			}
			// - Parse da String JSON
			return JSON.parse(retorno.data);
		}else{
			return retorno;
		}
	}

	api.sendTrafegus = async function (obj, api, method) {
		//console.log('Foi '+api);
		let obj2 = null;
		let url = "";
		if(method == "get") {
			obj2 = '?' + obj;
			obj = null;
			url = process.env.TRAFEGUS_URL + api + obj2;
		}else{
			url = process.env.TRAFEGUS_URL + api;
		}

		let retorno = await axios({
			method: method,
			url: url,
			headers: {
				'Content-Type': 'application/json',
				'authorization' : 'Basic ' + utils.cript(process.env.TRAFEGUS_LOGIN + `:` + process.env.TRAFEGUS_PASSWORD)
			},
			data: obj
		}).then((result) => {
			return result;
		}).catch(function (err) {
			err.stack = new Error().stack + `\r\n` + err.stack;
		});
		//let teste = await api.formatRetornoToJson(retorno.data);
		//console.log(teste);
		return retorno;
	}

	api.manageTransportadora = async function (CJTRANSP) {
		//- Verifico se existe uma transportadora cadastrada no Trafegus
		let isExists = await api.getTransportadoraTrafegus(CJTRANSP);
		
		// - Formato o retorno pra objeto JSON
		let retorno = await api.formatRetornoToJson(isExists);
		// - Verifica se existe Transportadora no Trafegus
		if (retorno == undefined || retorno.transportador == null) {
			// - Busco as viagens para serem importadas.
			let objTransportadora = await dao.getTransportadora(CJTRANSP)
				.then((result) => {
					return result;
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
					//next(err);
				});

			if(objTransportadora != undefined){
				// - Cria a Transportadora no Trafegus
				let result = await api.postTransportadoraTrafegus(objTransportadora);
				result = await api.formatRetornoToJson(result);
				if (result.status == 201) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		}
		
		return true;
	}

	api.manageMotorista = async function (CJMOTORI) {
		//- Verifico se existe uma Motorista cadastrada no Trafegus
		let isExists = await api.getMotoristaTrafegus(CJMOTORI);
		
		// - Formato o retorno pra objeto JSON
		let retorno = await api.formatRetornoToJson(isExists);
		// - Verifica se existe Motorista no Trafegus
		if (retorno != undefined && retorno.motorista == null) {
			// - Busco as viagens para serem importadas.
			let objMotorista = await dao.getMotorista1(CJMOTORI)
				.then((result) => {
					return result;
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
					//next(err);
				});
			if(objMotorista != undefined){
				// - Cria a Motorista no Trafegus
				let result = await api.postMotoristaTrafegus(objMotorista);
				result = await api.formatRetornoToJson(result);
				if (result.status == 201) {
					return true;
				} else {
					//res.status(200).send({ message: result.data.error[0].mensagem });
					return false;
				}
			} else {
				//res.status(200).send({ message: result.data.error[0].mensagem });
				return false;
			}
		}
		
		return true;
	}

	api.manageVeiculo = async function (NRPLACA) {
		//- Verifico se existe uma Veiculo cadastrada no Trafegus
		let isExists = await api.getVeiculoTrafegus(NRPLACA);
		
		// - Formato o retorno pra objeto JSON
		let retorno = await api.formatRetornoToJson(isExists);
		// - Verifica se existe Veiculo no Trafegus
		if (retorno != undefined && retorno.veiculo == null) {
			// - Busco as viagens para serem importadas.
			let objVeiculo = await dao.getVeiculo1(NRPLACA)
				.then((result) => {
					return result;
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
					//next(err);
				});

			if(objVeiculo != undefined){
				// - Cria a Veiculo no Trafegus
				let result = await api.postVeiculoTrafegus(objVeiculo);
				result = await api.formatRetornoToJson(result);
				if (result.status == 201) {
					return true;
				} else {
					return false;
				}
			}else{
				return false;
			}
		}
		
		return retorno;
	}

	api.salvarViagem = async function (req, res, next) {
		try {
			let responseTrafegus = null;
			let responseCarga = null;
			let viagemEvolog = null;
			var cod_viagem = "";
			// - Busco as viagens para serem importadas.
			let arViagens = await dao.getViagens(req, res, next)
				.then((result) => {
					return result;
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
					//next(err);
				});
			
			
		
			// - Verifico se possui viagens para serem importadas.
			if (Array.isArray(arViagens) && arViagens.length > 0) {
				// - Percorrendo as cargas filtradas

				// let canProceed = await api.validateFields('item');
				for (let i = 0; i < arViagens.length; i++){

					// - Começo a criar o objeto para subir para API
					let objEnviarViagem = { "viagem": []};
					let viagens = [];


					let objSingleViagem = {};
					let snTerminal = false;

					let canProceed = await api.validateFields(arViagens[i]);

					if (canProceed) {

						objSingleViagem.viag_codigo_externo 	= arViagens[i].IDG046;
						objSingleViagem.viag_numero_manifesto 	= `` + arViagens[i].IDG046 + ``  ;
						objSingleViagem.viag_valor_carga 		= arViagens[i].VRCARGA;
						objSingleViagem.viag_descricao_carga 	= arViagens[i].DSCARGA;
						objSingleViagem.documento_transportador = arViagens[i].CJTRANSP;
						objSingleViagem.viag_pgpg_codigo 		= arViagens[i].PGR_VIAGEM;
						objSingleViagem.viag_ttra_codigo 		= 12;
						objSingleViagem.viag_previsao_inicio 	= arViagens[i].DTPRESAI;
						objSingleViagem.rota_codigo 			= null;
						objSingleViagem.viag_carregado = 'S';

						let transportadoraObj = await api.manageTransportadora(arViagens[i].CJTRANSP);

						if(arViagens[i].CJMOTORI0 != null){
							let motoristaObj  = await api.manageMotorista(arViagens[i].CJMOTORI0);
							objSingleViagem.motoristas 				= await api.prepareMotoristas(arViagens[i]);
						}

						let veiculoObj 		  = await api.manageVeiculo(arViagens[i].NRPLAVEI0);

						if(typeof veiculoObj === 'object'){
							if(veiculoObj.veiculo != undefined && veiculoObj.veiculo.terminais != undefined && veiculoObj.veiculo.terminais.length > 0){
								snTerminal = true;
							}
						}

						//# placa carreta - futuramente usar tbm a DSPLACAR;
						if(arViagens[i].DSPLACAR2){
							let veiCarAux = null;
							let veiAux = arViagens[i].DSPLACAR2.split(',');
							for (let k = 0; k < veiAux.length; k++) {
								arViagens[i]['NRPLACAR'+k] = veiAux[k];
								veiCarAux = await api.manageVeiculo(veiAux[k]);
								//# não é necessario validar carreta vinculada
								// if(typeof veiCarAux === 'object'){
								// 	if(veiculoObj.veiculo != undefined && veiculoObj.veiculo.terminais != undefined && veiculoObj.veiculo.terminais.length > 0){
								// 		snTerminal = true;
								// 	}
								// }

							}
						}

						//# Não subir SM, caso nenhum veiculo tenha terminal
						if(snTerminal == true){

						
							objSingleViagem.ajudantes 				= await api.prepareAjudantes(arViagens[i]);
							objSingleViagem.veiculos 				= await api.prepareVeiculos(arViagens[i]);
							objSingleViagem.origem 					= await api.prepareOrigem(arViagens[i]);
							objSingleViagem.destino 				= await api.prepareDestino(arViagens[i]);
							objSingleViagem.locais 				    = await api.prepareLocais(arViagens[i].IDG046);

							/*
							let rotas = await api.buscarRotas();
							let ori   = null;
							let des   = null;

							for (let y = 0; y < rotas.length; y++){

								ori = (rotas[y].pontos_rota.length >= 1 ? rotas[y].pontos_rota[0].descricao_local : 0);
								des = (rotas[y].pontos_rota.length >= 1 ? rotas[y].pontos_rota[rotas[y].pontos_rota.length-1].descricao_local : 0);

								if(ori == arViagens[i].IBGEOR && des == arViagens[i].IBGEDE){
								objSingleViagem.rota_codigo = rotas[y].id_rota;
								break;
								}

							}
							*/

							// if(objSingleViagem.rota_codigo == null){
							// 	res.status(200).send({ message: 'Rota não encontrada'+arViagens[i].IBGEOR+"x"+arViagens[i].IBGEDE});
							// }
							
							viagens.push(objSingleViagem);
							viagemEvolog = objSingleViagem.viag_codigo_externo;

							objEnviarViagem.viagem = viagens;
							responseTrafegus = await api.sendTrafegus(objEnviarViagem, 'viagem', 'post');

							var objReturn = {};
							if(responseTrafegus.data.success != undefined && responseTrafegus.data.error != undefined ){
								if(responseTrafegus.data.success.length){
									cod_viagem = cod_viagem + responseTrafegus.data.success[0].cod_viagem + ",";
									responseCarga = await dao.setCodigoTrafegus(viagemEvolog,responseTrafegus.data.success[0].cod_viagem);
									console.log("success",viagemEvolog);
									objReturn = {
										IDS032:11,
										IDS001:169,
										STATREQ:"Sucesso -"+viagemEvolog,
										STATDETA: "S",
										TXMENSAG: viagemEvolog,
										CDRETORN: responseTrafegus.data.success[0].cod_viagem
									};
					
								}else if(responseTrafegus.data.error.length){
									objReturn = {
										IDS032:11,
										IDS001:169,
										STATREQ:"Erro - "+viagemEvolog,
										STATDETA: "E",
										TXMENSAG: responseTrafegus.data.error[0].mensagem + ": "+responseTrafegus.data.error[0].valor+" - Carga: "+objSingleViagem.viag_codigo_externo,
										CDRETORN: ""
									};
									console.log("errooo", viagemEvolog, objEnviarViagem);
									console.log(responseTrafegus.data.error[0].valor, responseTrafegus.data.error[0].mensagem, objSingleViagem.viag_codigo_externo);
								}
							}else{
								objReturn = {
									IDS032:11,
									IDS001:169,
									STATREQ:"Erro - "+viagemEvolog,
									STATDETA: "E",
									TXMENSAG: "Erro inesperado",
									CDRETORN: ""
								};
								console.log("errooo-inesperado",viagemEvolog, responseTrafegus.data);
								console.log(objEnviarViagem);
							}
						
						}else{
							objReturn = {
								IDS032:11,
								IDS001:169,
								STATREQ:"Erro - "+viagemEvolog,
								STATDETA: "E",
								TXMENSAG: "Erro - Terminal não encontrado",
								CDRETORN: ""
							};
							console.log("errooo-Terminal não encontrado",viagemEvolog);
							console.log(objEnviarViagem);
							
						}

						responseCarga = await dao.setMovInterface(objReturn);

					}

				}
			} else {
				//res.status(200).send({ message: 'Não foi encontrado viagens.' });
				console.log('Não foi encontrado viagens.');
				return true;
			}
			
			//res.status(200).send({ message: 'Viagens trafegus:'+cod_viagem.substr(0, cod_viagem.length-1)});
			console.log('fim salvarViagem');
			res.status(200).send({ message: 'OK'});
			return true;

		} catch (err) {
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		}
	};

	api.salvarVeiculo = async function (req, res, next) {
		try {
			// O tpSalvar pode ser 'S' de salvar ou 'U' Atualizar "Update".
			let tpSalvar = req.body.tpSalvar;
			let arVeiculos = await dao.getVeiculos(req.body.arVeiculos) // arVeiculos vem como "310,309"
				.then((result) => {
					return result;
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
					//next(err);
				});
			if (Array.isArray(arVeiculos) && arVeiculos.length > 0) {
				let objEnviarVeiculo = { "veiculo": [] };
				let retorno = null;
				if (tpSalvar == 'S') {
					objEnviarVeiculo.veiculo = arVeiculos;
					retorno = await api.sendTrafegus(objEnviarVeiculo, 'veiculo', 'post');
				} else {
					objEnviarVeiculo.veiculo = arVeiculos[0];
					retorno = await api.sendTrafegus(arVeiculos[0], 'veiculo/'+objEnviarVeiculo.veiculo.placa.replace(" ", ""), 'put');
				}
				res.json( JSON.parse(retorno.data.replace("/{", "{")) );
			} else {
				res.status(500).send({ armensag: 'Não foi encontrado veículos.' });
			}
			
			
		} catch (err) {
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		}
	}

	api.salvarMotorista = async function (req, res, next) {
		try {
			// O tpSalvar pode ser 'S' de salvar ou 'U' Atualizar "Update".
			let tpSalvar = req.body.tpSalvar;
			let arMotoristas = await dao.getMotoristas(req.body.arMotorista) // arMotorista vem como '1919, 1918'
				.then((result) => {
					return result;
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
					//next(err);
				});
			if (Array.isArray(arMotoristas) && arMotoristas.length > 0) {
				let objEnviarMotorista = { "motorista": [] };
				let retorno = null;
				if (tpSalvar == 'S') {
					objEnviarMotorista.motorista = arMotoristas;
					retorno = await api.sendTrafegus(objEnviarMotorista, 'motorista', 'post');
				} else {
					objEnviarMotorista.motorista = arMotoristas[0];
					retorno = await api.sendTrafegus(null, 'motorista/' + objEnviarMotorista.motorista.cpf_motorista.replace("-", ""), 'get');
					//console.log(retorno);
					retorno = await api.sendTrafegus(arMotoristas[0], 'motorista/'+JSON.parse(retorno.data.replace("/{", "{")).motorista.codigo, 'put');
				}
				res.json( JSON.parse(retorno.data.replace("/{", "{")) );
			} else {
				res.status(500).send({ armensag: 'Não foi encontrado motoristas.' });
			}
			
			
		} catch (err) {
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		}
	}

	api.salvarTransportadora = async function (req, res, next) {
		try {
			// O tpSalvar pode ser 'S' de salvar ou 'U' Atualizar "Update".
			let tpSalvar = req.body.tpSalvar;
			let arTransportadoras = await dao.getTransportadoras(req.body.arTransportadora) // arTransportadora vem como '1919, 1918'
				.then((result) => {
					return result;
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
					//next(err);
				});
			if (Array.isArray(arTransportadoras) && arTransportadoras.length > 0) {
				let objEnviarTransportadora = { "transportador": [] };
				let retorno = null;
				if (tpSalvar == 'S') {
					objEnviarTransportadora.transportador = arTransportadoras;
					retorno = await api.sendTrafegus(objEnviarTransportadora, 'transportador', 'post');
				} else {
					objEnviarTransportadora.transportador = arTransportadoras[0];
					retorno = await api.sendTrafegus(null, 'transportador/' + objEnviarTransportadora.transportador.documento_transportador, 'get');
					//console.log(retorno);
					retorno = await api.sendTrafegus(arTransportadoras[0], 'transportador/'+JSON.parse(retorno.data.replace("/{", "{")).transportador.codigo, 'put');
				}
				res.json( JSON.parse(retorno.data.replace("/{", "{")) );
			} else {
				res.status(500).send({ armensag: 'Não foi encontrado transportadoras.' });
			}
			
			
		} catch (err) {
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		}
	}

	api.buscarEventos = async function (req, res, next) {
		
		var aux = null;
		aux = await dao.getltimoMovimento(12);

		let eventosObj = await axios({
			method: 'get',
			url: process.env.TRAFEGUS_URL + `eventos?UltCodigo=`+aux,
			headers: {
				'Content-Type': 'application/json',
				'authorization' : 'Basic ' + utils.cript(process.env.TRAFEGUS_LOGIN + `:` + process.env.TRAFEGUS_PASSWORD)
			}
		}).then((result) => {
			return result;
		}).catch(function (err) {
			err.stack = new Error().stack + `\r\n` + err.stack;
		});

		
		aux = await dao.setEventos(eventosObj.data);
		//res.json(eventosObj.data.eventos);
		console.log('fim buscarEventos');
		return eventosObj;
	}

	api.buscarViagem = async function (req, res, next) {
		
		
		let viagemObj = await axios({
			method: 'get',
			url: process.env.TRAFEGUS_URL + `viagem?UltCodigo=1`,
			headers: {
				'Content-Type': 'application/json',
				'authorization' : 'Basic ' + utils.cript(process.env.TRAFEGUS_LOGIN + `:` + process.env.TRAFEGUS_PASSWORD)
			}
		}).then((result) => {
			return result;
		}).catch(function (err) {
			err.stack = new Error().stack + `\r\n` + err.stack;
		});

		res.json( JSON.parse(viagemObj.data.replace("/{", "{"))  );
		return viagemObj;
	}

	api.setAtualizarStatusViagem = async function (status, IdViagem) {
		
		/*
			Os status permitidos para alteração da viagem são: 
			1 = Efetivada; 2 = Cancelada; 5 = Finalizada 
			(quaisquer outros códigos serão rejeitados pelo webservice).
		*/

		//let IdViagem = null;
		let obj = {};
		obj.status_viagem = {};

		obj.status_viagem.id_novo_status = status;
		//IdViagem = 15157;

		let viagemObj = await axios({
			method: 'put',
			url: process.env.TRAFEGUS_URL + `viagem/`+IdViagem,
			headers: {
				'Content-Type': 'application/json',
				'authorization' : 'Basic ' + utils.cript(process.env.TRAFEGUS_LOGIN + `:` + process.env.TRAFEGUS_PASSWORD)
			},
			data: obj
		}).then((result) => {
			return result;
		}).catch(function (err) {
			err.stack = new Error().stack + `\r\n` + err.stack;
		});

		//res.json( viagemObj.data );
		return viagemObj;
	}




	api.atualizarStatusViagem = async function (req, res, next) {
		
		/*
			Os status permitidos para alteração da viagem são: 
			1 = Efetivada; 2 = Cancelada; 5 = Finalizada 
			(quaisquer outros códigos serão rejeitados pelo webservice).
		*/

		let IdsViagem = [

			];
		let status    = 2;
		let retorno   = null;

		for (let i = 0; i < IdsViagem.length; i++) {
			IdsViagem[i];
			retorno = await api.setAtualizarStatusViagem(status,IdsViagem[i]);
		}
		res.json( 'true' );
		return 'OK';
	}



	api.buscarUltimaPosicaoVeiculo = async function (req, res, next) {
		//return true;
		var auxID = null;
		auxID = await dao.getltimoMovimento(13);
		//ultimaPosicaoVeiculo?IdPosicao=1&Documento=00950001000105&Placa=PYC5712
		let posicaoObj = await axios({
			method: 'get',
			url: process.env.TRAFEGUS_URL + `ultimaPosicaoVeiculo?IdPosicao=`+auxID+`&Documento=00950001000105`,
			headers: {
				'Content-Type': 'application/json',
				'authorization' : 'Basic ' + utils.cript(process.env.TRAFEGUS_LOGIN + `:` + process.env.TRAFEGUS_PASSWORD)
			}
		}).then((result) => {
			return result;
		}).catch(function (err) {
			err.stack = new Error().stack + `\r\n` + err.stack;
		});

		//res.json(posicaoObj.data.Posicao);


		/*

			"DataBordo": "2019-02-21 08:13:33",
			"DataCadastro": "2019-02-21 08:13:39",
			"DataTecnologia": "2019-02-21 08:13:34",
			"DescricaoSistema": "0,098 KM DE P. BUFFON - SANTA RITA/RS",
			"DescricaoTecnologia": "FILIAL BRAVO (PAULINIA-SP)",
			"IdViagem": null,
			"Ignicao": "0",
			"Latitude": "-29.8472883333",
			"Longitude": "-51.2735033333",
			"NumeroTerminal": "IWB5899-2",
			"Odometro": "0",
			"Placa": "IWB5899",
			"RPM": "0",
			"Tecnologia": "SASCAR",
			"Velocidade": 0,
			"idPosicao": 89537263
		
		*/


		let posicao    = null;
		let objVeiculo = null;
		let aux 	   = null;
		var idEvento   = 0;

		for (let i = 0; i < posicaoObj.data.Posicao.length; i++) {

			posicao = posicaoObj.data.Posicao[i];
			idEvento = (posicao.idPosicao > idEvento ? posicao.idPosicao : idEvento);
			if(posicao.IdViagem != null){

				objVeiculo = null;
				objVeiculo = await dao.getVeiculo1(posicao.Placa);

				if(objVeiculo != undefined){
					if(objVeiculo.CDPOSTRA == undefined || posicao.idPosicao > objVeiculo.CDPOSTRA){
						//aux = await dao.getVeiculo1(posicao.Placa);
						aux = await dao.setCodigoPosicaoVeiculoTrafegus(objVeiculo.IDG032, posicao);
						aux = await dao.setPosicaoVeiculo(objVeiculo.IDG032, posicao);
					}
				}else{
					console.log('Veiculo não encontrado');
				}
			}else{
				console.log('Sem código de viagem');
			}
		}

		objReturn = {
			IDS032:13,
			IDS001:169,
			STATREQ:"Sucesso",
			STATDETA: "S",
			TXMENSAG: "Sucesso",
			CDRETORN: idEvento
		};
		aux = await dao.setMovInterface(objReturn);


		return true;
	}

	api.buscarRotas = async function () {
		//&RotaCodigo=13
		console.log('process.env.TRAFEGUS_URLB >>>>>>>>>>>', process.env.TRAFEGUS_URLB);
		let posicaoObj = await axios({
			method: 'get',
			url: process.env.TRAFEGUS_URLB + `rota?UltCodigo=1&RotaCodigo=4346`,
			headers: {
				'Content-Type': 'application/json',
				'authorization' : 'Basic ' + utils.cript(process.env.TRAFEGUS_LOGIN + `:` + process.env.TRAFEGUS_PASSWORD)
			}
		}).then((result) => {
			console.log('ok >>>>>>>>>>>', result);
			return result;
		}).catch(function (err) {
			console.log('erro >>>>>>>>>>>', err);
			err.stack = new Error().stack + `\r\n` + err.stack;
		});
		// res.json({id:"aa"});
		// res.json(posicaoObj.data.rotas);
		
		return posicaoObj.data.rotas;
	}



	return api;
}