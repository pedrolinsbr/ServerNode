module.exports = function (app, cb) {

	var moment = require('moment');

	const utilCA  		= app.src.utils.ConversorArquivos;
	const utilsDir 		= app.src.utils.Diretorio;
	const tmz     		= app.src.utils.DataAtual;
	const dao 	  		= app.src.modWarehouse.dao.MilestonesDAO;

	const daoInv	  	= app.src.modWarehouse.dao.InventarioDAO;

	const utilsWare 	= app.src.utils.Warehouse;

	const strDirWHMS   	= process.env.FOLDER_WHMS;

	let ctrlCockpit 	= app.src.modWarehouse.controllers.XcockpitController;
	
	let daoCockpit 	= app.src.modWarehouse.dao.CockpitDAO;

	let ctrlSap 	= app.src.modWarehouse.controllers.SapBravoController;
	const commonCtrl = app.src.modWarehouse.controllers.CommonController;

	var api = {};


	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.inserirMilestone = async function (req, res, next) {

		var idIDW001 = [];
		var tipoTimeline = [];

		try {

			req.objConn = await dao.controller.getConnection();

			for(var t of req.body.params.TIPO){
				
				for(var d of req.body.params.IDW001){

					var parmMilestone = {};
					parmMilestone.IDW001 = d;
					parmMilestone.NRTIPO = utilsWare.tipoMilestoneNr(t);
					tipoTimeline.push(t);
					parmMilestone.objConn = req.objConn;
					idIDW001.push(d);

					milestoneCriado = await dao.verificarMilestoneCriado(parmMilestone);

					if(milestoneCriado[0].IDW006 == 0){
						var parm = {};
						parm.IDW001 = d;
						parm.NRTIPO = utilsWare.tipoMilestoneNr(t);
						parm.DTMILEST = tmz.retornaData(req.body.params.DTMILEST, "YYYY-MM-DD hh:mm:ss");
						parm.objConn = req.objConn;
						
						await dao.inserirMilestone(parm);
						await api.verificarBR52(parm);

					}
				}
			}

			//timeline
			req.params = {};
			req.params.NRKEY = idIDW001.join();
			req.params.STEVENT = 'O';
			req.params.DSKEY = 'Milestone';
			req.params.DSDESC = `Adicionado o tipo de Milestone => ${tipoTimeline.join()} na Delivery => ${idIDW001.join()}`;

			commonCtrl
			.timelineAddPromise(req, res, next)
			.then((res) => {
                console.log(`timelineID => ${res.id}`);
			})
			.catch((err) => {
				console.error(`Rejected on ${err}`);
			});

			await req.objConn.close();

			res.status(201).send({status:"success", message:"Milestones gerados com sucesso"});

		} catch (error) {

			//timeline
			req.params = {};
			req.params.NRKEY = idIDW001.join();
			req.params.STEVENT = 'O';
			req.params.DSKEY = 'Milestone';
			req.params.DSDESC = `Erro ao inserir tipo de Milestone => ${tipoTimeline.join()} na Delivery => ${idIDW001.join()}`;

			commonCtrl
			.timelineAddPromise(req, res, next)
			.then((res) => {
				console.log(`timelineID => ${res.id}`);
			})
			.catch((err) => {
				console.error(`Rejected on ${err}`);
			});
			
			await req.objConn.closeRollback();

			res.status(201).send({status:"error", message:"Erro ao gerar milestones", error});

		}
	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.inserirMilestoneSap = async function (req, res, next) {
	
		try {
			var result = '';
			req.objConn = await dao.controller.getConnection();
			
			for(var t of req.body.params.TIPO){
				for(var d of req.body.params.IDW001){

					var parmMilestone = {};
					parmMilestone.IDW001 = d;
					parmMilestone.NRTIPO = utilsWare.tipoMilestoneNr(t);
					parmMilestone.objConn = req.objConn;

					milestoneCriado = await dao.verificarMilestoneCriadoSap(parmMilestone);

					if(milestoneCriado.length == 0){

						var parm = {};
						parm.IDW001 = d;
						parm.NRTIPO = utilsWare.tipoMilestoneNr(t);
						parm.DTMILEST = tmz.retornaData(req.body.params.DTMILEST, "YYYY-MM-DD hh:mm:ss");
						parm.objConn = req.objConn;
						
						await dao.inserirMilestone(parm)
					} else {
						result = { STETAPA: milestoneCriado[0].STETAPA }
					}
					

				}
			}
			await req.objConn.close();
		  return {status:"success", result}
			
		} catch (error) {
			await req.objConn.closeRollback();
			return {status:"error", message:"Erro ao gerar milestones", error};

		}
	}

	api.gerarMilestones = function (req, res, next) {

		try {

			switch (req.Milestonecode) {

				case 'GRB':
					var strMS = 'Goods removed from bin';
					break;
	
				case 'GRL':
					var strMS = 'Goods ready for loading';
					break;
	
				case 'GRW':
					var strMS = 'Goods received at warehouse';
					break;
	
				default: 
					var strMS = '-';
					break;
	
			}

			//var arDataHora = tmz.tempoAtual('YYYY-MM-DD HH:mm:ss').split(' ');
	
			//----------------------------------------------------------------\\

			var strXML = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">`
			strXML += `<soapenv:Header/>`
			strXML += `<soapenv:Body>`
			strXML += `<ZXDELVRY07_WH>`;
			strXML += 		`<IDOC BEGIN="1">`;
			strXML += 			`<EDI_DC40 SEGMENT="1"></EDI_DC40>`
			strXML += 				`<E1EDL20 SEGMENT="1">`;
			strXML += 					`<VBELN>${req.CDDELIVE}</VBELN>`;
			strXML += 					`<E1EDT13 SEGMENT="1">`;
			strXML += 						`<QUALF>${req.Milestonecode}</QUALF>`;
			strXML += 						`<NTANF>${req.Date ? utilsWare.soNumeros(req.Date): ''}</NTANF>`;
			strXML += 						`<NTANZ>${req.Time ? utilsWare.soNumeros(req.Time): ''}</NTANZ>`;
			strXML += 						`<TZONE_BEG>BRAZIL</TZONE_BEG>`;
			strXML += 					`</E1EDT13>`;
			strXML += 				`</E1EDL20>`;
			strXML += 		`</IDOC>`;
			strXML += 	`</ZXDELVRY07_WH>`;
			strXML += `</soapenv:Body>`
			strXML +=  `</soapenv:Envelope>`

			return strXML;

		} catch (err) {

			throw err;

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
	
	api.gerarPGR = function (req, res, next) {

		try {

			//var dtAtual = tmz.tempoAtual('YYYYMMDDHHmmss'); 

			//----------------------------------------------------------------\\

			var strXML = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">`
			strXML += `<soapenv:Header/>`
			strXML += `<soapenv:Body>`
			strXML += `<WMMBID02>`;
			strXML += 		`<IDOC BEGIN="1">`;
			strXML += 			`<EDI_DC40 SEGMENT="1"></EDI_DC40>`;
			strXML += 			`<E1MBXYH SEGMENT="1">`;
			strXML +=				`<BLDAT>${req[0].dtAtual}</BLDAT>`;
			strXML +=				`<BUDAT>${req[0].dtAtual}</BUDAT>`;
			strXML +=				`<TCODE>MIGO</TCODE>`;
			strXML +=				`<USNAM>BRAVO</USNAM>`;
			strXML +=				`<XBLNR>${req[0].NRNOTA}</XBLNR>`;

			for (var i in req) {
				
				var DTVALIDA = tmz.formataData(req[i].DTVALIDA, 'YYYYMMDD');

				strXML +=				`<E1MBXYI SEGMENT="1">`;
				strXML +=					`<MATNR>${req[i].CDMATERI}</MATNR>`;
				strXML +=					`<WERKS>${req[i].NMPLAORI}</WERKS>`;
				strXML +=					`<LGORT>${req[i].NMSTOLOC}</LGORT>`;
				strXML +=					`<CHARG>${req[i].NRLOTE}</CHARG>`;
				strXML +=					`<MAPA_NUMBER>${req[i].NRMAPA ? req[i].NRMAPA : ''}</MAPA_NUMBER>`;
				strXML +=					`<ORIGINAL_LOT_NUMBER>${req[i].DSALFANU}</ORIGINAL_LOT_NUMBER>`;
				strXML +=					`<ERFMG>${req[i].QTITEMVE}</ERFMG>`;
				strXML +=					`<ERFME>${req[i].DSMEDIVE}</ERFME>`;
				strXML +=					`<POSNR>${req[i].NRITEM}</POSNR>`;
				strXML +=					`<VBELN>${req[i].CDOUBOUN}</VBELN>`;
				strXML +=					`<VFDAT>${DTVALIDA}</VFDAT>`;
				strXML +=					`<EBELN>${req[i].NRPOLNIT}</EBELN>`;
				strXML +=					`<EBELP>${req[i].NRPONMBR ? req[i].NRPONMBR.slice(1): ''}</EBELP>`;
				strXML +=					`<E1MBXYJ SEGMENT="1">`;
				strXML +=						`<VLIEF_AVIS>${req[i].CDINBOUN}</VLIEF_AVIS>`;
				strXML +=					`</E1MBXYJ>`;
				strXML +=				`</E1MBXYI>`;
			}

			strXML +=			`</E1MBXYH>	`;
			strXML += `</IDOC>`;
			strXML += 	`</WMMBID02>`;
			strXML += `</soapenv:Body>`
			strXML +=  `</soapenv:Envelope>`

			return strXML;

		} catch (err) {
			throw err;
		}
	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.listarMilestones = async function (req, res, next) {

		try {
			req.objConn = await dao.controller.getConnection();

			if(req.body.params.tipo == 'INV'){

				var rs = await daoInv.listarInventarioEnvio(req, res, next);

			}else {

				var rs = await dao.listarMilestones(req, res, next);
			}

			
			
			await req.objConn.close()
			
			res.send(utilsWare.formatDataGrid(rs, req));

		} catch (error) {
			res.send({status:"error", message: "Erro ao gerar lista de Milestones"});
		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.enviarMilestones = async function (req, res, next) {

/* 		var id001 = {};
		id001.IDW001 = req.body.params.IDW001.join();
		var CDOUBOUN = await dao.retornarOutbound(id001);
		var outbound = CDOUBOUN[0].CDOUBOUN; */

		try {

			req.objConn = await dao.controller.getConnection();
			var blOk = true;
			var idToasts = [];

			var milestones = await dao.buscarMilestones(req);
			blOk = (milestones.length > 0);


			if (blOk) {

				if (milestones[0].NRTIPO == 4) { //PGR
					blOk = await api.enviarPgr(milestones);

				} else { // Milestones

					for (m of milestones) {
						var parms = {};
						//if (m.TPPROCES == "O") {
						parms.CDDELIVE = m.CDOUBOUN
						//} else {
						//	parms.CDDELIVE = m.CDINBOUN
						//}
						parms.Milestonecode = utilsWare.tipoMilestoneText(m.NRTIPO)

						if(m.DTMILEST){
							parms.Date = utilsWare.soNumeros(moment(m.DTMILEST).format('YYYY-MM-DD'))
							parms.Time = utilsWare.soNumeros(moment(m.DTMILEST).format('hh:mm:ss'))
						}

						xmlMilestone = api.gerarMilestones(parms);

						var args = {}

						args.xml = xmlMilestone
						args.CDDELIVE = parms.CDDELIVE

						await ctrlSap.enviarMilestones(args);

						var parmAtu = {};
						parmAtu.objConn = req.objConn;
						parmAtu.IDW006 = m.IDW006;
						parmAtu.IDW001 = m.IDW001;
						idToasts.push(parmAtu.IDW001);

						await dao.atualizarMilestone(parmAtu);

						var finalizado = await dao.verificarFinalizado(parmAtu);

						if(finalizado.length >= 2 ) {
							var parmEtapa = {};
							parmEtapa.objConn = req.objConn;
							parmEtapa.body = {}
							parmEtapa.body.STETAPA = 8
							parmEtapa.body.IDW001 = [m.IDW001];
							await ctrlCockpit.atualizarStatusNew(parmEtapa);
						}

						await req.objConn.close();
					}
				}
			}

			if (blOk) {
				//timeline
				// var timeline = {};
				// timeline.NRKEY = req.body.params.IDW001.join();
				// timeline.STEVENT = 1;
				// timeline.DSKEY = outbound;
				// timeline.DSDESC = `Enviar milestone MANUAL efetuado com sucesso => ${req.body.params.IDW001.join()}.`;
				// await daoCommon.timelineAdd(timeline);

				if(req.objConn){
					await req.objConn.close();
				}

				res.status(201).send({ status: "success", message: `Milestones ${idToasts} enviados com sucesso` });
			} else {
				//timeline
				// var timeline = {};
				// timeline.NRKEY = req.body.params.IDW001.join();
				// timeline.STEVENT = 1;
				// timeline.DSKEY = outbound;
				// timeline.DSDESC = `Falha ao enviar milestone MANUAL => ${req.body.params.IDW001.join()}.`;
				// await daoCommon.timelineAdd(timeline);

				if(req.objConn){
					await req.objConn.closeRollback();
				}
				res.status(201).send({ status: "error", message: "Não foram encontrados Milestones para serem gerados" });
			}

		} catch (error) {
			//timeline
			// var timeline = {};
			// timeline.NRKEY = req.body.params.IDW001.join();
			// timeline.STEVENT = 1;
			// timeline.DSKEY = outbound;
			// timeline.DSDESC = `Falha ao enviar milestone MANUAL => ${req.body.params.IDW001.join()}.`;
			// await daoCommon.timelineAdd(timeline);

			if(req.objConn){
				await req.objConn.closeRollback();
			}
			res.status(201).send({ status: "error", message: "Erro ao enviar Milestones", error: error });
		}
	}

	api.enviarPgr = async function (req, res, next) {

		var blOk = true;
		for (p of req) {

			req.body = {}

			req.body.IDW001 = p.IDW001;

			var rs = await dao.buscarDadosPGR(req, res, next);


			if (rs.length > 0) {
				rs[0].dtAtual = tmz.formataData(p.DTMILEST, "YYYYMMDDHHmmss");

				var xmlPGR = api.gerarPGR(rs, res, next);

				var args = {}

				args.xml = xmlPGR

				args.CDDELIVE = rs[0].CDOUBOUN;

				await ctrlSap.enviarPGR(args);

				var parmAtu = {};
				parmAtu.objConn = req.objConn;
				parmAtu.IDW006 = p.IDW006;
				parmAtu.IDW001 = req.body.IDW001

				await dao.atualizarMilestone(parmAtu);


				var finalizado = await dao.verificarFinalizado(parmAtu);

				if (finalizado.length >= 2) {
					var parmEtapa = {};
					parmEtapa.objConn = req.objConn;
					parmEtapa.body = {}
					parmEtapa.body.STETAPA = 8
					parmEtapa.body.IDW001 = [req.body.IDW001];
					await daoCockpit.atualizarStatusNew(parmEtapa);
				}

				//await req.objConn.close();
			} else {
				blOk = false;
			}

		}

		return blOk;


	}


	api.milestonesFisico = async function (req, res, next) {

		try {

			if(!req.body.params){
				req.body = {};
				req.body.params = {IDW006:req.params.IDW006};
			}

			req.objConn = await dao.controller.getConnection();
			var blOk = true;


			var milestones = await dao.buscarMilestones(req);
			blOk = (milestones.length > 0);
			
			if (blOk){
				for (m of milestones){
					var parms = {};
					//if(m.TPPROCES == "O"){
						parms.CDDELIVE = m.CDOUBOUN
					//} else {
						//parms.CDDELIVE = m.CDINBOUN
					//}
					parms.Milestonecode = utilsWare.tipoMilestoneText(m.NRTIPO)
					
					
					if(m.DTMILEST){
						parms.Date = utilsWare.soNumeros(moment(m.DTMILEST).format('YYYY-MM-DD'))
						parms.Time = utilsWare.soNumeros(moment(m.DTMILEST).format('HH:mm:ss'))
					}

					if(m.NRTIPO != 4){
						xmlMilestone = api.gerarMilestones(parms);
					} else {
						req.body.IDW001 = m.IDW001;
						var rs = await dao.buscarDadosPGR(req, res, next);

						rs[0].dtAtual = tmz.formataData(m.DTMILEST, "YYYYMMDDHHmmss");
			
						var xmlMilestone = api.gerarPGR(rs, res, next);

						console.log(xmlMilestone);
					}
					
					//await ctrlSap.enviarMilestones(xmlMilestone);

					var parmAtu = {};
					parmAtu.objConn = req.objConn;
					parmAtu.IDW006 = m.IDW006;

					var folder = `${strDirWHMS}${parms.Milestonecode}`

					var nomeArquivo = `WH-${parms.Milestonecode}-${parms.CDDELIVE}.xml`

					await utilCA.salvarArquivo(`${folder}/${nomeArquivo}`, xmlMilestone);

					await req.objConn.close();
				}

			} 
			
			if(blOk){

				if (utilsDir.existsPath(`${folder}/${nomeArquivo}`)) {
					res.sendFile(nomeArquivo, { root: folder });
				} else {
					res.status(201).send({ erro: 'Arquivo não encontrado' });
				}

			} else {
				res.status(201).send({ status:"error", message: "Não foram encontrados Milestones para serem gerados" });
			}
			
		} catch (error) {
			await req.objConn.closeRollback();
			res.status(201).send({ status:"error", message: "Erro ao enviar Milestones" });
		}

	}

	api.gerarMilSoap = async function (req, res, next){

		req.body = {};
		req.body.params = {};
		req.body.params.TIPO = [req.Milestonecode];
		req.body.params.IDW001 = []

		for( var i of req.ItVbeln.item){
			req.body.params.IDW001.push(utilsWare.formatarIDW001(i.Vbeln))
		}
		req.body.params.DTMILEST = `${req.Date} ${req.Time}`

		var stEtapa;
		switch(req.Milestonecode){
		  case "PGR":
		  case "GRL":
		  case "GRW":
			stEtapa = 5
			break
		  default: //GRB
			stEtapa = 4
			break
		}

		var rs = await api.inserirMilestoneSap(req);

		if(rs.status == 'success'){
			stEtapa = rs.result.STETAPA;
		}
		

		if(stEtapa == 3){

			return await ctrlCockpit.atualizarStatusNew({ body: { IDW001: req.body.params.IDW001, STETAPA: stEtapa } }).then(
				(result) => {

					return {
						EvOk: "X"
					}
				});

		} else {
			return {
				EvOk: "X"
			}
		}

	}

	api.gerarMilSoapPGR = async function (req, res, next){

		req.body = {};
		req.body.params = {};
		req.body.params.TIPO = [req.Milestonecode];
		//req.body.params.IDW001 = [req.IvVbeln]

		req.body.params.IDW001 = [];
		req.body.params.IDW001.push(utilsWare.formatarIDW001(req.IvVbeln))


		req.body.params.DTMILEST = `${moment().format('YYYYMMDD')}${moment().format('HHmmss')}`

		var stEtapa;



		stEtapa = 5
		
		var rs = await api.inserirMilestoneSap(req);

		if(rs.status == 'success'){
			stEtapa = rs.result.STETAPA;
		}
		
		if(stEtapa == 3){

			return await ctrlCockpit.atualizarStatusNew({body:{IDW001: req.body.params.IDW001, STETAPA: stEtapa}}).then(
				(result) =>{
					
					return {
						EvOk: "X"
					}
				});
		} else {

			return {
				EvOk: "X"
			}

		}
	}

	//função temporaria
	api.verificarBR52 = async function (req, res, next){
		
		rs = await dao.verificarBR52(req);

		if(rs.length){

			var stEtapa;
			switch(req.NRTIPO){
			case 2:
			case 3:
			case 4:
				stEtapa = 5
				break
			default: //GRB
				stEtapa = 4
				break
			}

			req.IDW001;
			req.STETAPA = stEtapa;

			await dao.atualizarStatusBR52(req)
			return true
		}
	}

	api.buscarDadosHC = async function (req, res, next){
		try {
			req.objConn = await dao.controller.getConnection();

			rs = await dao.buscarDadosHC(req);
		
		} catch (error) {
			
		}
	
	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.criarMilestonesHc = async function (req, res, next) {

		//var id001 = {};
		//id001.IDW001 = req.body.params.IDW001.join();
		//var CDOUBOUN = await dao.retornarOutbound(id001);
		//var outbound = CDOUBOUN[0].CDOUBOUN;

		try {

			//req.objConn = await dao.controller.getConnection();
			req.IDG046;
			req.DTMILEST;
			req.TPPROCES;
			req.body = {};
			req.body.params = {};

			if (req.IDG046 && req.DTMILEST && req.TPPROCES) {

				if (req.TPPROCES == 'C') {

					req.body.params.TIPO = ['GRB', 'GRL']

				} else {
					req.body.params.TIPO = ['GRW', 'PGR']
				}

				req.body.params.DTMILEST = req.DTMILEST;



				req.body.params.IDW001 = [];

				carga = await dao.buscarDeliveryCarga(req);

				for (c of carga) {
					req.body.params.IDW001.push(c.IDW001)
				}

				for (var t of req.body.params.TIPO) {
					for (var d of req.body.params.IDW001) {

						var parmMilestone = {};
						parmMilestone.IDW001 = d;
						parmMilestone.NRTIPO = utilsWare.tipoMilestoneNr(t);
						parmMilestone.objConn = req.objConn;

						milestoneCriado = await dao.verificarMilestoneCriado(parmMilestone);

						if (milestoneCriado[0].IDW006 == 0) {
							var parm = {};
							parm.IDW001 = d;
							parm.NRTIPO = utilsWare.tipoMilestoneNr(t);

							var DTMILEST;
							if (t == 'GRL' || t == 'GRW') {
								DTMILEST = utilsWare.calcularHoraFin(req.body.params.DTMILEST, carga[0].PSCARGA);
							} else {
								DTMILEST = utilsWare.calcularHoraIni(req.body.params.DTMILEST, carga[0].PSCARGA);
							}

							parm.IDS001 = 1068
							parm.DTMILEST = tmz.retornaData(DTMILEST, "YYYY-MM-DD hh:mm:ss");
							parm.objConn = req.objConn;

							await dao.inserirMilestone(parm);

						}

					}
				}


				//await req.objConn.close();

				return { status: "success", message: "Milestones Warehouse criados com sucesso" }
		} else {
				return { status: "success", message: "faltaa informações para geração dos milestones" }
		}

		} catch (error) {


			if(req.objConn){
				//await req.objConn.closeRollback();
			}
			
			return { status: "error", message: error }
		}

	}

	
	api.testeMilestoneHC = async function (req, res, next) {
		await api.criarMilestonesHc(req);
	}


	return api;
}