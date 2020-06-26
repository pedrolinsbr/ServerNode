module.exports = function (app, cb) {

	const dao 	  		= app.src.modWarehouse.dao.CockpitDAO;

	const daoInv	  	= app.src.modWarehouse.dao.InventarioDAO;

	const utilsWare 	= app.src.utils.Warehouse;
	const sapBravo 		= app.src.modWarehouse.controllers.SapBravoController;
	const daoCommon 	= app.src.modWarehouse.dao.CommonDAO;


	var api = {};

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.listarShipments = async function (req, res, next) {

		try {


			if(!req.body.params){
				req.body.params = {};
				req.body.params.TPPROCES = req.body.TPPROCES;
				req.body.params.STETAPA = req.body.STETAPA;
			}


			//=:=:=:=:=:=:=:=:VALIDACÕES=:=:==:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:
			var blOk  = true;
			var error = {};

			if (!req.body.params.TPPROCES){
				blOk  = false;
				error = `'TPPROCES' não enviado`;
			}

			else if(req.body.params.TPPROCES.toUpperCase() != "O" && req.body.params.TPPROCES.toUpperCase() != "I"){
				blOk = false;
				error = `'TPPROCES:' '${req.body.params.TPPROCES}' não existe`;
			}

			else if (!req.body.params.STETAPA){
				blOk  = false;
				error = `'STETAPA' não enviado`;
			}

			else if (req.body.params.STETAPA < 1 || req.body.params.STETAPA > 7 ){
				blOk  = false;
				error = `'STETAPA': ${req.body.STETAPA} não existe`;
			}

			else if (req.body.pageNumber == undefined){
				blOk  = false;
				error = `'pageNumber' não enviado'`;
			}

			else if (!req.body.size){
				blOk  = false;
				error = `'size' não enviado'`;
			}
			//=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=


			if(blOk){
				req.objConn = await dao.controller.getConnection();

				var rs = await dao.listarShipments(req, res, next);
				await req.objConn.close();

				res.send(utilsWare.formatDataGrid(rs, req));
			} else{
				utilsWare.erros(error, error, res);
			}

		} catch (err) {
			utilsWare.erros("Erro ao buscar Shipments", err, res);

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.listarDeliveries = async function (req, res, next) {

		try {


			//req.objConn = await dao.controller.getConnection();

			var rs = await dao.listarDeliveries(req, res, next);

			/* var arIDW001 = []
			for(i of rs){
				arIDW001.push(i.IDW001)
			} */

			//var parms = {}
			//parms.objCoon = req.objConn;
			//parms.arIDW001 = arIDW001;

			rs.forEach(e => {
				(e.STRESERV == 1 && !!e.IDW001) ? e.DELIVSAP = utilsWare.customizarDeliverySap(e.IDW001) : '';
				(e.STRESERV == 1 && !!e.IDW005) ? e.NRDOCTRA = utilsWare.customizarDocTransporte(req.body.params.TPPROCES, e.IDW005) : '';
			});



			for (i of rs){

				 i.MILESTAT = [];

				 if(i.GRB){
					i.MILESTAT.push({name:'GRB', value: true})
				 }

				 if(i.GRL){
					i.MILESTAT.push({name:'GRL', value: true})
				 }

				 if(i.GRW){
					i.MILESTAT.push({name:'GRW', value: true})
				 }

				 if(i.PGR){
					i.MILESTAT.push({name:'PGR', value: true})
				 }

			}






			//if(arIDW001.length){
				//var milestonesIcons = await dao.buscarMilestones(parms, res, next);
				//var dados = utilsWare.gerarIconesMilestones(rs, milestonesIcons);
			//}

			//await req.objConn.close();

			if(rs){
				res.send(utilsWare.formatDataGrid(rs, req));
			} else {
				res.send({});
			}



		} catch (err) {


			//await req.objConn.closeRollback();

			var error = {};
			error.message = "Erro ao buscar deliveries";
			if (process.env.DEBUG && process.env.DEBUG == 1) {
				error.err = err.message;
			}
			res.send({ status: "error", message: err.message });

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.calcularCards = async function (req, res, next) {

		try {

			//req.objConn = await dao.controller.getConnection();

			if(req.body.TPPROCES == 'V'){

				var rs = await daoInv.calcularCards(req, res, next);

			} else {

				var rs = await dao.calcularCards(req, res, next);

			}

			//await req.objConn.close();

			res.send(rs[0]);

		} catch (err) {

			if (req.objConn) {
				//await req.objConn.closeRollback();
			}

			var error = {};
			error.message = "Erro ao calcular cards";
			if (process.env.DEBUG && process.env.DEBUG == 1) {
				error.err = err.message;
			}
			res.send(error);
		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.calcularCardsTp = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			var rs = await dao.calcularCardsTp(req, res, next);

			await req.objConn.close();

			res.send(rs[0]);

		} catch (err) {

			var error = {};
			error.message = "Erro ao calcular cards";
			if (process.env.DEBUG && process.env.DEBUG == 1) {
				error.err = err.message;
			}
			res.send(error);
		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.importarDelivery = async function (req, res, next) {

		req.objConn = await dao.controller.getConnection();

		var rs = await dao.buscarDelivery(req, res, next);

		/*
		if (rs.length > 0) {
			await dao.updateDelivery(req, res, next);
		} else {
			await dao.inserirDelivery(req, res, next);
		}
		*/

		await req.objConn.close();

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.inserirPreAsn = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			var buscarCarga = await dao.buscarCarga(req, res, next);

			var erro = '';
			var blOk = (buscarCarga.length > 0);

			if (blOk) {

				req.carga = buscarCarga[0];

				var inserirCarga = await dao.inserirCarga(req, res, next);

				blOk = (buscarCarga.length > 0);

				if (blOk) {

					req.body.IDW002 = inserirCarga.id;
					await dao.inserirDeliveries(req, res, next);

				} else {

					erro = "Erro ao inserir a carga";

				}

			} else {

				erro = "Delivery não encontrada";

			}

			await req.objConn.close();

			if (blOk) {
				res.status(200).send({ message: "Pré ASN inserido com sucesso!" });
			} else {
				res.status(500).send({ message: erro });

			}

		} catch (err) {

			await req.objConn.closeRollback();
			res.status(500).send({ message: "Erro" });

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.trocarStatus = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			if (req.body.IDW002 == undefined) {
				req.body.IDW002 = []
				var buscaShipmentPorDelivery = await (dao.buscaShipmentPorDelivery(req));

				for(i of buscaShipmentPorDelivery ){
					req.body.IDW002.push(i.IDW002)
				}
			}

			await dao.trocarStatus(req, res, next);

			await req.objConn.close();

			if(req.body.SOAP){
				return { message:"success" }

			} else {
				res.status(200).send({ message: "OK" });
			}


		} catch (err) {

			var error = {};
			error.message = "Erro ao buscar detalhes da delivery";
			if (process.env.DEBUG && process.env.DEBUG == 1) {
				error.err = err.message;
			}
			res.status(500).send(error);

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.atualizarStatus = async function (req, res, next) {

		if (req.body.IDW002 == undefined) {
			req.body.IDW002 = []
			var buscaShipmentPorDelivery = await (dao.buscaShipmentPorDelivery(req));

			for (i of buscaShipmentPorDelivery) {
				req.body.IDW002.push(i.IDW002);
			}
		}
		await dao.atualizarStatus(req, res, next);

		return { message: "success" }

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.atualizarStatusNew = async function (req, res, next) {


		try {

			req.objConn = await dao.controller.getConnection();

			await dao.atualizarStatusNew(req, res, next);

			await req.objConn.close();

			return { message: "success" }

		} catch (error) {

			if(req.objConn){
				req.objConn.closeRollback();
			}

		}



	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.listarItensDelivery = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			var rs = await dao.listarItensDelivery(req, res, next);

			res.send(utilsWare.formatDataGrid(rs, req));

		} catch (err) {

			var error = {};
			error.message = "Erro ao buscar detalhes da delivery";
			if (process.env.DEBUG && process.env.DEBUG == 1) {
				error.err = err.message;
			}
			res.send(error);

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\


	api.mapaDelivery = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			var itens = await dao.mapaDelivery(req, res, next);

			await req.objConn.close();

			res.status(200).send(itens);

		} catch (err) {

			var error = {};
			error.message = "Erro ao gerar mapa das deliveries";
			if (process.env.DEBUG && process.env.DEBUG == 1) {
				error.err = err.message;
			}
			res.status(500).send(error);

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.updateTransp = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			var result = await dao.updateTransp(req, res, next);

			await req.objConn.close();

			res.status(200).send(result);

		} catch (err) {

			var error = {};
			error.message = "Erro ao Atualizar transportadora";
			if (process.env.DEBUG && process.env.DEBUG == 1) {
				error.err = err.message;
			}
			res.status(500).send(error);

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.updateItens = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			await dao.updateItens(req, res, next);

			await dao.updateLote(req, res, next);

			await req.objConn.close();

			res.send({ message: 'ok' });

		} catch (err) {

			var error = {};
			error.message = "Erro ao atualizar itens";
			if (process.env.DEBUG && process.env.DEBUG == 1) {
				error.err = err.message;
			}
			res.status(500).send(error);

		}

	}
	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.reservarSaldo = async function (req, res, next) {
// aqui
		try {

			var blOk = true;
			var error = {};

			//=-=-=-=-=-==validações=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=
			if(req.body.STRESERV == undefined){
				blOk = false;
				error.message = "'STRESERV' não informado";
			}

			else if(req.body.STRESERV != 0 && req.body.STRESERV != 1){
				blOk = false;
				error.message = `'STRESERV' ${req.body.STRESERV} não existe`;
			}

			else if(!req.body.TPPROCES){
				blOk = false;
				error.message = `'TPPROCES' não informado`;
			}

			else if(req.body.TPPROCES.toUpperCase() != "O" && req.body.TPPROCES.toUpperCase() != "I"){
				blOk = false;
				error.message = `'STRESERV' ${req.body.STRESERV} não existe`;
			}

			else if( !req.body.IDW001 || !req.body.IDW001.length) {
				blOk = false;
				error.message = `'IDW001 ou IDW002' não enviados`;
			}

			//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=

			if(blOk){

				if (req.body.IDW001[0] == null){
					req.body.IDW001 = [];
				}

				req.objConn = await dao.controller.getConnection();

				var rs = await api.reservarSaldoSAP(req, res, next);

				if(rs.deliveriesUpdate.length){
					req.body.arIDW001 = rs.deliveriesUpdate;
				 	await dao.reservarSaldo(req, res, next);
				}

				//timeline
				// var timeline = {};
				// timeline.NRKEY = req.body.IDW001[0];
				// timeline.STEVENT = 1;
				// timeline.DSKEY = id;
				// timeline.DSDESC = `O saldo da delivery => ${id} foi reservado MANUALMENTE com sucesso!`;
				// await daoCommon.timelineAdd(timeline);

				req.objConn.close();
				res.status(201).send(rs.resp);

			}
			else {
				//timeline
				// var timeline = {};
				// timeline.NRKEY = req.body.IDW001;
				// timeline.STEVENT = 1;
				// // timeline.DSKEY = id;
				// timeline.DSDESC = `Não foi possivel reservar MANUALMENTE o saldo da delivery => ${req.body.IDW001}`;
				// await daoCommon.timelineAdd(timeline);

				req.objConn.closeRollback();
				res.status(201).send({status:"error", message: "Erro ao reservar saldo!", err:error.message});
			}

		} catch (error) {

			//timeline
			// var timeline = {};
			// timeline.NRKEY = req.body.IDW001;
			// timeline.STEVENT = 1;
			// timeline.DSKEY = 9000000000;
			// timeline.DSDESC = `Não foi possivel reservar MANUALMENTE o saldo da delivery => ${req.body.IDW001}`;
			// await daoCommon.timelineAdd(timeline);

			if(req.objConn){
				req.objConn.closeRollback();
			}
			res.status(201).send({status:"error", message: "Erro ao reservar saldo!", err:error.message});

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.reservarSaldoSAP = async function (req, res, next) {

			resp = [];
			deliveriesUpdate = [];

			if(req.body.TPPROCES.toUpperCase() == "O"){
				arDeliveries = await api.criarXMLRemessa(req, res, next);
			} else {
				arDeliveries = await api.criarXMLRecebimento(req, res, next);
			}

			for( var r of arDeliveries.arDeliveries){
				r.TPPROCES = req.body.TPPROCES
				var criarReservaSaldoSap = await sapBravo.criarReservaSaldoSap(r, res, next);

				 //criarReservaSaldoSap.EvOk = "X"
				 if(criarReservaSaldoSap.EvOk == "X"){
					let id;

					if(req.body.TPPROCES.toUpperCase() == "O"){
						id = r.IsCabecRemessaSr.Rfbel;
					} else {
						id = r.IsCabecReceb.Rfbel
					}

					//timeline
					// var timeline = {};
					// timeline.NRKEY = id;
					// timeline.STEVENT = 1;
					// timeline.DSKEY = id;
					// timeline.DSDESC = `O saldo da delivery => ${id} foi reservado AUTOMÁTICAMENTE com sucesso!`;
					// await daoCommon.timelineAdd(timeline);

					resp.push({ status:"success", id, message: `O Saldo da delivery ${id} foi reservado com sucesso!` });
					deliveriesUpdate.push(utilsWare.formatarIDW001(id));
				 }
				 else{
					var id;
					if(req.body.TPPROCES.toUpperCase() == "O"){
						id = r.IsCabecRemessaSr.Rfbel;
					} else {
						id = r.IsCabecReceb.Rfbel;
					}

					var message;
					aux = true;
					for (var ret of criarReservaSaldoSap.Return.item){
						if(aux && ret.Type == "E"){
							message = ret.Message;
							aux = false;
						}
					}

					//timeline
					// var timeline = {};
					// timeline.NRKEY = id;
					// timeline.STEVENT = 1;
					// timeline.DSKEY = id;
					// timeline.DSDESC = `Erro ao reservar saldo da delivery AUTOMÁTICAMENTE => ${id}!`;
					// await daoCommon.timelineAdd(timeline);

					resp.push({status: "error", id: utilsWare.formatarIDW001(id), message})
				 }
			}

			//req.body.arIDW001 = arDeliveries.arIDW001;

			return {resp, deliveriesUpdate}
	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\


	api.DtxTrocaPartileira = async function (req, res, next) {






	}



	api.criarDt = async function (req, res, next) {
// aqui
		try {

			resp = [];
			blOk = true;
			var message;
			req.body.STETAPA = 3;

			// var id001 = {};
			// id001.IDW001 = req.body.params.IDW001.join();
			// var CDOUBOUN = await dao.retornarOutbound(id001);
			// var outbound = CDOUBOUN[0].CDOUBOUN;


			req.objConn = await dao.controller.getConnection();

			var verificarShipmentDt = await dao.verificarShipmentDt(req);

			if(verificarShipmentDt.length > 0){
				blOk = false;
				message = `Deliveries vinculadas a outro DT: `;
				for (var i of verificarShipmentDt){
					message += `    ${i.CDOUBOUN} => ${req.body.TPPROCES}${i.IDW005} `
				}

				message += `O DT NÃO FOI CRIADO.`
			}

			if (blOk) {

				var IDW005 = await dao.criarShipment(req);

				req.body.params.IDW005 = IDW005.id;

				await dao.atualizarIDW005(req);

				arShipments = await api.criarXmlDt(req, res, next);

				/* 			var transp = await dao.buscarTranspEvolog(req);

							if(transp.length){ // inserir transportadora do evolog
								req.CJTRAEVO = transp[0].CJTRANSP;
								req.NMTRAEVO = transp[0].NMTRANSP;
								await salvarTranspEvolog(req)
								arShipments[0].IsShipHeader.CarrierId = transp[0].CJTRANSP
							} */

				var criarReservaDtSap = await sapBravo.criarDtSap(arShipments, res, next);

				if (criarReservaDtSap.EvOk == "X") {
					resp.push({ status: "success", message: "Documento de transporte criado com sucesso!" });
					await dao.atualizarStatusNew(req);

				}
				else {
					blOk = false;
					var id = 0;

					aux = true;
					for (var ret of criarReservaDtSap.Return.item) {
						if (aux && ret.Type == "E") {
							message = ret.Message;
							aux = false;
						}
					}
				}
			}



			if(blOk){
				//timeline
				// var timeline = {};
				// timeline.NRKEY = req.body.params.IDW001.join();
				// timeline.STEVENT = 1;
				// timeline.DSKEY = outbound;
				// timeline.DSDESC = `O Documento de Transporte => ${req.body.params.IDW001.join()} foi criado com sucesso.`;
				// await daoCommon.timelineAdd(timeline);

				await req.objConn.close();
				res.status(201).send(resp);
			} else {
				if(req.objConn){
					//timeline
					// var timeline = {};
					// timeline.NRKEY = req.body.params.IDW001.join();
					// timeline.STEVENT = 1;
					// timeline.DSKEY = outbound;
					// timeline.DSDESC = `O Documento de Transporte => ${req.body.params.IDW001.join()} foi criado MANUALMENTE com sucesso.`;
					// await daoCommon.timelineAdd(timeline);
					 await req.objConn.closeRollback();
				}
				res.status(201).send({ status: "error", message });
			}

		} catch (err) {
			//timeline
			// var timeline = {};
			// timeline.NRKEY = req.body.params.IDW001.join();
			// timeline.STEVENT = 1;
			// timeline.DSKEY = outbound;
			// timeline.DSDESC = `Erro durante criação de Documento de Transporte MANUAL => ${req.body.params.IDW001.join()}.`;
			// await daoCommon.timelineAdd(timeline);

			await req.objConn.closeRollback();
			res.status(201).send({ status: "error", message: err.message  });
		}
	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.criarXMLRecebimento = async function (req, res, next) {

		var deliveries = await dao.buscarRecebimentos(req, res, next);

		var arDeliveries = [];
		for (var d of deliveries) {

			if(d.NMSTOLOC == "SL75"){
				req.IDW001 = utilsWare.formatarIDW001(d.RFBEL);

				var werks = await dao.buscarWerks(req);
				d.WERKS = werks[0].IDKEY;
				d.LGORT = 'SEWM';
				d.STCD1 = "60744463008417";
			} else {
				d.LGORT = utilsWare.verificarDepositoBloqueado(d);
				d.CHARG = utilsWare.verificarLoteBloqueado(d); // formata lote bloqueado
			}

			var incluirCabec = true;
			var incluirItem = false;
			for (var i of arDeliveries) {

				if (d.RFBEL == i.IsCabecReceb.Rfbel) {
					incluirCabec = false;
					incluirItem = true;
				}

				if (incluirItem) {
					objItem = {}
					objItem = {
						Rfpos: d.RFPOS,
						Matnr: d.MATNR,
						Charg: d.CHARG,
						Vfdat: utilsWare.mudarDataValidade(d.VFDAT),
						Hsdat: d.HSDAT,
						Lfimg: parseFloat(d.LFIMG.toFixed(3)),
						Vrkme: d.VRKME,
						VrkmeIso: d.VRKMEISO,
						Werks: d.WERKS,
						Lgort: d.LGORT,
						Insmk: d.INSMK,
						Kdauf: d.KDAUF,
						Kdpos: d.KDPOS,
						Netwr: d.NETWR,
						Waerk: d.WAERK
					}

					i.ItItemReceb.item.push(objItem)
					incluirItem = false;
				}
			} //fim for i

			if (incluirCabec) {
				var args = {
					IsCabecReceb: {},
					ItItemReceb: {}
				};

				//header
				args.IsCabecReceb.Rfbel = d.RFBEL;
				args.IsCabecReceb.Lfart = d.LFART;
				args.IsCabecReceb.Lifex = d.LIFEX;
				args.IsCabecReceb.Stcd1 = d.STCD1;
				args.IsCabecReceb.Lfdat = d.LFDAT;
				args.IsCabecReceb.TpEmissao = d.TPEMISSAO;
				args.IsCabecReceb.Route = d.ROUTE;

				args.ItItemReceb.item = []

				objItem = {}
				objItem = {
					Rfpos: d.RFPOS,
					Matnr: d.MATNR,
					Charg: d.CHARG,
					Vfdat: utilsWare.mudarDataValidade(d.VFDAT),
					Hsdat: d.HSDAT,
					Lfimg: parseFloat(d.LFIMG.toFixed(3)),
					Vrkme: d.VRKME,
					VrkmeIso: d.VRKMEISO,
					Werks: d.WERKS,
					Lgort: d.LGORT,
					Insmk: d.INSMK,
					Kdauf: d.KDAUF,
					Kdpos: d.KDPOS,
					Netwr: d.NETWR,
					Waerk: d.WAERK
				}
				args.ItItemReceb.item.push(objItem);
				arDeliveries.push(args);

			} //fim incluirCabec
		}
		return {arDeliveries};
	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.criarXMLRemessa = async function (req, res, next) {

		var deliveries = await dao.buscarRemessas(req, res, next);

		var arDeliveries = [];
		for (var d of deliveries) {
			if(d.NMSTOLOC == "SL75"){
				req.IDW001 = utilsWare.formatarIDW001(d.RFBEL);

				var werks = await dao.buscarWerks(req);
				d.WERKS = werks[0].IDKEY;
				d.LGORT = 'SEWM';
				d.STCD1V = "60744463008417";
			} else {
				d.LGORT = utilsWare.verificarDepositoBloqueado(d);
				d.CHARG = utilsWare.verificarLoteBloqueado(d); // formata lote bloqueado
			}


			var incluirCabec = true;
			var incluirItem = false;
			for (var i of arDeliveries) {

				if (d.RFBEL == i.IsCabecRemessaSr.Rfbel) {
					incluirCabec = false;
					incluirItem = true;
				}

				if (incluirItem) {
					objItem = {}
					objItem = {
						Rfpos: d.RFPOS,
						Matnr: d.MATNR,
						Charg: d.CHARG,
						Lfimg: parseFloat(d.LFIMG.toFixed(3)),
						Vrkme: d.VRKME,
						VrkmeIso: d.VRKMEISO,
						Werks: d.WERKS,
						Lgort: d.LGORT,
						Waerk: d.WAERK,
						Noatp: d.NOATP // O que é? //em branco
					}

					args.ItItemRemessaSr.item.push(objItem)
					incluirItem = false;
				}
			} //fim for i

			if (incluirCabec) {
				var args = {
					IsCabecRemessaSr: {},
					ItItemRemessaSr: {}
				};

				//header
				args.IsCabecRemessaSr.Rfbel = d.RFBEL;
				args.IsCabecRemessaSr.Lfart = d.LFART;

				args.IsCabecRemessaSr.Vstel = d.VSTEL		// Posto de expedição? // em branco
				args.IsCabecRemessaSr.Vkorg = d.VKORG		// Organização de vendas? em branco
				args.IsCabecRemessaSr.Vtweg = d.VTWEG		// Canal de distribuição? em branco
				args.IsCabecRemessaSr.Spart = d.SPART		// Setor de atividade? em branco

				args.IsCabecRemessaSr.Lifex = d.LIFEX; //número da nota e série "-"
				args.IsCabecRemessaSr.Stcd1V = d.STCD1V;	//remetente
				args.IsCabecRemessaSr.Stcd1C = d.STCD1C;	//destinatario
				args.IsCabecRemessaSr.Lfdat = d.LFDAT;

				args.IsCabecRemessaSr.Lfuhr = d.LFUHR;	// hora da remessa?

				args.IsCabecRemessaSr.Route = d.ROUTE; // Z00001
				args.IsCabecRemessaSr.Ofull = d.OFULL; // fornecer completamente /

				args.ItItemRemessaSr.item = []

				objItem = {}
				objItem = {
					Rfpos: d.RFPOS,
					Matnr: d.MATNR,
					Charg: d.CHARG,
					Lfimg: parseFloat(d.LFIMG.toFixed(3)),
					Vrkme: d.VRKME,
					VrkmeIso: d.VRKMEISO,
					Werks: d.WERKS,
					Lgort: d.LGORT,
					Waerk: d.WAERK,
					Noatp: d.NOATP // O que é? //em branco
				}
				args.ItItemRemessaSr.item.push(objItem);
				arDeliveries.push(args);

			} //fim incluirCabec
		}
		return {arDeliveries};
	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\


	api.criarXmlDt = async function (req, res, next) {


		var deliveries = await dao.buscarDt(req, res, next);

		var arDeliveries = [];
		for (var d of deliveries) {

			var incluirCabec = true;
			var incluirItem = false;
			for (var i of arDeliveries) {

				if (d.SHIPMENTNUM == i.IsShipHeader.ShipmentNum) {
					incluirCabec = false;
					incluirItem = true;
				}

				if (incluirItem) {
					objItem = {}
					objItem = {
						Delivery: d.DELIVERY,
						Itenerary: d.ITENERARY
					}
					i.ItItemdata.item.push(objItem)
					incluirItem = false;
				}
			} //fim for i

			if (incluirCabec) {
				var args = {
					IsShipHeader: {},
					ItItemdata: {}
				};

				//header
				args.IsShipHeader.ShipmentNum = d.SHIPMENTNUM;
				args.IsShipHeader.ShipmentType = d.SHIPMENTTYPE;

				args.IsShipHeader.TransPlanPt = d.TRANSPLANPT
				args.IsShipHeader.ShipmentRoute = d.SHIPMENTROUTE
				args.IsShipHeader.ContainerId = req.body.params.PLACA;
				args.IsShipHeader.ShipMat = d.SHIPMAT

				args.IsShipHeader.CarrierId = d.CARRIERID;
				args.IsShipHeader.Dpreg = d.DPREG;
				args.IsShipHeader.Upreg = d.UPREG;
				args.IsShipHeader.Dplbg = d.DPLBG;
				args.IsShipHeader.Uplbg = d.UPLBG;
				args.IsShipHeader.Dplen = d.DPLEN;
				args.IsShipHeader.Uplen = d.UPLEN;
				args.IsShipHeader.Dpabf = d.DPABF;
				args.IsShipHeader.Upabf = d.UPABF;
				args.IsShipHeader.Dptbg = d.DPTBG;
				args.IsShipHeader.Uptbg = d.UPTBG;
				args.IsShipHeader.Dpten = d.DPTEN;
				args.IsShipHeader.Upten = d.UPTEN;
				args.IsShipHeader.Iftyp = d.IFTYP;

				args.ItItemdata.item = []

				objItem = {}
				objItem = {
					Delivery: d.DELIVERY,
					Itenerary: d.ITENERARY
				}
				args.ItItemdata.item.push(objItem);
				arDeliveries.push(args);

			} //fim incluirCabec
		}
		return arDeliveries[0];
	}

	api.cancelarDeliveryBravo = async function (req, res, next) {

		try {
			var blOk = true;
			var msgError = '';

			if(!req.body.params.IDW001 ){
				blOk = false;
				msgError = "O ID da delivery não foi enviado"

			}

			if(blOk){
				req.objConn = await dao.controller.getConnection();
				await dao.cancelarDeliveryBravo(req);

				//await api.inserirMilestoneBranco(req);

				await req.objConn.close();

				res.status(201).send({status:'success', message:`A Delivery ${req.body.params.IDW001} cancelada com sucesso`})
			} else {

				res.status(201).send({status:'error', message:msgError})
			}

		} catch (error) {

			if(req.objConn){
				await req.objConn.closeRollback();
			}

			var error = {}
			if(process.env.DEBUG == 1){
				err = error
			}

			res.status(201).send({status:'error', message:`Erro ao cancelar a delivery`, err})
		}

	}

	api.buscarInfoHc = async function (req, res, next) {

		try {
			req.objConn = await dao.controller.getConnection();
			var rs = await dao.buscarInfoHc(req, res, next);
			await req.objConn.close();

			res.send(utilsWare.formatDataGrid(rs, req));
		} catch (error) {
			res.send({status: "error", message: err.messsage});
		}

	}


	api.criarTp = async function (req, res, next) {

		try {

			resp = [];
			blOk = true;
			req.body.STETAPA = 5;

			var id001 = {};
			id001.IDW001 = req.body.params.IDW001.join();
			var CDOUBOUN = await dao.retornarOutbound(id001);
			var outbound = CDOUBOUN[0].CDOUBOUN;


			req.objConn = await dao.controller.getConnection();


			xmlTp = await api.criarXmlTp(req, res, next);

			var criarTpSap = await sapBravo.criarTpSap(xmlTp, res, next);

			//var salvarNumTP


			if (criarTpSap.EvOk == "X") {
				resp.push({ status: "success", message: "Troca de partileira efetuada com sucesso!" });
				await dao.atualizarStatusTp(req);
			}
			else {
				blOk = false;
				var id = 0;

				var message;
				aux = true;
				for (var ret of criarTpSap.Return.item) {
					if (aux && ret.Type == "E") {
						message = ret.Message;
						aux = false;
					}
				}
			}

			if(blOk){
				//timeline
				// var timeline = {};
				// timeline.NRKEY = req.body.params.IDW001.join();
				// timeline.STEVENT = 1;
				// timeline.DSKEY = outbound;
				// timeline.DSDESC = `Troca de partileira MANUAL efetuada com sucesso => ${req.body.params.IDW001.join()}.`;
				// await daoCommon.timelineAdd(timeline);

				await req.objConn.close();
				res.status(201).send(resp);
			} else {
				if(req.objConn){
					//timeline
					// var timeline = {};
					// timeline.NRKEY = req.body.params.IDW001.join();
					// timeline.STEVENT = 1;
					// timeline.DSKEY = outbound;
					// timeline.DSDESC = `Troca de partileira MANUAL => ${req.body.params.IDW001.join()} falhou.`;
					// await daoCommon.timelineAdd(timeline);

					await req.objConn.closeRollback();
				}
				res.status(201).send({ status: "error", message });
			}

		} catch (err) {
			//timeline
			// var timeline = {};
			// timeline.NRKEY = req.body.params.IDW001.join();
			// timeline.STEVENT = 1;
			// timeline.DSKEY = outbound;
			// timeline.DSDESC = `Troca de partileira MANUAL => ${req.body.params.IDW001.join()} falhou.`;
			// await daoCommon.timelineAdd(timeline);

			await req.objConn.closeRollback();
			res.status(201).send({ status: "error", message: err.message , err: err.message });
		}
	}

	api.criarXmlTp = async function (req, res, next) {


		var deliveries = await dao.buscarTp(req, res, next);

		var arDeliveries = [];
		for (var d of deliveries) {

			var incluirCabec = true;
			var incluirItem = false;
			for (var i of arDeliveries) {

				if (d.Rfbel == i.IsModificaEstoqueC.Rfbel) {
					incluirCabec = false;
					incluirItem = true;
				}

				if (incluirItem) {
					objItem = {}
					objItem = {
						Material: d.MATERIAL,
						Plant: d.PLANT,
						StgeLoc: d.STGELOC,
						Batch: d.BATCH,
						EntryQnt: d.ENTRYQNT,
						EntryUom: d.ENTRYUOM,
						EntryUomIso: d.ENTRYUOMISO,
						MovePlant: d.MOVEPLANT,
						MoveStloc: d.MOVESTLOC,
						MoveBatch: d.MOVEBATCH
					}
					i.ItModificaEstoqueI.item.push(objItem)
					incluirItem = false;
				}
			} //fim for i

			if (incluirCabec) {
				var args = {
					IsModificaEstoqueC: {},
					ItModificaEstoqueI: {}
				};

				//header
				args.IsModificaEstoqueC.Rfbel = d.RFBEL;
				args.IsModificaEstoqueC.Lifex = d.LIFEX;

				args.IsModificaEstoqueC.Stcd1 = d.STCD1;
				args.IsModificaEstoqueC.ConvMat = d.CONVMAT;

				args.ItModificaEstoqueI.item = []

				objItem = {}
				objItem = {
					Material: d.MATERIAL,
					Plant: d.PLANT,
					StgeLoc: d.STGELOC,
					Batch: d.BATCH,
					EntryQnt: d.ENTRYQNT,
					EntryUom: d.ENTRYUOM,
					EntryUomIso: d.ENTRYUOMISO,
					MovePlant: d.MOVEPLANT,
					MoveStloc: d.MOVESTLOC,
					MoveBatch: d.MOVEBATCH
				}
				args.ItModificaEstoqueI.item.push(objItem);
				arDeliveries.push(args);

			} //fim incluirCabec
		}
		return arDeliveries[0];
	}

	api.excluirDelivery = async function (req, res, next) {

		var id001 = {};
		id001.IDW001 = req.body.params.IDW001.join();
		var CDOUBOUN = await dao.retornarOutbound(id001);
		var outbound = CDOUBOUN[0].CDOUBOUN;

		try {

			req.objConn = await dao.controller.getConnection();

			var deliveryExcluir = await dao.deliveryExcluir(req);

			var parm = {}
			parm.IDW001 = [];
			parm.IDW002 = [];
			parm.IDW003 = [];
			parm.objConn = req.objConn;

			for( i of  deliveryExcluir) {
				parm.IDW001.push(i.IDW001);
				//parm.IDW002.push(i.IDW002);
				parm.IDW003.push(i.IDW003);
			}

			await dao.excluirW001 (parm);

			//await dao.excluirW002 (parm);

			await dao.excluirW003 (parm);

			//timeline
			// var timeline = {};
			// timeline.NRKEY = req.body.params.IDW001.join();
			// timeline.STEVENT = 1;
			// timeline.DSKEY = outbound;
			// timeline.DSDESC = `Delivery excluida MANUALMENTE com sucesso => ${req.body.params.IDW001.join()}.`;
			// await daoCommon.timelineAdd(timeline);

			await req.objConn.close();

			res.status(201).send({ status: "success", message: 'Deliveries excluidas com sucesso.'});

		} catch (error) {
			if(req.objConn){

				//timeline
				// var timeline = {};
				// timeline.NRKEY = req.body.params.IDW001.join();
				// timeline.STEVENT = 1;
				// timeline.DSKEY = outbound;
				// timeline.DSDESC = `Falha ao excluir delivery MANUALMENTE => ${req.body.params.IDW001.join()}.`;
				// await daoCommon.timelineAdd(timeline);

				await req.objConn.closeRollback();

				res.status(201).send({ status: "error", message: error.message});
			}
		}


	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.detalhesDelivery = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			var result = await dao.detalhesDelivery(req, res, next);
			result[0].itens = [];

			var itens = await dao.itensDelivery(req, res, next);

			result[0].itens = itens;

			res.status(200).send(result);

		} catch (err) {

			res.status(500).send({ message: `Erro ao buscar dados da Delivery` });

		}

	}

	api.reservarSaldoAutomatico = async function (req) {

		//var id001 = {};
		//id001.IDW001 = req.body.IDW001.join();
		//var CDOUBOUN = await dao.retornarOutbound(id001);
		//var outbound = CDOUBOUN[0].CDOUBOUN;

		try {

			var blOk = true;
			var error = {};

			//=-=-=-=-=-==validações=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=
			if(req.body.STRESERV == undefined){
				blOk = false;
				error.message = "'STRESERV' não informado";
			}

			else if(req.body.STRESERV != 0 && req.body.STRESERV != 1){
				blOk = false;
				error.message = `'STRESERV' ${req.body.STRESERV} não existe`;
			}

			else if(!req.body.TPPROCES){
				blOk = false;
				error.message = `'TPPROCES' não informado`;
			}

			else if(req.body.TPPROCES.toUpperCase() != "O" && req.body.TPPROCES.toUpperCase() != "I"){
				blOk = false;
				error.message = `'STRESERV' ${req.body.STRESERV} não existe`;
			}

			else if( !req.body.IDW001 || !req.body.IDW001.length) {
				blOk = false;
				error.message = `'IDW001' não enviado`;
			}

			//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=

			if(blOk){

				if (req.body.IDW001[0] == null){
					req.body.IDW001 = [];
				}

				var rs = await api.reservarSaldoSAP(req);

				if(rs.deliveriesUpdate.length){
					req.body.arIDW001 = rs.deliveriesUpdate;
				 	await dao.reservarSaldo(req);
				}
				//timeline
	/* 			var timeline = {};
				timeline.NRKEY = req.body.params.IDW001.join();
				timeline.STEVENT = 1;
				timeline.DSKEY = outbound;
				timeline.DSDESC = `Saldo reservado AUTOMATICAMENTE com sucesso => ${req.body.IDW001.join()}.`;
				await daoCommon.timelineAdd(timeline); */

				return {status:'success', message: 'Saldo reservado com sucesso'};

			}
			else {
				//timeline
/* 				var timeline = {};
				timeline.NRKEY = req.body.IDW001.join();
				timeline.STEVENT = 1;
				timeline.DSKEY = outbound;
				timeline.DSDESC = `Falha ao reservar saldo AUTOMATICAMENTE com sucesso => ${req.body.IDW001.join()}.`;
				await daoCommon.timelineAdd(timeline); */

				return {error:'error', message: 'Erro Salvar Saldo'};
			}

		} catch (error) {
			//timeline
	/* 		var timeline = {};
			timeline.NRKEY = req.body.IDW001.join();
			timeline.STEVENT = 1;
			timeline.DSKEY = outbound;
			timeline.DSDESC = `Falha ao reservar saldo AUTOMATICAMENTE com sucesso => ${req.body.IDW001.join()}.`;
			await daoCommon.timelineAdd(timeline); */

			return {error:'error', message: 'Erro ao reservar Saldo'};

		}

	}

	api.inserirMilestoneBranco = async function (req, res, next) {

		try {

			var shipments = await dao.buscarShipments(req);

			parms = {};
			parms.IDW002 = [];
			for(z of shipments){
				parms.IDW002.push (z.IDW002);
			}

			parms.objConn = req.objConn
			parms.IDW001 = req.body.params.IDW001;

			var buscarDeliveriesPorShipment = await dao.buscarDeliveriesPorShipment(parms);

			buscarDeliveriesPorShipment.TIPO = [];
			buscarDeliveriesPorShipment.arIDW001 = [];

			for(i of buscarDeliveriesPorShipment ){
				if(shipments[0].TPPROCES == 'O'){
					buscarDeliveriesPorShipment.TIPO.push("GRB")
					buscarDeliveriesPorShipment. arIDW001.push(i.IDW001);
				} else {
					buscarDeliveriesPorShipment.TIPO .push("GRW")
					buscarDeliveriesPorShipment. arIDW001.push(i.IDW001);
				}
			}

			arMilestone = []
			for(j of buscarDeliveriesPorShipment ){
				if(shipments[0].TPPROCES == 'O'){
					buscarDeliveriesPorShipment.TIPO.push('GRW')
					buscarDeliveriesPorShipment.arIDW001.push(i.IDW001);
				} else {
					buscarDeliveriesPorShipment.TIPO.push('PGR')
					buscarDeliveriesPorShipment.arIDW001.push(i.IDW001);
				}
			}



			for(var t of buscarDeliveriesPorShipment.TIPO){

				for(var d of buscarDeliveriesPorShipment.arIDW001){

					var parmMilestone = {};
					parmMilestone.IDW001 = d;
					parmMilestone.NRTIPO = utilsWare.tipoMilestoneNr(t);
					parmMilestone.objConn = req.objConn;
					idIDW001 = d;

					//milestoneCriado = await dao.verificarMilestoneCriado(parmMilestone);

					if(milestoneCriado[0].IDW006 == 0 ){
						var parm = {};
						parm.IDW001 = d;
						parm.NRTIPO = utilsWare.tipoMilestoneNr(t);
						parm.objConn = req.objConn;

						await dao.inserirMilestoneBranco(parm);

					}
				}
			}

		  await req.objConn.close();

		  res.status(201).send({status:"success", message:"Milestones gerados com sucesso"});


		} catch (error) {

			await req.objConn.closeRollback();

			res.status(201).send({status:"error", message:"Erro ao gerar milestones", error});

		}
    }

    api.moverEtapa = async function (req, res, next) {

        try {

            var idw001 = req.body.params.IDW001;
            var status = req.body.params.STATUS;
            if (!!idw001 && !!status) {
                req.IDW001 = idw001;
                req.STATUS = status;
                var rs = await dao.moverEtapa(req, res, next);
            }

            res.status(201).send({ status: "success", message: `Delivery ID: ${idw001}, movida para ${utilsWare.verificarStatusDelivery(status)}.` });

        } catch (error) {
            res.status(201).send({ status: "error", message: "Erro ocorrido ao tentar mover Delivery"});
        }

    }




	return api;

}
