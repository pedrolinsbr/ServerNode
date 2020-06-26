/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 29/06/2018
 *
*/

/**
 * @module dao/Conhecimento
 * @description G046, .
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

	var api = {};
	var utils = app.src.utils.FuncoesObjDB;
	var dicionario = app.src.utils.Dicionario;
	var dtatu = app.src.utils.DataAtual;
	var acl = app.src.modIntegrador.controllers.FiltrosController;
	var logger = app.config.logger;
	api.controller = app.config.ControllerBD;

	/**
	 * @description Listar um dados da tabela G046.
	 *
	 * @async
	 * @function api/listar
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	 */



	api.listar = async function (req, res, next) {

		logger.debug("Inicio listar");
		let con = await this.controller.getConnection(null, req.UserId);
		var sqlWhereAux = '';
		try {

			logger.debug("Parametros recebidos:", req.body);

			// FILTRO NF lIBERADAS
			if (req.body['parameter[SNLIB][id]'] && req.body['parameter[SNLIB][id]'] != undefined && req.body['parameter[SNLIB][id]'] != 'undefined' && req.body['parameter[SNLIB][id]'] != null) {
				if (req.body['parameter[SNLIB][id]'] == 1) {
					sqlWhereAux += ` and ((G043.DTBLOQUE is null AND G043.DTDESBLO is null) or (G043.DTBLOQUE is not null AND G043.DTDESBLO is not null)) `;
				} else if (req.body['parameter[SNLIB][id]'] == 2) {
					sqlWhereAux += ` And G043.DTBLOQUE is not null AND G043.DTDESBLO is null `;
				} else {
					sqlWhereAux += '';
				}
				delete req.body['parameter[SNLIB][id]'];
				delete req.body['parameter[SNLIB][text]'];

			}

			//FILTRO DATA ENTREGA CONTRATUAL
			if (req.body['parameter[dtEntCon]'] && req.body['parameter[dtEntCon]'] != false && req.body['parameter[dtEntCon]'] != undefined) {
				sqlWhereAux += `and G043.DTENTCON is not null `;
				delete req.body['parameter[dtEntCon]'];
			} else {
				sqlWhereAux += '';
			}

			//FILTRO DATA ENTREGA
			if (req.body['parameter[dtEntrega]'] && req.body['parameter[dtEntrega]'] != false && req.body['parameter[dtEntrega]'] != undefined) {
				sqlWhereAux += `and G043.DTENTREG is not null `;
				delete req.body['parameter[dtEntrega]'];
			} else {
				sqlWhereAux += '';
			}

			//FILTRO STATUS MONTAGEM CARGA 3PL
			if (req.body['parameter[SNLIBMONT][id]'] && req.body['parameter[SNLIBMONT][id]'] != undefined && req.body['parameter[SNLIBMONT][id]'] != 'undefined' && req.body['parameter[SNLIBMONT][id]'] != null) {
				if (req.body['parameter[SNLIBMONT][id]'] == 1) {//Liberado
					sqlWhereAux += ` and g051.idg046 is null and g051.cdcarga is null and g043.dtentreg is null and  g043.dtentcon is not null and g051.idg051 = g052.idg051 `;
				} else if (req.body['parameter[SNLIBMONT][id]'] == 0) {//não liberado
					sqlWhereAux += ` and ( g051.idg046 is not null or g051.cdcarga is not null or g043.dtentreg is not null or g043.dtentcon is null and g051.idg051 = g052.idg051) `;
				} else {
					sqlWhereAux += '';
				}
				delete req.body['parameter[SNLIBMONT][id]'];
				delete req.body['parameter[SNLIBMONT][text]'];

			}


			//FILTRO CARGA
			if (req.body.IDG046 && req.body.IDG046 != false && req.body.IDG046 != undefined) {
				sqlWhereAux += ` and G048.IDG046 = `+ req.body.IDG046;
			} else {
				sqlWhereAux += '';
			}


			var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G051', true);

			logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

			var user = null;
				if(req.UserId != null){
				user = req.UserId;
				}else if(req.headers.ids001 != null){
				user = req.headers.ids001;
				}else if(req.body.ids001 != null){
				user = req.body.ids001;
			}
			
			var acl1 = '';
			acl1 = await acl.montar({
			ids001: user,
			dsmodulo: 'transportation',
			nmtabela: [{
				G024: 'G024'
			}],
			//dioperad: ' ',
			esoperad: 'And '
			});

			if(typeof acl1 == 'undefined'){
				acl1 = '';
			}

			let result = await con.execute(
				{
					sql: ` 

					SELECT DISTINCT G051.IDG051,
									G051.IDG005RE,
									G051.IDG005DE,
									G051.IDG005RC,
									G051.IDG005EX,
									G051.IDG005CO,
									G051.IDG024,
									G051.NRCHADOC,
									G051.DSMODENF,
									G051.NRSERINF,
									G051.CDCTRC,
									G051.VRTOTFRE,
									G051.VRFRETEP,
									G051.VRFRETEV,
									G051.VRPEDAGI,
									G051.VROUTROS,
									G051.DTEMICTR,
									G051.VRMERCAD,
									G051.VRSECCAT,
									G051.STCTRC,
									G051.VRTOTPRE,
									G051.VROPERAC,
									G051.SNDELETE,
									G051.VRBASECA,
									G051.PCALIICM,
									G051.VRICMS,
									G051.BSISSQN,
									G051.VRISSQN,
									G051.VRISSQST,
									G051.PCALIISS,
									G051.VRDESCON,
									G051.DTLANCTO,
									/*G051.DSINFCPL,*/
									G051.DTCALANT,
									G051.DTCOLETA,
									G051.DTENTPLA,
									G051.DTCALDEP,
									G051.DTAGENDA,
									G051.DTCOMBIN,
									G051.DTROTERI,
									G051.CDCARGA,
									G051.IDG059,
									G051.STLOGOS,
									G051.SNLOTACA,
									G051.CDSATISF,
									G051.IDG024AT,
									G051.SNPRIORI,
									/*G051.IDG046,*/
									G005RE.NMCLIENT AS NMCLIENTRE,
									G005DE.NMCLIENT AS NMCLIENTDE,
									G005RC.NMCLIENT AS NMCLIENTRC,
									G005EX.NMCLIENT AS NMCLIENTEX,
									G005CO.NMCLIENT AS NMCLIENTCO,
									
									CASE
									WHEN G043.DTBLOQUE IS NULL AND G043.DTDESBLO IS NULL THEN
									'1'
									WHEN G043.DTBLOQUE IS NOT NULL AND
										G043.DTDESBLO IS NOT NULL THEN
									'1'
									WHEN G043.DTBLOQUE IS NOT NULL AND G043.DTDESBLO IS NULL THEN
									'0'
									END AS NRLIB,
									G043.DTENTREG,
									
									G043.DTENTMOB,
									
									G043.DTCANHOT,
									C04.CARGA4PL ,
									C01.QTDCARGA,
									C02.NRNOTA,
									C03.SNMOUNT,
									O01.IDRASTRE,
									O02.IDNPS,
									
									
									
									
									
									
									
									
									
									FN_DATA_SLA(G051.IDG051) AS DTSLA,
									
									G051.TPTRANSP,
									G051.STINTCLI,
									
									G024.NMTRANSP || ' [' || G024.IDG024 || '-' || G024.IDLOGOS || ']' AS NMTRANSP,
									G024AT.NMTRANSP || ' [' || G024AT.IDG024 || '-' ||
									G024AT.IDLOGOS || ']' AS NMTRANSPAT,
									COUNT(G051.IDG051) OVER() AS COUNT_LINHA
					FROM G051 G051
					
					LEFT JOIN G052 G052
						ON G052.IDG051 = G051.IDG051
					JOIN G005 G005RE
						ON G005RE.IDG005 = NVL(G051.IDG005RE, G051.IDG005EX)
					JOIN G005 G005DE
						ON G005DE.IDG005 = NVL(G051.IDG005DE, G051.IDG005RC)
					JOIN G005 G005RC
						ON G005RC.IDG005 = NVL(G051.IDG005RC, G051.IDG005DE)
					JOIN G005 G005EX
						ON G005EX.IDG005 = NVL(G051.IDG005EX, G051.IDG005RE)
					JOIN G005 G005CO
						ON G005CO.IDG005 = G051.IDG005CO
					
					JOIN G024 G024
						ON G024.IDG024 = G051.IDG024
					AND G024.IDG023 = 2
					
					LEFT JOIN G043 G043
						ON G043.IDG043 = G052.IDG043
					
					JOIN G024 G024AT
						ON G024AT.IDG024 = NVL(G051.IDG024AT, G051.IDG024)
					AND G024AT.IDG023 = 2
					
					--LEFT JOIN G022 G022 ON G022.IDG005 = G051.IDG005RE                
					LEFT JOIN G049 G049
						ON G049.IDG051 = G051.IDG051
					LEFT JOIN G048 G048
						ON G048.IDG048 = G049.IDG048
					
					CROSS APPLY
					
					(SELECT COUNT(X.IDG046) AS QTDCARGA
						FROM (SELECT DISTINCT G046.IDG046
								FROM G049 G049
								LEFT JOIN G048 G048
								ON (G049.IDG048 = G048.IDG048)
								LEFT JOIN G046 G046
								ON (G048.IDG046 = G046.IDG046)
							WHERE G049.IDG051 = G051.IDG051) X) C01							

					CROSS APPLY (SELECT COUNT(G052.IDG043) AS NRNOTA
									FROM G052
								WHERE G051.IDG051 = G052.IDG051) C02

					CROSS APPLY (SELECT COUNT(G051X.IDG051) AS SNMOUNT
									FROM G051 G051X
									JOIN G052 G052
									ON G052.IDG051 = G051.IDG051
									JOIN G043 G043
									ON G043.IDG043 = G052.IDG043
								WHERE G051X.IDG046 IS NULL
									AND G051X.CDCARGA IS NULL
									AND G043.DTENTREG IS NULL
									AND G043.DTENTCON IS NOT NULL
									AND G051X.IDG051 = G052.IDG051) C03
					CROSS APPLY
	
					(SELECT COUNT(G046.IDG046) AS CARGA4PL
						FROM G046 WHERE G046.IDG046 = G051.IDG046 AND G046.STCARGA <> 'C' AND G046.TPMODCAR = 2) C04

					OUTER APPLY (SELECT X.IDG078 AS IDRASTRE
									FROM (SELECT RASTREIO.IDG078
											FROM G078 RASTREIO
										WHERE RASTREIO.IDG051 = G051.IDG051
											AND RASTREIO.TPSISENV = 'R'
											AND NVL(RASTREIO.SNENVMAN, 0) = 0
											AND NVL(RASTREIO.SNENVIAD, 0) = 1
										ORDER BY RASTREIO.IDG078 DESC) X
								WHERE ROWNUM = 1) O01

					OUTER APPLY (SELECT NPS.IDG078 AS IDNPS
									FROM G078 NPS
								WHERE NPS.IDG051 = G051.IDG051
									AND NPS.TPSISENV = 'N'
									AND NVL(NPS.SNENVIAD, 0) = 1
									AND ROWNUM <= 1) O02
									
						`+

						sqlWhere +
						
						sqlWhereAux +

						acl1
						+`

						GROUP BY G051.IDG051,
						G051.IDG005RE,
						G051.IDG005DE,
						G051.IDG005RC,
						G051.IDG005EX,
						G051.IDG005CO,
						G051.IDG024,
						G051.NRCHADOC,
						G051.DSMODENF,
						G051.NRSERINF,
						G051.CDCTRC,
						G051.VRTOTFRE,
						G051.VRFRETEP,
						G051.VRFRETEV,
						G051.VRPEDAGI,
						G051.VROUTROS,
						G051.DTEMICTR,
						G051.VRMERCAD,
						G051.VRSECCAT,
						G051.STCTRC,
						G051.VRTOTPRE,
						G051.VROPERAC,
						G051.SNDELETE,
						G051.VRBASECA,
						G051.PCALIICM,
						G051.VRICMS,
						G051.BSISSQN,
						G051.VRISSQN,
						G051.VRISSQST,
						G051.PCALIISS,
						G051.VRDESCON,
						G051.DTLANCTO,
						G051.DTCALANT,
						G051.DTCOLETA,
						G051.DTENTPLA,
						G051.DTCALDEP,
						G051.DTAGENDA,
						G051.DTCOMBIN,
						G051.DTROTERI,
						G051.CDCARGA,
						G051.IDG059,
						G051.STLOGOS,
						G051.SNLOTACA,
						G051.CDSATISF,
						G051.IDG024AT,
						G051.SNPRIORI,
						G005RE.NMCLIENT,
						G005DE.NMCLIENT,
						G005RC.NMCLIENT,
						G005EX.NMCLIENT,
						G005CO.NMCLIENT,
						G043.DTBLOQUE,
						G043.DTDESBLO,
						G043.DTENTREG,
						G043.DTENTMOB,
						G043.DTCANHOT,
						G051.TPTRANSP,
						G051.STINTCLI,
						G024.NMTRANSP,
						G024.IDG024,
						G024.IDLOGOS,
						G024AT.NMTRANSP,
						G024AT.IDG024,
						G024AT.IDLOGOS,
						C01.QTDCARGA,
						C02.NRNOTA,
						C03.SNMOUNT,
						O01.IDRASTRE,
						O02.IDNPS
						`+
						sqlOrder +
						sqlPaginate,

					param: bindValues
				})
				.then((result) => {
					logger.debug("Retorno:", result);
					return (utils.construirObjetoRetornoBD(result));
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					logger.error("Erro:", err);
					throw err;
				});

			await con.close();
			logger.debug("Fim listar");
			return result;

		} catch (err) {

			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;

		}

	};

	api.listarCarga = async function (req, res, next) {

		logger.debug("Inicio listar");
		let con = await this.controller.getConnection(null, req.UserId);

		try {

			logger.debug("Parametros recebidos:", req.body);

			var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G051', true);

			logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);


			var user = null;
			if (req.UserId != null) {
				user = req.UserId;
			} else if (req.headers.ids001 != null) {
				user = req.headers.ids001;
			} else if (req.body.ids001 != null) {
				user = req.body.ids001;
			}
			var acl1 = '';
			acl1 = await acl.montar({
				ids001: user,
				dsmodulo: 'transportation',
				nmtabela: [{
					G024: 'G024'
				}],
				//dioperad: ' ',
				esoperad: ' AND '
			});

			if (typeof acl1 == 'undefined') {
				acl1 = '';
			}

			let result = await con.execute(
				{
					sql: ` Select Distinct G051.IDG051		,
					G051.IDG005RE	,
					G051.IDG005DE	,
					G051.IDG005RC	,
					G051.IDG005EX	,
					G051.IDG005CO	,
					G051.IDG024		,
					G051.NRCHADOC	,
					G051.DSMODENF	,
					G051.NRSERINF	,
					G051.CDCTRC		,
					G051.VRTOTFRE	,
					G051.VRFRETEP	,
					G051.VRFRETEV	,
					G051.VRPEDAGI	,
					G051.VROUTROS	,
					G051.DTEMICTR	,
					G051.VRMERCAD	,
					G051.VRSECCAT	,
					G051.STCTRC		,
					G051.VRTOTPRE	,
					G051.VROPERAC	,
					G051.SNDELETE	,
					G051.VRBASECA	,
					G051.PCALIICM	,
					G051.VRICMS		,
					G051.BSISSQN	,
					G051.VRISSQN	,
					G051.VRISSQST	,
					G051.PCALIISS	,
					G051.VRDESCON	,
					G051.DTLANCTO	,
					/*G051.DSINFCPL	,*/
					G051.DTCALANT	,
					G051.DTCOLETA	,
					G051.DTENTPLA	,
					G051.DTCALDEP	,
					G051.DTAGENDA	,
					G051.DTCOMBIN	,
					G051.DTROTERI	,
					G051.CDCARGA	,
					G051.IDG059		,
					G051.STLOGOS	,
					G051.SNLOTACA	,
					G051.CDSATISF	,
					G051.IDG024AT	,
					G051.SNPRIORI	,
					G051.IDG046		,
					G051.NRPESO		,
					/*G043.NRNOTA,*/

					g005RE.NMCLIENT AS NMCLIENTRE,
					g005DE.NMCLIENT AS NMCLIENTDE,
					g005RC.NMCLIENT AS NMCLIENTRC,
					g005EX.NMCLIENT AS NMCLIENTEX,
					g005CO.NMCLIENT AS NMCLIENTCO,

					G051.TPTRANSP, /* Tipo de Operação */	

					g024.NMTRANSP   || ' [' || g024.idg024   || '-' || g024.idlogos   || ']'  as NMTRANSP,
					g024AT.NMTRANSP || ' [' || g024AT.idg024 || '-' || g024AT.idlogos || ']'  as NMTRANSPAT,

					(select min(G043x.DTENTREG) from G043 G043x
						 join G049 G049x On G049x.IDG043 = G043x.IDG043
						where G049x.IDG051 = G051.IDG051) As dtentreg,
						
					(select min(G043x.DTENTMOB) from G043 G043x
						 join G049 G049x On G049x.IDG043 = G043x.IDG043
						where G049x.IDG051 = G051.IDG051) As DTENTMOB,

					(select min(G043x.DTCANHOT) from G043 G043x
					 	 join G049 G049x 
							 On G049x.IDG043 = G043x.IDG043
					  where G049x.IDG051 = G051.IDG051) As DTCANHOT,

					G048.NRSEQETA,
					
					COUNT(g051.IDG051) OVER () as COUNT_LINHA
					From g051 g051   
					Join G052 G052   On G052.idg051   = g051.idg051
					Left Join g005 g005RE On g005RE.IDG005 = g051.IDG005RE
					Left Join g005 g005DE On g005DE.IDG005 = g051.IDG005DE 
					Left Join g005 g005RC On g005RC.IDG005 = g051.IDG005RC 
					Left Join g005 g005EX On g005EX.IDG005 = g051.IDG005EX
					Left Join g005 g005CO On g005CO.IDG005 = g051.IDG005CO
					Join g024 g024   On g024.IDG024   = g051.IDG024 and g024.idg023 = 2
					join g024 g024AT On G024AT.IDG024 = G051.idg024at and g024at.idg023 = 2
					join g049 g049 on g049.idg051 = g051.idg051
					join g048 g048 on g048.idg048 = g049.idg048
					join G046 G046 On G046.IDG046 = G048.IDG046
					Left Join g052 g052 On g052.idg051 = g051.idg051
					Left Join g043 g043 On g043.idg043 = g052.idg043
					
					`+
						sqlWhere + acl1 +
					/*sqlOrder +*/ ` Order by g048.idg048 asc ` +
						sqlPaginate,

					param: bindValues
				})
				.then((result) => {
					logger.debug("Retorno:", result);
					return (utils.construirObjetoRetornoBD(result));
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					logger.error("Erro:", err);
					throw err;
				});

			await con.close();
			logger.debug("Fim listar");
			return result;

		} catch (err) {

			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;

		}

	};


	/**
	 * @description Listar um dados da tabela G046.
	 *
	 * @async
	 * @function api/listarNfe
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	 */


	api.listarNfe = async function (req, res, next) {

		logger.debug("Inicio listarNfe");
		let con = await this.controller.getConnection(null, req.UserId);

		try {

			logger.debug("Parametros recebidos:", req.body);

			var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', false);
			var conhecimentos = req.body['arIds'];
			if (typeof conhecimentos != "string") {
				conhecimentos = conhecimentos.join(",");
			}
			logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
			let result = null;


			result = await con.execute(
				{
					sql: `select G043.IDG043	,
					G043.CDDELIVE,
					G043.SNLIBROT,
					G043.DTLANCTO,
					G043.IDS001	,
					G043.DTDELIVE,
					G043.TPDELIVE,
					G043.STDELIVE,
					G043.NRNOTA	,
					G043.NRSERINF,
					G043.DTEMINOT,
					G043.NRCHADOC,
					G043.DSMODENF,
					G043.SNDELETE,
					G043.IDG005RE,
					G043.IDG005DE,
					G043.DTFINCOL,
					G043.CDPRIORI,
					G043.TPTRANSP,
					G043.CDFILIAL,
					G043.PSBRUTO	,
					G043.PSLIQUID,
					G043.NRDIVISA,
					G043.STETAPA	,
					G043.VRDELIVE,
					G043.NREMBSEC,
					G043.SNINDSEG,
					G043.VRALTURA,
					G043.VRLARGUR,
					G043.VRCOMPRI,
					G043.CJDESTIN,
					G043.IEDESTIN,
					G043.IMDESTIN,
					G043.IDG014	,
					G043.CDCLIEXT,
					G043.VRVOLUME,
					G043.IDG009PS,
					G043.DTENTREG,
					G043.STULTETA,
					G043.DTENTCON,
					G043.TXINSTRU,
					G043.TXCANHOT,
					G043.IDG005TO,
					G043.IDG024TR,
					/*G043.DSINFCPL,*/
					G043.SNOTIMAN,
					G043.SNAG	,
					G043.DTBLOQUE,
					G043.DTDESBLO,
					G043.STLOGOS,
					G043.CDRASTRE,
					I015.DSOCORRE
					From G043 G043
					Left Join I015 I015 On I015.IDI015 = G043.IDI015
					Where g052.idg051 in (${conhecimentos})
					/*and g046.STCARGA in ('T') */`+
						/* sqlWhere +*/
						sqlOrder +
						sqlPaginate,
					param: {}
				})
				.then((result) => {
					logger.debug("Retorno:", result);
					return (utils.construirObjetoRetornoBD(result));
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					logger.error("Erro:", err);
					throw err;
				});


			await con.close();
			logger.debug("Fim listarNfe");
			return result;

		} catch (err) {

			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;

		}

	};


	/**
	 * @description Atualizar um dado na tabela G067, .
	 *
	 * @async
	 * @function api/atribuirDataEntrega
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	 */
	api.atribuirDataEntrega = async function (req, res, next) {

		logger.debug("Inicio atribuirDataEntrega");
		let con = await this.controller.getConnection(null, req.UserId);
		try {

			var id = req.body.IDG043.join(',');
			var idConhecimentos = req.body.IDG051.join(',');
			var date = req.body.DTENTREG.date;
			logger.debug("Parametros recebidos:", req.body);

			let result = await
				con.update({
					tabela: 'G043',
					colunas: {

						DTENTREG: new Date(date.year, date.month - 1, date.day),
						IDI015: req.body.IDI015.id,
						STETAPA: 5
					},
					condicoes: `IdG043 in (${id})`,
					parametros: {}
				})
					.then((result1) => {
						logger.debug("Retorno:", result1);
						return { response: req.__('tp.sucesso.update') };
					})
					.catch((err) => {
						err.stack = new Error().stack + `\r\n` + err.stack;
						logger.error("Erro:", err);
						throw err;
					});

			let resultConhecimentos = await
				con.update({
					tabela: 'G051',
					colunas: {
						STINTCLI: 3
					},
					condicoes: `IdG051 in (${idConhecimentos})`,
					parametros: {}
				})
					.then((result2) => {
						logger.debug("Retorno:", result2);
						return { response: req.__('tp.sucesso.update') };
					})
					.catch((err) => {
						err.stack = new Error().stack + `\r\n` + err.stack;
						logger.error("Erro:", err);
						throw err;
					});

			await con.close();
			logger.debug("Fim atribuirDataEntrega");
			return result;

		} catch (err) {

			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;

		}

	};




	/**
	 * @description Atualizar um dado na tabela G067, .
	 *
	 * @async
	 * @function api/atribuirDataEntrega
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	 */
	api.alteracaoDataPrevisaoEntrega = async function (req, res, next) {

		logger.debug("Inicio alteracaoDataPrevisaoEntrega");
		let con = await this.controller.getConnection(null, req.UserId);
		try {

			var id = req.body.IDG051.join(',');
			var date = req.body.DTENTPLA.date;
			//logger.debug("Parametros recebidos:", req.body);

			let result = await
				con.update({
					tabela: 'G051',
					colunas: {

						DTENTPLA: new Date(date.year, date.month - 1, date.day),
						IDI015: req.body.IDI015.id,
						STINTCLI: 1
					},
					condicoes: `IdG051 in (${id})`,
					parametros: {}
				})
					.then((result1) => {
						logger.debug("Retorno:", result1);
						return { response: req.__('tp.sucesso.update') };
					})
					.catch((err) => {
						err.stack = new Error().stack + `\r\n` + err.stack;
						logger.error("Erro:", err);
						throw err;
					});

			await con.close();
			logger.debug("Fim alteracaoDataPrevisaoEntrega");
			return result;

		} catch (err) {

			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;

		}

	};





	/**
	 * @description Listar um dados da tabela G046.
	 *
	 * @async
	 * @function api/listarLiberaConhecimentos
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	 */



	api.listarLiberaConhecimentos = async function (req, res, next) {

		logger.debug("Inicio listar");
		let con = await this.controller.getConnection(null, req.UserId);

		try {

			logger.debug("Parametros recebidos:", req.body);

			var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G051', true);

			logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

			let result = await con.execute(
				{
					sql: ` Select Distinct G051.IDG051		,
					G051.IDG005RE	,
					G051.IDG005DE	,
					G051.IDG005RC	,
					G051.IDG005EX	,
					G051.IDG005CO	,
					G051.IDG024		,
					G051.NRCHADOC	,
					G051.DSMODENF	,
					G051.NRSERINF	,
					G051.CDCTRC		,
					G051.VRTOTFRE	,
					G051.VRFRETEP	,
					G051.VRFRETEV	,
					G051.VRPEDAGI	,
					G051.VROUTROS	,
					G051.DTEMICTR	,
					G051.VRMERCAD	,
					G051.VRSECCAT	,
					G051.STCTRC		,
					G051.VRTOTPRE	,
					G051.VROPERAC	,
					G051.SNDELETE	,
					G051.VRBASECA	,
					G051.PCALIICM	,
					G051.VRICMS		,
					G051.BSISSQN	,
					G051.VRISSQN	,
					G051.VRISSQST	,
					G051.PCALIISS	,
					G051.VRDESCON	,
					G051.DTLANCTO	,
					G051.DSINFCPL	,
					G051.DTCALANT	,
					G051.DTCOLETA	,
					G051.DTENTPLA	,
					G051.DTCALDEP	,
					G051.DTAGENDA	,
					G051.DTCOMBIN	,
					G051.DTROTERI	,
					G051.TPTRANSP	,
					G051.CDCARGA	,
					G051.IDG046		,
					G051.IDG059		,
					G051.STLOGOS	,
					G051.SNLOTACA	,
					G051.CDSATISF	,
					G051.IDG024AT	,
					G051.SNPRIORI	,
					G051.NRPESO	,

					g005RE.NMCLIENT AS NMCLIENTRE,
					g005DE.NMCLIENT AS NMCLIENTDE,
					g005RC.NMCLIENT AS NMCLIENTRC,
					g005EX.NMCLIENT AS NMCLIENTEX,
					g005CO.NMCLIENT AS NMCLIENTCO,

					g024.NMTRANSP   || ' [' || g024.idg024   || '-' || g024.idlogos   || ']'  as NMTRANSP,

					g024AT.NMTRANSP || ' [' || g024AT.idg024 || '-' || g024AT.idlogos || ']'  as NMTRANSPAT,

					COUNT(g051.IDG051) OVER () as COUNT_LINHA
					From g051 g051   
					Join G052 G052   On G052.idg051   = g051.idg051
					Join g043 g043   on G052.idg043   = g043.idg043 
					 And g043.dtentreg Is Null 
					Join g005 g005RE On g005RE.IDG005 = g051.IDG005RE
					Join g005 g005DE On g005DE.IDG005 = g051.IDG005DE 
					Left Join g005 g005RC On g005RC.IDG005 = g051.IDG005RC 
					Join g005 g005EX On g005EX.IDG005 = g051.IDG005EX
					Join g005 g005CO On g005CO.IDG005 = g051.IDG005CO
					Join g024 g024   On g024.IDG024   = g051.IDG024
					Join g024 g024AT On g024AT.IDG024 = g051.IDG024AT
					`+
						sqlWhere + ` /*And g051.idg046 Is Null*/
					/*And g051.cdcarga Is Not Null */
					And g051.stctrc = 'A' 
					/*and (g051.cdcarga Is Not Null or g051.idg046 Is Not Null)*/
					
					` +
						sqlOrder +
						sqlPaginate,

					param: bindValues
				})
				.then((result) => {
					logger.debug("Retorno:", result);
					return (utils.construirObjetoRetornoBD(result));
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					logger.error("Erro:", err);
					throw err;
				});

			await con.close();
			logger.debug("Fim listar");
			return result;

		} catch (err) {

			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;

		}

	};




	/**
	 * @description Atualizar um dado na tabela G067, .
	 *
	 * @async
	 * @function api/liberarConhecimento
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	 */
	api.liberarConhecimento = async function (req, res, next) {

		logger.debug("Inicio liberarConhecimento");
		let con = await this.controller.getConnection(null, req.UserId);
		try {

			var id = req.body.IDG051.substr(0, req.body.IDG051.length - 1);
			logger.debug("Parametros recebidos:", req.body);

			let result = await
				con.update({
					tabela: 'G051',
					colunas: {

						CDCARGA: null,
						IDG046: null,
						IDG024AT: req.body.IDG024.id
					},
					condicoes: `IdG051 in (${id})`,
					parametros: {}
				})
					.then((result1) => {
						logger.debug("Retorno:", result1);
						return { response: req.__('tp.sucesso.update') };
					})
					.catch((err) => {
						err.stack = new Error().stack + `\r\n` + err.stack;
						logger.error("Erro:", err);
						throw err;
					});

			await con.close();
			logger.debug("Fim liberarConhecimento");
			return result;

		} catch (err) {

			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;

		}

	};

	//   listarInfConhecimento

	api.listarInfConhecimento = async function (req, res, next) {

		logger.debug("Inicio listar");
		let con = await this.controller.getConnection(null, req.UserId);

		try {

			logger.debug("Parametros recebidos:", req.body);



			let result = await con.execute(
				{
					sql: ` 

				select x.*,
       
				(select g031.NMMOTORI || ' [' || g031.IDG031 || '-' || g031.NRMATRIC || ']'
					 from g031 g031
					 join g046 g046
						 on G046.idg031m1 = G031.idg031
						AND g046.idg046 = x.idg046) as NMMOTORI,
				(select g032.DSVEICUL || ' [' || g032.idg032 || '-' || g032.NRFROTA || ']'
					 from g032 g032
					 join g046 g046
						 on G046.idg032v1 = G032.idg032
						AND g046.idg046 = x.idg046) as DSVEICUL
 
	 from (Select Distinct G051.IDG051,
												 /*G051.IDG005RE,*/
												 /*G051.IDG005DE,*/
												 /*G051.IDG005RC,*/
												 /*G051.IDG005EX,*/
												 /*G051.IDG005CO,*/
												 G051.IDG024,
												 G051.NRCHADOC,
												 G051.DSMODENF,
												 G051.NRSERINF,
												 G051.CDCTRC,
												 G051.VRTOTFRE,
												 G051.VRFRETEP,
												 G051.VRFRETEV,
												 G051.VRPEDAGI,
												 G051.VROUTROS,
												 G051.DTEMICTR,
												 G051.VRMERCAD,
												 G051.VRSECCAT,
												 G051.STCTRC,
												 G051.VRTOTPRE,
												 G051.VROPERAC,
												 G051.SNDELETE,
												 G051.VRBASECA,
												 G051.PCALIICM,
												 G051.VRICMS,
												 G051.BSISSQN,
												 G051.VRISSQN,
												 G051.VRISSQST,
												 G051.PCALIISS,
												 G051.VRDESCON,
												 G051.DTLANCTO,
												 G051.DSINFCPL,
												 G051.DTCALANT,
												 G051.DTCOLETA,
												 G051.DTENTPLA,
												 G051.DTCALDEP,
												 G051.DTAGENDA,
												 G051.DTCOMBIN,
												 G051.DTROTERI,
												 G051.TPTRANSP,
												 G051.CDCARGA,
												 G051.IDG059,
												 G051.STLOGOS,
												 G051.SNLOTACA,
												 G051.CDSATISF,
												 G051.IDG024AT,
												 G051.SNPRIORI,
												 G051.NRPESO,
												 
												 g005RE.NMCLIENT AS NMCLIENTRE,
												 g005DE.NMCLIENT AS NMCLIENTDE,
												 g005RC.NMCLIENT AS NMCLIENTRC,
												 g005EX.NMCLIENT AS NMCLIENTEX,
												 g005CO.NMCLIENT AS NMCLIENTCO,

												 g005RE.IDG005 AS IDG005RE,
												 g005DE.IDG005 AS IDG005DE,
												 g005RC.IDG005 AS IDG005RC,
												 g005EX.IDG005 AS IDG005EX,
												 g005CO.IDG005 AS IDG005CO,

												 
												 g024.NMTRANSP || ' [' || g024.idg024 || '-' ||
												 g024.idlogos || ']' as NMTRANSP,
												 
												 g024AT.NMTRANSP || ' [' || g024AT.idg024 || '-' ||
												 g024AT.idlogos || ']' as NMTRANSPAT,
												 
												 (select max(G046.idg046) AS idg046
														from G049 G049
														Left Join G048 G048
															On (G049.IDG048 = G048.IDG048)
														Left Join G046 G046
															On (G048.IDG046 = G046.IDG046)
														 AND G046.STCARGA <> 'C'
													 where G049.IDG051 = g051.IDG051) as IDG046,

												(select min(G043x.DTENTREG) from G043 G043x
													 join G049 G049x 
													   On G049x.IDG043 = G043x.IDG043
												  where G049x.IDG051 = G051.IDG051) As dtentreg,

												(select min(G043x.DTENTMOB) from G043 G043x
													 join G049 G049x 
													   On G049x.IDG043 = G043x.IDG043
													where G049x.IDG051 = G051.IDG051) As DTENTMOB,
													
													(select min(G043x.DTCANHOT) from G043 G043x
													join G049 G049x 
														On G049x.IDG043 = G043x.IDG043
												 where G049x.IDG051 = G051.IDG051) As DTCANHOT,
												 
												 g005RE.dsendere as dsendereRE,
												 g005RE.biendere as biendereRE,
												 g005RE.nrlatitu as nrlatituRE,
												 g005RE.nrlongit as nrlongitRE,
												 g005RE.CJCLIENT as CJCLIENTRE,
												 g002RE.nmestado as nmestadoRE,
												 g005RE.cpendere as cpendereRE,
												 g003RE.nmcidade as nmcidadeRE,
												 g003RE.cdmunici as cdmuniciRE,
												 g005RE.ieclient as ieclientRE,
												 
												 g005DE.dsendere as dsendereDE,
												 g005DE.biendere as biendereDE,
												 g005DE.nrlatitu as nrlatituDE,
												 g005DE.nrlongit as nrlongitDE,
												 g005DE.CJCLIENT as CJCLIENTDE,
												 g002DE.nmestado as nmestadoDE,
												 g005DE.cpendere as cpendereDE,
												 g003DE.nmcidade as nmcidadeDE,
												 g003DE.cdmunici as cdmuniciDE,
												 g005DE.ieclient as ieclientDE,
												 
												 g005RC.dsendere as dsendereRC,
												 g005RC.biendere as biendereRC,
												 g005RC.nrlatitu as nrlatituRC,
												 g005RC.nrlongit as nrlongitRC,
												 g005RC.CJCLIENT as CJCLIENTRC,
												 g002RC.nmestado as nmestadoRC,
												 g005RC.cpendere as cpendereRC,
												 g003RC.nmcidade as nmcidadeRC,
												 g003RC.cdmunici as cdmuniciRC,
												 g005RC.ieclient as ieclientRC,
												 
												 g005EX.dsendere as dsendereEX,
												 g005EX.biendere as biendereEX,
												 g005EX.nrlatitu as nrlatituEX,
												 g005EX.nrlongit as nrlongitEX,
												 g005EX.CJCLIENT as CJCLIENTEX,
												 g002EX.nmestado as nmestadoEX,
												 g005EX.cpendere as cpendereEX,
												 g003EX.nmcidade as nmcidadeEX,
												 g003EX.cdmunici as cdmuniciEX,
												 g005EX.ieclient as ieclientEX,
												 
												 g005CO.dsendere as dsendereCO,
												 g005CO.biendere as biendereCO,
												 g005CO.nrlatitu as nrlatituCO,
												 g005CO.nrlongit as nrlongitCO,
												 g005CO.CJCLIENT as CJCLIENTCO,
												 g002CO.nmestado as nmestadoCO,
												 g005CO.cpendere as cpendereCO,
												 g003CO.nmcidade as nmcidadeCO,
												 g003CO.cdmunici as cdmuniciCO,
												 g005CO.ieclient as ieclientCO,
												 
												 COUNT(g051.IDG051) OVER() as COUNT_LINHA
					 From g051 g051
					 left Join G052 G052
						 On G052.idg051 = g051.idg051
					 Join g005 g005RE
						 On g005RE.IDG005 = nvl(g051.IDG005RE, g051.IDG005EX)
					 Join g005 g005DE
						 On g005DE.IDG005 = nvl(g051.IDG005DE,g051.IDG005RC)
					 Join g005 g005RC
						 On g005RC.IDG005 = nvl(g051.IDG005RC, g051.IDG005DE)
					 Join g005 g005EX
						 On g005EX.IDG005 = nvl(g051.IDG005EX,g051.IDG005RE)
					 Join g005 g005CO
						 On g005CO.IDG005 = g051.IDG005CO
				 
					 Join g003 g003RE
						 On g003RE.IDG003 = g005RE.idg003
					 Join g003 g003DE
						 On g003DE.IDG003 = g005DE.idg003
					 Join g003 g003RC
						 On g003RC.IDG003 = g005RC.idg003
					 Join g003 g003EX
						 On g003EX.IDG003 = g005EX.idg003
					 Join g003 g003CO
						 On g003CO.IDG003 = g005CO.idg003
				 
					 Join g002 g002RE
						 On g002RE.IDG002 = g003RE.idg002
					 Join g002 g002DE
						 On g002DE.IDG002 = g003DE.idg002
					 Join g002 g002RC
						 On g002RC.IDG002 = g003RC.idg002
					 Join g002 g002EX
						 On g002EX.IDG002 = g003EX.idg002
					 Join g002 g002CO
						 On g002CO.IDG002 = g003CO.idg002
				 
					 Join g024 g024
						 On g024.IDG024 = g051.IDG024
					 Join g024 g024AT
						 On g024AT.IDG024 = nvl(g051.IDG024AT, g051.IDG024)
				 
					where g051.idg051 = ${ req.body.IDG051}) x
 
				`,

					param: {}
				})
				.then((result) => {
					logger.debug("Retorno:", result);
					return (utils.construirObjetoRetornoBD(result));
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					logger.error("Erro:", err);
					throw err;
				});

			await con.close();
			logger.debug("Fim listar");
			return result;

		} catch (err) {

			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;

		}

	};

	api.listarInfProdutos = async function (req, res, next) {

		logger.debug("Inicio listar");
		let con = await this.controller.getConnection(null, req.UserId);

		try {

			logger.debug("Parametros recebidos:", req.body);

			let IDG083 = req.body.IDG083;

			let result = await con.execute(
				{
					sql: `
				select 
					G004.IDG004,
					G004.IDG083,
					g004.vrunipro,
					G004.NRORDITE,
					
					g004.PSBRUTO,
					
					g004.VRVOLUME,
					g004.DSINFAD,
					g004.dsprodut,
					g004.DSREFFAB,
					g004.NRONU,
					g004.CDLOCVEN,
					g004.qtprodut,

					
					

					--g010.IDG015,
					--g010.CDNCM,
					--g010.SNINFLAM,
					--g010.TPORIPRO,
					--g010.DTCADAST,
					--g010.IDG014,
					--g010.IDG038,
					--g010.STENVOTI,
					--g010.IDG037,
                    
					--nvl(g010.dsprodut, g045.dsprodut) as dsprodut,
					--nvl(g010.DSREFFAB, g045.DSREFFAB) as DSREFFAB,
					--nvl(g015.NRONU,g045.NRONU) as NRONU,
					g009PS.CDUNIDAD as IDG009PS,
					g009UM.CDUNIDAD as IDG009UM

					from g004 g004

					--inner join g052 g052 on g052.idg051 = g051.idg051
					--inner join g043 g043 on g043.idg043 = g052.idg043
					--inner join g045 g045 On g045.idg043 = g043.idg043
                    left join g009 g009UM on g004.idg009UM = g009UM.idg009
                    left join g009 g009PS on g004.idg009PS = g009PS.idg009
					--left  join g010 g010 On g010.IDG010 = g045.IDG010 and G010.IDG010<>0 and g010.sndelete = 0
					--left  join g015 g015 on g015.idg015 = g010.idg015
					where G004.idg083 = ${IDG083} and g004.sndelete = 0
				`,

					param: {}
				})
				.then((result) => {
					logger.debug("Retorno:", result);
					return (utils.construirObjetoRetornoBD(result));
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					logger.error("Erro:", err);
					throw err;
				});

			await con.close();
			logger.debug("Fim listar");
			return result;

		} catch (err) {

			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;

		}

	};

	api.listarInfNotas = async function (req, res, next) {

		logger.debug("Inicio listar");
		let con = await this.controller.getConnection(null, req.UserId);

		try {

			logger.debug("Parametros recebidos:", req.body);

			let IDG051 = req.body.IDG051;

			let result = await con.execute(
				{
					sql: `
				select g083.*, COUNT(g083.IDg083) OVER() as COUNT_LINHA
				 from g051 g051
				join g052 g052 on g052.idg051 = g051.idg051
				join g083 g083 on g083.idg083 = g052.idg083
				 where G051.idg051 = ${IDG051}
				`,

					param: {}
				})
				.then((result) => {
					logger.debug("Retorno:", result);
					return (utils.construirObjetoRetornoBD(result));
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					logger.error("Erro:", err);
					throw err;
				});

			await con.close();
			logger.debug("Fim listar");
			return result;

		} catch (err) {

			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;

		}

	};

	api.listarInfMovimento = async function (req, res, next) {

		logger.debug("Inicio listar");
		let con = await this.controller.getConnection(null, req.UserId);

		try {

			logger.debug("Parametros recebidos:", req.body);

			let IDG051 = req.body.IDG051;

			let result = await con.execute(
				{
					sql: `   
				select distinct G046.idg046,  
												g046.stcarga, to_char(g046.dtcarga, 'DD/MM/YYYY HH24:MI') AS dtcarga, 
												g046.dscarga,  
												g046.idcarlog,  
												G024.nmtransp || ' [' || g024.idg024 || '-' || g024.idlogos || ']' as nmtransp, 
												g024.idlogos, 
												g051.idg051,
												COUNT(g051.idg051) OVER() as COUNT_LINHA
				from G051 G051
				join G046 G046 on G046.idG046 = G051.idG046
				join G048 G048 on G048.idg046 = G046.idg046
				join G049 G049 on G049.idg048 = G048.idg048 
				join G024 G024 on G024.idG024 = G046.idg024 
				where g051.idg051 = ${IDG051}
				`,

					param: {}
				})
				.then((result) => {
					logger.debug("Retorno:", result);
					return (utils.construirObjetoRetornoBD(result));
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					logger.error("Erro:", err);
					throw err;
				});

			await con.close();
			logger.debug("Fim listar");
			return result;

		} catch (err) {

			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;

		}

	};








	return api;
};
