module.exports = function (app, cb) {

	const tmz    = app.src.utils.DataAtual;
	const fmt    = app.src.utils.Formatador;
	const asndao = app.src.modDocSyn.dao.ASNDAO;
	const dao    = app.src.modLogisticaReversa.dao.Recusa4plDAO;
	const cdao   = app.src.modLogisticaReversa.dao.CancelamentoDAO;
	const mdl    = app.src.modLogisticaReversa.models.CancelaModel;
	const xfld   = app.src.modGlobal.controllers.XFieldAddController;
		
	var api = {};

	//-----------------------------------------------------------------------\\

    api.alterarEtapaCarga = async function (req, res, next) {

        try {

            var blOK = ((req.body.IDG046) && (req.body.STCARGA) && (req.body.STETAPA));
        
            if (blOK) { 

                var cdStatus = 200; 
				var strErro = null;

				var parm = req.body;

				parm.objConn = await dao.controller.getConnection();
				
				await dao.controller.setConnection(parm.objConn);				
				await asndao.changeShipmentStatus(parm, res, next);

				await dao.controller.setConnection(parm.objConn);				
				await dao.alteraStatusCarga(parm, res, next);

				await parm.objConn.close();
    
            } else { 
                var cdStatus = 400;
                var strErro = 'Parâmetros inválidos';
                
            }   
            
            res.status(cdStatus).send({ blOK, error: strErro });

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\	

	api.retiraBacklogRecusa = async function (req, res, next) { 

		try {

			var arValores = await dao.retiraBacklogRecusa(req, res, next);

			var blOK = (arValores.length > 0);
			var cdStatus = (blOK) ? 200:400;

			res.status(cdStatus).send({ blOK, arValores });

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\

	api.buscaDadosDelivery = async function (req, res, next) {

		try {

			var rs = await dao.buscaDadosDelivery(req, res, next);

			var objDelivery = {};

			var arKeys 	 = Object.keys(rs[0]);
			var arKeysDH = arKeys.slice(0, 34);
			var arKeysDI = arKeys.slice(34, 41);
			var arKeysDL = arKeys.slice(41);

			for (var k of arKeysDH) objDelivery[k] = rs[0][k];

			var idRem = objDelivery.IDG005RE;
			objDelivery.IDG005RE = objDelivery.IDG005DE;
			objDelivery.IDG005DE = idRem;
			
			objDelivery.item = [];

			while (rs.length > 0) {

				var objItem = {};

				for (var k of arKeysDI) objItem[k] = rs[0][k];
				objItem.lote = [];

				while ((rs.length > 0) && (objItem.IDG045 == rs[0].IDG045)) {

					var objLote = {};

					for (var k of arKeysDL) objLote[k] = rs[0][k];

					delete objLote.IDG050;

					objItem.lote.push(objLote);
					rs.shift();
				}

				var idUnPeso   = objItem.UNPESITE;
				var idUnMedida = objItem.UNMEDITE

				delete objItem.IDG045;
				delete objItem.UNPESITE;
				delete objItem.UNMEDITE;

				objItem.IDG009PS = idUnPeso;
				objItem.IDG009UM = idUnMedida; 

				objDelivery.item.push(objItem);
				
			}

			var idDelRef = objDelivery.IDG043;
			delete objDelivery.IDG043;
			objDelivery.IDG043RF = idDelRef;

			objDelivery.DTLANCTO = tmz.dataAtualJS();
			objDelivery.DTDELIVE = objDelivery.DTLANCTO;
			objDelivery.DTENTCON = objDelivery.DTLANCTO;
			objDelivery.TPDELIVE = '4';
			objDelivery.STETAPA  = 21;
			objDelivery.STULTETA = objDelivery.STETAPA;

			res.send(objDelivery);

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\

	api.buscaRecusa4plCards = async function (req, res, next) {

		try {

			var rs = await dao.buscaRecusa4plCards(req, res, next);
			res.send(rs);

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\

	api.buscaRecusa4plBacklog = async function (req, res, next) {

		try {

			var rs = await dao.buscaRecusa4plBacklog(req, res, next);
			res.send(rs);

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\

	api.buscaRecusa4plOtimiza = async function (req, res, next) {

		try {

			var rs = await dao.buscaRecusa4plOtimiza(req, res, next);
			res.send(rs);

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\

	api.buscaRecusa4plTransporte = async function (req, res, next) {

		try {

			var rs = await dao.buscaRecusa4plTransporte(req, res, next);
			res.send(rs);

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\	

	api.buscaDadosOtimizacao = async function (req, res, next) {

		try {

			var psTotal		= 0;
			var vrTotal		= 0;
			var arDelivery	= (req.body.conjuntoId === undefined) ? 0 : req.body.conjuntoId;

			var rs = await dao.buscarDadosOtimizacao({ arDelivery }, res, next);

			if (rs.length > 0) {

				for (var i of rs) {

					psTotal += i.PSBRUTO;
					vrTotal += i.VRDELIVE;

				}

				rs[0].PSTOTAL  = parseFloat(psTotal.toFixed(2));
				rs[0].VRTOTAL  = parseFloat(vrTotal.toFixed(2));

				res.send(rs);

			} else {

				res.status(400).send({ error: 'Nenhum registro encontrado' });

			}


		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\

	api.checkModel = function (req, res, next) {

		var parm = { post: req.body, model: mdl.cancelaRecusa };

		fmt.chkModelPost(parm, res, next);

	}

	//-----------------------------------------------------------------------\\

	api.iniciaCancela = async function (req, res, next) {

		try {

			var parm    = req.body;
			var idUser  = parm.IDS001CA;
			var strErro = null;

			parm.objConn = await dao.controller.getConnection(null, idUser);

			var rs = await cdao.buscaCteAtivo(parm, res, next);

			if (rs.length == 0) {

				var blOK = await api.cancelaRecusa(parm, res, next);
				if (!blOK) strErro = 'Deliveries de Recusa não encontradas';

			}  else {

				strErro  = 'Existe um CTe ativo para esta carga';
			}

			await parm.objConn.close();

			var cdStatus = (blOK) ? 200 : 400;			

			res.status(cdStatus).send({ blOK, strErro });

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\

	api.cancelaRecusa = async function (req, res, next) {

        try {

			var rs = await cdao.buscaDlvRecusa(req, res, next);

			if (rs.length == 0) {

				return false;

			} else {

				//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
				//Cancela Carga

				req.DTCANCEL = tmz.dataAtualJS();
				req.STCARGA  = 'C';
	
				var objDados = fmt.setSchema(mdl.cancelaRecusa, req);
	
				objDados.objConn = req.objConn;
			
				await cdao.cancelarCargaRecusa(objDados, res, next);	

				//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
				//Cancela Delivery - Estorna flag recusa

				req.DTCANCEL = tmz.formataData(req.DTCANCEL, 'YYYY-MM-DD HH:mm:ss');
	
				while (rs.length > 0) {
	
					req.IDG043 = rs[0].IDG043;
	
					await cdao.cancelarDeliveryRecusa(req, res, next);
					
					var parm = 
						{ 
							objConn: req.objConn,
							nmTabela: 'G043', 
							idTabela: rs[0].IDG043RF, 
							STRECUSA: 1 
						};
	
					await xfld.inserirValoresAdicionais(parm, res, next);
					
					rs.shift();
	
				}

				//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
	
				return true;

			}


        } catch (err) {

			throw err;

		}

    }

    //-----------------------------------------------------------------------\\    	

	return api;

}