module.exports = function (app, cb) {

	const dao	 	  	= app.src.modWarehouse.dao.XmlDAO;
	const daoCompra		= app.src.modWarehouse.dao.CompraIndustrialDAO;
	const daoCommon 	= app.src.modWarehouse.dao.CommonDAO;
	const utilsWare 	= app.src.utils.Warehouse;
	const tmz 	   		= app.src.utils.DataAtual;

	var api = {};

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.addDeliveryCompra = async function (req, res, next) {

		//var id001 = {};
		//id001.IDW001 = req.body.params.IDW001.join();
		//var CDOUBOUN = await dao.retornarOutbound(id001);
		//var outbound = CDOUBOUN[0].CDOUBOUN;

		try {
			//#######DELIVERY#####################################################
			req.body.TPPROCES		=		"I";
			req.body.DTDELIVE		= 		tmz.tempoAtual('YYYYMMDD', false);
			req.body.CREDAT			= 		tmz.tempoAtual('YYYYMMDD', false);
			req.body.CRETIM			=		tmz.tempoAtual('YYYYMMDD', false);
			req.body.DOCNUM			=		"0";
			req.body.TPDELIVE		= 		1;
			req.body.SNDELETE		=  		0;		  
			req.body.PSBRUTO		=  		req.body.PSBRUTO ? utilsWare.normalizarPeso(req.body.PSBRUTO) : 0;
			req.body.STETAPA		=  		1;
			req.body.VRDELIVE		=  		0;
			req.body.VRVOLUME		=		0;
			req.body.CDINBOUN		=  		0;
			req.body.CDOUBOUN		=  		0;
			req.body.STATUALI		= 		"CHA";
			req.body.IDS001			=		req.headers.ids001 ? req.headers.ids001 : 97;
			
			//REMETENTE
			req.body.CJREMETE		=  		req.body.CJREMETE ? req.body.CJREMETE.replace(/[^\d]+/g,'') : '';
			req.body.IEREMETE		=  		0;
			req.body.IMREMETE		=  		0;
			req.body.NMCLIRE		=  		"";
			req.body.NRCEPRE		=  		"";
			req.body.NRSAPRE		=  		"";
			req.body.NMCIDRE		=  		"";
			req.body.NMESTRE		=  		"";
  
			//DESTINATÁRIO
			req.body.CJDESTIN		=  		req.body.CJDESTIN ? req.body.CJDESTIN.replace(/[^\d]+/g,'') : '';
			req.body.IEDESTIN		=  		0;
			req.body.IMDESTIN		=  		0;
			req.body.NMCLIDE		=  		"";
			req.body.NRCEPDE		=  		"";
			req.body.NRSAPDE		=  		"";
			req.body.NMCIDDE		=  		"";
			req.body.NMESTDE		=  		"";
  
			//TRANSPORTADORA
			req.body.CJTRANSP		=  		req.body.CJTRANSP ? req.body.CJTRANSP.replace(/[^\d]+/g,'') : '';
			req.body.NMCLITR		=  		"";
			req.body.NRCEPTR		=  		"";
			req.body.NRSAPTR		=  		"";
			req.body.NMCIDTR		=  		"";
			req.body.NMESTTR		=  		"";
  
			//CLIENTE
			req.body.NMCLICL		=  		"";
			req.body.NRCEPCL		=  		"";
			req.body.NRSAPCL		=  		"";
			req.body.NMCIDCL		=  		"";
			req.body.NMESTCL		=  		"";
			req.body.IMCLIENT		=  		"";
			req.body.DELICOMP		=		1;


			//#######NOTA FISCAL#####################################################

			req.body.NRNOTA			= 		req.body.NRNOTA;
			req.body.NRSERINF		=		req.body.NRSERINF;
			req.body.NRCHADOC		=		req.body.NRCHADOC;
			req.body.DSMODENF		=		req.body.DSMODENF;
			req.body.NRNFREF		=		req.body.NRNFREF;
			req.body.STNOTA			=		req.body.STNOTA;
			req.body.VRNOTA			=		0;
			// req.body.PSNOTA			=		req.body.PSBRUTO ? utilsWare.normalizarPeso(req.body.PSBRUTO) : 0;
			req.body.PSNOTA			=		req.body.PSNOTA ? utilsWare.normalizarPeso(req.body.PSNOTA) : 0;
			req.body.NMPLADES		=		req.body.NMPLADES;


			req.objConn = await dao.controller.getConnection();

			var IDW001 = await dao.importarDelivery(req, res, next);
			req.body.IDW001 = IDW001.id;
			
			var IDW004 = await dao.importarNf(req, res, next);
			req.body.IDW004 = IDW004.id;
			
			var sequence = 0
			for(var i of req.body.items){

				sequence += 1;
                i.IDW001 = req.body.IDW001;
				i.IDW004 = req.body.IDW004;
				
				req.body.CDMATERI 	=  	i.CDMATERI;
				//req.body.DSMATERI 	=  	req.DSMATERI;
				i.NMMATGRO  			=  	0;
				i.NMPLAORI		  		=  	i.NMPLAORI;
				req.body.NMSTOLOC 		=  	i.NMSTOLOC;
				i.NRLOTE				=	i.NRLOTE;
				i.QTITEMVE				=  	i.QTITEMBA;
				i.DSMEDIVE				=  	i.DSMEDIBA;
				i.QTITEMBA				=  	i.QTITEMBA;
				i.DSMEDIBA				=  	i.DSMEDIBA;
				i.NRITEM				=  	sequence;
				i.NRMAPA				=  	"";
				i.DSALFANU				=  	i.DSALFANU;
				i.DTVALIDA				=  	i.DTVALIDA;
				i.DTFABRIC				=  	i.DTFABRIC;
				i.objConn = req.objConn;
				i.IDS001 = req.body.IDS001;
                var x = await dao.importarItem(i, res, next);
            }
			//timeline
			// var timeline = {};
			// timeline.NRKEY = req.body.params.IDW001.join();
			// timeline.STEVENT = 1;
			// timeline.DSKEY = outbound;
			// timeline.DSDESC = `Delivery MANUAL criada com sucesso => ${req.body.params.IDW001.join()}.`;
			// await daoCommon.timelineAdd(timeline);

			await req.objConn.close();

			res.status(201).send([{status:"success", message: `A delivery  ${IDW001.id} foi criada com sucesso!`, IDW001:IDW001.id}]);

		} catch (err) {

			var error = {};
			error.message = "Erro ao criar delivery";
			if (process.env.DEBUG && process.env.DEBUG == 1) {
				error.err = err.message;
			}
			//timeline
			// var timeline = {};
			// timeline.NRKEY = req.body.params.IDW001.join();
			// timeline.STEVENT = 1;
			// timeline.DSKEY = outbound;
			// timeline.DSDESC = `Delivery MANUAL criada com sucesso => ${req.body.params.IDW001.join()}.`;
			// await daoCommon.timelineAdd(timeline);

			await req.objConn.closeRollback();
			res.status(201).send([{status:"error", message: err.message, err: error}]);
		}

	}

	api.addShipmentCompra = async function (req, res, next) {

		try {

			//var CDSHIPME = await daoCompra.buscarUltimoId(req);

			req.body.CDSHIPME = `CI${tmz.tempoAtual('DDHHmmss')}`;
			req.body.TPPROCES = "I"
			req.body.IDS001 = req.headers.ids001 ? req.headers.ids001:97

			req.objConn = await dao.controller.getConnection();

			var IDW002 = await dao.importarShipment(req, res, next);
			req.body.IDW002 = IDW002.id;
				
			await daoCompra.updateDeliveriesToShipment(req, res, next);

			await req.objConn.close();

			res.status(201).send([{status:"success", message: `O Shipment ${IDW002.id} foi criado com sucesso!`, IDW001: req.body.IDW001[0]}]);

		} catch (err) {

			var error = {};
			error.message = "Erro ao criar Shipment";
			if (process.env.DEBUG && process.env.DEBUG == 1) {
				error.err = err.message;
			}
			res.status(201).send([{status:"error", message:"Erro ao criar Shipment", IDW001: req.body.IDW001}]);
		}

	}

	api.listarDeliveries = async function (req, res, next) {

		try {

			//=:=:=:=:=:=:=:=:VALIDACÕES=:=:==:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:
			var blOk  = true;
			var error = {};

			/* if (!req.body.TPPROCES){
				blOk  = false;
				error = `'TPPROCES' não enviado`;
			}

			else if(req.body.TPPROCES.toUpperCase() != "O" && req.body.TPPROCES.toUpperCase() != "I"){
				blOk = false;
				error = `'TPPROCES:' '${req.body.TPPROCES}' não existe`;
			}

			else if (!req.body.STETAPA){
				blOk  = false;
				error = `'STETAPA' não enviado`;
			}

			else if (req.body.STETAPA < 1 || req.body.STETAPA > 6 ){
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
			} */
			//=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=


			if(blOk){
				req.objConn = await dao.controller.getConnection();

				var rs = await daoCompra.listarDeliveries(req, res, next);
				await req.objConn.close();
	
				res.status(200).send(utilsWare.formatDataGrid(rs, req));
			} else{
				utilsWare.erros(error, error, res);	
			}

		} catch (err) {
			utilsWare.erros("Erro ao buscar Shipments", err, res);

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
	
	return api;

}