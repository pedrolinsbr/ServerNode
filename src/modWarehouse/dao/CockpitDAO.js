module.exports = function (app, cb) {

	const gdao  = app.src.modGlobal.dao.GenericDAO;
	const utils = app.src.utils.FuncoesObjDB;

	var api = {};
	api.controller = app.config.ControllerBD;

	var acl = app.src.modIntegrador.controllers.FiltrosController;

	const tmz 	   		= app.src.utils.DataAtual;
	const utilsWare 	= app.src.utils.Warehouse;



	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	/**
	 * @description Retorna um array com os dados das cargas para o Cockpit
	 * @author Everton
	 * @since 02/07/2019
	 * @async
	 * @function listarCargas
	 * @return {Array} Retorno da consulta SQL.
	 * @throws {Object} Retorna o erro da consulta.
	 */
	api.listarShipments = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		var tpProces = req.body.params.TPPROCES.toUpperCase();
		var aux;
		if(tpProces == 'O'){
			aux = 'R'
		} else {
			aux = 'D'
		}

		var sql = `
					Select
						  W002.IDW002
						, W002.CDSHIPME
						, W001.TPPROCES
						, MIN(W001.NMCLI${aux}E) AS ARMAZEM
						, W001.STETAPA
						, W002.DTLANCTO
						, COUNT(W002.CDSHIPME) OVER() AS COUNT_LINHA
					From W002
					Inner join W001 On W002.IDW002 = W001.IDW002

					WHERE W001.SNDELETE = 0
					  AND W001.TPPROCES = '${tpProces}'
					  AND W001.STETAPA = ${req.body.params.STETAPA}

					GROUP BY W002.IDW002, W002.CDSHIPME, W001.TPPROCES, W001.STETAPA, W002.DTLANCTO
					${utilsWare.ordenar(req, "W002.IDW002")}

					${utilsWare.paginar(req.body.pageNumber, req.body.size)}
				`;

		var parm = {sql};

		var rs = await gdao.executar(parm, res, next);

		return rs;

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
	/**
	 * @description Retorna um array com a lista de deliveries que compõe a carga
	 * @author Everton
	 * @since 02/07/2019
	 * @async
	 * @function listarCargas
	 * @return {Array} Retorno da consulta SQL.
	 * @throws {Object} Retorna o erro da consulta.
	 */
	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.listarDeliveries = async function (req, res, next) {

		//var parm = { objConn: req.objConn };

		//await this.controller.setConnection(parm.objConn);

		var aux = ' AND W001.TPDELIVE NOT IN (3, 4) ';
		if(req.body.params.TPPROCES == 'S'){
			aux = ' AND W001.TPDELIVE = 3 '
			req.body.params.TPPROCES = 'I'
		}

		if(req.body.params.TPPROCES == 'A'){
			aux = ' AND W001.TPDELIVE = 4 '
			req.body.params.TPPROCES = 'O'
		}

		var filtros = utilsWare.criarfiltros(req.body.params.filtros);


		var IDS001 = req.headers.ids001;
		var sqlAclClient = '';

		if (IDS001 !== undefined) {
			sqlAclClient = await acl.montar({
				ids001: IDS001,
				dsmodulo: 'WAREHOUSE',
				nmtabela: [{ G028: 'G028' }],
				//dioperad: ' ',
				esoperad: 'AND'
			});
		}

		req.sql = `
		SELECT W001.IDW001,
		W001.CDOUBOUN AS CDDELIVE,
		W001.DTLANCTO,
		W001.STRESERV,
		W001.CJREMETE,
		W001.NMCLIRE,
		W001.IEREMETE,
		W001.NMESTRE,
		W001.CJDESTIN,
		W001.NMCLIDE,
		W001.IEDESTIN,
		W001.NMESTDE,
		W001.NMCLITR,
		'' AS NRDOCTRA,
		W001.STATUALI,
		W001.SNCANBRA,
		W001.IDW005,
		CASE WHEN W001.TPDELIVE = 2 OR W001.TPDELIVE = 4  THEN 'VENDA' ELSE 'TRANSFERÊNCIA' END AS TPDELIVE,
		W004.NRNOTA,
		CASE WHEN W004.STNOTA is null THEN 'LIVRE' END as STNOTA,
		W002.CDSHIPME AS IDW002,
		GRB.NRTIPO AS GRB,
		GRL.NRTIPO AS GRL,
		GRW.NRTIPO AS GRW,
		PGR.NRTIPO AS PGR,
		COUNT(W001.IDW001) OVER() AS COUNT_LINHA
		FROM W001
		INNER JOIN W003
		ON W003.IDW001 = W001.IDW001
		LEFT JOIN W004
		ON W004.IDW004 = W003.IDW004
		INNER JOIN W002
			ON W002.IDW002 = W001.IDW002

		--MILESTONES
		LEFT JOIN (SELECT IDW001, NRTIPO FROM W006 WHERE NRTIPO = 1) GRB
			ON W001.IDW001 = GRB.IDW001
		LEFT JOIN (SELECT IDW001, NRTIPO FROM W006 WHERE NRTIPO = 2) GRL
			ON W001.IDW001 = GRL.IDW001
		LEFT JOIN (SELECT IDW001, NRTIPO FROM W006 WHERE NRTIPO = 3) GRW
			ON W001.IDW001 = GRW.IDW001
		LEFT JOIN (SELECT IDW001, NRTIPO FROM W006 WHERE NRTIPO = 4) PGR
			ON W001.IDW001 = PGR.IDW001


		${utilsWare.joinAclArm(req.body.params.TPPROCES)}

		WHERE W001.SNDELETE = 0
		AND   W003.SNDELETE = 0

		--ACL
		${utilsWare.filtroAclArm()}

		AND W001.TPPROCES = '${req.body.params.TPPROCES.toUpperCase()}'
		AND W001.STETAPA = ${req.body.params.STETAPA}
		${aux}
		${filtros}
		${ sqlAclClient }

		GROUP BY W001.IDW001, W001.DTLANCTO, W001.TPPROCES, W001.STRESERV,
				W001.CJREMETE, W001.NMCLIRE, W001.IEREMETE, W001.NMESTRE,
				W001.CJDESTIN, W001.NMCLIDE, W001.IEDESTIN, W001.NMESTDE,
				W001.NMCLITR, W001.STATUALI, W001.TPDELIVE, W004.NRNOTA,
				W004.STNOTA, W001.CDOUBOUN, W001.CDINBOUN, W001.SNCANBRA,
				W002.CDSHIPME, W001.IDW005, GRB.NRTIPO, GRL.NRTIPO, GRW.NRTIPO, PGR.NRTIPO
				${utilsWare.ordenar(req, "W001.IDW001")}
				${utilsWare.paginar(req.body.pageNumber, req.body.size)}
		`;

		return await gdao.executar(req, res, next);

	}

	api.buscarMilestones = async function (req, res, next) {

		var parm = { objConn: req.objConn };

		await this.controller.setConnection(parm.objConn);

		parm.sql = `
			SELECT
			W001.IDW001,
			CASE W006.NRTIPO
				WHEN '1' THEN 'GRB'
				WHEN '2' THEN 'GRL'
				WHEN '3' THEN 'GRW'
				WHEN '4' THEN 'PGR'
			END AS TIPO,
			DECODE(W006.SNENVIAD, 1, 'TRUE', 'FALSE') AS SNENVIAD
			FROM W001
			INNER JOIN W006 on W001.IDW001 = W006.IDW001
			WHERE W001.IDW001 IN (${req.arIDW001.join()})
			ORDER BY W001.IDW001 ASC
		`;

		return await gdao.executar(parm, res, next);

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
	/**
	 * @description Retorna os dados de preenchimentos cos cards calculados
	 * @author Everton
	 * @since 02/07/2019
	 * @async
	 * @function listarCargas
	 * @return {Array} Retorno da consulta SQL.
	 * @throws {Object} Retorna o erro da consulta.
	 */
	api.calcularCards = async function (req, res, next) {

		//await this.controller.setConnection(req.objConn);

		var aux = ' AND W001.TPDELIVE NOT IN (3, 4) ';
		if(req.body.TPPROCES == 'S'){
			aux = ' AND W001.TPDELIVE = 3 '
			req.body.TPPROCES = 'I'
		}

		if(req.body.TPPROCES == 'A'){
			aux = ' AND W001.TPDELIVE = 4 '
			req.body.TPPROCES = 'O'
		}

		var labels = {ini: "SEPARADO", fim: "CONFERIDO"}

		if(req.body.TPPROCES == "I"){
			labels.ini = "DESCARREGADO"
		}




		var IDS001 = req.headers.ids001

		var sqlAclClient = '';

		if (IDS001 !== undefined) {
			sqlAclClient = await acl.montar({
				ids001: IDS001,
				dsmodulo: 'WAREHOUSE',
				nmtabela: [{ G028: 'G028' }],
				//dioperad: ' ',
				esoperad: 'AND'
			});
		}

		req.sql = `
						SELECT
							  SUM(PRE_ASN) AS PRE_ASN
							, SUM(ANALISE) AS ANALISE
							, SUM(DOC_TRANSPORTE) AS DOC_TRANSPORTE
							, SUM(${labels.ini}) AS ${labels.ini}
							, SUM(${labels.fim}) AS ${labels.fim}
							, SUM(A_CANCELAR) AS A_CANCELAR
							, SUM(CANCELADO) AS CANCELADO
							, SUM(FINALIZADO) AS FINALIZADO
					    FROM (
								SELECT
									CASE
										WHEN STETAPA = 1 THEN 1
											ELSE 0
										END PRE_ASN,

									CASE
										WHEN STETAPA = 2 THEN 1
										ELSE 0
									END ANALISE,

									CASE
										WHEN STETAPA = 3 THEN 1
										ELSE 0
									END DOC_TRANSPORTE,

									CASE
										WHEN STETAPA = 4 THEN 1
										ELSE 0
									END ${labels.ini},

									CASE
										WHEN STETAPA = 5 THEN 1
										ELSE 0
									END ${labels.fim},


									CASE
										WHEN STETAPA = 6 THEN 1
										ELSE 0
									END A_CANCELAR,

									CASE
										WHEN STETAPA = 7 THEN 1
										ELSE 0
									END CANCELADO,

									CASE
										WHEN STETAPA = 8 THEN 1
										ELSE 0
								END FINALIZADO

								FROM (
									SELECT IDW001, STETAPA
									FROM W001
									${utilsWare.joinAclArm(req.body.TPPROCES)}
									WHERE W001.TPPROCES = '${req.body.TPPROCES}'
									--ACL
									${utilsWare.filtroAclArm()}
									${sqlAclClient}
									${aux}
									AND W001.SNDELETE = 0
									GROUP BY IDW001, STETAPA
								)
							)
				`;

		return  await gdao.executar(req, res, next);

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
	/**
	 * @description Retorna os dados de preenchimentos cos cards calculados
	 * @author Everton
	 * @since 02/07/2019
	 * @async
	 * @function listarCargas
	 * @return {Array} Retorno da consulta SQL.
	 * @throws {Object} Retorna o erro da consulta.
	 */
	api.calcularCardsTp = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);


		req.sql = `
						SELECT
							  SUM(PRE_ASN) AS PRE_ASN
							, SUM(ANALISE) AS ANALISE
							, SUM(A_CANCELAR) AS A_CANCELAR
							, SUM(CANCELADO) AS CANCELADO
							, SUM(FINALIZADO) AS FINALIZADO
					    FROM (
								SELECT
									CASE
										WHEN STETAPA = 1 THEN 1
											ELSE 0
										END PRE_ASN,

									CASE
										WHEN STETAPA = 2 THEN 1
										ELSE 0
									END ANALISE,

									CASE
										WHEN STETAPA = 6 THEN 1
										ELSE 0
									END A_CANCELAR,

									CASE
										WHEN STETAPA = 7 THEN 1
										ELSE 0
									END CANCELADO,

									CASE
										WHEN STETAPA = 8 THEN 1
										ELSE 0
								END FINALIZADO

								FROM (
									SELECT IDW001, STETAPA
									FROM W001
									WHERE W001.SNDELETE = 0
									AND W001.TPDELIVE = 3
									GROUP BY IDW001, STETAPA
								)
							)
				`;

		return  await gdao.executar(req, res, next);

	}


	api.buscarCarga = async function (req, res, next) {

		req.sql = `
					SELECT
						G046.DSCARGA, G046.IDG031M1, G046.IDG031M2, G046.IDG031M3, G046.IDG032V1, G046.IDG032V2, G046.IDG032V3,
						G046.IDG024, G046.CDVIAOTI, G046.SNESCOLT, G046.DTCARGA, G046.DTSAICAR, G046.DTPRESAI, G046.PSCARGA, G046.VRCARGA, G046.IDS001,
						G046.SNDELETE, G046.QTVOLCAR, G046.TPCARGA, G046.QTDISPER, G046.VRPOROCU, G046.IDG030, G046.DTAGENDA,
						G046.STCARGA, G046.STINTCLI, G046.SNCARPAR, G046.OBCANCEL, G046.IDS001CA, G046.DTCANCEL, G046.IDG028, G046.SNURGENT,
						G046.TPORIGEM, G046.DTCOLATU, G046.DTCOLORI, G046.DTPSMANU, G046.IDG034, G046.STENVLOG, G046.STPROXIM, G046.VRPERCAR,
						G046.NRPLARE1, G046.NRPLARE2, G046.NRPLAVEI, G046.IDCARLOG, G046.SNMOBILE, G046.DTINIVIA, G046.DTFIMVIA, G046.TPTRANSP, G046.TPMODCAR,
						G046.VRFREREC, G046.IDG085, G046.VRFREMIN, G046.IDG024SV, G046.DTINITRA, G046.DTFIMTRA, G046.CDVIATRA, G046.QTDISBAS, 1 AS STWARE, G046.IDG046
					FROM G046
					WHERE IDG046 = ${req.body.IDG046}
				`;

		return  await gdao.executar(req, res, next);

	}

	api.inserirCarga = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		objBanco = {
			table:    'W002_A'
		  , key:      ['IDW002_A']
		  , vlFields:  req.carga
		  , objConn : req.objConn
		  }


		return await gdao.inserir(objBanco, res, next).catch((err) => { throw err });

	}

	api.inserirDeliveries = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `
					INSERT INTO W001
						SELECT
							"DEV"."NEXTIDW001"."NEXTVAL",
							G043.CDDELIVE, G043.SNLIBROT,G043.DTLANCTO, G043.IDS001, G043.DTDELIVE, G043.TPDELIVE, G043.STDELIVE,
							G043.NRNOTA, G043.NRSERINF, G043.DTEMINOT, G043.NRCHADOC, G043.DSMODENF, G043.SNDELETE, G043.IDG005RE,
							G043.IDG005DE, G043.DTFINCOL, G043.CDPRIORI, G043.TPTRANSP, G043.CDFILIAL, G043.PSBRUTO, G043.PSLIQUID, G043.NRDIVISA,
							G043.STETAPA, G043.VRDELIVE, G043.NREMBSEC, G043.SNINDSEG, G043.VRALTURA, G043.VRLARGUR, G043.VRCOMPRI, G043.CJDESTIN, G043.IEDESTIN,
							G043.IMDESTIN, G043.IDG014, G043.CDCLIEXT, G043.VRVOLUME, G043.IDG009PS, G043.DTENTREG, G043.STULTETA, G043.DTENTCON, G043.TXINSTRU,
							G043.TXCANHOT, G043.IDG043RF, G043.IDI015, G043.DSEMACLI, G043.DSEMARTV, G043.IDG005RC, G043.CDRASTRE, G043.DSINFCPL, G043.DTBLOQUE,
							G043.DTDESBLO, G043.IDG005TO, G043.IDG024TR, G043.SNAG, G043.SNOTIMAN, G043.STLOGOS, G043.IDG074, G043.CDG46ETA, G043.IDS001CA,
							G043.DTCANCEL, G043.DTAUXILI, G043.IDEXTCLI, G043.OBCANCEL, G043.NRINTSUB, G043.DTCANHOT, G043.DTENTMOB ,${req.body.IDW002}, G043.IDG043
						FROM G043
							LEFT JOIN G049 ON G049.IDG043 = G043.IDG043
							LEFT JOIN G048 ON G049.IDG048 = G048.IDG048
							LEFT JOIN G046 ON G048.IDG046 = G046.IDG046
						WHERE G043.SNDELETE = 0
							AND G046.SNDELETE = 0
							AND G046.IDG046 = ${req.body.IDG046}
				`;

		return  await gdao.executar(req, res, next);

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.trocarStatus = async function (req, res, next) {

		var parm = { objConn: req.objConn };

		await this.controller.setConnection(parm.objConn);

		parm.sql = `UPDATE W002 SET STETAPA = ${req.body.STETAPA} WHERE IDW002 IN (${req.body.IDW002.join()})`;

		return await gdao.executar(parm, res, next);

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.atualizarStatus = async function (req, res, next) {

		var parm = { objConn: req.objConn };

		await this.controller.setConnection(parm.objConn);

		parm.sql = `UPDATE W001 SET STETAPA = ${req.body.STETAPA} WHERE IDW002 IN (${req.body.IDW002.join()}) AND STRESERV = 1`;

		return await gdao.executar(parm, res, next);

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.atualizarStatusNew = async function (req, res, next) {

		try {

			var parm = { objConn: req.objConn };

			await this.controller.setConnection(parm.objConn);

			var IDW001 = [];

			if(!req.body.IDW001){
				IDW001 = req.body.params.IDW001;
			} else{
				IDW001 =req.body.IDW001;
			}

			parm.sql = `UPDATE W001 SET STETAPA = ${req.body.STETAPA} WHERE IDW001 IN (${IDW001.join()}) AND STRESERV = 1`;

			return await gdao.executar(parm, res, next);

		} catch (error) {
			console.log(error)
		}



	}


	api.atualizarStatusTp = async function (req, res, next) {

		try {

			var parm = { objConn: req.objConn };

			await this.controller.setConnection(parm.objConn);

			parm.sql = `UPDATE W001 SET STETAPA = ${req.body.STETAPA} WHERE IDW001 IN (${req.body.params.IDW001.join()})`;

			return await gdao.executar(parm, res, next);

		} catch (error) {
			console.log(error)
		}



	}


	api.detalhesDelivery = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);


		var IDW001;

		if(!req.body.IDW001){
			IDW001 = req.body.params.IDW001;
		} else{
			IDW001 =req.body.IDW001;
		}

		req.sql = `
				SELECT
					W001.IDW001

					, W001.CDOUBOUN
					, W001.CDINBOUN
					, CASE WHEN W001.TPPROCES = 'O' THEN 'OUTBOUND' ELSE 'INBOUND' END AS TPPROCES
					, W001.DTLANCTO
					, CASE
							 WHEN W001.TPDELIVE = 1 THEN 'TRANSFERÊNCIA'
							 WHEN W001.TPDELIVE = 2 THEN 'VENDA'
							 WHEN W001.TPDELIVE = 3 THEN 'TROCA DE PROPRIEDADE'
					  END AS TPDELIVE
					, W001.DTLANCTO
					, W001.STRESERV

					--REMETENTE
					, W001.NMCLIRE
					, W001.CJREMETE
					, W001.IEREMETE
					, W001.IMREMETE
					, W001.NMCIDRE
					, W001.NMESTRE
					, W001.NRCEPRE
					, W001.NRSAPRE

					--DESTINATÁRIO
					, W001.NMCLIDE
					, W001.CJDESTIN
					, W001.IEDESTIN
					, W001.IMDESTIN
					, W001.NMCIDDE
					, W001.NMESTDE
					, W001.NRCEPDE
					, W001.NRSAPDE

					--CLIENTE
					, W001.NMCLICL
					, W001.IMCLIENT
					, W001.NMCIDCL
					, W001.NMESTCL
					, W001.NRCEPCL
					, W001.NRSAPCL

					--TRANSPORTADORA
					, W001.NMCLITR
					, W001.CJTRANSP
					, W001.IETRANSP
					, W001.IMTRANSP
					, W001.NMCIDTR
					, W001.NMESTTR
					, W001.NRCEPTR
					, W001.NRSAPTR

					, W001.PSBRUTO
					, W001.STATUALI

					, W002.CDSHIPME
					, W001.CDPLAFOR -- PLANTA DE ORIGEM
					, W001.CDARMFOR -- ARMAZEM DE ORIGEM
					, W001.NRDELREF

					, W004.NRNOTA
					, W004.PSNOTA
					, W004.NRCHADOC

				FROM W001
				INNER JOIN W002 --SHIPMENT
					ON W002.IDW002 = W001.IDW002
				INNER JOIN W003 --ITEM
					ON W003.IDW001 = W001.IDW001
				LEFT JOIN W004 --NOTA
					ON W004.IDW004 = W003.IDW004
				WHERE W001.IDW001 = ${IDW001}
				AND W003.SNDELETE = 0`;

		return await gdao.executar(req, res, next).catch(err=>{
			console.log(err);
		});
	}

	api.listarItensDelivery = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);


		req.sql = `
					SELECT
						  W003.*
						, COUNT(W003.IDW003) OVER() AS COUNT_LINHA
					FROM W003
					WHERE W003.SNDELETE = 0
					AND W003.IDW001 = ${req.body.params.IDW001}
					  ${utilsWare.ordenar(req, "W003.IDW003")}
					${utilsWare.paginar(req.body.pageNumber, req.body.size)}
				`;

		return await gdao.executar(req, res, next);
	}

	api.buscaShipmentPorDelivery = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `
					SELECT W002.IDW002 FROM W002
					INNER JOIN W001 ON W002.IDW002 = W001.IDW002
					WHERE W001.IDW001 IN (${req.body.params.IDW001.join()})
				`;

		return await gdao.executar(req, res, next);
	}

	api.mapaDelivery = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `
					SELECT
						  G043.NRNOTA						G043_NRNOTA
						, W001.CDDELIVE						W001_CDDELIVE
						, G024.NMTRANSP						G024_NMTRANSP
						, G045.IDG010						G045_IDG010
						, G045.DSPRODUT						G045_DSPRODUT
						, G045.VRUNIPRO						G045_VRUNIPRO

						, G050.QTPRODUT						G050_QTPRODUT
						, G050.DSLOTE						G050_DSLOTE

						, G045.VRUNIPRO * G050.QTPRODUT 	G045_VRTOTAL

						, G009.CDUNIDAD						G009_CDUNIDAD

				FROM W001
					LEFT JOIN W002 ON W002.IDW002 = W001.IDW002
					LEFT JOIN G045 ON W001.IDG043 = G045.IDG043
					LEFT JOIN G050 ON G045.IDG045 = G050.IDG045
					LEFT JOIN G009 ON G009.IDG009 = G045.IDG009PS
					LEFT JOIN G043 ON G043.IDG043 = W001.IDG043
					LEFT JOIN G024 ON W001.IDG024TR = G024.IDG024
				WHERE W002.IDW002 = ${req.body.IDW002}
				`;

		return await gdao.executar(req, res, next);
	}

	api.headerDelivery = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `
				SELECT
					G024.NMTRANSP						NMTRANSP
				FROM W001
					LEFT JOIN W002 ON W002.IDW002 = W001.IDW002
					LEFT JOIN G024 ON W001.IDG024TR = G024.IDG024
				WHERE W002.IDW002 = ${req.body.IDW002}
				`;

		return await gdao.executar(req, res, next);
	}

	api.updateTransp = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `
					Update W001 Set IDG024TR = ${req.body.IDG024} WHERE IDW001 = ${req.body.IDW001}
				`;

		return await gdao.executar(req, res, next);
	}

	api.updateItens = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `
					Update G045 Set
						IDG010 = ${req.body.IDG010},
						PSBRUTO = ${req.body.PSBRUTO}
					WHERE IDG045 = ${req.body.IDG045}
				`;

		return await gdao.executar(req, res, next);
	}

	api.updateLote = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `
					Update G050 Set
						DSLOTE = ${req.body.DSLOTE}
					WHERE IDG045 = ${req.body.IDG045}
				`;

		return await gdao.executar(req, res, next);
	}

	api.reservarSaldo = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `
					Update W001 Set
						STRESERV = ${req.body.STRESERV}
					WHERE IDW001 IN (${req.body.arIDW001.join()})
				`;

		return await gdao.executar(req, res, next);
	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.buscarDelivery = async function (req, res, next) {

		var parm = { objConn: req.objConn };

		await this.controller.setConnection(parm.objConn);

		parm.sql = `SELECT IDW001 FROM W001 WHERE CDDELIVE = ${req.body.CDDELIVE}`;

		return await gdao.executar(parm, res, next);
	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.buscarDocTransp = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `	Select *
					From
						w002 w002
					Where
						IDW002 = ${req.body.IDW002.join()}
					`;
		return await gdao.executar(req, res, next);
	}

	api.buscarRecebimentos = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		var IDW002 = '';
		var IDW001 = '';
		var IDW004 = '';

		if(req.body.IDW002 && req.body.IDW002.length){
			IDW002 = `AND W002.IDW002  = ${req.body.IDW002} --SHIPMENT`
		}

		if(req.body.IDW001 && req.body.IDW001.length){
			IDW001 = `AND W001.IDW001 IN (${req.body.IDW001.join()}) -- DELIVERIES`
		}

		if(req.body.IDW004 && req.body.IDW004.length){
			IDW004 = `AND W004.NRNOTA IN (${req.body.IDW004}) --NOTAS`
		}


		req.sql = `
						SELECT

							--HEADER
							  'Z' || LPAD(W001.IDW001, 9, 0) 		AS RFBEL 		-- ID DA TABELA
							, 'ZIG' 								AS LFART 		-- CÓDIGO FIXO QUE IDENTIFICA TRANSFERÊNCIA
							, W004.NRNOTA							AS LIFEX		-- NR NOTA
							, W001.CJDESTIN							AS STCD1		-- CNPJ DO FORNECEDOR (REMETENTE)
							, '${tmz.tempoAtual("YYYY-MM-DD")}'		AS LFDAT		-- DATA PLANEJADA DE RECEBIMENTO
							, ''									AS TPEMISSAO	-- ??
							, 'Z00001'								AS ROUTE		-- CÓDIGO FIXO QUE IDENTIFICA A ROTA

							--ITENS
							, W003.NMSTOLOC
							, W003.NRITEM							AS RFPOS		-- NÚMERO DO ITEM
							, W003.CDMATERI							AS MATNR		-- CÓDIGO DO MATERIAL
							, NVL(W003.DSALFANU, W003.NRLOTE)		AS CHARG		-- NÚMERO DO LOTE ALFANUMERICO
							, CASE WHEN TO_CHAR(W003.DTVALIDA, 'YYYY-MM-DD') = '1889-01-02'
									THEN ''
									ELSE TO_CHAR(W003.DTVALIDA, 'YYYY-MM-DD')
								END 								AS VFDAT		-- DATA DE VALIDADE
							,  CASE WHEN TO_CHAR(W003.DTFABRIC, 'YYYY-MM-DD') = '1889-01-02'
							   	 THEN ''
								 ELSE TO_CHAR(W003.DTFABRIC, 'YYYY-MM-DD')
							   END									AS HSDAT		-- DATA DE FABRICAÇÃO
							, W003.QTITEMBA							AS LFIMG		-- QUANTIDADE DE ITENS W003.QTITEMBA
							, ''									AS VRKME		-- UNIDADE DE MEDIDA DSMEDIDA
							, W003.DSMEDIBA							AS VRKMEISO		-- UNIDADE DE MEDIDA DSMEDIDA ISO
							, G097.IDKEY							AS WERKS		-- PLANTA DE DESTINO NMPLADES
							, W003.CDDEPOSI							AS LGORT		-- ESTOQUE DE ORIGEM NMSTOLOC
							, ''									AS INSMK		-- STATUS DO ESTOQUE (QUALIDADE, LIVRE UTILIZAÇÃO E BLOQUEADO)
							, ''									AS KDAUF		-- NÚMERO DA ORDEM DE VENDA (AG)
							, ''									AS KDPOS		-- ITEM DA ORDEM DE VENDA (AG)
							, ''									AS NETWR		-- VALOR DO ITEM
							, ''									AS WAERK		-- UNIDADE MONETARIA


					FROM W001
					INNER JOIN W002 ON W001.IDW002 = W002.IDW002 --SHIPMENT
					INNER JOIN W003 ON W001.IDW001 = W003.IDW001 -- DELIVERY
					LEFT JOIN W004 ON W003.IDW004 = W004.IDW004 -- NOTA
					LEFT JOIN G097 ON G097.DSVALUE = W003.NMPLAORI --PLANTA DE DESTINO

				WHERE W001.SNDELETE = 0
				  AND W003.SNDELETE = 0
				  AND W001.TPPROCES = '${req.body.TPPROCES}'
				${IDW002}
				${IDW001}
				${IDW004}
		`;
		return await gdao.executar(req, res, next);
	}

	api.buscarRemessas = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		var IDW002 = '';
		var IDW001 = '';
		var IDW004 = '';

		if(req.body.IDW002 && req.body.IDW002.length){
			IDW002 = `AND W002.IDW002 = ${req.body.IDW002} --SHIPMENT`
		}

		if(req.body.IDW001 && req.body.IDW001.length){
			IDW001 = `AND W001.IDW001 IN (${req.body.IDW001.join()}) -- DELIVERIES`
		}

		if(req.body.IDW004 && req.body.IDW004.length){
			IDW004 = `AND W004.NRNOTA IN (${req.body.IDW004}) --NOTAS`
		}


		req.sql = `
						SELECT

							--HEADER
							  'Z' || LPAD(W001.IDW001, 9, 0) 		AS RFBEL 		-- ID DA TABELA
							, 'ZLO' 								AS LFART 		-- CÓDIGO FIXO QUE IDENTIFICA TRANSFERÊNCIA

							, '' 									AS VSTEL 		-- POSTO DE EXPEDIÇÃO
							, '' 									AS VKORG 		-- ORGANIZAÇÃO DE VENDAS
							, '' 									AS VTWEG 		-- CANAL DE DISTRIBUIÇÃO
							, '' 									AS SPART 		-- SETOR DE ATIVIDADE

							, W004.NRNOTA || '-' || NRSERINF		AS LIFEX		-- NR NOTA

							, W001.CJREMETE							AS STCD1V		-- CNPJ DO FORNECEDOR (REMETENTE)
							, W001.CJDESTIN							AS STCD1C		-- CNPJ DO CLIENTE (DESTINARIO)


							, '${tmz.tempoAtual("YYYY-MM-DD")}'		AS LFDAT		-- DATA PLANEJADA DE REMESSA
							, '${tmz.tempoAtual("HH:MM:ss")}'		AS LFUHR		-- HORA PLANEJA REMESSA
							, 'Z00001'								AS ROUTE		-- CÓDIGO FIXO QUE IDENTIFICA A ROTA
							, 'X'									AS OFULL		-- FORNECER COMPLETAMENTE


							--ITENS
							, W003.NMSTOLOC
							, W003.NRITEM							AS RFPOS		-- NÚMERO DO ITEM
							, W003.CDMATERI							AS MATNR		-- CÓDIGO DO MATERIAL
							, NVL(W003.DSALFANU, W003.NRLOTE)		AS CHARG		-- NÚMERO DO LOTE ALFANUMERICO
							, W003.QTITEMVE							AS LFIMG		-- QUANTIDADE DE ITENS W003.QTITEMBA
							, ''									AS VRKME		-- UNIDADE DE MEDIDA DSMEDIDA
							, W003.DSMEDIBA							AS VRKMEISO		-- UNIDADE DE MEDIDA DSMEDIDA ISO
							, G097.IDKEY							AS WERKS		-- PLANTA DE DESTINO NMPLADES
							, W003.CDDEPOSI							AS LGORT		-- ESTOQUE DE ORIGEM NMSTOLOC
							, ''									AS WAERK		-- UNIDADE MONETARIA
							, ''									AS NOATP		-- UNIDADE MONETARIA
					FROM W001
					INNER JOIN W002 ON W001.IDW002 = W002.IDW002 --SHIPMENT
					INNER JOIN W003 ON W001.IDW001 = W003.IDW001 -- DELIVERY
					LEFT JOIN W004 ON W003.IDW004 = W004.IDW004 -- NOTA
					LEFT JOIN G097 ON G097.DSVALUE = W003.NMPLAORI --PLANTA DE DESTINO

				WHERE W001.SNDELETE = 0
				AND W003.SNDELETE = 0
				AND W001.TPPROCES = '${req.body.TPPROCES}'
				${IDW002}
				${IDW001}
				${IDW004}
		`;
		return await gdao.executar(req, res, next);
	}

	api.buscarDt = async function (req, res, next) {

	  await this.controller.setConnection(req.objConn);

		var SHIPMENTTYPE = 1000;

		if(req.body.TPPROCES=='O'){
			SHIPMENTTYPE = 1000;

		} else {
			SHIPMENTTYPE = 1001;
		}

		var filIDW002 = ''
		if(req.body.IDW002){
			filIDW002 = ` AND W002.IDW002 = ${req.body.IDW002[req.body.index]} `
		}

		var filIDW001 = '';
		if(req.body.params.IDW001){
			filIDW001 = ` AND W001.IDW001 in (${req.body.params.IDW001.join()}) `
		}

		req.sql = `
						SELECT
						--HEADER
						  '${req.body.TPPROCES}' || W001.IDW005	 	AS SHIPMENTNUM
						, ${SHIPMENTTYPE}	AS SHIPMENTTYPE
						, '1000'			AS TRANSPLANPT
						, 'Z00001'			AS SHIPMENTROUTE
						, ''				AS CONTAINERID
						, 'T000'			AS SHIPMAT
						, W001.CJTRANSP		AS CARRIERID

						, ''				AS Dpreg
						, ''				AS Upreg
						, ''				AS Dplbg
						, ''				AS Uplbg
						, ''				AS Dplen
						, ''				AS Uplen
						, ''				AS Dpabf
						, ''				AS Upabf
						, ''				AS Dptbg
						, ''				AS Uptbg
						, ''				AS Dpten
						, ''				AS Upten
						, ''				AS Iftyp

						--ITEM
						,  'Z' || LPAD(W001.IDW001, 9, 0)		AS DELIVERY
						, ''				AS ITENERARY

					FROM W001
					INNER JOIN W002
						ON W002.IDW002 = W001.IDW002
					INNER JOIN W003
						ON W003.IDW001 = W001.IDW001
					WHERE W001.SNDELETE = 0
					AND   W003.SNDELETE = 0
					AND W001.STRESERV = 1
					AND W001.TPPROCES = '${req.body.TPPROCES}'
					${filIDW002}
					${filIDW001}

					GROUP BY W001.IDW005, W001.CJTRANSP, W001.IDW001


		`;
		return await gdao.executar(req, res, next);
	}
	api.buscarReservados = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);
		req.sql = `
						SELECT IDW001 FROM W001
						WHERE SNDELETE = 0
						AND STRESERV = 1
						AND STETAPA IN (1,2)
						AND IDW002 IN (${req.body.IDW002})
						AND TPPROCES = '${req.body.TPPROCES}'
					`
		return await gdao.executar(req, res, next);
	}

	api.buscarWerks = async function (req, res, next){

		await this.controller.setConnection(req.objConn);
		req.sql = `
					SELECT G097.IDKEY FROM W001
					INNER JOIN W003 ON W003.IDW001 = W001.IDW001
					INNER JOIN G097 ON W003.NMSTOLOC = G097.DSVALUE
					WHERE W001.IDW001 = ${req.IDW001}
					AND W003.SNDELETE = 0
				`
		return await gdao.executar(req, res, next);
	}

	api.cancelarDeliveryBravo = async function (req, res, next) {
		await this.controller.setConnection(req.objConn);

		var stEtapa = 6;

		if(req.body.params.STETAPA == 6){
			stEtapa = 7
		}

		req.sql = `
					Update W001 Set
						STETAPA = ${stEtapa}
					WHERE IDW001 IN (${req.body.params.IDW001})
				`;

		return await gdao.executar(req, res, next);


	}

	api.criarShipment = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		var objBanco = {
			table:    'W005'
		  , key:      ['IDW005']
		  , vlFields:  {}
		  }


		  objBanco.vlFields.IDS001 		=  	req.headers.ids001 ? req.headers.ids001 : 97;
		  objBanco.vlFields.DTCADAST 	=  	tmz.dataAtualJS();
		  objBanco.vlFields.SNDELETE 	=  	0;

		  objBanco.objConn = req.objConn;

		return await gdao.inserir(objBanco, res, next).catch((err) => {
			throw err
		});
	}

	api.atualizarIDW005 = async function (req, res, next) {
		await this.controller.setConnection(req.objConn);

		req.sql = `
					Update W001 Set IDW005 = ${req.body.params.IDW005}
					Where IDW001 in (${req.body.params.IDW001.join()})
				`;

		return await gdao.executar(req, res, next);

	}

	api.buscarTranspEvolog = async function (req, res, next) {
		await this.controller.setConnection(req.objConn);

		req.sql = `
					Select
						G024.IDG024, G024.NMTRANSP, G024.CJTRANSP FROM W001
					Inner Join G043
						On G043.CDDELIVE = 'F' || W001.CDOUBOUN
					Inner Join G049
						On G049.IDG043 = G043.IDG043
					Inner Join G048
						On G048.IDG048 = G049.IDG048
					Inner Join G046
						On G046.IDG046 = G048.IDG046
					Inner Join G024
						On G024.IDG024 = G046.IDG024
					Where W001.IDW001 IN (${req.body.params.IDW001.join()})
				`;

		return await gdao.executar(req, res, next);

	}

	api.buscarInfoHc = async function(req, res, next){
		await this.controller.setConnection(req.objConn);

		req.sql = `
					Select
						MIN(H007.HOINICIO) AS HOINICIO, MAX(H007.HOFINAL) AS HOFINAL
					From W001
						Inner Join G043 ON G043.CDDELIVE = 'F' || W001.CDOUBOUN
						Inner Join G049 ON G049.IDG043 = G043.IDG043
						Inner Join G048 ON G048.IDG048 = G049.IDG048
						Inner Join G046 ON G046.IDG046 = G048.IDG046
						Inner Join H019 ON H019.IDG046 = G046.IDG046
						Inner Join H006 ON H006.IDH006 = H019.IDH006
						Inner Join H007 ON H007.IDH006 = H006.IDH006
					Where
						W001.CDOUBOUN IN (${req.body.params.IDW001.join()})
						${utilsWare.paginar(req.body.pageNumber, req.body.size)}
				`;

		return await gdao.executar(req, res, next);
	}

	api.salvarTranspEvolog = async function(req, res, next){

		await this.controller.setConnection(req.objConn);

		req.sql = `
					Update W001 Set CJTRAEVO = ${req.CJTRAEVO}, NMTRAEVO = ${req.NMTRAEVO}
					Where IDW001 in (${req.body.params.IDW001.join()})
				`;

		return await gdao.executar(req, res, next);

	}

	api.buscarTp = async function (req, res, next) {

        await this.controller.setConnection(req.objConn);

          req.sql = `
						SELECT
						--HEADER
						'Z' || LPAD(W001.IDW001, 9, 0)        AS RFBEL        -- ID DA TABELA
						, W004.NRNOTA                         AS LIFEX        -- NR NOTA
						, CASE WHEN W001.CDARMFOR = 'SL75'
							THEN '60744463008417'ELSE W001.CJDESTIN END          AS STCD1      -- ESTOQUE DE ORIGEM NMSTOLOC

						, 'X'                                 CONVMAT

						--ITEM
						, W003.CDMATERI                       AS MATERIAL     -- CÓDIGO DO MATERIAL
						, G097ORI.IDKEY                       AS PLANT        --
						, CASE WHEN W001.CDARMFOR = 'SL75'
							THEN 'SEWM'ELSE 'DEWM' END          AS STGELOC      -- ESTOQUE DE ORIGEM NMSTOLOC


						, NVL(W003.DSALFANU, W003.NRLOTE)     AS BATCH        -- NÚMERO DO LOTE ALFANUMERICO
						, W003.QTITEMBA                       AS ENTRYQNT     -- QUANTIDADE DE ITENS W003.QTITEMBA
						, ''                                  AS ENTRYUOM     -- UNIDADE DE MEDIDA DSMEDIDA
						, W003.DSMEDIBA                       AS ENTRYUOMISO  -- UNIDADE DE MEDIDA DSMEDIDA ISO
						, G097DES.IDKEY                       AS MOVEPLANT    -- PLANTA DE DESTINO NMPLADES

						, CASE WHEN W003.NMPLAORI = 'SL75'
							THEN 'SEWM'ELSE 'DEWM' END          AS MOVESTLOC      -- ESTOQUE DE DESTINO NMSTOLOC
						, NVL(W003.DSALFANU, W003.NRLOTE)       AS MOVEBATCH    -- NÚMERO DO LOTE ALFANUMERICO

					FROM W001
						INNER JOIN W002 ON W001.IDW002 = W002.IDW002 --SHIPMENT
						INNER JOIN W003 ON W001.IDW001 = W003.IDW001 -- DELIVERY
						LEFT JOIN W004 ON W003.IDW004 = W004.IDW004 -- NOTA
						LEFT JOIN G097 G097ORI ON G097ORI.DSVALUE = W001.CDARMFOR --PLANTA ORIGEM
						LEFT JOIN G097 G097DES ON G097DES.DSVALUE = W003.NMPLAORI --PLANTA DE DESTINO
					WHERE W001.SNDELETE = 0
					AND W003.SNDELETE = 0

                    AND W001.TPPROCES = 'I'
                    AND W001.IDW001 in (${req.body.params.IDW001.join()})




          `;
          return await gdao.executar(req, res, next);
	  }



	api.deliveryExcluir = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `
					SELECT
						W001.IDW001, W001.IDW002, W003.IDW003
					FROM W001
					INNER JOIN W003 ON W001.IDW001 = W003.IDW001
					WHERE W001.SNDELETE = 0
					AND W003.SNDELETE = 0
					AND W001.IDW001 in (${req.body.params.IDW001.join()})
				`;
		return await gdao.executar(req, res, next);

	}

	api.excluirW001 = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `UPDATE W001 SET SNDELETE = 1 WHERE IDW001 IN (${req.IDW001.join()})`;

		return await gdao.executar(req, res, next);

	}

	api.excluirW002 = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `UPDATE W002 SET SNDELETE = 1 WHERE IDW002 IN (${req.IDW002.join()})`;

		return await gdao.executar(req, res, next);

	}

	api.excluirW003 = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `UPDATE W003 SET SNDELETE = 1 WHERE IDW003 IN (${req.IDW003.join()}) AND W003.SNDELETE = 0`;

		return await gdao.executar(req, res, next);

	}

	api.itensDelivery = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		var IDW001;

		if(!req.body.IDW001){
			IDW001 = req.body.params.IDW001;
		} else{
			IDW001 =req.body.IDW001;
		}

		req.sql = `
					SELECT
					  W003.CDMATERI
					, W003.DSMATERI
					, W003.NMMATGRO
					, W003.QTITEMBA
					, W003.DSMEDIBA
					, W003.NRLOTE
					, W003.NRMAPA
					, W003.DTFABRIC
					, W003.DSALFANU
					, W003.DTVALIDA

					FROM W003
					WHERE W003.IDW001 = ${IDW001}
					AND W003.SNDELETE = 0

				`;

		return await gdao.executar(req, res, next);
	}

	api.retornarOutbound = async function (req, res, next) {

		var parm = { objConn: req.objConn };

		await this.controller.setConnection(parm.objConn);

		parm.sql = `SELECT CDOUBOUN FROM W001 WHERE IDW001 = ${req.IDW001}`;

		return await gdao.executar(parm, res, next);

	}

	api.inserirMilestoneBranco = async function (req, res, next) {
		await this.controller.setConnection(req.objConn);

		objBanco = {
			table:    'W006'
			, key:      ['IDW006']
			, vlFields:  {}
			}

			objBanco.vlFields.IDS001 		=  	97;
			objBanco.vlFields.SNDELETE 	=  	0;
			objBanco.vlFields.DTCADAST 	=  	tmz.dataAtualJS();
			objBanco.vlFields.SNENVIAD	=	0;
			objBanco.vlFields.IDW001		=	req.IDW001;
			objBanco.vlFields.NRTIPO 		=  	req.NRTIPO


			objBanco.objConn = req.objConn;

		return await gdao.inserir(objBanco, res, next).catch((err) => {
			throw err
		});

	}

	api.buscarDeliveriesPorShipment = async function (req, res, next) {

		var parm = { objConn: req.objConn };

		await this.controller.setConnection(parm.objConn);

		parm.sql = `SELECT IDW001 FROM W001 WHERE IDW002 in (${req.IDW002.join()}) And IDW001 not in (${req.IDW001.join()})`;

		return await gdao.executar(parm, res, next);

	}

	api.buscarShipments = async function (req, res, next) {

		var parm = { objConn: req.objConn };

		await this.controller.setConnection(parm.objConn);

		parm.sql = `SELECT IDW002, TPPROCES FROM W001 WHERE IDW001 = ${req.body.params.IDW001.join()}`;

		return await gdao.executar(parm, res, next);

	}

	api.verificarShipmentDt = async function (req, res, next) {

		try {

			var parm = { objConn: req.objConn };

			await this.controller.setConnection(parm.objConn);

			parm.sql = `
						SELECT
							IDW001, CDOUBOUN, IDW005
						FROM W001
						WHERE IDW001 IN (${req.body.params.IDW001.join()})
						AND IDW005 IS NOT NULL
						`;

			return await gdao.executar(parm, res, next);

		} catch (error) {

			throw error

		}


    }

    api.moverEtapa = async function (req, res, next) {

        var parm = { objConn: req.objConn };

		await this.controller.setConnection(parm.objConn);

		parm.sql = `UPDATE W001 SET STETAPA = ${req.STATUS} WHERE IDW001 = ${req.IDW001}`;

		return await gdao.executar(parm, res, next);

    }



	return api;
}
