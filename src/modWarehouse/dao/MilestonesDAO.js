module.exports = function (app, cb) {

	const gdao  = app.src.modGlobal.dao.GenericDAO;
	const utils = app.src.utils.FuncoesObjDB;
	
	var api = {};
	api.controller = app.config.ControllerBD;

	const tmz 	   		= app.src.utils.DataAtual;
	const utilsWare 	= app.src.utils.Warehouse;
	

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.buscarDadosPGR = async function (req, res, next) {
		
		await this.controller.setConnection(req.objConn);

		try {

			req.sql = `SELECT 
							W001.IDW001
						,	W001.CDOUBOUN
						,	W001.CDINBOUN
						,	W003.CDMATERI
						,	W003.NMPLAORI
						,	W003.NMSTOLOC
						,	W003.NRLOTE
						,   W003.NRMAPA
						,	W003.DSALFANU
						,	W003.QTITEMVE
						,	W003.DSMEDIVE
						,	W003.NRITEM
						,	W003.DTVALIDA
						,	W003.NRPOLNIT
						,	W003.NRPONMBR
						,	W004.NRNOTA
						FROM W001
						INNER JOIN W002
							ON W002.IDW002 = W001.IDW002
						INNER JOIN W003
							ON W003.IDW001 = W001.IDW001
						INNER JOIN W004
							ON W004.IDW004 = W003.IDW004
						WHERE W001.CDOUBOUN IS NOT NULL
							AND W003.SNDELETE = 0
							AND W001.CDINBOUN IS NOT NULL
							AND W001.IDW001 IN (${req.body.IDW001})`;

		return await gdao.executar(req, res, next);

		} catch (err) {
	
			throw err;
	
		}
		
	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
	api.listarMilestones = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);
		var aux = "And SNENVIAD = 1 ";
		var nrTipo = "";

		if (req.body.params.tipo != "SEN") {
			aux = ` And SNENVIAD = 0 `
			nrTipo = ` And NRTIPO = ${utilsWare.tipoMilestoneNr(req.body.params.tipo)}`
		}

		req.sql = `
							Select 
								W006.IDW006 -- ID DO MILESTONE
							, TO_CHAR(W006.DTCADAST, 'YYYY-MM-DD') AS DTCADAST
							, W006.DTMILEST
							, W001.IDW001
							, W001.CDOUBOUN
							
							, CASE W006.NRTIPO
								WHEN '1' THEN 'GRB'
								WHEN '2' THEN 'GRL'
								WHEN '3' THEN 'GRW'
								WHEN '4' THEN 'PGR'
								END AS TIPO
							
							, W002.CDSHIPME -- SHIPMENT
							, COUNT(W006.IDW006) OVER() AS COUNT_LINHA
						From W006
						INNER JOIN W001 ON W001.IDW001 = W006.IDW001
						INNER JOIN W002 ON W002.IDW002 = W001.IDW002
						Where W006.SNDELETE = 0
						${aux}
						${nrTipo}
						${utilsWare.ordenar(req, "W006.IDW006")} 
						${utilsWare.paginar(req.body.pageNumber, req.body.size)}
					`;

		return await gdao.executar(req, res, next);

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
	api.inserirMilestone = async function (req, res, next) {
		await this.controller.setConnection(req.objConn);
		
		objBanco = {
			table:    'W006'
		  , key:      ['IDW006']
		  , vlFields:  {}
		  }

		 
		  objBanco.vlFields.IDS001 		=  	req.IDS001 ? req.IDS001: 97 ; 
		  objBanco.vlFields.SNDELETE 	=  	0;
		  objBanco.vlFields.DTCADAST 	=  	tmz.dataAtualJS();
		  objBanco.vlFields.SNENVIAD	=	0;
		  objBanco.vlFields.IDW001		=	req.IDW001;
		  objBanco.vlFields.NRTIPO 		=  	req.NRTIPO
		  objBanco.vlFields.DTMILEST	=	req.DTMILEST;
		  
		  
		  objBanco.objConn = req.objConn;
		  
		return await gdao.inserir(objBanco, res, next).catch((err) => { 
			throw err 
		});

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
	api.buscarMilestones = async function (req, res, next){
		await this.controller.setConnection(req.objConn);
		
		req.sql = `
						Select 
							W006.IDW006, W001.IDW001, W006.NRTIPO, W006.DTMILEST, 
							W001.CDOUBOUN, W001.CDINBOUN, W001.TPPROCES
						From W006
						Inner Join W001 ON W001.IDW001 = W006.IDW001
						Where IDW006 in (${req.body.params.IDW006})
					`;

		return await gdao.executar(req, res, next);

	}

	api.atualizarMilestone = async function (req, res, next){
		
		await this.controller.setConnection(req.objConn);

		req.sql = `
					Update W006 SET 
						SNENVIAD = 1
					Where IDW006 = ${req.IDW006}
				`;

		return await gdao.executar(req, res, next);
	}

	api.verificarBR52 = async function (req, res, next){

		await this.controller.setConnection(req.objConn);


		if (req.TPROCESS = 'O') {
			req.sql = `
			Select NMPLAORI FROM W003
			WHERE IDW001 = ${req.IDW001}
			AND NMPLAORI = 'BR52'
			`
		} else{
			req.sql = `
			Select 
				W004.NMPLADES 
			FROM W004
			INNER JOIN W003 ON W003.IDW003 = W004.IDW003
			WHERE W003.IDW001 = ${req.IDW001}
			AND W003.SNDELETE = 0
			AND NMPLADES = 'BR52'
			`
		}

		return await gdao.executar(req, res, next);

	}

	api.atualizarStatusBR52 = async function (req, res, next){
		
		await this.controller.setConnection(req.objConn);

		req.sql = `
					Update W001 SET 
						STETAPA = ${req.STETAPA}
					Where IDW001 = ${req.IDW001}
				`;

		return await gdao.executar(req, res, next);
	}

	api.buscarDadosHC = async function (req, res, next){

		await this.controller.setConnection(req.objConn);

		req.sql = `
					Update W001 SET 
							STETAPA = ${req.STETAPA}
					Where IDW001 = ${req.IDW001}
				`;

		return await gdao.executar(req, res, next);


	}

	api.verificarFinalizado = async function (req, res, next){
		await this.controller.setConnection(req.objConn);
		
		req.sql = `
						Select 
							IDW001,
							NRTIPO
						From W006
						Where IDW001 in (${req.IDW001})
						and SNENVIAD = 1
						GROUP BY IDW001, NRTIPO
					`;

		return await gdao.executar(req, res, next);

	}

	api.verificarMilestoneCriado = async function (req, res, next){

		await this.controller.setConnection(req.objConn);
		
		req.sql = `
						Select 
							count(IDW006) IDW006
						From W006
						Where IDW001 in (${req.IDW001})
						and NRTIPO = ${req.NRTIPO}
					`;

		return await gdao.executar(req, res, next);

	}

	api.verificarMilestoneCriadoSap = async function (req, res, next){

		await this.controller.setConnection(req.objConn);
		
		req.sql = `
						Select 
							W006.IDW006, W001.STETAPA
						From W006
						inner join W001
							ON W001.IDW001 = W006.IDW001
						Where W006.IDW001 in (${req.IDW001})
						and W006.NRTIPO = ${req.NRTIPO}
					`;

		return await gdao.executar(req, res, next);

	}

	api.buscarDeliveryCarga = async function (req, res, next){

		await this.controller.setConnection(req.objConn);

		var TPPROCES = 'O'

		if(req.TPPROCES == 'D'){
			TPPROCES = 'I'
		}
		
		req.sql = `
					SELECT W001.IDW001 , G046.PSCARGA
					FROM G046
					INNER JOIN G048
						ON G046.IDG046 = G048.IDG046
					INNER JOIN G049
						ON G049.IDG048 = G048.IDG048
					INNER JOIN G043
						ON G049.IDG043 = G043.IDG043
					INNER JOIN W001
						ON regexp_replace(G043.CDDELIVE, '[^0-9]', '') = W001.CDOUBOUN
					WHERE G046.IDG046 in (${req.IDG046})
					AND W001.TPPROCES = '${TPPROCES}'

					`;

		return await gdao.executar(req, res, next);

	}

	api.retornarOutbound = async function (req, res, next) {

		var parm = { objConn: req.objConn };

		await this.controller.setConnection(parm.objConn);

		parm.sql = `SELECT CDOUBOUN FROM W001 WHERE IDW001 = ${req.IDW001}`;

		return await gdao.executar(parm, res, next);

	}


	return api;
}


