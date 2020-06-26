module.exports = function (app, cb) {

	const tmz = app.src.utils.DataAtual;
	const fldAdd = app.src.modGlobal.controllers.XFieldAddController;
	const gdao = app.src.modGlobal.dao.GenericDAO;
	const dtatu      = app.src.utils.DataAtual;
	var db = app.config.database;
	var utils = app.src.utils.FuncoesObjDB;
	var utilsCurl  = app.src.utils.Utils;
	var api = {};
	var logger     = app.config.logger;
	api.controller = app.config.ControllerBD;
	//-----------------------------------------------------------------------\\

	/**
	 * @description Insere os dados dos eventos da Delivery
	 * @author Rafael Delfino Calzado
	 * @since 17/11/2017
	 *
	 * @async
	 * @function salvarEvento
	 * @return {boolean} Retorna true.
	 * @throws {Object} Retorna o erro da consulta.
	 */

	api.salvarEvento = async function (idDelivery, idEvento, dtEvento) {
		var dtEvento = tmz.tempoAtual('DD/MM/YYYY HH:mm:ss');
		return await db.execute({
				sql: `INSERT INTO I008 (IDG043, IDI001, DTEVENTO) VALUES
							(${idDelivery}, ${idEvento}, TO_DATE('${dtEvento}', 'DD/MM/YYYY HH24:MI:SS'))`,
				param: []
			})

			.then((result) => {
				return true;
			})
			.catch((err) => {
				throw err;
			});
	}

	//-----------------------------------------------------------------------\\

	/**
	 * @description Insere os dados dos eventos da Etapa da Carga
	 * @author Rafael Delfino Calzado
	 * @since 13/12/2017
	 *
	 * @async
	 * @function salvarEventoEtapa
	 * @return {boolean} Retorna true.
	 * @throws {Object} Retorna o erro da consulta.
	 */

	api.salvarEventoEtapa = async function (idEtapa, idEvento, idReasonCode, dtEvento, dtAlterada) {
		return await db.execute({
				sql: `INSERT INTO I013 (IDG048, IDI001, IDI007, DTEVENTO,  DTALTEVE) VALUES (
								${idEtapa}
							,	${idEvento}
							,	${idReasonCode}
							,	TO_DATE('${dtEvento}', 'DD/MM/YYYY HH24:MI:SS')
							,	TO_DATE('${dtAlterada}', 'DD/MM/YYYY HH24:MI:SS')
							)`,
				param: []
			})

			.then((result) => {
				return true;
			})
			.catch((err) => {
				throw err;
			});
	}

	//-----------------------------------------------------------------------\\

	/**
	 * @description Retorna um array com os dados das Deliveries para a Dashboard
	 * @author Rafael Delfino Calzado
	 * @since 17/11/2017
	 *
	 * @async
	 * @function getDashboardDelivery
	 * @return {Array} Retorno da consulta SQL.
	 * @throws {Object} Retorna o erro da consulta.
	 */
	api.getDashboardDelivery = async function (req, res, next) {
		return await db.execute({
				sql: `SELECT
								DH.IDG043 			ID,
								DH.CDDELIVE,
								DH.NRNOTA,
								DH.SNLIBROT,
								DH.STETAPA 			STATUS,
								DH.STULTETA,
								DH.STDELIVE,
								DH.CDPRIORI, 
								DH.SNINDSEG,
								DH.TXINSTRU			DH_TXINSTRU ,
								DH.TXCANHOT,
								DH.STULTETA AS ULT_STATUS,								
								TO_CHAR(DH.DTDELIVE, 'DD/MM/YYYY') 						DATE_CREATION,
								TO_CHAR(DH.DTLANCTO, 'DD/MM/YYYY HH24:MI:SS') DATE_LAUNCH,
								TO_CHAR(DH.DTENTCON, 'DD/MM/YYYY') 						DTENTCON,
								TO_CHAR(DH.DTENTREG, 'DD/MM/YYYY') 						DTENTREGDEL,
								TO_CHAR(DH.DTEMINOT, 'DD/MM/YYYY') 						DTEMINOT,
								SELLER.NMCLIENT SELLER_NAME,
								BUYER.NMCLIENT 	BUYER_NAME

							FROM G043 DH

							INNER JOIN G014 OP 
								ON OP.IDG014 = DH.IDG014

							INNER JOIN G005 SELLER 
								ON SELLER.IDG005 = DH.IDG005RE

							INNER JOIN G005 BUYER 
								ON BUYER.IDG005 = DH.IDG005DE

							WHERE 
								OP.SN4PL = 1 -- CHKRDC
								AND DH.SNDELETE = 0								
								AND DH.TPDELIVE IN ('1', '2', '3', '4', '5')
								AND DH.CDDELIVE IS NOT NULL

							ORDER BY DH.DTDELIVE DESC`,
				param: []
			})

			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	}

	api.postDashboardDelivery = async function (req, res, next) {

		if (!(req.body["parameter[DH_STETAPA]"] || req.body["parameter[DH_STETAPA][in][]"])) {
			req.body["parameter[DH_STETAPA]"] = {"in":[0,1]};
		}
		
		let objConn = await api.controller.getConnection();

		var parm = { nmTabela: 'G043', objConn };
		var sqlAux = await fldAdd.tabelaPivot(parm, res, next).catch((err) => { throw err });

		var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'DH', true);
				
		if(sqlOrder){
			// Realizar a ordenação pelo campo DETAILSINFO (campo criado através da SQL e não um campo de uma tabela)
			sqlOrder = sqlOrder.replace('Order by DH.DETAILSINFO','Order by DETAILSINFO');
		}

		var sql =
			`SELECT
				
				DH.IDG043 										DH_IDG043,
				DH.CDDELIVE 									DH_CDDELIVE,
				SELLER.NMCLIENT 								SELLER_NMCLIENT,
				BUYER.NMCLIENT 									BUYER_NMCLIENT,

				UPPER(CIDADE_DESTINATARIO.NMCIDADE) || ' / ' || ESTADO_DESTINATARIO.CDESTADO CIDADE_ESTADO_DESTINO,

				DH.NRNOTA 										DH_NRNOTA,
				DH.SNLIBROT 									DH_SNLIBROT,
				DH.STETAPA 										DH_STETAPA,
				DH.STULTETA										DH_STULTETA,
				DH.STDELIVE 									DH_STDELIVE,
				DH.CDPRIORI 									DH_CDPRIORI,
				DH.CDPRIINI 									DH_CDPRIINI, 
				DH.SNINDSEG 									DH_SNINDSEG,
				DH.TXINSTRU 									DH_TXINSTRU,
				DH.TXCANHOT 									DH_TXCANHOT,
				TO_CHAR(DH.DTDELIVE, 'DD/MM/YYYY') 				DH_DTDELIVE,
				TO_CHAR(DH.DTLANCTO, 'DD/MM/YYYY HH24:MI:SS') 	DH_DTLANCTO,
				TO_CHAR(DH.DTENTCON, 'DD/MM/YYYY') 				DH_DTENTCON,
				TO_CHAR(DH.DTENTREG, 'DD/MM/YYYY') 				DH_DTENTREG,
				TO_CHAR(DH.DTEMINOT, 'DD/MM/YYYY') 				DH_DTEMINOT,
				DH.TPDELIVE                                     DH_TPDELIVE,
				DH.DSEMACLI                                   	DH_DSEMACLI,
				DH.DSEMARTV										DH_DSEMARTV,

				CASE
					WHEN DH.SNINDSEG = 'S' THEN 'SIM'
					WHEN DH.SNINDSEG = 'N' THEN 'NÃO'
				END SNINDSEG,
				
				CAMPOSADD.NRPROTOC								CAMPOSADD_NRPROTOC,
				CAMPOSADD.STTEMPER								CAMPOSADD_STTEMPER,	
				CAMPOSADD.SNPALETI								CAMPOSADD_SNPALETI,
				CAMPOSADD.CDGRUCLI								CAMPOSADD_CDGRUCLI,
				CAMPOSADD.CDGRUPRE								CAMPOSADD_CDGRUPRE,
				G074.CDMOTIVO 									G074_CDMOTIVO,
				G074.DSMOTIVO									G074_DSMOTIVO,

				CASE WHEN ((CAMPOSADD.STTEMPER = 'True') OR 
						  (CAMPOSADD.SNPALETI = 'Y') OR
						  (DH.SNINDSEG = 'S'))
						THEN 'true'
					ELSE 'false'
				END 											DETAILSINFO, 

				G014.DSOPERAC                                   G014_DSOPERAC,

				CASE
					WHEN G058RE.SNVIRA IS NULL THEN 0 ELSE G058RE.SNVIRA 
				END G058RE_SNVIRA,

				COUNT(DH.IDG043) OVER () COUNT_LINHA

				FROM G043 DH

				INNER JOIN G005 SELLER 
					ON SELLER.IDG005 = DH.IDG005RE

				INNER JOIN G005 BUYER 
					ON BUYER.IDG005 = DH.IDG005DE

				INNER JOIN G003 CIDADE_DESTINATARIO
					ON CIDADE_DESTINATARIO.IDG003 = BUYER.IDG003

				INNER JOIN G002 ESTADO_DESTINATARIO 
					ON ESTADO_DESTINATARIO.IDG002 = CIDADE_DESTINATARIO.IDG002

				INNER JOIN G014 G014 
					ON G014.IDG014 = DH.IDG014

				LEFT JOIN (${sqlAux}) CAMPOSADD 
					ON CAMPOSADD.ID = DH.IDG043

				LEFT JOIN G074 G074 
					ON G074.IDG074 = DH.IDG043
				
				LEFT JOIN (
							SELECT 
								G058.IDG005RE,
								G058.IDG005DE,
								COUNT(*) SNVIRA

							FROM G058

							WHERE 
								G058.SNDELETE = 0

							GROUP BY 
								G058.IDG005RE,
								G058.IDG005DE
				) G058RE 
					ON G058RE.IDG005RE = SELLER.IDG005
					AND G058RE.IDG005DE = BUYER.IDG005
	
				${sqlWhere} 

					AND G014.SN4PL = 1 -- CHKRDC 
					AND DH.TPDELIVE IN ('1', '2', '3', '4', '5')
					AND DH.CDDELIVE IS NOT NULL

				${sqlOrder} ${sqlPaginate}`;
						console.log("sql ",sql)
		return await objConn.execute({ sql, param: bindValues })

		.then(async (result) => {
			await objConn.close();
			return (utils.construirObjetoRetornoBD(result));
		})
		.catch(async (err) => {
			await objConn.closeRollback()
			throw err;
		});
	}

	//-----------------------------------------------------------------------\\

	/**
     * @description Retorna deliveries para datagrid
     *
     * @function receiveNotification            
     * @param   {Object} req    
     * @param   {Object} req.body   
     *
     * @returns {Object} retorno padrão p/ datagrid
     * @throws  {status(500)} Exceção não tratada
     *
     * @author Igor Pereira da Silva
     * @since 21/06/2018
     *
     */
	api.listarCanhoto = async function (req, res, next) {	
		var sqlCanhot = ""
		switch (req.body["parameter[DH_TXCANHOT]"]) {
		case "0":
			sqlCanhot = "DH.TXCANHOT IS NULL";   
			break;
		case "1":
			sqlCanhot = "DH.TXCANHOT IS NOT NULL";
			break;
		}
		delete req.body["parameter[DH_TXCANHOT]"];
		var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'DH',true);

		if(sqlWhere == "" && (sqlCanhot != "")){
			sqlWhere = "Where ";
		  }else if(sqlCanhot != ""){
			sqlCanhot = "And " + sqlCanhot;
		  }
		return await db.execute(
			{
				sql: `SELECT
				DH.IDG043 											DH_IDG043,
				DH.CDDELIVE 										DH_CDDELIVE,
				DH.STETAPA 											DH_STETAPA,
				DH.NRNOTA 											DH_NRNOTA,
				DH.TXCANHOT 										DH_TXCANHOT,
				CANHOTO.EVENTO										CANHOTO_EVENTO,
				SELLER.NMCLIENT 									SELLER_NMCLIENT,
				BUYER.NMCLIENT 										BUYER_NMCLIENT,
				TRANSPORTADORAS.NMTRANSP 							TRANSPORTADORAS_NMTRANSP, 							
				TO_CHAR(DH.DTDELIVE, 'DD/MM/YYYY') 						DH_DTDELIVE,
				TO_CHAR(DH.DTLANCTO, 'DD/MM/YYYY HH24:MI:SS') DH_DTLANCTO,
				TO_CHAR(DH.DTENTCON, 'DD/MM/YYYY') 						DH_DTENTCON,
				TO_CHAR(DH.DTENTREG, 'DD/MM/YYYY') 						DH_DTENTREG,
				TO_CHAR(DH.DTEMINOT, 'DD/MM/YYYY') 						DH_DTEMINOT,
				COUNT(DH.IDG043) OVER () as COUNT_LINHA
			
			FROM G043 DH
			
			INNER JOIN G005 SELLER
				ON SELLER.IDG005 = DH.IDG005RE
				AND SELLER.SNDELETE = 0
				
			INNER JOIN G005 BUYER 
				ON BUYER.IDG005 = DH.IDG005DE
				AND BUYER.SNDELETE = 0
				
			INNER JOIN G049
				ON G049.IDG043 = DH.IDG043
				
			INNER JOIN G048 PARADAS 
				ON PARADAS.IDG048 = G049.IDG048
				
			INNER JOIN G046 CARGAS
				ON CARGAS.IDG046 = PARADAS.IDG046
				AND CARGAS.SNDELETE = 0
				AND CARGAS.STCARGA NOT LIKE 'C'
				
			INNER JOIN G052 CTE_DELIVERY
					ON CTE_DELIVERY.IDG043 = DH.IDG043 
					
			INNER JOIN G051 CTE
				ON CTE.IDG051 = CTE_DELIVERY.IDG051
				AND CTE.SNDELETE = 0
				AND CTE.STCTRC NOT LIKE 'C'
				
			INNER JOIN G024 TRANSPORTADORAS
				ON TRANSPORTADORAS.IDG024 = CARGAS.IDG024
				AND TRANSPORTADORAS.SNDELETE = 0
				
			LEFT JOIN (
				SELECT G043.IDG043, 
				CASE
					WHEN MAX(I008.IDI001) = 31 THEN 'UPLOAD'
					ELSE 'PENDENTE'
				END EVENTO
				FROM G043
				INNER JOIN I008
					ON I008.IDG043 = G043.IDG043
				WHERE G043.SNDELETE = 0 AND G043.STDELIVE <> 'D' AND G043.IDG014 IN (5,6)
				GROUP BY G043.IDG043
			) CANHOTO
			ON CANHOTO.IDG043 = DH.IDG043
			
			${(sqlWhere != '' ? sqlWhere + ' AND ' : ' WHERE ')}
				DH.SNDELETE = 0
				AND DH.STETAPA IN (4,5)
				AND DH.IDG014 IN (5)
				AND DH.STDELIVE NOT LIKE 'D'
			
			${sqlCanhot}

			GROUP BY 
				DH.IDG043,
				DH.CDDELIVE,
				DH.NRNOTA,	
				DH.TXCANHOT,
				CANHOTO.EVENTO,
				DH.STETAPA, 
				DH.DTDELIVE,
				DH.DTLANCTO,
				DH.DTENTCON,
				DH.DTENTREG,
				DH.DTEMINOT,
				SELLER.NMCLIENT,
				BUYER.NMCLIENT,
				TRANSPORTADORAS.NMTRANSP
				
				${sqlOrder}` + sqlPaginate,

				param: bindValues
			})
			.then((result) => {
				return (utils.construirObjetoRetornoBD(result));
			})
			.catch((err) => {
				throw err;
			});
	}

	//-----------------------------------------------------------------------\\


	/**
	 * @description Retorna um array com os itens da Delivery selecionada para a Dash
	 * @author Rafael Delfino Calzado
	 * @since 17/11/2017
	 *
	 * @async
	 * @function buscarItensDashboard
	 * @return {Array} Retorno da consulta SQL.
	 * @throws {Object} Retorna o erro da consulta.
	 * 
	 */

	api.buscarItensDashboard = async function (req, res, next) {
		return await db.execute({
				sql: `SELECT
							DH.IDG043 	IDDELIVE,
							DH.CDDELIVE PONUMBER,

							TO_CHAR(DH.DTDELIVE, 'YYYY-MM-DD') DTCREATE,
							TO_CHAR(DH.DTENTCON, 'YYYY-MM-DD') DTPKPEND,
							DH.CDPRIORI,

							DH.IDG005RE CDSHIPTO,

							DI.IDG045 IDITEM,
							DI.CDLOCVEN DI_CDLOCVEN,

							G5.IDG005 IDORIGIN,
							DI.IDG010 IDPRODUT,
							PROD.DSREFFAB,
							PROD.DSPRODUT,

							DL.DSLOTE,
							DL.QTPRODUT,
							DH.STULTETA

							FROM G043 DH

							LEFT JOIN G005 G5 ON G5.IDG005 = DH.IDG005RE

							LEFT JOIN G045 DI ON DI.IDG043 = DH.IDG043

							LEFT JOIN G050 DL ON DL.IDG045 = DI.IDG045

							LEFT JOIN G010 PROD ON PROD.IDG010 = DI.IDG010

							WHERE DH.SNDELETE = 0
							AND DI.SNDELETE = 0
							AND DL.SNDELETE = 0
							AND DH.IDG043 = ${req}

							ORDER BY DH.IDG043, DI.IDG045, DL.IDG050`,
				param: []
			})

			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	}


	api.buscarDiasSLA = async function (req, res, next) {
		return await db.execute({
				sql: `SELECT QTDIAENT
						FROM G053
						WHERE IDG003OR = ${req[0].CIDADE_REMETENTE}
						AND IDG003DE = ${req[0].CIDADE_DESTINATARIO}`,
				param: []
			})

			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	}

	//-----------------------------------------------------------------------\\

	api.buscarOrigemDestino = async function (req, res, next) {
		return await db.execute({
				sql: `SELECT
										CIDADERE.IDG003     CIDADE_REMETENTE
								,   CIDADEDE.IDG003     CIDADE_DESTINATARIO

							FROM G048 PARADA
							INNER JOIN G005 CLIENTERE
								ON CLIENTERE.IDG005 = PARADA.IDG005OR

							INNER JOIN G005 CLIENTEDE
								ON CLIENTEDE.IDG005 = PARADA.IDG005DE

							INNER JOIN G003 CIDADERE
								ON CIDADERE.IDG003 = CLIENTERE.IDG003

							INNER JOIN G003 CIDADEDE
								ON CIDADEDE.IDG003 = CLIENTEDE.IDG003

							WHERE CLIENTERE.SNDELETE = 0
								AND CLIENTEDE.SNDELETE = 0
								AND CIDADERE.SNDELETE = 0
								AND CIDADEDE.SNDELETE = 0
								AND PARADA.IDG048 = ${req}`,
				param: []
			})

			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	}

	//-----------------------------------------------------------------------\\

	/**
	 * @description Verifica se existe delivery passada e retorna o ID.
	 *
	 * @async
	 * @function api/buscaDeliveryPorCd
	 * @return {Array} Retorno da consulta SQL.
	 * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
	 */
	api.buscaDeliveryPorCd = async function (idDelivery) {
		return await db.execute({
				sql: `Select G043.IDG043, 
							G043.CdDelive, 
							G043.VrDelive, 
							G043.PsBruto 
						From G043 
						Where G043.SnDelete = 0  
						/*And	 G043.CdDelive = '${idDelivery}'*/
						and to_number(SUBSTR(G043.CDdelive, 2, 20)) in (${idDelivery})
						AND LENGTH(G043.CDdelive) = 11
						`,
				param: []
			})

			.then((result) => {
				return (result[0]);
			})
			.catch((err) => {
				throw err;
			});
	};

	//-----------------------------------------------------------------------\\

	/**
	 * @description Verifica se existe delivery passada e retorna o ID.
	 *
	 * @async
	 * @function api/buscaDeliveryPorId
	 * @return {Array} Retorno da consulta SQL.
	 * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
	 */


	api.buscaDeliveryPorId = async function (idDelivery) {
		return await db.execute({
				sql: `Select G043.IDG043, 
							G043.CdDelive, 
							G043.VrDelive, 
							G043.PsBruto 
						From G043 
						Where G043.SnDelete = 0  
						And G043.idg043 in (${idDelivery})
						AND LENGTH(G043.CDdelive) = 11
						`,
				param: []
			})

			.then((result) => {
				return (result[0]);
			})
			.catch((err) => {
				throw err;
			});
	};


	//-----------------------------------------------------------------------\\

	/**
	 * @description Verifica se existe delivery passada e retorna o ID.
	 *
	 * @async
	 * @function api/buscaDeliveryPorCdOrNota
	 * @return {Array} Retorno da consulta SQL.
	 * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
	 */


	api.buscaDeliveryPorCdOrNota = async function (obj) {
		var whereG  = '';/** Where geral para as duas SQLs */
		var whereE  = '';/** Where específico */

		/** Se o tptransp for devolução é necessário específicar o tpdelive, pois pode acontecer
		 *  de pegar delivery de retorno de AG ao invés de devolução, por causa da sequência do 
		 *  cddelive de ambos.
		 */
		if(obj.tptransp == 'D'){
			whereG = ' AND G043.TPDELIVE IN (4, 3) ';
		}else{
			whereG = ' AND G043.TPDELIVE NOT IN (4, 3) ';
		}

		/** Se o snag for 1 significa que o CTE que está vindo do Logos é AG e as deliveries estão
		 *  completas, caso não seja 1 significa que as deliveries estão apenas com os números. 
		 */
		if(obj.snag == 1){
			whereG += ` AND (G043.IDG005DE IN (${obj.remetente}) OR G043.IDG005RE IN (${obj.remetente}))`;
			whereE += ` AND G043.CDDELIVE IN (${obj.dsrascl3}) `;
		}else{
			whereG += ` AND G043.IDG005RE IN (${obj.remetente})`;
			whereE += ` AND TO_NUMBER(SUBSTR(G043.CDDELIVE, 2, 20)) IN (${obj.delivery})
						AND LENGTH(G043.CDDELIVE) = 11
						AND TO_NUMBER(SUBSTR(G043.CDDELIVE, 2, 20)) > 10 `;
		}
		return await db.execute({
				sql: `SELECT G043.IDG043, 
							 G043.CDDELIVE, 
							 G043.VRDELIVE, 
							 G043.PSBRUTO 
						FROM G043 
						INNER JOIN G014 
							ON G014.IDG014 = G043.IDG014
						WHERE 
							NOT EXISTS (SELECT * FROM G052 G052 WHERE G052.IDG043 = G043.IDG043)
							AND G014.SN4PL = 1 -- CHKRDC 
							AND G043.SNDELETE = 0
							AND NVL(G043.STETAPA,0) NOT IN (7,8)
							${whereG}
							${whereE}
					UNION
					SELECT G043.IDG043, 
						   G043.CDDELIVE, 
						   G043.VRDELIVE, 
						   G043.PSBRUTO 
						FROM G043 
						INNER JOIN G014 
							ON G014.IDG014 = G043.IDG014
						WHERE 
							NOT EXISTS (SELECT * FROM G052 G052 WHERE G052.IDG043 = G043.IDG043) AND
							NVL(G043.NRNOTA, 0) <> 0
							AND G014.SN4PL = 1 -- CHKRDC 
							AND SUBSTR(G043.CDDELIVE, 0, 1) IN ('F','W','D')
							AND TO_NUMBER(SUBSTR(G043.CDDELIVE, 2, 20)) > 10
							AND G043.SNDELETE = 0
							AND NVL(G043.STETAPA,0) NOT IN (7,8)
							AND G043.NRNOTA IN (${obj.nota})
							${whereG}
						`,
				param: []
			})

			.then((result) => {
				return (result[0]);
			})
			.catch((err) => {
				throw err;
			});
	};

	//-----------------------------------------------------------------------\\
	/**
	 * @description Atualiza delivery com dados vindo do conhecimento.
	 *
	 * @async
	 * @function atualizaDeliveryConhecimento
	 * @return {Array} Retorno da consulta SQL.
	 * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
	 */

	api.atualizaDeliveryConhecimento = async function (req, res, next) {
		if (!req.nrchadoc || req.nrchadoc == '') {
			return await
			db.update({
					tabela: 'G043',
					colunas: {
						/*DTEMINOT: req.dteminot,*/
						NRNOTA: req.nrnota,
						DSMODENF: req.dsmodenf,
						NRSERINF: req.nrserinf,
						SNAG: req.snag,
						NRINTSUB: req.nrintsub,
					},
					condicoes: 'IdG043 = ' + req.idg043 + ' ',
					parametros: {}
				})
				.then((result) => {
					return result;
				})
				.catch((err) => {

					throw err;
				});
		} else {
			return await
			db.update({
					tabela: 'G043',
					colunas: {
						/*DTEMINOT: req.dteminot,*/
						NRNOTA: req.nrnota,
						NRCHADOC: req.nrchadoc,
						DSMODENF: req.dsmodenf,
						NRSERINF: req.nrserinf,
						NRINTSUB: req.nrintsub,
					},
					condicoes: 'IdG043 = ' + req.idg043 + ' ',
					parametros: {}
				})
				.then((result) => {
					return result;
				})
				.catch((err) => {

					throw err;
				});
		}
	};

	api.atualizaSnag = async function (req, res, next) {
		
		return await
		db.update({
				tabela: 'G043',
				colunas: {
					SNAG: req.snag,
				},
				condicoes: 'IdG043 = ' + req.idg043 + ' ',
				parametros: {}
		})
		.then((result) => {
			return result;
		})
		.catch((err) => {

			throw err;
		});
	};

	api.listarLocProDelivery = async function (req, res, next) {
		var ids = req.body.ids.toString();
		return await db.execute({
				sql: `Select 	LISTAGG(X.IDG005RE, ',') WITHIN GROUP (ORDER BY X.IDG005RE) IDG005RE,
											LISTAGG(X.IDG005DE, ',') WITHIN GROUP (ORDER BY X.IDG005DE) IDG005DE,
											LISTAGG( X.IDG010, ',') WITHIN GROUP (ORDER BY X.IDG010)IDG010
							From (	Select 			Distinct DH.IDG005RE, DH.IDG005DE, DI.IDG010
											From 				G043 DH
											Inner Join 	G045 DI On DI.IDG043 = DH.IDG043
											Where 			DH.SNDELETE = 0
											And DI.SNDELETE = 0
											And DH.IDG043 In (${ids}) ) X`,
				param: [],
			})
			.then((result) => {
				return result;
			})
			.catch((err) => {
				throw err;
			});
	};

	/**
	 * @description Lista eventos de uma delivery.
	 *
	 * @async
	 * @function delivery/eventos
	 * @return {Array} Retorno da consulta SQL.
	 * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
	 */

	api.listarEventosDelivery = async function (req, res, next) {
		var id = req.params.id;

		return await db.execute({
				sql: `Select
										I008.IdI008, I001.DsEvento, I008.IdG043,
										TO_CHAR(I008.DtEvento, 'DD/MM/YYYY') DtEvento,
										TO_CHAR(I008.DtEvento, 'HH24:MI:SS') HrEvento
						From   I008
										Join I001 on I008.IdI001 = I001.IdI001
						Where  IdG043 = ` + id + ` and
										I008.SnDelete = 0
						Order By I008.DtEvento Desc`,
				param: [],
			})
			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	};

	//-----------------------------------------------------------------------\\

	/**
	 * @description Lista eventos de uma delivery.
	 *
	 * @async
	 * @function delivery/eventos
	 * @return {Array} Retorno da consulta SQL.
	 * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
	 */

	api.listarParceirosDelivery = async function (req, res, next) {
		var id = req.params.id;

		return await db.execute({
				sql: `Select
										G044.IdG044, G044.TpFunPar,
										G005.NmClient
						From   G044
										Join G005 G005 on G044.IdG005 = G005.IdG005
						Where  IdG043 = ` + id + ` and
										G044.SnDelete = 0`,
				param: [],
			})
			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	};

	api.cargaPorDelivery = async function (req, res, next) {
		return await db.execute({
				sql: `
				SELECT 
						G048.IDG046 AS ID_CARGA,
						G048.IDG048 AS ID_ETAPA,
						G048.NRSEQETA AS ID_SEQ_ETAPA,
						G049.IDG049 AS ID_DELIVERY_ETAPA,
						G043.IDG043 AS ID_DELIVERY_EVOLOG,
						G043.NRNOTA AS ID_NOTA,
						G043.DTENTREG AS DTENTREG,
						G043.CDDELIVE AS COD_DELIVERY
						
				FROM 	G048
				
				JOIN 	G049
					ON	G048.IDG048 = G049.IDG048
				
				JOIN 	G043
					ON 	G043.IDG043 = G049.IDG043
					
				WHERE
						G043.SNDELETE = 0	AND
						G043.CDDELIVE = '${req}'`,
				param: [],
			})
			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	}

	api.cargaPorDeliveryPeloId = async function (req, res, next) {
		return await db.execute(
			{
				sql: `
				SELECT 
						G048.IDG046  		ID_CARGA,
						G048.IDG048  		ID_ETAPA,
						G048.NRSEQETA  	ID_SEQ_ETAPA,
						G049.IDG049  		ID_DELIVERY_ETAPA,
						G043.IDG043  		ID_DELIVERY_EVOLOG,
						G043.NRNOTA  		ID_NOTA,
						G043.DTENTREG  	DTENTREG,
						G043.CDDELIVE  	COD_DELIVERY
						
				FROM 	G048
				
				INNER JOIN 	G049
					ON	G048.IDG048 = G049.IDG048
				
				INNER JOIN G043
					ON G043.IDG043 = G049.IDG043
					
				WHERE
						G043.SNDELETE = 0	AND
						G043.IDG043 = '${req}'`
				,
				param: [],
			})
			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	}

	api.paradaPorDelivery = async function (req, res, next) {

		return await db.execute({
				sql: `SELECT IDG048 FROM G049 WHERE IDG043 = ${req}`,
				param: [],
			})
			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	}

	api.buscarDataSaida = async function (req, res, next) {

		return await db.execute({
				sql: `SELECT TO_CHAR(DTENTREG,'YYYY-MM-DD HH24:MI:SS') DTENTREG FROM G043 WHERE IDG043 = ${req}`,
				param: [],
			})
			.then((result) => {
				return (result[0].DTENTREG);
			})
			.catch((err) => {
				throw err;
			});
	}

	api.listarCargasDelivery = async function (req, res, next) {
		var id = req.params.id;

		return await db.execute({
				sql: `
					SELECT DISTINCT
					G046.IDG046,
					G046.DSCARGA,
					G046.PSCARGA,
					G046.VRCARGA,
					G046.VRPOROCU,
					G046.SNCARPAR,
					G046.STCARGA,
					G046.TPCARGA,
					G046.QTVOLCAR,
					G046.IDG028,
					G046.SNESCOLT,
					G046.CDVIAOTI,
					ROUND(NVL(G048.QTDISTOD, G048.QTDISPER), 0) QTDISPER,
					G046.SNURGENT,
					TO_CHAR(G046.DTCARGA, 'dd/mm/yyyy') 	DTCARGA,
					TO_CHAR(G046.DTSAICAR, 'dd/mm/yyyy') 	DTSAICAR,
					TO_CHAR(G046.DTPRESAI, 'dd/mm/yyyy') 	DTPRESAI,
					TO_CHAR(G046.DTAGENDA, 'dd/mm/yyyy') 	DTAGENDA,
					G005_DESTINO.NMCLIENT  								DEST_CLIENTE,   
					G005_DESTINO.DSENDERE  								DEST_ENDERECO,  
					G005_DESTINO.CPENDERE  								DEST_CEP,       
					G003_DESTINO.IDG003    								DEST_CIDADE_ID, 
					G003_DESTINO.NMCIDADE  								DEST_CIDADE,    
					G002_DESTINO.IDG002    								DEST_ESTADO_ID,                
					G002_DESTINO.NMESTADO  								DEST_ESTADO,                   
					G005_ORIGEM.NMCLIENT   								ORIG_CLIENTE,   
					G005_ORIGEM.DSENDERE   								ORIG_ENDERECO,  
					G005_ORIGEM.CPENDERE   								ORIG_CEP,       
					G003_ORIGEM.IDG003     								ORIG_CIDADE_ID,
					G003_ORIGEM.NMCIDADE   								ORIG_CIDADE,    
					G002_ORIGEM.IDG002     								ORIG_ESTADO_ID, 
					G002_ORIGEM.NMESTADO   								ORIG_ESTADO,
					CASE
                        WHEN G032V1.NRPLAVEI IS NOT NULL THEN UPPER(G032V1.NRPLAVEI)
                        WHEN G046.NRPLAVEI IS NOT NULL THEN UPPER(G046.NRPLAVEI)
                        ELSE ''
                    END NRPLACA,
					G031M1.NMMOTORI 			 								NMMOTORI1,
					G031M2.NMMOTORI 			 								NMMOTORI2,
					G031M3.NMMOTORI 			 								NMMOTORI3,
					G032V1.DSVEICUL 			 								DSVEICUL1,
					G032V2.DSVEICUL 			 								DSVEICUL2,
					G032V3.DSVEICUL 			 								DSVEICUL3,
					G030.DSTIPVEI,
					G024.NMTRANSP,
					G024.IDG024,
					S001.NMUSUARI,
					H002.DSTIPCAR,
					I011.IDTIPVEI,
					COUNT(G046.IDG046) OVER () AS COUNT_LINHA

					FROM G046                                           

					INNER JOIN H002  
						ON H002.IDH002 = G046.TPCARGA
						
					INNER JOIN G048                                            
						ON G048.IDG046 = G046.IDG046 
						
					INNER JOIN G049 
						ON G049.IDG048 = G048.IDG048
						
					INNER JOIN G043                                            
						ON G043.IDG043 = G049.IDG043 
						
					INNER JOIN G005 G005_DESTINO                                  
						ON G043.IDG005DE = G005_DESTINO.IDG005   
						
					INNER JOIN G003 G003_DESTINO
						ON G005_DESTINO.IDG003 = G003_DESTINO.IDG003
						
					INNER JOIN G002 G002_DESTINO                                   
						ON G003_DESTINO.IDG002 = G002_DESTINO.IDG002 
						
					INNER JOIN G005 G005_ORIGEM                                     
						ON G043.IDG005RE = G005_ORIGEM.IDG005     
						
					INNER JOIN G003 G003_ORIGEM                                    
						ON G005_ORIGEM.IDG003 = G003_ORIGEM.IDG003  
						
					INNER JOIN G002 G002_ORIGEM                                     
						ON G003_ORIGEM.IDG002 = G002_ORIGEM.IDG002
						
					LEFT JOIN G031 G031M1
						ON G031M1.IDG031 = G046.IDG031M1
						
					LEFT JOIN G031 G031M2
						ON G031M2.IDG031 = G046.IDG031M2
						
					LEFT JOIN G031 G031M3
						ON G031M3.IDG031 = G046.IDG031M3
						
					LEFT JOIN G032 G032V1
						ON G032V1.IDG032 = G046.IDG032V1
						
					LEFT JOIN G032 G032V2
						ON G032V2.IDG032 = G046.IDG032V2
						
					LEFT JOIN G032 G032V3
						ON G032V3.IDG032 = G046.IDG032V3
						
					LEFT JOIN G030 
						ON G030.IDG030 = G046.IDG030
						
					LEFT JOIN G024
						ON G024.IDG024 = G046.IDG024
						
					LEFT JOIN S001
						ON S001.IDS001 = G046.IDS001
						
					LEFT JOIN H006 
						ON H006.IDG046 = G046.IDG046
						
					LEFT JOIN I011 
						ON I011.IDG030 = H006.IDG030

						WHERE  G046.SNDELETE = 0                                 
							AND G043.IDG043 = ${id}`,
				param: [],
			})
			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	};

	/**
	 *
	 * @async
	 * @function cancelarDelivery  
	 * @return {Array} Retorna true se alterada.
	 * @description Recebe obj { id: IDG043, //Id da Delivery etapa: 'C' //Etapa}
	 * @author Vanessa Souto
	 * @since 31/01/2018
	 *
	 */
	api.cancelarDelivery = async function (req, res, next) {

		var idDeliveries = req.body.ID_DELIVERIES;
		var etapa = req.body.STETADELIVERY;
		var usuario = req.body.IDS001CA;
		var dataCancelamento = tmz.tempoAtual("YYYY-MM-DD HH:mm:ss");
		var motivoCancelamento = req.body.IDT013.id;

		var sqlCommand = `
						UPDATE 
							 G043 SET STETAPA  = '${etapa}',
									  IDS001CA = '${usuario}',
									  DTCANCEL = To_Date('${dataCancelamento}', 'YYYY-MM-DD HH24:MI:SS'),
									  IDT013 = '${motivoCancelamento}'		 
						WHERE IDG043 IN (${idDeliveries})`;

		return await db.execute({
				sql: sqlCommand,
				param: [],
			})
			.then((result) => {
				result = {
					'result': true
				};
				return result;
			})
			.catch((err) => {
		throw err;
			});
	};

	/**
	 *
	 * @async
	 * @function voltarBacklog  
	 * @return {Array} Retorna true se alterada.
	 * @description Recebe a delivery que está na etapa A Cancelar para mudar para Backlog.
	 * @author Luiz Gustavo 
	 * @since 26/03/2019
	 *
	 */
	api.voltarBacklog = async function (req, res, next) {

		var parm = { UserId: req.UserId };
		var deliverySelecionada = req.body.DH_IDG043;
		var etapa = req.etapa;

		parm.sql = `UPDATE 
						G043 SET STETAPA  = ${etapa},
								 IDS001CA = NULL,
								 OBCANCEL = NULL,
								 DTCANCEL = NULL		 
						WHERE IDG043 = ${deliverySelecionada}`;

		return await gdao.executar(parm, res, next)
		.catch((err) => { 
			throw err 
		});
	};

	api.getEtapaDelivery = async function (req, res, next) {

		var idDeliveries = req.body.ID_DELIVERIES;

		var sqlCommand = `
						SELECT 
							STETAPA 
						FROM
							G043 
						WHERE IDG043 IN (${idDeliveries})`;

		return await db.execute({
				sql: sqlCommand,
				param: [],
			})
			.then((result) => {
				return result[0];
			})
			.catch((err) => {
				throw err;
			});
	};

	api.altEtapaParaCancelada = async function (req, res, next) {

		var etapa = req.body.STETADELIVERY;

		switch (req.body.STETADELIVERY) {
			case 0:
			case 1:
			case 6:
			case undefined:
				etapa = 7;
				break;
			
			case 7:
				etapa = 8;
				break;		

			case 2:
				etapa = 0;
				break;

			default:
				etapa = req.body.STETADELIVERY;
				break;
		}

		var idDeliveries = req.body.ID_DELIVERIES;
		var sqlCommand = `
						Update 
								G043 Set StEtapa = '${etapa}' 
						Where IdG043 in (${idDeliveries})`;

		return await db.execute({
				sql: sqlCommand,
				param: [],
			})
			.then((result) => {
				return {
					result: true,
					etapa: etapa
				}
			})
			.catch((err) => {
				throw err;
			});
	};

	api.alterarStatusEtapa = async function (req, res, next) {
		var idDelivery = req[0];
		var etapa = req[1];

		return await
		db.update({
				tabela: 'G043',
				colunas: {
					STETAPA: etapa
				},
				condicoes: 'IdG043 = :id',
				parametros: {
					id: idDelivery
				}
			})
			.then((result) => {
				return result;
			})
			.catch((err) => {
				throw err;
			});
	};

	api.deliveyPorConhecimentoNota = async function (conhecimento, nota) {

		var sqlCommand = `
					SELECT		
						G043.IDG043, 
						G043.CDDELIVE, 
						G052.IDG051
					FROM G043 
					JOIN G052 
						ON G052.IDG043 = G043.IDG043
					WHERE G043.SNDELETE = 0 					
					AND G043.NRNOTA = ${nota} 						
					AND	G052.IDG051 = ${conhecimento}`;

		return await db.execute({
				sql: sqlCommand,
				param: [],
			})
			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	}

	api.salvaDataSaida = async function (req, res, nex) {
		return await
		db.update({
				tabela: 'G043',
				colunas: {
					DTENTREG: req.data
				},
				condicoes: `IdG043  = ${req.idDelivery}`,
				parametros: {}
			})
			.then((result) => {
				return result;
			})
			.catch((err) => {
				throw err;
			});
	}

	//-----------------------------------------------------------------------\\
	/**
	 * @description Retorna o as deliveries que podem ser canceladas
	 * 
	 * @async
	 * @function getDeliveryACancelar
	 * @return {Array}  Retorna um array.
	 * @throws {Object} Retorna o erro da consulta.
	 * 
	 * @author Yusha Mariak e Everton
	 * @since 27/02/2018
	 */

	api.getDeliveryACancelar = async function (req, res, next) {
		return await db.execute({
				sql: `SELECT
								DH.IDG043 				ID,
								DH.CDDELIVE,
								DH.STETAPA 				STATUS,
								DH.STULTETA				STULTETA,
								DH.STDELIVE,
								DH.CDPRIORI, 
								DH.STULTETA				ULT_STATUS,								
								TO_CHAR(DH.DTDELIVE, 'DD/MM/YYYY') 						DATE_CREATION,
								TO_CHAR(DH.DTLANCTO, 'DD/MM/YYYY HH24:MI:SS') DATE_LAUNCH,
								TO_CHAR(DH.DTENTCON, 'DD/MM/YYYY') 						DTENTCON,
								TO_CHAR(DH.DTENTREG, 'DD/MM/YYYY') 						DTENTREGDEL,
								SELLER.NMCLIENT 	SELLER_NAME,
								BUYER.NMCLIENT 		BUYER_NAME

							FROM G043 DH

							INNER JOIN G014 OP
								ON OP.IDG014 = DH.IDG014

							INNER JOIN G005 SELLER 
								ON SELLER.IDG005 = DH.IDG005RE

							INNER JOIN G005 BUYER 
								ON BUYER.IDG005 = DH.IDG005DE

							WHERE 
							OP.SN4PL = 1 -- CHKRDC 
							AND DH.SNDELETE = 0							
							AND (
									(DH.STETAPA IN (0, 1, 20, 21, 22, 23)) OR 
									(DH.STETAPA = 7 AND DH.STDELIVE = 'D') OR
									(DH.STETAPA = 24 AND DH.TPDELIVE = '3')
								)

							ORDER BY DH.DTDELIVE DESC`,
				param: []
			})

			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	}

	api.postDeliveryACancelar = async function (req, res, next) {
		if(req.body['parameter[G058RE_SNVIRA][null]']){
			delete req.body['parameter[G058RE_SNVIRA][null]'];
		}
		var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, "DH", true);
		return await db.execute({
				sql: `SELECT
								DH.IDG043 						DH_IDG043,
								DH.CDDELIVE 					DH_CDDELIVE,
								SELLER.NMCLIENT  			SELLER_NMCLIENT,
								BUYER.NMCLIENT 				BUYER_NMCLIENT,
								DH.STETAPA 						DH_STETAPA,
								DH.STULTETA						DH_STULTETA,
								DH.STDELIVE 					DH_STDELIVE,
								DH.CDPRIORI 					DH_CDPRIORI, 		
								DH.TPDELIVE						DH_TPDELIVE,						
								TO_CHAR(DH.DTDELIVE, 'DD/MM/YYYY') 						DH_DTDELIVE,
								TO_CHAR(DH.DTLANCTO, 'DD/MM/YYYY HH24:MI:SS') DH_DTLANCTO,
								TO_CHAR(DH.DTENTCON, 'DD/MM/YYYY') 						DH_DTENTCON,
								TO_CHAR(DH.DTENTREG, 'DD/MM/YYYY') 						DH_DTENTREG,
								COUNT(DH.IDG043) OVER () as COUNT_LINHA

							FROM G043 DH

							INNER JOIN G014 OP
								ON OP.IDG014 = DH.IDG014

							INNER JOIN G005 SELLER 
								ON SELLER.IDG005 = DH.IDG005RE

							INNER JOIN G005 BUYER 
								ON BUYER.IDG005 = DH.IDG005DE

							${sqlWhere} 
							AND OP.SN4PL = 1 -- CHKRDC
							AND (
									(DH.STETAPA IN (0, 1, 20, 21, 22, 23)) OR 
									(DH.STETAPA = 7 AND DH.STDELIVE = 'D') OR
									(DH.STETAPA = 24 AND DH.TPDELIVE = '3')
								)

							${sqlOrder} ${sqlPaginate}`,
				param: bindValues
			})

			.then((result) => {
				return (utils.construirObjetoRetornoBD(result));
			})
			.catch((err) => {
				throw err;
			});
	}

	api.postDeliveryACancelarBacklog = async function (req, res, next) {
		if(req.body['parameter[G058RE_SNVIRA][null]']){
			delete req.body['parameter[G058RE_SNVIRA][null]'];
		}
		var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, "DH", true);
		return await db.execute({
				sql: `SELECT
								DH.IDG043 						DH_IDG043,
								DH.CDDELIVE 					DH_CDDELIVE,
								SELLER.NMCLIENT  			SELLER_NMCLIENT,
								BUYER.NMCLIENT 				BUYER_NMCLIENT,
								DH.STETAPA 						DH_STETAPA,
								DH.STULTETA						DH_STULTETA,
								DH.STDELIVE 					DH_STDELIVE,
								DH.CDPRIORI 					DH_CDPRIORI, 		
								DH.TPDELIVE						DH_TPDELIVE,						
								TO_CHAR(DH.DTDELIVE, 'DD/MM/YYYY') 						DH_DTDELIVE,
								TO_CHAR(DH.DTLANCTO, 'DD/MM/YYYY HH24:MI:SS') DH_DTLANCTO,
								TO_CHAR(DH.DTENTCON, 'DD/MM/YYYY') 						DH_DTENTCON,
								TO_CHAR(DH.DTENTREG, 'DD/MM/YYYY') 						DH_DTENTREG,
								COUNT(DH.IDG043) OVER () as COUNT_LINHA

							FROM G043 DH

							INNER JOIN G014 OP
								ON OP.IDG014 = DH.IDG014							

							INNER JOIN G005 SELLER 
								ON SELLER.IDG005 = DH.IDG005RE

							INNER JOIN G005 BUYER 
								ON BUYER.IDG005 = DH.IDG005DE

							${sqlWhere} 
							AND OP.SN4PL = 1 -- CHKRDC
							AND (
									(DH.STETAPA = 7 AND DH.STDELIVE <> 'D')
								)

							${sqlOrder} ${sqlPaginate}`,
				param: bindValues
			})

			.then((result) => {
				return (utils.construirObjetoRetornoBD(result));
			})
			.catch((err) => {
				throw err;
			});
	}

	api.ajustaPDFCanhoto = async function (req, res, next) {
		
		return await db.execute(
			{
				sql: `SELECT G043.IDG043, G043.TXCANHOT FROM G043 
				WHERE G043.TXCANHOT IS NOT NULL
				AND G043.TXCANHOT NOT LIKE '%.pdf%' `,
				param: []
			})

			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	}

	api.envioOtimizadorManual = async function (req, res, next) {
		
		
	try {

		logger.debug("Inicio envioOtimizadorManual");

		//# Forçando conexao vinda do bloqueio/desbloqueio - Monitoria;
		var con = await this.controller.getConnection((req.conexao != undefined && req.conexao != null ? req.conexao : null), req.UserId);

		//# Objeto de retorno para tela SLA
		var objResult = {};

		//# Informações Deliverys
		var verificaDeliverys = await con.execute({
				sql: `
				SELECT X.*,
       
                (SELECT TO_DATE(TO_CHAR(X.DTLANCTO,
                                'DD/MM/YYYY') || ' ' ||TO_CHAR(G105.DTCORTE,
                                'HH24:mi:ss'), 'DD/MM/YYYY HH24:mi:ss')
                   FROM G105 G105
                  WHERE G105.TPTRANSP = X.TPTRANSP
                    AND G105.IDG014 = X.IDG014
                    AND G105.SNDELETE = 0) AS CORTE
                    FROM (


				SELECT  G043.IDG043,
						G043.CDDELIVE,
						/* Forcando DTDESBLO do bloqueio/desbloqueio - Monitoria */
						NVL(G043.DTDESBLO, G043.DTLANCTO) as DTLANCTO,
						G043.DTLANCTO as DTCHEGAD,
						G043.DTDESBLO,
						G043.DTBLOQUE,
						G043.DTDELIVE,
						G043.TPDELIVE,
						G005DE.idg003 as IDG003DE,
						G005RE.idg003 as IDG003RE,
						G003DE.NMCIDADE || '-' || G002DE.CDESTADO AS NMCIDADE,
						G003RE.NMCIDADE || '-' || G002RE.CDESTADO AS NMCIDARE,
						CASE G043.tpdelive
							WHEN '1' THEN
							'T'
							WHEN '2' THEN
							'V'
							WHEN '5' THEN
							'V'
							WHEN '3' THEN
							'D'
							WHEN '4' THEN
							'R'
							ELSE
							'X'
					  	END as tptransp,
						CASE
							WHEN (SELECT COUNT(1)
									FROM G045 G045
									WHERE G045.CDLOCVEN IN ('BR05')
									AND G045.IDG043 = G043.IDG043) >= 1 THEN
							'1'
							ELSE
							'0'
						END AS TPLG,
					  G043.IDG014
				FROM G043 G043

				INNER JOIN G005 G005DE
					ON G005DE.IDG005 = NVL(G043.IDG005RC, G043.IDG005DE)

				INNER JOIN G005 G005RE
					ON G005RE.IDG005 = G043.IDG005RE

				INNER JOIN G003 G003DE
					ON G003DE.IDG003 = G005DE.IDG003

				INNER JOIN G002 G002DE
					ON G002DE.IDG002 = G003DE.IDG002

				INNER JOIN G003 G003RE
					ON G003RE.IDG003 = G005RE.IDG003
					
				INNER JOIN G002 G002RE
					ON G002RE.IDG002 = G003RE.IDG002
					

				WHERE G043.IDG043 IN (${req.body.IDG043}) ) X `,

				param: []
			}).then((res) => {
				return res;
			}).catch((err) => {
				throw err;
			});

			//# Informações das delivery
			objResult.delivery = verificaDeliverys;

			if(verificaDeliverys.length > 0){
				var snSave = true;
				for (let j = 0; j < verificaDeliverys.length; j++) {

					//# Utilizado para dar update ou nao na delivery em casos de ausencia de cidade tarifa
					snSave = true;
					
					let dataSLA = null;
					let dataVenctoRot = null;
					let whereAuxRota = '';

					if(verificaDeliverys[j].TPLG == 1){
						whereAuxRota = ' AND T001.IDT005 = 35';
					}else{
						if(verificaDeliverys[j].TPDELIVE == '1' /* Transferencia */){
							whereAuxRota = ' AND T001.IDT005 = 37';

						}else if(verificaDeliverys[j].TPDELIVE == '2' /* Venda */){
							whereAuxRota = ' AND T001.IDT005 = 34';

						}else if(verificaDeliverys[j].TPDELIVE == '5' /* Retorno de AG */){
							whereAuxRota = ' AND T001.IDT005 = 36';
						}
					}

					var verificaDados = await con.execute({
						sql: `
						 SELECT Z.IDG003,
								Z.IDG024,
								SUM(Z.T001SNDIA0) AS SNDIA0,
								SUM(Z.T001SNDIA1) AS SNDIA1,
								SUM(Z.T001SNDIA2) AS SNDIA2,
								SUM(Z.T001SNDIA3) AS SNDIA3,
								SUM(Z.T001SNDIA4) AS SNDIA4,
								SUM(Z.T001SNDIA5) AS SNDIA5,
								SUM(Z.T001SNDIA6) AS SNDIA6,
								LISTAGG(Z.IDT001, ',') WITHIN GROUP (ORDER BY Z.IDT001) IDT001,
								Z.IDG043
						   FROM (SELECT Y.*
								FROM (SELECT X.*,
												
												(T002SNDIA0 + T002SNDIA1 + T002SNDIA2 + T002SNDIA3 +
												T002SNDIA4 + T002SNDIA5 + T002SNDIA6) AS T002SN
										FROM (SELECT T002.*,
										
														T001.SNDIA0 AS T001SNDIA0,
														T001.SNDIA1 AS T001SNDIA1,
														T001.SNDIA2 AS T001SNDIA2,
														T001.SNDIA3 AS T001SNDIA3,
														T001.SNDIA4 AS T001SNDIA4,
														T001.SNDIA5 AS T001SNDIA5,
														T001.SNDIA6 AS T001SNDIA6,
										
														T001.SNDIA0 AS T002SNDIA0,
														T001.SNDIA1 AS T002SNDIA1,
														T001.SNDIA2 AS T002SNDIA2,
														T001.SNDIA3 AS T002SNDIA3,
														T001.SNDIA4 AS T002SNDIA4,
														T001.SNDIA5 AS T002SNDIA5,
														T001.SNDIA6 AS T002SNDIA6,
														G043.IDG043
												
												FROM G043 G043
												
												INNER JOIN G005 G005DE
													ON G005DE.IDG005 =
														NVL(G043.IDG005RC,
															G043.IDG005DE)
												INNER JOIN G003 G003DE
													ON G003DE.IDG003 = G005DE.IDG003
												
												INNER JOIN G002 G002DE
													ON G002DE.IDG002 = G003DE.IDG002
												
												INNER JOIN T002 T002
													ON T002.IDG003 = G005DE.IDG003
												
												INNER JOIN T001 T001
													ON T001.IDT001 = T002.IDT001
												
												INNER JOIN G005 G005RE
													ON G005RE.IDG005 = G043.IDG005RE
												
												JOIN G084 G084
													ON G005RE.IDG028 = G084.IDG028
													AND G084.IDG024 = T002.IDG024
												
												WHERE G043.IDG043 = ${verificaDeliverys[j].IDG043}
													AND T001.SNDELETE = 0
													AND T002.SNDELETE = 0
													AND T001.IDT005 NOT IN (1)
													${whereAuxRota}
												
												) X) Y
								
								WHERE Y.T002SN >= 1
								
								ORDER BY T002SNDIA0 DESC,
										T002SNDIA1 DESC,
										T002SNDIA2 DESC,
										T002SNDIA3 DESC,
										T002SNDIA4 DESC,
										T002SNDIA5 DESC,
										T002SNDIA6 DESC) Z
						GROUP BY Z.IDG003,
								Z.IDG024,
								Z.IDG043
								/*,z.IDT001*/ `,
						param: []
					}).then((res) => {
						return res;
					}).catch((err) => {
						throw err;
					});

					//# Informações de rotas encontradas
					objResult.delivery[j].ROTAS = verificaDados;
			
					var dataProximaRota = 9;

					//# Data de partida para Calculo
					let dataAgora = new Date(verificaDeliverys[j].DTLANCTO);

			
					if(verificaDados.length > 0){

						//# Horário de corte
						if(verificaDeliverys[0].CORTE != null){
							
							var dataCorte = new Date(verificaDeliverys[j].CORTE);

							if(dataAgora > dataCorte){
								dataAgora.setDate(dataAgora.getDate() + 1);
							}
						}
						
						var diaAux = dataAgora.getDay();

						for (let k = 0; k < 7; k++) {

							if(verificaDados[0]['SNDIA'+diaAux] != 0){
								dataProximaRota = diaAux;
								break;
							}

							if(diaAux >= 6){
								diaAux = 0
							}else{
								diaAux++;
							}

						}
			
					}else{
						dataAgora = new Date();
						dataProximaRota = 9;
					}
			
					var qtdDiasAte = 0;

					//# Data com horario de corte
					objResult.delivery[j].DATAATUAL = new Date(dataAgora);

					//# Dia da semana atualmente
					objResult.delivery[j].DIAATUAL = dataAgora.getDay();

					//# Dia que vai roteirizar
					objResult.delivery[j].DIASELECIONADOROTA = dataProximaRota;
					
					//# Caso não exista rota para a delivery, utiliza-se o dia atual
					if(dataProximaRota != 9){

						if(dataAgora.getDay() == dataProximaRota){ //# mesmo dia
							qtdDiasAte = 0;
				
						}else if(dataAgora.getDay() > dataProximaRota){ //# maior, vai virar a semana
							qtdDiasAte = (7 - dataAgora.getDay()) + dataProximaRota;
							
						}else if(dataAgora.getDay() < dataProximaRota){ //# menor, mesma semana
							qtdDiasAte = (dataProximaRota - dataAgora.getDay());
						}

						objResult.delivery[j].QTDDIASATEPROXIMA = qtdDiasAte;
				
						for (let i = 0; i < qtdDiasAte; i++) {
							dataAgora.setDate(dataAgora.getDate() + 1);
						}
					}
			
					dataVenctoRot = new Date(dataAgora);

					//# Data do vencimento da rota
					objResult.delivery[j].DATAVENCIMENTOROTA = dataVenctoRot;

					//# Mais um dia para a coleta
					dataAgora.setDate(dataAgora.getDate() + 1);

					//# Data +1 dia para coleta
					objResult.delivery[j].DATACOLETA = new Date(dataAgora);

					/* Buscando cidade tarifa */
					var sqlCidadeTarifa = ` 
					SELECT
						IDG053,
						NVL(QTDIAENT, 0) QTDIAENT,
						NVL(QTDIACOL, 0) QTDIACOL,
						NVL(QTDIENLO, 0) QTDIENLO,
						NVL(QTDIENIT, 0) QTDIENIT,
						COALESCE(TO_CHAR(HOFINOTI, 'HH24:MI'), '23:59') HOFINOTI

					FROM G053
					WHERE
						SNDELETE     = 0
						AND IDG014   =  ${verificaDeliverys[j].IDG014}
						AND IDG003OR =  ${verificaDeliverys[j].IDG003RE}
						AND IDG003DE =  ${verificaDeliverys[j].IDG003DE}
						AND TPTRANSP = '${verificaDeliverys[j].TPTRANSP}' `;

					let resultParamDias = await con.execute({ sql:sqlCidadeTarifa, param: [] })
					.then((result) => {
						return result;
					})
					.catch((err) => {
						con.closeRollback();
						err.stack = new Error().stack + `\r\n` + err.stack;
						throw err;
					});

					var qtdDias = 0;
					var snCarPar = 'S'; //# Forçando LTL até segunda ordem;

					//# Informações de cidade tarifa
					objResult.delivery[j].CIDADETARIFA = resultParamDias;

					if(resultParamDias.length > 0 ){
						if(snCarPar == 'N'){ //# FTL
							qtdDias = resultParamDias[0].QTDIENLO;
						}else if(snCarPar == 'S'){ //# LTL
							qtdDias = resultParamDias[0].QTDIAENT;
						}else{// # ITL
							qtdDias = resultParamDias[0].QTDIENIT;
						}
					}else{
						qtdDias = 0;
						if(verificaDeliverys[j].TPTRANSP != 'D'){
							snSave = false; //# Caso nao tenha cidade tarifa não salvar para nao interferir nos proximos resultados
							//res.status(500);
							//return {response: "Cidade tarifa não cadastrado para os parâmetros informados! ("+verificaDeliverys[j].IDG043+")"};
						}
					}
					
					//# Verifica dia útil
					dataAgora   = await utilsCurl.addDiasUteis(dataAgora, qtdDias, verificaDeliverys[j].IDG003DE);
					dataSLA 	= new Date(dataAgora);

					//# Data do SLA já calculado dias utéis
					objResult.delivery[j].DATASLAUTIL = dataSLA;
					
					//# Forçando guardar etapa caso o recalculo sla venha de um bloqueio/desbloqueio;
					let stEtapaAux = 9;  
					if (req.conexao != undefined && req.conexao != null) {
						stEtapaAux = verificaDeliverys[j].STETAPA;
					} else { 
						stEtapaAux = 1;
					}
					//##################################################################################

					if(req.body.SNCONSLA == undefined && snSave == true){

						let resultUpdate = await
						con.update({
						tabela: 'G043',
						colunas: {
				
							SNOTIMAN: 1,
							STETAPA:  stEtapaAux,
							DTENTCON: (dataSLA ? dtatu.retornaData(dataSLA, "DD/MM/YYYY HH:mm:ss") : null)	, /*Data de entrega contratual -> Logistica Reversa o If*/
							DTENT4PL: (dataSLA ? dtatu.retornaData(dataSLA, "DD/MM/YYYY HH:mm:ss") : null)	, /*Data de entrega contratual -> Logistica Reversa o If*/
							DTVENROT: dataVenctoRot,
				
						},
						condicoes: 'IdG043 = :id',
						parametros: {
							id: verificaDeliverys[j].IDG043
						}
						})
						.then((result1) => {
							logger.debug("Retorno:", result1);
							return result1;
						})
						.catch((err) => {
							err.stack = new Error().stack + `\r\n` + err.stack;
							logger.error("Erro:", err);
							throw err;
						});

					}
			
					dataSLA = null;
					dataVenctoRot = null;
					
					await con.close();
					con = await this.controller.getConnection(null, req.UserId);

				}

			}else{

				res.status(500);
				await con.closeRollback();
				return { response: "Nenhuma delivery encontrada" };

			}
			
			await con.close();

			if(req.body.SNCONSLA == undefined){
				return { response: "Enviado com sucesso" };
			}else{
				return objResult;
			}
			
			
			

		}catch (err) {
			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;
		}
			
	}

	api.cancelarEnvioOtimizadorManual = async function (req, res, next) {
		var envOti = await db.execute({
			sql: `UPDATE G043
					SET SNOTIMAN = '0'
				  WHERE IDG043 in (${req.body.IDG043}) `,
			param: [],
			type: "UPDATE"
		}).then((result) => {
			return result;
		}).catch((err) => {
			throw err;
			})
		
		return { response: "Cancelado com sucesso" };
		
	}

	api.buscaDeliveryEmMassaPorCd = async function (objDelivery,next) {
		return await db.execute(
			{
				sql: `select distinct g043.idg043
						from g043 g043
						where 
							  to_number(SUBSTR(G043.CDdelive, 2, 20)) in (${objDelivery})
							  AND LENGTH(G043.CDdelive) = 11
							  and g043.SnDelete = 0`,
				param: []
			})

			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	}


	api.buscaDeliveryNotaEmMassaPorCd = async function (obj, next) {
		
		var whereG  = '';/** Where geral para as duas SQLs */
		var whereE  = '';/** Where específico */

		/** Se o tptransp for devolução é necessário específicar o tpdelive, pois pode acontecer
		 *  de pegar delivery de retorno de AG ao invés de devolução, por causa da sequência do 
		 *  cddelive de ambos.
		 */
		if(obj.tptransp == 'D'){
			whereG = ' AND G043.TPDELIVE IN (4, 3) ';
		}else{
			whereG = ' AND G043.TPDELIVE NOT IN (4, 3) ';
		}

		/** Se o snag for 1 significa que o CTE que está vindo do Logos é AG e as deliveries estão
		 *  completas, caso não seja 1 significa que as deliveries estão apenas com os números. 
		 */
		if(obj.snag == 1){
			whereG += ` AND (G043.IDG005DE IN (${obj.remetente}) OR G043.IDG005RE IN (${obj.remetente}))`;
			whereE += ` AND G043.CDDELIVE IN (${obj.dsrascl3}) `;
		}else{
			whereG += ` AND G043.IDG005RE IN (${obj.remetente})`;
			whereE += ` AND TO_NUMBER(SUBSTR(G043.CDDELIVE, 2, 20)) IN (${obj.delivery})
						AND LENGTH(G043.CDDELIVE) = 11
						AND TO_NUMBER(SUBSTR(G043.CDDELIVE, 2, 20)) > 10 `;
		}
		return await db.execute(
			{
				sql: `SELECT DISTINCT G043.IDG043, G043.IDG005RE
						FROM G043 
						INNER JOIN G014 
							ON G014.IDG014 = G043.IDG014
						WHERE 
							  NOT EXISTS (SELECT * FROM G052 G052 WHERE G052.IDG043 = G043.IDG043)
							  AND G014.SN4PL = 1 -- CHKRDC
							  AND G043.SNDELETE = 0
							  AND NVL(G043.STETAPA,0) NOT IN (7,8)
							  ${whereG}
							  ${whereE}
					UNION
					SELECT DISTINCT G043.IDG043, G043.IDG005RE
						FROM G043
						INNER JOIN G014 
							ON G014.IDG014 = G043.IDG014						
						WHERE 
							NOT EXISTS (SELECT * FROM G052 G052 WHERE G052.IDG043 = G043.IDG043) 
							AND NVL(G043.NRNOTA, 0) <> 0
							AND G014.SN4PL = 1 -- CHKRDC
							AND SUBSTR(G043.CDDELIVE, 0, 1) IN ('F','W','D')
							AND TO_NUMBER(SUBSTR(G043.CDDELIVE, 2, 20)) > 10
							AND G043.SNDELETE = 0
							AND NVL(G043.STETAPA,0) NOT IN (7,8)
							AND G043.NRNOTA IN (${obj.nota})
							${whereG}
							  `,
				param: []
			})

			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	}



	api.buscaTpDelivery = async function (idDeliverys) {
		return await db.execute(
			{
				sql: `select g043.tpdelive, g043.stetapa
						from g043 g043
						where
							  g043.idg043 in (${idDeliverys}) 
							  group by g043.tpdelive, g043.stetapa `,
				param: []
			})

			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	}

	// api.buscaTpDelivery = async function (objDelivery) {
	// 	return await db.execute(
	// 		{
	// 			sql: `select g043.tpdelive
	// 					from g043 g043
	// 					where
	// 						  to_number(SUBSTR(G043.CDdelive, 2, 20)) in (${objDelivery})
	// 						  AND LENGTH(G043.CDdelive) = 11
	// 						  and g043.SnDelete = 0
	// 						  group by g043.tpdelive`,
	// 			param: []
	// 		})

	// 		.then((result) => {
	// 			return (result);
	// 		})
	// 		.catch((err) => {
	// 			throw err;
	// 		});
	// }

	/**
     * @description Retorna Warehouse para os itens
     *
     * @function buscarWarehouseDashboard           
     * @param   {Object} req    
     * @param   {Object} req.body   
     *
     * @returns {Object} retorno padrão p/ datagrid
     * @throws  {status(500)} Exceção não tratada
     */
	api.buscarWarehouseDashboard = async function (req, res, next){
		
		let objConn = await api.controller.getConnection();

		let sql = `SELECT
					DH.DSEMACLI  DH_DSEMACLI,
					DH.DSEMARTV  DH_DSEMARTV,
					
					WS.IDG005    WS_IDG005,        
					WS.NMCLIENT  WS_NMCLIENT,
					WS.DSENDERE  WS_DSENDERE,
					WS.NRENDERE  WS_NRENDERE,
					WS.BIENDERE  WS_BIENDERE,
					WS.CPENDERE  WS_CPENDERE,

					WSCITY.NMCIDADE WSCITY_NMCIDADE,
					
					WSSTATE.NMESTADO WSSTATE_NMESTADO,
					WSSTATE.CDESTADO WSSTATE_CDESTADO

				FROM G043 DH

					LEFT JOIN G005 WS ON
						WS.IDG005 = DH.IDG005RC
			
					LEFT JOIN G003 WSCITY ON
						WSCITY.IDG003 = WS.IDG003

					LEFT JOIN G002 WSSTATE ON
						WSSTATE.IDG002 = WSCITY.IDG002

				WHERE DH.SNDELETE = 0
				AND DH.IDG043 = ${req.params.id}`;

		return await objConn.execute({ sql, param: [] })
			.then(async result => {
				await objConn.close();
				return result[0];
			})
			.catch(async err => {
				await objConn.closeRollback();
				throw err;
			})
	}

	api.vincularDeliveryNotaAG = async function (objNota, objCte) {

		var qtdNotas = 0;
		var idg083   = null;
		let db       = await api.controller.getConnection();

		try{

			var sql = await db.execute(
			{
				sql: `Select count(G083.idg083) as qtd, G083.idg083 From G083 G083 
					  Where G083.nrchadoc = '${objNota.nrchadoc}' and G083.idg043 = '${objNota.idg043}' and G083.SnDelete = 0
					  Group By G083.idg083 `,
				param: []
			})
			.then((result) => {
				if(result.length > 0){
					qtdNotas = result[0].QTD;
					idg083   = result[0].IDG083;
				}else{
					qtdNotas = 0;
					idg083   = null;
				}
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				logger.error("Erro:", err);
				throw err;
			});
			
		let resultado = null;

		if(qtdNotas == 0){

				resultado = await db.insert({
					tabela: 'G083',
					colunas: {
						IDG043:   objNota.idg043,
						DTEMINOT: objNota.dteminot,
						NRNOTA:   objNota.nrnota,
						DSMODENF: objNota.dsmodenf,
						NRSERINF: objNota.nrserinf,
						NRCHADOC: objNota.nrchadoc,
						PSBRUTO:  objNota.nrpeso ? String(objNota.nrpeso).replace(',', '.') : null,
						PSLIQUID: objNota.nrpeso ? String(objNota.nrpeso).replace(',', '.') : null,
						VRNOTA:   objNota.vrnota ? String(objNota.vrnota).replace(',', '.') : null,
						VRVOLUME: objNota.vrvolume,
						IDS001: 1,
						NRINTSUB: objNota.nrintsub,
					},
					key: 'IDG083'
				  })
				  .then((result) => {
					  return result;
				  })
				  .catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					logger.error("Erro:", err);
					throw err;
				  });
				
		}else{
			resultado = idg083;

			atualizar = await db.update({
				tabela: 'G083',
				colunas: {
					IDG043:   objNota.idg043,
					DTEMINOT: objNota.dteminot,
					NRNOTA:   objNota.nrnota,
					DSMODENF: objNota.dsmodenf,
					NRSERINF: objNota.nrserinf,
					NRCHADOC: objNota.nrchadoc,
					PSBRUTO:  objNota.nrpeso ? String(objNota.nrpeso).replace(',', '.') : null,
					PSLIQUID: objNota.nrpeso ? String(objNota.nrpeso).replace(',', '.') : null,
					VRNOTA:   objNota.vrnota ? String(objNota.vrnota).replace(',', '.') : null,
					VRVOLUME: objNota.vrvolume,
					IDS001: 1,
					NRINTSUB: objNota.nrintsub,
				},
				condicoes: 'IdG083 = :id',
				parametros: {
				  id: resultado
				}
			  })
			  .then((result) => {
				  return result;
			  })
			  .catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				logger.error("Erro:", err);
				throw err;
			  });

		}

		await db.close();

		return resultado;

	} catch (err) {
		await db.closeRollback();
		err.stack = new Error().stack + `\r\n` + err.stack;
		logger.error("Erro:", err);
		throw err;
	}
		
	};

	api.retQntStDelivery = async function(req,res,next){
        const tplObjRet = [
            {
                label:"Backlog",
                indNum:null,
                bgColor:"#e91e63",
                icon:"fas fa-bars",
                filtParam:"0"
            },
            {
                label:"Otimizando",
                indNum:null,
                bgColor:"#1e88e5",
                icon:"fas fa-box",
                filtParam:"1"
            },
            {
                label:"Oferecendo",
                indNum:null,
                bgColor:"#607d8b",
                icon:"fas fa-handshake",
                filtParam:"2"
            },
            {
                label:"Agendado",
                indNum:null,
                bgColor:"#8e24aa",
                icon:"fas fa-calendar-check",
                filtParam:"3"
            },
            {
                label:"Transporte",
                indNum:null,
                bgColor:"#ef6c00",
                icon:"fas fa-truck",
                filtParam:"4"
            },
            {
                label:"Encerrado",
                indNum:null,
                bgColor:"#4caf50",
                icon:"fas fa-check",
                filtParam:"5"
            },
            {
                label:"Ocorrências",
                indNum:null,
                bgColor:"#f44336",
                icon:"fas fa-exclamation",
                filtParam:"6"
            },
            {
                label:"A Cancelar",
                indNum:null,
                bgColor:"#f9a825",
                icon:"fas fa-minus",
                filtParam:"7"
            },
            {
                label:"Cancelado",
                indNum:null,
                bgColor:"#b71c1c",
                icon:"fas fa-ban",
                filtParam:"8"
            }
        ]


		var objConn = await this.controller.getConnection();
		
        try {
			
			if(Array.isArray(req.body.DH_TPDELIVE)){
                if(req.body.DH_TPDELIVE.length == 0){
                    delete req.body.DH_TPDELIVE;
                }
			}
			
            req.body.tableName = "DH";
            req.body.DH_STETAPA = {in:req.body.in};
            delete req.body.in;
            var [sqlWhere,bindValues] = utils.buildWhere(req.body,true);
			console.log("sqlWhere ",sqlWhere)
			console.log("bindValues ",bindValues)
            var objReturn = await objConn.execute({
                sql:`   SELECT 

							DH.STETAPA,

                            COUNT(*) QTSTATUS
                            
							FROM G043 DH
							
							LEFT JOIN G005 SELLER 
                                ON SELLER.IDG005 = DH.IDG005RE
                                AND SELLER.SNDELETE = 0

							LEFT JOIN G005 BUYER 
                                ON BUYER.IDG005 = DH.IDG005DE
                                AND BUYER.SNDELETE = 0

                            LEFT JOIN G003 CIDADE_DESTINATARIO
                                ON CIDADE_DESTINATARIO.IDG003 = BUYER.IDG003
                                AND CIDADE_DESTINATARIO.SNDELETE = 0

							LEFT JOIN G002 ESTADO_DESTINATARIO ON
                                ESTADO_DESTINATARIO.IDG002 = CIDADE_DESTINATARIO.IDG002
                                AND ESTADO_DESTINATARIO.SNDELETE = 0

                            INNER JOIN G014 G014 ON
                                G014.IDG014 = DH.IDG014

                            LEFT JOIN G074 G074 ON
                                G074.IDG074 = DH.IDG043

                            LEFT JOIN (
                                    SELECT 
                                            G058.IDG005RE
                                        ,	G058.IDG005DE
                                        ,	COUNT(*) SNVIRA
                
                                            FROM G058
                
                                            WHERE G058.SNDELETE = 0
                
                                            GROUP BY 
                                                    G058.IDG005RE
                                                ,	G058.IDG005DE
                                            ) G058RE 
                                                ON G058RE.IDG005RE = DH.IDG005RE
												AND G058RE.IDG005DE = DH.IDG005DE

                            ${sqlWhere}
							AND G014.SN4PL = 1 -- CHKRDC
							AND DH.CDDELIVE IS NOT NULL
							AND DH.TPDELIVE IN ('1', '2', '3', '4', '5')							
                        
						GROUP BY 
							DH.STETAPA
                        
                        ORDER BY DH.STETAPA`,
                param:bindValues
            }).then((res) => {
                var objReturn = new Array();
                for (result of res){
                    var indTemp = tplObjRet[result.STETAPA];
                    indTemp.indNum = result.QTSTATUS;
                     objReturn.push(indTemp);
                }
                return objReturn;
            }).catch((err) => {
                throw err;
            });    
            objConn.close();
            return objReturn;
        } catch (err) {
            objConn.closeRollback();
            throw err;
        }
	}

	return api;
}