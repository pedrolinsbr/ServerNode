module.exports = function (app, cb) {

	const gdao  = app.src.modGlobal.dao.GenericDAO;
	const utils = app.src.utils.FuncoesObjDB;
	
	var api = {};
	api.controller = app.config.ControllerBD;

	const tmz 	   		= app.src.utils.DataAtual;
	const utilsWare 	= app.src.utils.Warehouse;
	
	


	//-=-=-=-=-=-=-=-=-=-=SHIPMENT-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.buscarShipment = async function (req, res, next) {
		req.objConn = req.body.objConn;
		await this.controller.setConnection(req.objConn);
		
		 req.sql = `
					Select W002.IDW002 
					 From W002
					Where W002.SNDELETE = 0
					 And W002.CDSHIPME =  '${utilsWare.formataShipment(req.body.CDSHIPME)}'
				`;
					
		return await gdao.executar(req, res, next);

	}
	
	api.importarShipment = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);
		
		objBanco = {
			table:    'W002'
		  , key:      ['IDW002']
		  , vlFields:  {}
		  }

		  objBanco.vlFields.IDS001 		=  	parseInt(req.body.IDS001); 
		  objBanco.vlFields.SNDELETE 	=  	0;
		  objBanco.vlFields.STETAPA 	=  	2; 
		  objBanco.vlFields.CDSHIPME 	=  	utilsWare.formataShipment(req.body.CDSHIPME);
		  objBanco.vlFields.DTLANCTO 	=  	tmz.dataAtualJS();
		  objBanco.vlFields.TPPROCES	=	req.body.TPPROCES;
		  
		  
		  objBanco.objConn = req.objConn;
		  
		return await gdao.inserir(objBanco, res, next).catch((err) => { 
			throw err 
		});

	}


	api.updateShipment = async function (req, res, next) {

		
		await this.controller.setConnection(req.objConn);

		
		req.sql = `
					Update W002 SET 
						  W002.CDSHIPME 	= '${utilsWare.formataShipment(req.body.CDSHIPME)}'
						, W002.IDS001 		= 	${parseInt(req.body.IDS001)}
						, W002.TPPROCES		= '${req.body.TPPROCES}'
					Where W002.SNDELETE 	= 0
					 And W002.CDSHIPME = '${req.body.IDW002}'

					`;

		return await gdao.executar(req, res, next);

	}


	api.updateShipmentMatch = async function (req, res, next) {

		
		await this.controller.setConnection(req.objConn);

		
		req.sql = `
					Update W002 SET 
						  W002.CDSHIPME 	= '${req.body.CDSHIPME ? utilsWare.formataShipment(req.body.CDSHIPME): ''}'
						, W002.IDS001 		= 	${parseInt(req.body.IDS001)}
						, W002.TPPROCES		= '${req.body.TPPROCES}'
					Where W002.SNDELETE 	= 0
					 And W002.IDW002 = '${req.body.IDW002}'

					`;

		return await gdao.executar(req, res, next);

	}

	//-=-=-=-=-=-=-=-=-=-=DELIVERY-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\


	api.buscarDelivery = async function (req, res, next) {

		req.objConn = req.body.objConn;
		await this.controller.setConnection(req.objConn);
		var aux = "";

		if(req.body.TPPROCES.toUpperCase() == 'O'){
			aux = `And W001.CDOUBOUN = ${req.body.CDOUBOUN}`
		} else {
			aux = `And W001.CDINBOUN = ${req.body.CDINBOUN}`
		}
		
		req.sql = `
					Select W001.IDW001, W001.STETAPA
					 From W001
					Where W001.SNDELETE = 0
					And TPPROCES = '${req.body.TPPROCES}'
					${aux}
					
				`;
					
		return await gdao.executar(req, res, next);

	}

	api.importarDelivery = async function (req, res, next) {

		var DTDELIVE = `${req.body.DTDELIVE.substring(0,4)}-${req.body.DTDELIVE.substring(4,6)}-${req.body.DTDELIVE.substring(6,8)}`
		
		var STATUALI = utilsWare.verificarStatusAtu(req.body.STATUALI, req.body.NRCHADOC, req.body.STNOTA, req.body.TPPROCES );

		var STETAPA = 1;


		if(req.body.TPPROCES=='O' && STATUALI >= 3){
			STETAPA = 2
		}

		if(req.body.TPPROCES=='I' && STATUALI >= 2){
			STETAPA = 2
		}

		

		await this.controller.setConnection(req.objConn);
		
		var objBanco = {
			table:    'W001'
		  , key:      ['IDW001']
		  , vlFields:  {}
		  }

		  objBanco.vlFields.DTLANCTO 	=  	tmz.dataAtualJS();
		  objBanco.vlFields.TPPROCES	=	req.body.TPPROCES;
		  objBanco.vlFields.IDS001	 	= 	parseInt(req.body.IDS001);
		  objBanco.vlFields.DTDELIVE 	= 	tmz.retornaData(DTDELIVE, 'YYYY-MM-DD');
		  objBanco.vlFields.TPDELIVE 	= 	utilsWare.tpDelive(req.body.TPDELIVE);
		  objBanco.vlFields.SNDELETE 	=  	0;		  
		  objBanco.vlFields.PSBRUTO  	=  	req.body.PSBRUTO ? utilsWare.normalizarPeso(req.body.PSBRUTO) : 0;
		  objBanco.vlFields.STETAPA  	=  	STETAPA;
		  objBanco.vlFields.VRDELIVE 	=  	req.body.VRDELIVE;
		  objBanco.vlFields.VRVOLUME	=	req.body.VRVOLUME;
		  objBanco.vlFields.CDINBOUN 	=  	req.body.CDINBOUN; //req.body.CDINBOUN;
		  objBanco.vlFields.CDOUBOUN 	=  	req.body.CDOUBOUN; //req.body.CDOUBOUN
		  objBanco.vlFields.STATUALI 	= 	STATUALI;
		  
		  //REMETENTE
		  objBanco.vlFields.CJREMETE 	=  	req.body.CJREMETE ? req.body.CJREMETE: '';
		  objBanco.vlFields.IEREMETE 	=  	req.body.IEREMETE;
		  objBanco.vlFields.IMREMETE 	=  	req.body.IMREMETE;
		  objBanco.vlFields.NMCLIRE 	=  	req.body.NMCLIRE;
		  objBanco.vlFields.NRCEPRE 	=  	req.body.NRCEPRE;
		  objBanco.vlFields.NRSAPRE 	=  	req.body.NRSAPRE;
		  objBanco.vlFields.NMCIDRE 	=  	req.body.NMCIDRE;
		  objBanco.vlFields.NMESTRE 	=  	req.body.NMESTRE;

		  //DESTINATARIO
		  objBanco.vlFields.CJDESTIN 	=  	req.body.CJDESTIN ? req.body.CJDESTIN: '';
		  objBanco.vlFields.IEDESTIN 	=  	req.body.IEDESTIN;
		  objBanco.vlFields.IMDESTIN 	=  	req.body.IMDESTIN;
		  objBanco.vlFields.NMCLIDE 	=  	req.body.NMCLIDE ? req.body.NMCLIDE: req.body.NMCLIDE1;
		  objBanco.vlFields.NRCEPDE 	=  	req.body.NRCEPDE;
		  objBanco.vlFields.NRSAPDE 	=  	req.body.NRSAPDE;
		  objBanco.vlFields.NMCIDDE 	=  	req.body.NMCIDDE;
		  objBanco.vlFields.NMESTDE 	=  	req.body.NMESTDE;

		  //TRANSPORTADORA
		  objBanco.vlFields.CJTRANSP 	=  	req.body.CJTRANSP ? req.body.CJTRANSP: '';
		  objBanco.vlFields.NMCLITR 	=  	req.body.NMCLITR;
		  objBanco.vlFields.NRCEPTR 	=  	req.body.NRCEPTR;
		  objBanco.vlFields.NRSAPTR 	=  	req.body.NRSAPTR;
		  objBanco.vlFields.NMCIDTR 	=  	req.body.NMCIDTR;
		  objBanco.vlFields.NMESTTR 	=  	req.body.NMESTTR;


		  //CLIENTE
		  objBanco.vlFields.IMCLIENT 	=  	req.body.IMCLIENT;
		  objBanco.vlFields.NMCLICL 	=  	req.body.NMCLICL;
		  objBanco.vlFields.NRCEPCL 	=  	req.body.NRCEPCL;
		  objBanco.vlFields.NRSAPCL 	=  	req.body.NRSAPCL;
		  objBanco.vlFields.NMCIDCL 	=  	req.body.NMCIDCL;
		  objBanco.vlFields.NMESTCL 	=  	req.body.NMESTCL;

		  objBanco.vlFields.IDW002 		=  	req.body.IDW002;

		  objBanco.vlFields.DELICOMP 	=  	req.body.DELICOMP;
		  objBanco.vlFields.NRDELREF 	=  	req.body.NRDELREF;
		  objBanco.vlFields.CDDEPOSI 	=  	req.body.CDDEPOSI;
		  objBanco.vlFields.CDPLAFOR 	=  	req.body.CDPLAFOR;
		  objBanco.vlFields.CDARMFOR 	=  	req.body.CDARMFOR;

		  objBanco.vlFields.IMCLIAG 	=  	req.body.IMCLIAG;
		  objBanco.vlFields.NMCLIAG 	=  	req.body.NMCLIAG;
		  objBanco.vlFields.NRCEPAG 	=  	req.body.NRCEPAG;
		  objBanco.vlFields.NMCIDAG 	=  	req.body.NMCIDAG;
		  objBanco.vlFields.NMESTAG 	=  	req.body.NMESTAG;
		  //objBanco.vlFields.NRSAPAG 	=  	req.body.NRSAPAG;



		  objBanco.vlFields.DTGERDEL 	=  	tmz.retornaData(req.body.CREDAT + req.body.CRETIM, 'YYYYMMDDHHmmss');
		  

		  objBanco.vlFields.CREDAT 		=  	req.body.CREDAT;

		  objBanco.vlFields.CRETIM 		=  	req.body.CRETIM;

		  objBanco.vlFields.DOCNUM 		=  	req.body.DOCNUM;

		  objBanco.objConn 				= 	req.objConn;	
		  
		return await gdao.inserir(objBanco, res, next).catch((err) => { 
			throw err;
		});

	}

	api.updateDelivery = async function (req, res, next) {
		
		var DTDELIVE = `${req.body.DTDELIVE.substring(0,4)}-${req.body.DTDELIVE.substring(4,6)}-${req.body.DTDELIVE.substring(6,8)}`;
		DTDELIVE = tmz.retornaData(DTDELIVE, 'YYYY-MM-DD');

		var STATUALI = utilsWare.verificarStatusAtu(req.body.STATUALI, req.body.NRCHADOC, req.body.STNOTA, req.body.TPPROCES);
		var TPDELIVE = utilsWare.tpDelive(req.body.TPDELIVE);

		var STETAPA = 1;

		if(req.body.TPPROCES=='O' && STATUALI >= 3){
			STETAPA = 2
		}

		if(req.body.TPPROCES=='I' && STATUALI >= 2){
			STETAPA = 2
		}

		DTGERDEL = tmz.formataData(tmz.retornaData(req.body.CREDAT + req.body.CRETIM, 'YYYYMMDDHHmmss' ), 'YYYY-MM-DD HH:mm:ss')

		
		await this.controller.setConnection(req.objConn);


		req.sql = `
					Update W001 SET 

						--W001.DTLANCTO 	=  	'${tmz.dataAtualJS()}'
						  W001.TPPROCES		=	'${req.body.TPPROCES ? req.body.TPPROCES : '' }'
						, W001.IDS001	 	= 	 ${parseInt(req.body.IDS001)}
						--, W001.DTDELIVE 	= 	'${DTDELIVE ? DTDELIVE : ''}'
						, W001.TPDELIVE 	= 	${TPDELIVE ? TPDELIVE : 0}		  
						, W001.PSBRUTO  	=  	${req.body.PSBRUTO ? req.body.PSBRUTO : 0}
						, W001.VRDELIVE 	=  	${req.body.VRDELIVE ? req.body.VRDELIVE : 0}
						, W001.VRVOLUME		=	${req.body.VRVOLUME ? req.body.VRVOLUME : 0}
						, W001.CDINBOUN 	=  	'${req.body.CDINBOUN ? req.body.CDINBOUN : ''}'
						, W001.CDOUBOUN 	=  	'${req.body.CDOUBOUN ? req.body.CDOUBOUN : ''}'
						, W001.STATUALI 	= 	${STATUALI ? STATUALI : 0}

						--REMETENTE
						, W001.CJREMETE 	=  	'${req.body.CJREMETE ? req.body.CJREMETE : ''}'
						, W001.IEREMETE 	=  	'${req.body.IEREMETE ? req.body.IEREMETE : ''}'
						, W001.IMREMETE 	=  	'${req.body.IMREMETE ? req.body.IMREMETE : ''}'
						, W001.NMCLIRE 		=  	'${req.body.NMCLIRE  ? req.body.NMCLIRE  : ''}'
						, W001.NRCEPRE 		=  	'${req.body.NRCEPRE  ? req.body.NRCEPRE  : ''}'
						, W001.NRSAPRE 		=  	'${req.body.NRSAPRE  ? req.body.NRSAPRE  : ''}'
						, W001.NMCIDRE 		=  	'${req.body.NMCIDRE  ? req.body.NMCIDRE  : ''}'
						, W001.NMESTRE 		=  	'${req.body.NMESTRE  ? req.body.NMESTRE  : ''}'

						--DESTINATARIO
						, W001.CJDESTIN 	=  	'${req.body.CJDESTIN ? req.body.CJDESTIN : ''}'
						, W001.IEDESTIN 	=  	'${req.body.IEDESTIN ? req.body.IEDESTIN : ''}'
						, W001.IMDESTIN 	=  	'${req.body.IMDESTIN ? req.body.IMDESTIN : ''}'
						, W001.NMCLIDE 		=  	'${req.body.NMCLIDE  ? req.body.NMCLIDE  : req.body.NMCLIDE1}'
						, W001.NRCEPDE 		=  	'${req.body.NRCEPDE  ? req.body.NRCEPDE  : ''}'
						, W001.NRSAPDE 		=  	'${req.body.NRSAPDE  ? req.body.NRSAPDE  : ''}'
						, W001.NMCIDDE 		=  	'${req.body.NMCIDDE  ? req.body.NMCIDDE  : ''}'
						, W001.NMESTDE	 	=  	'${req.body.NMESTDE  ? req.body.NMESTDE  : ''}'
	
						--TRANSPORTADORA
						, W001.CJTRANSP 	=  	'${req.body.CJTRANSP ? req.body.CJTRANSP : ''}'
						, W001.NMCLITR 		=  	'${req.body.NMCLITR  ? req.body.NMCLITR  : ''}'
						, W001.NRCEPTR 		=  	'${req.body.NRCEPTR  ? req.body.NRCEPTR  : ''}'
						, W001.NRSAPTR 		=  	'${req.body.NRSAPTR  ? req.body.NRSAPTR  : ''}'
						, W001.NMCIDTR 		=  	'${req.body.NMCIDTR  ? req.body.NMCIDTR  : ''}'
						, W001.NMESTTR 		=  	'${req.body.NMESTTR  ? req.body.NMESTTR  : ''}'

						--CLIENTE
						, W001.IMCLIENT 	=  	'${req.body.IMCLIENT ? req.body.IMCLIENT : ''}'
						, W001.NMCLICL 		=  	'${req.body.NMCLICL  ? req.body.NMCLICL  : ''}'
						, W001.NRCEPCL 		=  	'${req.body.NRCEPCL  ? req.body.NRCEPCL  : ''}'
						, W001.NRSAPCL	 	=  	'${req.body.NRSAPCL  ? req.body.NRSAPCL  : ''}'
						, W001.NMCIDCL 		=  	'${req.body.NMCIDCL  ? req.body.NMCIDCL  : ''}'
						, W001.NMESTCL 		=  	'${req.body.NMESTCL  ? req.body.NMESTCL  : ''}'

						, W001.IDW002 		=  	'${req.body.IDW002}'

						, W001.DELICOMP 	=  	'${req.body.DELICOMP ? req.body.DELICOMP : ''}'

						,W001.CDPLAFOR		=  '${req.body.CDPLAFOR ? req.body.CDPLAFOR : ''}'
						,W001.CDARMFOR		=  '${req.body.CDARMFOR ? req.body.CDARMFOR : ''}'
											
						, W001.STETAPA		=   ${req.body.ULTETAPA < 3 ? STETAPA : req.body.ULTETAPA }

						, W001.DTGERDEL		= TO_DATE('${DTGERDEL}', 'YYYY-MM-DD HH24:MI:SS')
						, W001.CREDAT		= '${req.body.CREDAT }'
						, W001.CRETIM		= '${req.body.CRETIM }'
						, W001.DOCNUM		= '${req.body.DOCNUM}'

					Where W001.SNDELETE 	= 0
					 And W001.IDW001 = ${req.body.IDW001}

					`;

		return await gdao.executar(req, res, next).catch((err) => { 
			throw err 
		});

	}

	//-=-=-=-=-=-=-=-=-=-=NOTA FISCAL-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
	api.buscarNf = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);
		
		var sql = `
					Select W004.IDW004 
					 From W004
					 Inner Join W003 ON W003.IDW004 = W004.IDW004
					 Inner Join W001 ON W003.IDW001 = W001.IDW001
					Where W004.SNDELETE = 0
					 AND W003.SNDELETE = 0
					 And W001.IDW001 = ${ req.body.IDW001 }
					 And  W004.NRNOTA= ${ req.body.NRNOTA ? req.body.NRNOTA : 0 }
					Group By W004.IDW004
					 
				`;
					
		return await gdao.executar({sql}, res, next);

	}

	api.importarNf = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);
		
		var objBanco = {
			table:    'W004'
		  , key:      ['IDW004']
		  , vlFields:  {}
		  }

		  var NRCHADOC = req.body.NRCHADOC ? req.body.NRCHADOC.replace(/\s/g, ""): '';

		  var NMPLADES = "";

		  //definir planta de destino
		  if(req.body.TPPROCES == "O" && req.body.NMPLADES){
			  NMPLADES = req.body.NMPLADES;
		  } else if(req.body.TPPROCES == "O" && req.body.NMPLAORI ){
				NMPLADES = req.body.NMPLAORI;
		  }

		  objBanco.vlFields.IDS001 		=  	parseInt(req.body.IDS001); 
		  objBanco.vlFields.SNDELETE 	=  	0;
		  objBanco.vlFields.NRNOTA 		=  	req.body.NRNOTA;
		  objBanco.vlFields.NRSERINF 	=  	req.body.NRSERINF;
		  objBanco.vlFields.NRCHADOC 	=  	NRCHADOC;
		  objBanco.vlFields.DSMODENF 	=  	req.body.DSMODENF;
		  objBanco.vlFields.NRNFREF 	=  	req.body.NRNFREF;
		  objBanco.vlFields.STNOTA 		=  	req.body.STNOTA;
		  objBanco.vlFields.VRNOTA 		=  	req.body.VRNOTA;
		  objBanco.vlFields.PSNOTA		=  	req.body.PSNOTA ? req.body.PSNOTA : 0;
		  objBanco.vlFields.NMPLADES 	=  	NMPLADES;

		  objBanco.objConn = req.objConn;
		  
		return await gdao.inserir(objBanco, res, next).catch((err) => { 
			throw err 
		});

	}

	api.updateNf = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		var NRCHADOC = req.body.NRCHADOC.replace(/\s/g, "");

		var NMPLADES = "";

		  //definir planta de destino
		  if(req.body.TPPROCES == "O" && req.body.NMPLADES){
			  NMPLADES = req.body.NMPLADES;
		  } else if(req.body.TPPROCES == "O" && req.body.NMPLAORI ){
				NMPLADES = req.body.NMPLAORI;
		  }
		
		req.sql = `
					Update W004 SET 

						  W004.NRNOTA 		=  	${ req.body.NRNOTA ? req.body.NRNOTA : 0   }
						, W004.IDS001	 	= 	 ${parseInt(req.body.IDS001)}
						, W004.NRSERINF 	=  	${ req.body.NRSERINF ? req.body.NRSERINF : 0 }
						, W004.NRCHADOC 	=  	'${ NRCHADOC ? NRCHADOC : '' }'
						, W004.DSMODENF 	=  	'${ req.body.DSMODENF ? req.body.DSMODENF : '' }'
						, W004.NRNFREF 		=  	'${ req.body.NRNFREF ? req.body.NRNFREF : '' }'
						, W004.STNOTA 		=  	${ req.body.STNOTA ? req.body.STNOTA : 0 }
						, W004.VRNOTA 		=  	${ req.body.VRNOTA ? req.body.VRNOTA : 0 }
						, W004.PSNOTA 		=  	${ req.body.PSNOTA ? req.body.PSNOTA : 0 }
						, W004.NMPLADES 	=  	'${ NMPLADES }'
					Where W004.IDW004		= 	${ req.body.IDW004}	
				`;

				return await gdao.executar(req, res, next);

	}


	api.updateNfMatch = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		var NRCHADOC = req.body.NRCHADOC.replace(/\s/g, "");

		var NMPLADES = "";

		  //definir planta de destino
		  if(req.body.TPPROCES == "O" && req.body.NMPLADES){
			  NMPLADES = req.body.NMPLADES;
		  } else if(req.body.TPPROCES == "O" && req.body.NMPLAORI ){
				NMPLADES = req.body.NMPLAORI;
		  }
		
		req.sql = `
					Update W004 SET 

						  --W004.NRNOTA 		=  	${ req.body.NRNOTA ? req.body.NRNOTA : 0   }
						--, W004.NRSERINF 	=  	${ req.body.NRSERINF ? req.body.NRSERINF : 0 }
						  W004.NRCHADOC 	=  	'${ NRCHADOC ? NRCHADOC : '' }'
						, W004.DSMODENF 	=  	'${ req.body.DSMODENF ? req.body.DSMODENF : '' }'
						, W004.IDS001	 	= 	 ${parseInt(req.body.IDS001)}
						, W004.NRNFREF 		=  	'${ req.body.NRNFREF ? req.body.NRNFREF : '' }'
						, W004.STNOTA 		=  	${ req.body.STNOTA ? req.body.STNOTA : 0 }
						, W004.VRNOTA 		=  	${ req.body.VRNOTA ? req.body.VRNOTA : 0 }
						, W004.PSNOTA 		=  	${ req.body.PSNOTA ? req.body.PSNOTA : 0 }
						, W004.NMPLADES 	=  	'${ NMPLADES }'
					Where W004.IDW004		= 	${ req.body.IDW004}	

				`;

				return await gdao.executar(req, res, next);

	}

	//-=-=-=-=-=-=-=-=-=-=ITEM-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.buscarItem = async function (req, res, next) {

		req.objConn = req.body.objConn;
		await this.controller.setConnection(req.objConn);
		
		req.sql = `
					Select W003.IDW003
					 From W003
					Where W003.SNDELETE = 0
					 And IDW001 	= ${ req.body.IDW001 }	
					 And CDMATERI 	= '${ req.body.CDMATERI }'	
					 And NRITEM 	= ${ req.body.NRITEM }	
				`;
					
		return await gdao.executar(req, res, next);

	}
	
	
	api.importarItem = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);
		
		
		var objBanco = {
			table:    'W003'
		  , key:      ['IDW003']
		  , vlFields:  {}
		  }

		  objBanco.vlFields.IDS001 		=  	parseInt(req.IDS001);
		  objBanco.vlFields.SNDELETE 	=  	0;		  
		  objBanco.vlFields.CDMATERI 	=  	req.CDMATERI;
		  objBanco.vlFields.DSMATERI 	=  	req.DSMATERI;
		  objBanco.vlFields.NMMATGRO  	=  	req.NMMATGRO;
		  objBanco.vlFields.NMPLAORI  	=  	req.NMPLAORI;
		  objBanco.vlFields.NMSTOLOC 	=  	req.NMSTOLOC;
		  objBanco.vlFields.NRLOTE		=	req.NRLOTE;
		  objBanco.vlFields.QTITEMVE	=  	req.QTITEMVE;
		  objBanco.vlFields.DSMEDIVE 	=  	req.DSMEDIVE;
		  objBanco.vlFields.QTITEMBA	=  	req.QTITEMBA;
		  objBanco.vlFields.DSMEDIBA 	=  	req.DSMEDIBA;
		  objBanco.vlFields.NRITEM 		=  	req.NRITEM;
		  objBanco.vlFields.NRMAPA 		=  	req.NRMAPA;
		  objBanco.vlFields.DSALFANU 	=  	req.DSALFANU;
		  objBanco.vlFields.DTVALIDA 	=  	req.DTVALIDA ? tmz.retornaData(req.DTVALIDA, 'DD.MM.YYYY') : tmz.retornaData('02.01.1889', 'DD.MM.YYYY');
		  objBanco.vlFields.DTFABRIC 	=  	req.DTFABRIC ? tmz.retornaData(req.DTFABRIC, 'DD.MM.YYYY') : tmz.retornaData('02.01.1889', 'DD.MM.YYYY');
		  objBanco.vlFields.IDW001 		=  	req.IDW001;
		  objBanco.vlFields.IDW004 		=  	req.IDW004 ? req.IDW004: null;
		  objBanco.vlFields.NRREFERE 	=  	req.NRREFERE;
		  objBanco.vlFields.STITEM 		=  	req.STITEM;
		  objBanco.vlFields.NMARMITE 	=  	req.NMARMITE;
		  objBanco.vlFields.NRPONMBR 	=  	req.NRPONMBR;
		  objBanco.vlFields.NRPOLNIT 	=  	req.NRPOLNIT;
		  objBanco.vlFields.CDDEPOSI 	=  	req.STNOTA == 0 ? 'BEWM' : 'DEWM';
		  
		  objBanco.objConn = req.objConn;
		  
		return await gdao.inserir(objBanco, res, next).catch((err) => { 
			throw err 
		});

	}

	api.updateItem = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		var DTVALIDA = tmz.formataData(tmz.retornaData(req.DTVALIDA, 'DD.MM.YYYY'), 'YYYY-MM-DD');
		var DTFABRIC = tmz.formataData(tmz.retornaData(req.DTFABRIC, 'DD.MM.YYYY'), 'YYYY-MM-DD');
		var aux = '';

		if(req.statusNota){
			aux = `, IDW004 		=  	'${ req.IDW004 ? req.IDW004 : '' }'`
		}

		req.sql = `
					Update W003 SET 
	  
						  CDMATERI 		=  	'${ req.CDMATERI ? req.CDMATERI : '' }'
						, DSMATERI 		=  	'${ req.DSMATERI ? req.DSMATERI : '' }'
						, NMMATGRO  	=  	'${ req.NMMATGRO ? req.NMMATGRO : '' }'
						, NMPLAORI  	=  	'${ req.NMPLAORI ? req.NMPLAORI : '' }'
						, NMSTOLOC 		=  	'${ req.NMSTOLOC ? req.NMSTOLOC : '' }'
						, NRLOTE		=	'${ req.NRLOTE ? req.NRLOTE : '' }'
						, QTITEMVE		=  	'${ req.QTITEMVE ? req.QTITEMVE : '' }'
						, DSMEDIVE 		=  	'${ req.DSMEDIVE ? req.DSMEDIVE : '' }'
						, QTITEMBA		=  	'${ req.QTITEMBA ? req.QTITEMBA : '' }'
						, DSMEDIBA 		=  	'${ req.DSMEDIBA ? req.DSMEDIBA : '' }'
						, NRITEM 		=  	'${ req.NRITEM ? req.NRITEM : '' }'
						, NRMAPA 		=  	'${ req.NRMAPA ? req.NRMAPA : '' }'
						, DSALFANU 		=  	'${ req.DSALFANU ? req.DSALFANU : '' }'
						, DTVALIDA 		=  	TO_DATE('${ DTVALIDA }' , 'YYYY-MM-DD')
						, DTFABRIC 		=  	TO_DATE('${ DTFABRIC }' , 'YYYY-MM-DD')
						, IDW001 		=  	'${ req.IDW001 ? req.IDW001 : '' }'
						${aux}
						, NRREFERE 		=  	'${ req.NRREFERE ? req.NRREFERE : '' }'
						, STITEM 		=  	'${ req.STITEM ? req.STITEM : '' }'
						, NMARMITE 		=  	'${ req.NMARMITE ? req.NMARMITE : '' }'
						, NRPOLNIT		=	'${ req.NRPOLNIT ? req.NRPOLNIT : '' }'
						, NRPONMBR		=	'${ req.NRPONMBR ? req.NRPONMBR : '' }'
						, W003.IDS001	= 	 ${parseInt(req.body.IDS001)}

					Where 
						  IDW003 		= ${req.IDW003}

				`;

		return await gdao.executar(req, res, next).catch((err) => { 
			throw err 
		});;

	}

	api.cancelarDelivery = async function (req, res, next) {
		var aux = "";
		if(req.TPPROCES == "O"){
			aux = `CDOUBOUN = '${req.CDOUBOUN}'`;
		} else {
			aux = `CDINBOUN = '${req.CDINBOUN}'`;
		}
		
		await this.controller.setConnection(req.objConn);

		req.sql = `
					Update W001 SET 
						--W001.SNDELETE = 1,
						W001.STETAPA = ${req.STETAPA},
						W001.STATUALI = 9
					Where ${aux}
				`;

		return await gdao.executar(req, res, next);

	}

	api.buscarDeliveryCancelamento = async function(req, res, next){

		var aux = "";
		if(req.TPPROCES == "O"){
			aux = `CDOUBOUN = '${req.CDOUBOUN}'`;
		} else {
			aux = `CDINBOUN = '${req.CDINBOUN}'`;
		}


		
		await this.controller.setConnection(req.objConn);

		req.sql = `
					Select IDW001, STETAPA, SNCANBRA From w001
					Where ${aux}
				`;
	
		return await gdao.executar(req, res, next);

	}


	api.importarInventario = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);
		
		objBanco = {
			table:    'W007'
		  , key:      ['IDW007']
		  , vlFields:  {}
		  }

		  objBanco.vlFields.IDS001 		=  	97; 
		  objBanco.vlFields.SNDELETE 	=  	0;
		  objBanco.vlFields.NRDOCUME 	=  	req.body.NRDOCUME;
		  objBanco.vlFields.DTINVENT 	=  	tmz.retornaData(req.body.DTINVENT, "YYYYMMDD");
		  objBanco.vlFields.NRINVENT 	=  	req.body.NRINVENT;
		  objBanco.vlFields.CDFILIAL 	=  	req.body.CDFILIAL;
		  objBanco.vlFields.CDDEPOSI 	=  	req.body.CDDEPOSI;
		  objBanco.vlFields.DTCADAST 	=  	tmz.dataAtualJS();
		  objBanco.vlFields.STETAPA 	=   1;

		  objBanco.objConn = req.objConn;
		  
		return await gdao.inserir(objBanco, res, next).catch((err) => { 
			throw err 
		});

	}

	api.importarItemInventario = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);
		
		objBanco = {
			table:    'W008'
		  , key:      ['IDW008']
		  , vlFields:  {}
		  }


		  objBanco.vlFields.SNDELETE 	=  	0;
		  objBanco.vlFields.IDW007 		=  	req.IDW007;
		  objBanco.vlFields.NRLNITEM 	=  	req.NRLNITEM;
		  objBanco.vlFields.CDMATERI 	=  	req.CDMATERI;
		  objBanco.vlFields.DSMATERI 	=  	req.DSMATERI;
		  objBanco.vlFields.QTMATERI	=  	req.QTMATERI;
		  objBanco.vlFields.DSMEDIDA	=  	req.DSMEDIDA;
		  objBanco.vlFields.NRLOTE		=  	req.NRLOTE;
		  //objBanco.vlFields.NRLTINDU	=  	req.NRLTINDU;
		  objBanco.vlFields.NRALFANU 	=  	req.NRALFANU;
		  objBanco.vlFields.VRVOLUME 	=  	req.VRVOLUME;
		  objBanco.vlFields.DSRESPON	=  	req.DSRESPON;
		  objBanco.vlFields.DSVERSAO	=  	req.DSVERSAO;

		  objBanco.objConn = req.objConn;
		  
		return await gdao.inserir(objBanco, res, next).catch((err) => { 
			throw err 
		});

	}

	api.buscarCompraIndustrial = async function (req, res, next) {

		req.objConn = req.body.objConn;
		await this.controller.setConnection(req.objConn);
		
		 req.sql = `
					SELECT
						  W004.IDW004 
						, W003.IDW003 
						, W001.IDW001 
						, W002.IDW002
					FROM W004
					INNER JOIN W003 ON W004.IDW004 = W003.IDW004
					INNER JOIN W001 ON W003.IDW001= W001.IDW001
					INNER JOIN W002 ON W001.IDW002= W002.IDW002
					WHERE W004.NRNOTA = ${parseInt(req.body.NRNFREF)}
					AND W003.SNDELETE = 0
					AND W001.SNDELETE = 0
				`;
					
		return await gdao.executar(req, res, next);
	}

	api.listDeliveries = async function (req, res, next) {
		
		var parm = {};
		parm.objConn = req.objConn;
		await this.controller.setConnection(parm.objConn);

		var aux = "AND  G082.PKS007 = 0";
		if(req.body.params.TIPO=="P"){
			aux = "AND  G082.PKS007 <> 0";
		   }

		//var filtros = utilsWare.criarfiltros(req.body.params.filtros);

		parm.sql = 
			`SELECT G082.IDG082 
					, G082.IDS007
					, G082.NMDOCUME AS FILENAME
					, G082.DTDOCUME
					, W001.IDW001 AS NRDELIVERY
					--, W001.CDOUBOUN AS CDDELIVE
					, COUNT(G082.IDS007) OVER() AS COUNT_LINHA
				FROM 
				G082
				LEFT JOIN W001 ON W001.IDW001 = G082.PKS007
				WHERE G082.TPDOCUME = 'WAR'
				AND G082.SNDELETE = 0
				${aux}
				ORDER BY G082.DTDOCUME DESC
				${utilsWare.paginar(req.body.pageNumber, req.body.size)}
				`;

		return await gdao.executar(parm, res, next);
    
	}

	
	api.getXmlDeliveryToString = async function (req, res, next) {

		var strBlob = ``;
		var parm = {};

		parm.objConn = req.objConn;
		await this.controller.setConnection(parm.objConn);

		parm.fetchInfo = [{ column: 'CTDOCUME', type: 'BLOB' }];
		strBlob = 'G082.CTDOCUME';

		parm.sql =
			`SELECT 
                    G082.IDG082,
                    G082.PKS007,
                    G082.STDOCUME,
                    G082.TMDOCUME,
                    G082.TPDOCUME,
                    G082.NMDOCUME,
                    G082.DSMIMETP,                    
                    TO_CHAR(G082.DTDOCUME, 'DD/MM/YYYY HH24:MI:SS') DTDOCUME,
                    ${strBlob}
        
                FROM G082
			
                WHERE 
					G082.SNDELETE = 0
					AND IDG082 = ${req.params.IDG082}`;

		return await gdao.executar(parm, res, next);


	}

	api.validarImportacaoDocNum = async function (req, res, next) {
		try {

			req.objConn = req.objConn;
			await this.controller.setConnection(req.objConn);
			
			 req.sql = `
						SELECT
							  IDW001, 
							  DOCNUM
						FROM W001
						WHERE CDOUBOUN = '${req.CDOUBOUN}'
						AND TPPROCES = '${req.TPPROCES}'
					`;
						
			return await gdao.executar(req, res, next);
			
		} catch (error) {
			console.log(error);
		}


	}

	api.apagarItens = async function (req, res, next) {

		
		await this.controller.setConnection(req.objConn);

		
		req.sql = `
					Update W003 SET 
						  W003.SNDELETE = 1
					Where W003.IDW001 = ${req.body.IDW001}
					  And W003.SNDELETE = 0
					`;

		return await gdao.executar(req, res, next);

	}



	return api;
}


