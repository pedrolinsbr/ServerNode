module.exports = function (app, cb) {

	const dao = app.src.modWarehouse.dao.InventarioDAO;
	const utilsWare = app.src.utils.Warehouse;
	const sapBravo = app.src.modWarehouse.controllers.SapBravoController
	const tmz = app.src.utils.DataAtual;

	var api = {};

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.enviarInventario = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			for (var i of req.body.params.IDW007){
				var parm = {};
				
				parm.objConn = req.objConn;
				parm.IDW007 = i;
				parm.STETAPA = 4;

				var xml = await api.gerarInventario(parm);
				await sapBravo.enviarInventario(xml);

				await dao.finalizar(parm);

			}

			await req.objConn.close();

			res.status(201).send([{status:"success", message: "Inventário enviado com sucesso."}])


		} catch (err) {
			if(req.objConn){ await req.objConn.closeRollback();}
			res.status(201).send([{status:"error", message: "erro ao enviar inventário."}])
		}
	}

	api.gerarTarefa = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			
			for (var i of req.body.params.IDW007){
				var parm = {};
				
				parm.objConn = req.objConn;
				parm.IDW007 = i;
				parm.STETAPA = 4;

				await dao.gerarTarefa(parm);

			}

			await req.objConn.close();


			res.status(201).send([{status:"success", message: "Inventário enviado com sucesso."}])


		} catch (err) {
			if(req.objConn){ await req.objConn.closeRollback();}
			res.status(201).send([{status:"error", message: "erro ao enviar inventário."}])
		}
	}

	api.listarInventario = async function (req, res, next) {

		try {

			//req.objConn = await dao.controller.getConnection();

			var rs = await dao.listaInventario(req, res, next);

			//await req.objConn.close();

			res.send(utilsWare.formatDataGrid(rs, req));

		} catch (err) {
			res.send({err});
		}
	}

	api.listarInventarioEnvio = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			var rs = await dao.listaInventarioEnvio(req, res, next);

			await req.objConn.close();

			res.send(utilsWare.formatDataGrid(rs, req));

		} catch (err) {
			res.send({err});
		}

	}

	api.gerarInventario = async function (req, res, next) {

		
		try {

			var inventario = await dao.buscarInventario(req);

			var strXml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">`
			strXml += `<soapenv:Header/>`
			strXml += `<soapenv:Body>`
			strXml += `<ZBMATERIALPHYSINV01>`
			strXml += `<IDOC>`
			strXml +=	`<EDI_DC40>`
			strXml +=		`<TABNAM></TABNAM>`
			strXml +=		`<MANDT></MANDT>`
			strXml +=		`<DOCNUM></DOCNUM>`
			strXml +=		`<DOCREL></DOCREL>`
			strXml +=		`<STATUS></STATUS>`
			strXml +=		`<DIRECT></DIRECT>`
			strXml +=		`<OUTMOD></OUTMOD>`
			strXml +=		`<IDOCTYP></IDOCTYP>`
			strXml +=		`<MESTYP></MESTYP>`
			strXml +=		`<SNDPOR></SNDPOR>`
			strXml +=		`<SNDPRT></SNDPRT>`
			strXml +=		`<SNDPRN></SNDPRN>`
			strXml +=		`<RCVPOR></RCVPOR>`
			strXml +=		`<RCVPRT></RCVPRT>`
			strXml +=		`<RCVPRN></RCVPRN>`
			strXml +=		`<CREDAT></CREDAT>`
			strXml +=		`<CRETIM></CRETIM>`
			strXml +=	`</EDI_DC40>`
			strXml +=	`<E1MATERIALPHYSINV_COUNT>`
			strXml +=		`<PHYSINVENTORY>${inventario[0].NRINVENT}</PHYSINVENTORY> `
			strXml +=		`<FISCALYEAR>${tmz.tempoAtual('YYYY')}</FISCALYEAR>`
			strXml +=		`<COUNT_DATE>${tmz.tempoAtual('YYYYMMDD')}</COUNT_DATE>`


			for(var i of inventario){

				strXml +=		`<E1BP_PHYSINV_COUNT_ITEMS>`
				strXml +=			`<ITEM>${i.NRLNITEM}</ITEM>`
				strXml +=			`<MATERIAL>${i.CDMATERI}</MATERIAL>`
				strXml +=			`<BATCH>${i.NRLOTE}</BATCH>`
				strXml +=			`<ENTRY_QNT>${i.QTMATERI}</ENTRY_QNT>`
				//strXml +=			`<ENTRY_UOM>${i.DSMEDIDA}</ENTRY_UOM>`
				strXml +=		`<Z1E1WVINI_I>`
				strXml +=			`<ZZBATCH>${i.NRALFANU}</ZZBATCH>`
				strXml +=			`<COUNTED_BY>BRAVO</COUNTED_BY>`
				strXml +=		`</Z1E1WVINI_I>`
				strXml +=		`</E1BP_PHYSINV_COUNT_ITEMS>`
			}

			strXml +=		`<E1BP_PHYSINV_SERIALNUMBERS></E1BP_PHYSINV_SERIALNUMBERS>`
			strXml +=	`</E1MATERIALPHYSINV_COUNT>`
			strXml += `</IDOC>`
			strXml += `</ZBMATERIALPHYSINV01>`
			strXml += `</soapenv:Body>`
			strXml +=  `</soapenv:Envelope>`
			
			return strXml;



		} catch (err) {

		}

	}

	api.downloadXmlInventario = async function (req, res, next) {
		
		try {

			req.IDW007 = req.params.id

			req.objConn = await dao.controller.getConnection();

			var xml = await api.gerarInventario(req);
			req.objConn.close();

			res.status(201).send([{status:"success", data: "Inventário gerado com sucesso.", data: xml}])

		} catch (error) {
			res.status(201).send([{status:"error", data: "Erro ao gerar inventário."}])
		}

	}

	api.detalhesInventario = async function (req, res, next) {
		
		try {

			var msgError = "Erro ao gerar inventário";
			var blOk = true;

			if(!req.body.params || !req.body.params.IDW007 ){
				msgError = "o id do inventário não enviado"
				blOk = false
			}

			if(blOk){
				req.objConn = await dao.controller.getConnection();
				
				var rs = await dao.detalhesInventario(req);
				
				req.objConn.close();

				res.send(utilsWare.formatDataGrid(rs, req));
			
			} else {
				res.status(201).send([{status:"error", message: msgError}])	
			}
			

		} catch (error) {
			res.status(201).send([{status:"error", message: msgError}])
		}

	}

	api.detalhesInventarioContagem = async function (req, res, next) {
		
		try {

			var msgError = "Erro ao gerar inventário";
			var blOk = true;

			if(!req.body.params || !req.body.params.IDW007 ){
				msgError = "o id do inventário não enviado"
				blOk = false
			}

			if(blOk){
				req.objConn = await dao.controller.getConnection();
				
				var rs = await dao.detalhesInventarioContagem(req);

				for(i of rs){
					i.QUANTIDAD = {IDW008:i.IDW008, QTRESULT: i.QTRESULT }
				}
				
				req.objConn.close();

				res.send(utilsWare.formatDataGrid(rs, req));
			
			} else {
				res.status(201).send([{status:"error", message: msgError}])	
			}
			

		} catch (error) {
			res.status(201).send([{status:"error", message: msgError}])
		}

	}

	api.calcularCards = async function (req, res, next) {
		
		try {

			req.objConn = await dao.controller.getConnection();

			var rs = await dao.calcularCards(req, res, next);

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

	api.gerarFCM = async function (req, res, next) {

		try {
			req.objConn = await dao.controller.getConnection();

			await dao.mudarEtapaFCM(req,res,next);

			await req.objConn.close();

			res.status(201).send([{status:"success", message: "FCM gerado(s) com sucesso."}])

		} catch (error) {
			if(req.objConn){ await req.objConn.closeRollback();}

			res.status(201).send([{status:"error", message: "erro ao gerar FCM(s)."}])
		}

	}

	api.gerarCBS = async function (req, res, next) {

		try {
			req.objConn = await dao.controller.getConnection();

			await dao.mudarEtapaCBS(req,res,next);

			await dao.geraCBS(req,res,next);

			await req.objConn.close();

			res.status(201).send([{status:"success", message: "CBS gerado(s) com sucesso."}])

		} catch (error) {
			if(req.objConn){ await req.objConn.closeRollback();}

			res.status(201).send([{status:"error", message: "erro ao gerar CBS(s)."}])
		}

	}

	api.recontagem = async function (req, res, next) {

		try {
			req.objConn = await dao.controller.getConnection();

			await dao.recontagem(req,res,next);

			await req.objConn.close();

			res.status(201).send([{status:"success", message: "Recontagem gerada(s) com sucesso."}])

		} catch (error) {
			if(req.objConn){ await req.objConn.closeRollback();}

			res.status(201).send([{status:"error", message: "erro ao gerar recontagem."}])
		}

	}

	api.gerarResultado = async function (req, res, next) {

		try {
			req.objConn = await dao.controller.getConnection();

			await dao.gerarTarefa(req,res,next);

			await req.objConn.close();

			res.status(201).send([{status:"success", message: "Resultado(s)  gerado(s) com sucesso."}])

		} catch (error) {
			if(req.objConn){ await req.objConn.closeRollback();}

			res.status(201).send([{status:"error", message: "erro ao gerar resultados(s)."}])
		}

	}

	api.gerarINV = async function (req, res, next) {

		try {
			req.objConn = await dao.controller.getConnection();

			//await dao.mudarEtapaINV(req,res,next);

			await req.objConn.close();

			res.status(201).send([{status:"success", message: "Inventário(s)  gerado(s) com sucesso."}])

		} catch (error) {
			if(req.objConn){ await req.objConn.closeRollback();}

			res.status(201).send([{status:"error", message: "erro ao gerar inventários(s)."}])
		}

	}

	api.editarQuantItem = async function (req, res, next) {

		try {
			req.objConn = await dao.controller.getConnection();

/* 			for (var i of req.body.IDW008){
				var parms = {};
				parms.objConn = req.objConn;		
				parms.IDW008 = i;
				parms.QTRESULT = i.QTRESULT; */
				
				await dao.editarQuantItem(req);
			/* } */

			await req.objConn.close();

			res.status(201).send([{status:"success", message: `Item => ${req.body.IDW008} atualizado com sucesso.`}])

		} catch (error) {
			if(req.objConn){ await req.objConn.closeRollback();}

			res.status(201).send([{status:"error", message: `erro ao atualizar o item => ${req.body.IDW008}.`}])
		}

    }
    
    api.excluirInventario = async function (req, res, next) {

        try {

            var idw007 = [];
            if (!!req.body.params.IDW007) {
                idw007.push(req.body.params.IDW007);
                for (req.i of idw007) {
                    
                    var rs = await dao.excluirInventario(req, res, next);
                    res.status(201).send({status: "success", message: `Inventário ${idw007.join()} excluido com sucesso !`});

                }
            }
            
        } catch (error) {
            res.status(201).send({status: "error", message: `Erro ao excluir inventário ${req.body.params.IDW007} !`});
        }

    }




	return api;

}