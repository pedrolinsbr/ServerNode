module.exports = function (app, cb) {

	const tmz = app.src.utils.DataAtual;
	const fldAdd = app.src.modGlobal.controllers.XFieldAddController;
	var db = app.config.database;
	var utils = app.src.utils.FuncoesObjDB;
	var api = {};
	api.controller = app.config.ControllerBD;

	//-----------------------------------------------------------------------\\	

	/**
	 * @description Retorna um array com os dados das Deliveries para a Dashboard
	 * @author Jean Carlos B. Guimarães Costa
	 * @since 21/06/2018
	 *
	 * @async
	 * @function getDashboardData
	 * @return {Array} Retorno da consulta SQL.
	 * @throws {Object} Retorna o erro da consulta.
	 */
	api.getDashboardData = async function (req, res, next) {
		return await db.execute({
			sql: `SELECT
								DH.IDG043 			ID,
								DH.CDDELIVE,
								DH.NRNOTA,
								DH.SNLIBROT,
								DH.STETAPA 			STATUS,
								DH.STULTETA,
								DH.STDELIVE,
								DH.TPDELIVE			DH_TPDELIVE,
								DH.CDPRIORI, 
								DH.SNINDSEG,
								DH.TXINSTRU,
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

							ORDER BY DH.DTDELIVE DESC`,
			param: []
		})

			.then((result) => {
				return (result);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});
	}


	//-----------------------------------------------------------------------\\

	/**
     * @description Retorna deliveries para datagrid
     *
     * @function getDashboardDataAtu            
     * @param   {Object} req    
     * @param   {Object} req.body   
     *
     * @returns {Object} retorno padrão p/ datagrid
     * @throws  {status(500)} Exceção não tratada
     *
     * @author Jean Carlos B. Guimarães Costa
     * @since 21/06/2018
     *
     */
	api.getDashboardDataAtu = async function (req, res, next) {
		
		let objConn = await api.controller.getConnection();

		var parm = { nmTabela: 'G043', objConn };
		var sqlAux = await fldAdd.tabelaPivot(parm, res, next).catch((err) => { throw err });


		var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'DH', true);
		return await db.execute({
			sql: `SELECT
							DH.IDG043 							DH_IDG043,
							DH.CDDELIVE 						DH_CDDELIVE,
							DH.NRNOTA 							DH_NRNOTA,
							DH.SNLIBROT 						DH_SNLIBROT,
							DH.STETAPA 							DH_STETAPA,
							DH.STULTETA							DH_STULTETA,
							DH.STDELIVE						 	DH_STDELIVE,
							DH.CDPRIORI 						DH_CDPRIORI, 
							DH.SNINDSEG 						DH_SNINDSEG,
							DH.TXINSTRU 						DH_TXINSTRU,
							DH.TXCANHOT 						DH_TXCANHOT,
							G014.DSOPERAC                       G014_DSOPERAC,
							DH.TPDELIVE  						DH_TPDELIVE,

							TO_CHAR(DH.DTDELIVE, 'DD/MM/YYYY')				DH_DTDELIVE,
							TO_CHAR(DH.DTLANCTO, 'DD/MM/YYYY HH24:MI:SS') 	DH_DTLANCTO,
							TO_CHAR(DH.DTENTCON, 'DD/MM/YYYY') 				DH_DTENTCON,
							TO_CHAR(DH.DTENTREG, 'DD/MM/YYYY') 				DH_DTENTREG,
							TO_CHAR(DH.DTEMINOT, 'DD/MM/YYYY') 				DH_DTEMINOT,


							SELLER.NMCLIENT SELLER_NMCLIENT,
							BUYER.NMCLIENT BUYER_NMCLIENT,
												
							COUNT(DH.IDG043) OVER () as COUNT_LINHA

						FROM G043 DH

						INNER JOIN G005 SELLER 
							ON SELLER.IDG005 = DH.IDG005RE
						INNER JOIN G014 
							ON DH.IDG014 = G014.IDG014

						INNER JOIN G005 BUYER ON BUYER.IDG005 = DH.IDG005DE` +
				sqlWhere +`AND DH.TPDELIVE > 2`+ 
				sqlOrder + sqlPaginate,
			param: bindValues
		})
			.then(async (result) => {
				await objConn.close();
				return (utils.construirObjetoRetornoBD(result));
			})
			.catch(async (err) => {
				await objConn.closeRollback();
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});
	}

	//-----------------------------------------------------------------------\\

	/**
     * @description Retorna deliveries agrupadas por remetente, destinatário e carga origem, 
	 * concatenando os ID's das deliveries, apenas na etapa "Otimizando"
	 * @author Jean Carlos B. Guimarães Costa
     *
     * @function getDashboardOtimizando            
     * @param   {Object} req    
     * @param   {Object} req.body   
     *
     * @returns {Object} retorno padrão p/ datagrid
     * @throws  {status(500)} Exceção não tratada
     *
     * @author Ítalo Andrade Oliveira
     * @since 12/09/2018
	 * @author Luiz Gustavo Borges Bosco 
     * @since 14/11/2018
     * @description Alteração na forma que volta o campo DH_DTDELIVE
     */
	api.getDashboardOtimizando = async function (req, res, next) {
		/* if (!(req.body["parameter[DH_STETAPA]"] || req.body["parameter[DH_STETAPA][in][]"])) {
			req.body["parameter[DH_STETAPA]"] = { "in": [0, 1] };
		} */
		var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'DH', true);
		return await db.execute({
			sql: `
					SELECT
					DH.IDG043   DH_IDG043,
					DH.CDDELIVE	 DH_CDDELIVE,
					DH.STETAPA	 DH_STETAPA,
					DH.STULTETA	 DH_STULTETA,
					DH.TPDELIVE  DH_TPDELIVE,
					TO_CHAR (DH.DTDELIVE, 'DD/MM/YYYY') DH_DTDELIVE,
					G046.IDG046 G046_IDG046,
					G046.IDG024 G046_IDG024,
					G046.IDG030 G046_IDG030,

					G014.IDG014	G014_IDGO14,
					G014.DSOPERAC G014_DSOPERAC,
					
					SELLER.NMCLIENT SELLER_NMCLIENT,
					SELLER.CJCLIENT SELLER_CJCLIENT,
					SELLER.IECLIENT SELLER_IECLIENT,
					BUYER.NMCLIENT BUYER_NMCLIENT,
					BUYER.CJCLIENT BUYER_CJCLIENT,
					BUYER.IECLIENT BUYER_IECLIENT,
					
							COUNT (*) OVER () AS COUNT_LINHA
						FROM
							G043 DH
						INNER JOIN G005 SELLER ON
							DH.IDG005RE = SELLER.IDG005
						INNER JOIN G005 BUYER ON
							DH.IDG005DE = BUYER.IDG005
						INNER JOIN G014 ON
							DH.IDG014 = G014.IDG014
						LEFT JOIN G049 ON
							G049.IDG043 = DH.IDG043RF
						LEFT JOIN G048 ON
							G048.IDG048 = G049.IDG048
						LEFT JOIN G046 ON
							G046.IDG046 = G048.IDG046
							AND G046.SNDELETE = 0
							AND G046.STCARGA <> 'C'
						WHERE
							DH.STETAPA = 23
							AND DH.SNDELETE = 0	
							AND DH.TPDELIVE IN ('3','4')
						
						ORDER BY
							DH_DTDELIVE DESC` + sqlPaginate,
			param: []
		})
			.then((result) => {
				return (utils.construirObjetoRetornoBD(result));
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});
	}


	//-----------------------------------------------------------------------\\

	/**
	 * @description Insere os dados de contato (data e nome do contato) em A001 - Atendimento
	 * @author Jean Carlos B. Guimarães Costa
	 * @since 20/07/2018
	 *
	 * @async
	 * @function registrarContato
	 * @return {boolean} Retorna o id da row inserida.
	 * @throws {Object} Retorna o erro da execução.
	 */

	api.registrarContato = async function (req, res, next) {

		let colunas = {
			IDA002: 49, // Em DEV, usar 1. Em QAS, usar 49
			IDSOLIDO: req.body.IDSOLIDO,
			NMSOLITE: req.body.NMSOLITE,
			DTREGIST: tmz.retornaData(req.body.DTFIM, 'DD/MM/YYYY HH:mm:ss'),
			DTFIM: tmz.dataAtualJS()
		}

		return await db.insert({
			tabela: 'A001',
			colunas: colunas,
			key: 'A001.IDA001'
		})
			.then(result => {
				return { id: result };
			})
			.catch(err => {
				err.stack = new Error().stack + '\r\n' + err.stack;
				throw err;
			});

	}

	//-----------------------------------------------------------------------\\

	/**
	 * @description Insere os dados de contato (observação) em A003 - Movimentação
	 * @author Jean Carlos B. Guimarães Costa
	 * @since 20/07/2018
	 *
	 * @async
	 * @function registrarObservacoes
	 * @return {boolean} Retorna o resultado.
	 * @throws {Object} Retorna o erro da execução.
	 */

	api.registrarObservacoes = async function (req, res, next) {

		let colunas = {
			IDA001: req.body.idAtendimento,
			DSOBSERV: req.body.DSOBSERV,
			DTMOVIME: tmz.dataAtualJS(),
			IDA006: 4
		}

		return await db.insert({
			tabela: 'A003',
			colunas: colunas,
			key: 'A003.IDA003'
		})
			.then(result => {
				return result;
			})
			.catch(err => {
				err.stack = new Error().stack + '\r\n' + err.stack;
				throw err;
			});
	}

	/**
	 * @description Insere os dados de contato (observação) em A003 - Movimentação
	 * @author Ítalo Andrade Oliveira
	 * @since 09/08/2018
	 *
	 * @async
	 * @function registrarContatoDelivery Cadastra a ligação 
	 * @return {boolean} Retorna o resultado.
	 * @throws {Object} Retorna o erro da execução.
	 */

	api.registrarContatoDelivery = async function (req, res, next) {

		let colunas = {
			IDA001: req.body.idAtendimento,
			IDG043: req.body.IDG043
		}

		let sql = `INSERT INTO A005 (IDA001, IDG043) VALUES (${colunas.IDA001},${colunas.IDG043})`

		return await db.execute({
			sql: sql,
			param: []
		})
			.then(result => {
				return result;
			})
			.catch(err => {
				err.stack = new Error().stack + '\r\n' + err.stack;
				throw err;
			});
	}

	//-----------------------------------------------------------------------\\

	/**
	 * @description Busca as etapas da delivery de acordo com o componente de filtros rápidos.
	 * @author Jean Carlos B. Guimarães Costa
	 * @since 26/07/2018
	 *
	 * @async
	 * @function retQntStDelivery
	 * @return {boolean} Retorna o resultado.
	 * @throws {Object} Retorna o erro da execução.
	 */

	api.retQntStDelivery = async function (req, res, next) {
		const tplObjRet = [
			{
				label: "Transporte",
				indNum: null,
				bgColor: "#ef6c00",
				icon: "fas fa-truck",
				filtParam: "4"
			},
			{
				label: "Encerrado",
				indNum: null,
				bgColor: "#4caf50",
				icon: "fas fa-check",
				filtParam: "5"
			},
			{
				label: "Backlog (devolução)",
				indNum: null,
				bgColor: "#ff5d5d",
				icon: "fas fa-ban",
				filtParam: "20"
			},
			{
				label: "Contato com o cliente",
				indNum: null,
				bgColor: "#607d8b",
				icon: "fas fa-phone",
				filtParam: "22"
			},
			{
				label: "Otimizando",
				indNum: null,
				bgColor: "#1e88e5",
				icon: "fas fa-cogs",
				filtParam: "23"
			},
			{
				label: "Coleta agendada",
				indNum: null,
				bgColor: "#8e24aa",
				icon: "fas fa-calendar-check",
				filtParam: "24"
			}
		]


		var objConn = await this.controller.getConnection();
		try {
			req.body.tableName = "DH";
			req.body.DH_STETAPA = { in: req.body.in };
			delete req.body.in;
			var [sqlWhere, bindValues] = utils.buildWhere(req.body, true);

			return await objConn.execute({
				sql: `SELECT DH.STETAPA, COUNT(*) QTSTATUS
                FROM G043 DH              
                ${sqlWhere ? sqlWhere + "AND TPDELIVE > 2 " : "WHERE TPDELIVE > 2"} 
                GROUP BY DH.STETAPA
                ORDER BY DH.STETAPA ASC`,
				param: bindValues
			}).then((res) => {
				let objRetorn = tplObjRet.map(d => {
					let resultFiltrado = res.filter(data => {
						return d.filtParam == data.STETAPA;
					})[0];

					if (resultFiltrado == null || resultFiltrado == undefined) {
						d.indNum = 0;
					} else {
						d.indNum = resultFiltrado.QTSTATUS;
					}

					return d;
				});

				return objRetorn;
			}).catch((err) => {
				throw err;
			});
			objConn.close();
		} catch (err) {
			objConn.closeRollback();
			throw err;
		}

	}

	/**
 	 * @description Busca as etapas da delivery de acordo com o componente de filtros rápidos.
	 * @author Ítalo Andrade Oliveira
	 * @since 26/07/2018
	 *
	 * @async
	 * @function otimizandoDetails
	 * @param {Array<Integer>} req.body Entra com um array de inteiro, contendo os id's da busca;
	 * @return {Object} Retorna o resultado.
	 * @throws {Object} Retorna o erro da execução.
	 */

	api.otimizandoDetails = async function (req, res, next) {

		var sql = `
				SELECT
					DISTINCT G043.IDG043,
					-- G043.IDS001,
					-- G043.IDG014,
					G043.IDG005RE,
					G043.IDG005DE,
					G043.IDG009PS,
					G043.CDDELIVE,
					G043.TPDELIVE,
					G043.STDELIVE,
					G043.SNINDSEG,
					G043.STETAPA,
					G043.STULTETA,
					G043.SNLIBROT,
					G043.CDPRIORI,
					TO_CHAR( G043.DTDELIVE, 'DD/MM/YYYY hh:mm:ss' ) DTDELIVE,
					TO_CHAR( G043.DTLANCTO, 'DD/MM/YYYY hh:mm:ss' ) DTLANCTO,
					TO_CHAR( G043.DTFINCOL, 'DD/MM/YYYY hh:mm:ss' ) DTFINCOL,
					TO_CHAR( G043.DTENTCON, 'DD/MM/YYYY hh:mm:ss' ) DTENTCON,
					G043.NRNOTA,
					G043.NREMBSEC,
					G043.PSBRUTO,
					G043.PSLIQUID,
					G043.VRVOLUME,
					G043.VRDELIVE,
						--REMETENTE
					REMET.IDG005 AS REMET_IDG005,
					REMET.NMCLIENT AS REMET_NMCLIENT,
					REMET.IDG003 AS REMET_IDG003,
					CITY_REMET.NMCIDADE AS CITY_REMET_NMCIDADE,
					UF_REMET.CDESTADO AS UF_REMET_CDESTADO,
					CASE
						WHEN REMET.NRLATITU IS NULL THEN CITY_REMET.NRLATITU
						ELSE REMET.NRLATITU
					END AS NRLATITURE,
					CASE
						WHEN REMET.NRLONGIT IS NULL THEN CITY_REMET.NRLONGIT
						ELSE REMET.NRLONGIT
					END AS NRLONGITRE,
						--DESTINATÁRIO
					DESTI.IDG005 AS DESTI_IDG005,
					DESTI.NMCLIENT AS DESTI_NMCLIENT,
					DESTI.IDG003 AS DESTI_IDG003,
					CITY_DESTI.NMCIDADE AS CITY_DESTI_NMCIDADE,
					UF_DESTI.CDESTADO AS UF_DESTI_CDESTADO,
					CASE
						WHEN DESTI.NRLATITU IS NULL THEN CITY_DESTI.NRLATITU
						ELSE DESTI.NRLATITU
					END AS NRLATITUDE,
					CASE
						WHEN DESTI.NRLONGIT IS NULL THEN CITY_DESTI.NRLONGIT
						ELSE DESTI.NRLONGIT
					END AS NRLONGITDE,
					G009.DSUNIDAD AS G009_DSUNIDAD,
					G009.CDUNIDAD AS G009_CDUNIDAD,

					G046.IDG030 AS G046_IDG030,
					G046.IDG024 AS G046_IDG024,
						-- TRANSPORTADORA
					G024.IDG024 AS G024_IDG024,
					G024.CJTRANSP AS G024_CJTRANSP,
					G024.IDLOGOS AS G024_IDLOGOS,
					G024.IETRANSP AS G024_IETRANSP,
					G024.NRLATITU AS G024_NRLATITU,
					G024.NRLONGIT AS G024_NRLONGIT,
					G024.NMTRANSP AS G024_NMTRANSP,
					G024.RSTRANSP AS G024_RSTRANSP,
						-- MOTORISTA 1
					G031M1.IDG031 AS G031M1_IDG031,
					G031M1.NMMOTORI AS G031M1_NMMOTORI,
					G031M1.NRMATRIC AS G031M1_NRMATRIC,
						-- MOTORISTA 2
					G031M2.IDG031 AS G031M2_IDG031,
					G031M2.NMMOTORI AS G031M2_NMMOTORI,
					G031M2.NRMATRIC AS G031M2_NRMATRIC,
						-- MOTORISTA 3
					G031M3.IDG031 AS G031M3_IDG031,
					G031M3.NMMOTORI AS G031M3_NMMOTORI,
					G031M3.NRMATRIC AS G031M3_NRMATRIC,
						-- VEÍCULO 1
					G032V1.IDG032 AS G032V1_IDG032,
					G032V1.DSVEICUL AS G032V1_DSVEICUL,
					G032V1.NRCHASSI AS G032V1_NRCHASSI,
					G032V1.NRPLAVEI AS G032V1_NRPLAVEI,
						-- VEÍCULO 2
					G032V2.IDG032 AS G032V2_IDG032,
					G032V2.DSVEICUL AS G032V2_DSVEICUL,
					G032V2.NRCHASSI AS G032V2_NRCHASSI,
					G032V2.NRPLAVEI AS G032V2_NRPLAVEI,
						-- VEÍCULO 3
					G032V3.IDG032 AS G032V3_IDG032,
					G032V3.DSVEICUL AS G032V3_DSVEICUL,
					G032V3.NRCHASSI AS G032V3_NRCHASSI,
					G032V3.NRPLAVEI AS G032V3_NRPLAVEI
					-- DELIVERIES
				FROM
					G043
						-- CLIENTE (REMETENTE)
					LEFT JOIN G005 REMET ON
						REMET.IDG005 = G043.IDG005RE
						-- CLIENTE (DESTINATÁRIO)
					LEFT JOIN G005 DESTI ON
						DESTI.IDG005 = G043.IDG005DE
						-- UNIDADE DE MEDIDA
					LEFT JOIN G009 ON
						G043.IDG009PS = G009.IDG009
						-- CIDADE DO REMETENTE
					LEFT JOIN G003 CITY_REMET ON
						REMET.IDG003 = CITY_REMET.IDG003
						-- CIDADE DO DESTINATÁRIO
					LEFT JOIN G003 CITY_DESTI ON
						DESTI.IDG003 = CITY_DESTI.IDG003
						-- ESTADO DO REMETENTE
					LEFT JOIN G002 UF_REMET ON
						CITY_REMET.IDG002 = UF_REMET.IDG002
						-- ESTADO DO DESTINATÁRIO
					LEFT JOIN G002 UF_DESTI ON
						CITY_DESTI.IDG002 = UF_DESTI.IDG002
						-- DELIVERY X NOTA
					LEFT JOIN G052 G052 ON
						G043.IDG043RF = G052.IDG043
						-- NOTA FISCAL
					LEFT JOIN G051 G051 ON
						G052.IDG051 = G051.IDG051
						-- TRANSPORTADORA
					LEFT JOIN G024 G024 ON
						G051.IDG024 = G024.IDG024
					LEFT JOIN G046 G046 ON
						G051.IDG046 = G046.IDG046
						-- MOTORISTA 1
					LEFT JOIN G031 G031M1 ON
						G046.IDG031M1 = G031M1.IDG031
						-- MOTORISTA 2
					LEFT JOIN G031 G031M2 ON
						G046.IDG031M2 = G031M2.IDG031
						-- MOTORISTA 3
					LEFT JOIN G031 G031M3 ON
						G046.IDG031M3 = G031M3.IDG031
						-- VEÍCULO 1
					LEFT JOIN G032 G032V1 ON
						G046.IDG032V1 = G032V1.IDG032
						-- VEÍCULO 2
					LEFT JOIN G032 G032V2 ON
						G046.IDG032V2 = G032V2.IDG032
						-- VEÍCULO 3
					LEFT JOIN G032 G032V3 ON
						G046.IDG032V3 = G032V3.IDG032
				WHERE
					G043.SNDELETE = 0
					AND G043.IDG043 IN (${req.body.conjuntoId})
				ORDER BY
					G043.IDG043 ASC`

		return await db.execute({
			sql: sql,
			param: []
		}).then((result) => {

			return (result);

		}).catch((err) => {
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		});
	}

	/**
 	 * @description 
	 * @author Jean Carlos B. Guimarães Costa
	 * @since 06/08/2018
	 *
	 * @async
	 * @function buscaTransporte
	 * @param {double} req.body Entra com o valor total do peso das deliveries.
	 * @return {Object} Retorna o caminhão.
	 * @throws {Object} Retorna o erro da execução.
	 */

	api.buscaTransporte = async function (req, res, next) {
		let sql = `
			SELECT
				G030.IDG030,
				G030.DSTIPVEI,
				G030.QTCAPPES,
				G030.QTCAPVOL,
				G030.STCADAST,
				G030.DTCADAST,
				G030.IDS001,
				G030.SNDELETE,
				G030.IDVEIOTI,
				G030.PCPESMIN,
				G030.TPCOMBUS,
				G030.TPCARVEI,
				G030.DSMARCA
			FROM
				G030
			WHERE
				G030.QTCAPPES > ${req.pesoBrutoTotal} AND
				G030.SNDELETE = 0
			ORDER BY
				G030.QTCAPPES ASC FETCH NEXT 1 ROWS ONLY`

		return await db.execute({
			sql: sql,
			param: []
		}).then((result) => {

			return (result);

		}).catch((err) => {
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		});
	}

	//-----------------------------------------------------------------------\\
	
	/*
    * @description Realiza a busca dos dados da delivery
    *
    * @async
    * @function listar
    * @returns {Object} Retorna um objeto contendo todos os dados da delivery  
    *
    * @author Ítalo Andrade Oliveira
    * @since 18/07/2018
    */
    api.listar = async (req, res, next) => {

        let notaDelivery = parseInt(req.body['parameter[NRNOTA]']);
        let idDelive = parseInt(req.body['parameter[IDG043]']);

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

        let sql = `	
                    SELECT
                        G043.IDG043,  
                        G043.IDS001,  
                        G043.IDG014,   
                        G043.IDG005RE,
                        G043.IDG005DE,
                        G043.IDG009PS,
                        G043.CDDELIVE,
                        G043.TPDELIVE,
                        G043.STDELIVE,
                        G043.SNINDSEG,
                        G043.STETAPA,
                        G043.STULTETA,
                        G043.SNLIBROT,
                        G043.CDPRIORI,
                        TO_CHAR(G043.DTDELIVE, 'DD/MM/YYYY hh:mm:ss') DTDELIVE,
                        TO_CHAR(G043.DTLANCTO, 'DD/MM/YYYY hh:mm:ss') DTLANCTO,
                        TO_CHAR(G043.DTFINCOL, 'DD/MM/YYYY hh:mm:ss') DTFINCOL,
                        TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY hh:mm:ss') DTENTCON,
                        G043.NRNOTA,
                        G043.NREMBSEC,
                        G043.PSBRUTO,
                        G043.PSLIQUID,
                        G043.VRVOLUME,
                        G043.VRDELIVE,
                        REMET.IDG005 AS REMET_IDG005,
                        REMET.NMCLIENT AS REMET_NMCLIENT,
                        DESTI.IDG005 AS DESTI_IDG005,
                        DESTI.NMCLIENT AS DESTI_NMCLIENT,
                        G009.DSUNIDAD AS G009_DSUNIDAD,
                        G009.CDUNIDAD AS G009_CDUNIDAD,
                        COUNT(G043.IDG043) OVER () AS COUNT_LINHA 
                            FROM G043 --IDG005RE E IDG005DE
                                INNER JOIN G005 REMET ON
                                    REMET.IDG005 = G043.IDG005RE
                                INNER JOIN G005 DESTI ON
                                    DESTI.IDG005 = G043.IDG005DE 
                                INNER JOIN G009 ON
                                    G043.IDG009PS = G009.IDG009

                                LEFT JOIN (
                                    SELECT IDG043RF, COUNT(*) TT_REF FROM G043 WHERE IDG043RF IS NOT NULL AND SNDELETE = 0 GROUP BY IDG043RF
                                ) DREF 
                                    ON DREF.IDG043RF = G043.IDG043
                                
                                ${sqlWhere}
                                    AND G043.SNDELETE = 0
                                    AND G043.STETAPA = 5
                                    AND G043.TPDELIVE IN('1', '2')
                                    AND DREF.TT_REF IS NULL
                `
            + sqlOrder
            + sqlPaginate;
        return await db.execute({
            sql,
            param: bindValues
        })
            .then((result) => {
                return (utils.construirObjetoRetornoBD(result, null, 4, 4));
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
    }

    //-----------------------------------------------------------------------\\
	/**
	 * @description Altera o status da carga para 22
	 * @author Ítalo Andrade Oliveira
	 * @since 09/08/2018
	 *
	 * @async
	 * @function alterarStatusCarga
	 * @return {boolean} Retorna o resultado.
	 * @throws {Object} Retorna o erro da execução.
	 */

	api.alterarStatusCarga = async function (req, res, next) {

		return await db.update({
			tabela: 'G043',
			colunas: {
				STETAPA: req.body.G043_STETAPA,
				STULTETA:  req.body.G043_STULTETA
			},
			condicoes: `IDG043 IN(${req.body.IDG043})`,
			parametros: {}
		})
			.then(result => {
				return result;
			})
			.catch(err => {
				err.stack = new Error().stack + '\r\n' + err.stack;
				throw err;
			});
	}

	api.confirmaColeta = async function (req, res, next) {

		let objConn = await api.controller.getConnection();

		let dataSaida = new Date(req.body.DTSAICAR);

		let parm = { nmTabela: 'G043', objConn };
		let sqlAux = await fldAdd.tabelaPivot(parm, res, next).catch((err) => { throw err });
		let sqlVerifica = `
							SELECT 
								CAMPOSADD.NRPROTOC
							FROM G043 G043
							LEFT JOIN (${sqlAux}) CAMPOSADD ON
								CAMPOSADD.ID = G043.IDG043
							WHERE G043.IDG043 = ${req.body.IDG043}`;

		await api.controller.setConnection(objConn);

		let verificar = await objConn.execute({
			sql: sqlVerifica,
			param: []
		}).then(async result => {
			await objConn.close();
			return result;
		}).catch(async err => {
			await objConn.closeRollback();
			throw err;
		});
		
		//Vertificando caso a delivery seja de recusa nao sera necessario a insercao de um protocolo e o coleta sera confirmada diretamente

		if (verificar[0].NRPROTOC == null && req.body.DH_TPDELIVE == 3) {
			return { error: "Não foi registrado o número de protocolo" };
		}
		else {
			let resultCarga = await db.execute(
				{
					sql: `SELECT  
							G048.IDG046
						FROM G049
						JOIN G048 G048 ON G049.IDG048 = G048.IDG048
						WHERE G049.IDG043 = `+ req.body.IDG043,
					param: []
				})
				.then((result) => {
					return (result);
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
				});
			
			return await db.update({
				tabela: 'G046',
				colunas: {
					DTSAICAR: dataSaida,
					STCARGA: 'T'
				},
				condicoes: `IDG046 IN(${resultCarga[0].IDG046})`,
				parametros: []
			})
				.then(result => {
					return 'Alterado com sucesso';
				})
				.catch(err => {
					err.stack = new Error().stack + '\r\n' + err.stack;
				throw err;
			});
			
		}

	}

	return api;
}


