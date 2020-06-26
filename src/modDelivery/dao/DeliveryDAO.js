/**
 * @file Consultas SQL
 * @module modDelivery/dao/DeliveryDAO
 *
 * @requires module:config/database
 * @requires module:util/DataAtual
 * @requires module:config/ControllerBD
*/
module.exports = function (app, cb) {

	const gdao   = app.src.modGlobal.dao.GenericDAO;
	const fldAdd = app.src.modGlobal.controllers.XFieldAddController;
	var utils    = app.src.utils.FuncoesObjDB;
	var utilsCurl= app.src.utils.Utils;
	var api      = {};

	api.controller = app.config.ControllerBD;

	//-----------------------------------------------------------------------\\
	/**
		* @description Lista as deliveries com ocorrência - Tabelas I010 e I009
		*
		* @async
		* @function listarOcorrenciasGrid
		* @returns {Array} Retorna um array com o resultado da pesquisa
		*
		* @author Rafael Delfino Calzado
		* @since 20/04/2018
	*/
	//-----------------------------------------------------------------------\\	

	api.listarOcorrenciasGrid = async function (req, res, next) {

		try {

			if (req.body['parameter[G043_STETAPA][id]'] == -1) {
				delete req.body['parameter[G043_STETAPA][id]'];
				delete req.body['parameter[G043_STETAPA][in]'];
				delete req.body['parameter[G043_STETAPA][text]'];

				req.body['parameter[G043_STETAPA]'] = { null: true };
			}

			if (req.body['parameter[G043_STETAPA][id]']) {
				delete req.body['parameter[G043_STETAPA][id]'];
			}

			var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'I010', true);

			var sql =
				`SELECT
						I010.IDI010
					,	I010.IDI009
					,	I010.CDDELIVE
					,	I010.NMCAMPO
					,	NVL(I010.DSSHIPOI, '-') DSSHIPOI
					,	I010.OBOCORRE
					,	I009.DSOCORRE

					,	CASE 

							WHEN G043.STETAPA IN (0,20) THEN 'BACKLOG'
							WHEN G043.STETAPA IN (1,21) THEN 'OTIMIZANDO'
							WHEN G043.STETAPA IN (2,22) THEN 'OFERECIMENTO'
							WHEN G043.STETAPA IN (3,23) THEN 'AGENDAMENTO'
							WHEN G043.STETAPA IN (4,24) THEN 'TRANSPORTE'
							WHEN G043.STETAPA IN (5,25) THEN 'ENCERRADO'
							WHEN G043.STETAPA = 6 THEN 'OCORRÊNCIA'
							WHEN G043.STETAPA = 7 THEN 'A CANCELAR'
							WHEN G043.STETAPA = 8 THEN 'CANCELADA'
							WHEN G043.STETAPA IS NULL THEN 'NÃO IMPORTADA'
							ELSE 'OUTRO'

						END DSETAPA

					,	G043.STETAPA  G043_STETAPA
					, 	G043.TPDELIVE G043_TPDELIVE
					,	TO_CHAR(I010.DTCADAST, 'DD/MM/YYYY HH24:MI:SS') DTCADAST
					,   COUNT(I010.IDI010) OVER() AS COUNT_LINHA

				FROM I010 -- OCORRÊNCIAS

				INNER JOIN I009 -- TIPOS DE OCORRÊNCIAS
					ON I009.IDI009 = I010.IDI009
					AND I010.CDDELIVE IS NOT NULL

				LEFT JOIN G043 -- DELIVERY
					ON I010.CDDELIVE = G043.CDDELIVE

				${sqlWhere} ${sqlOrder} ${sqlPaginate}`;

			var parm = { sql, bindValues };

			var rs = await gdao.executar(parm, res, next);

			return utils.construirObjetoRetornoBD(rs);

		} catch (err) {

			throw err;

		}

	};

	//-----------------------------------------------------------------------\\

	api.cancelarOcorrencia = async function (req, res, next) {

		var parm = { UserId: req.UserId };
		var idOcorrencia = req.body.idOcorrencia;

		parm.sql = `UPDATE 
							I010 SET SNDELETE = 1	 
							WHERE IDI010 IN (${idOcorrencia})`;

		return await gdao.executar(parm, res, next).catch((err) => { throw err });
	}

	//-----------------------------------------------------------------------\\
	/**
		* @description Listar Entregas
		*
		* @async
		* @function listarEntrega
		* @param {Object} req
		* @param {Object} req.params
		* @param {number} req.params.id ID da delivery
		* @returns {Array} Retorna um array com o resultado da pesquisa
		*
		* @author Rafael Delfino Calzado
		* @since 20/04/2018
	*/
	api.listarEntrega = async function (req, res, next) {

		req.sql =
			`SELECT
					CARGA.IDG046				IDCARGA
				,	CARGA.SNCARPAR				SNPARCIAL
				,	CARGA.VRPOROCU				VROCUPA
				,	CARGA.PSCARGA       		PSCARGA
				,	TO_CHAR(CARGA.DTAGENDA, 'DD/MM/YYYY HH24:MI') 	DTAGENDA
				,	TO_CHAR(CARGA.DTSAICAR, 'DD/MM/YYYY HH24:MI') 	DTSAICAR
				,	TO_CHAR(CARGA.DTPRESAI, 'DD/MM/YYYY HH24:MI')   DTCOLETA

				,	TRANS.NMTRANSP		  	NMTRANSP

				,	VEICULO.IDTIPVEI	  	IDVEICULO

				,	HORACERTA.NRPLAVEI		NRPLACA

				,	PARADA.IDG048       	IDPARADA
				,	PARADA.NRSEQETA     	NRSEQ
				,	PARADA.QTVOLCAR		  	VRVOLUME
				,	PARADA.QTDISPER		  	QTDISTAN
				, 	TO_CHAR(NVL(CTE.DTENTPLA, DH.DTENTCON), 'DD/MM/YYYY HH24:MI')  DTPLAN

				,	REM.NMCLIENT			NMREMETE
				,	DEST.NMCLIENT			NMDEST

				,	DH.CDDELIVE				CDDELIVE
				,	TO_CHAR(DH.DTENTREG, 'DD/MM/YYYY HH24:MI') 	DTENTREGDEL

			FROM G046 CARGA

			INNER JOIN G024 TRANS
				ON TRANS.IDG024 = CARGA.IDG024
				AND TRANS.SNDELETE = 0

			LEFT JOIN H006 HORACERTA
				ON HORACERTA.IDG046 = CARGA.IDG046
				AND HORACERTA.SNDELETE = 0

			LEFT JOIN H007 HORARIO
				ON HORARIO.IDH006 = HORACERTA.IDH006
				AND HORARIO.SNDELETE = 0

			LEFT JOIN I011 VEICULO
				ON VEICULO.IDG030 = HORACERTA.IDG030
				AND VEICULO.SNDELETE = 0

			INNER JOIN G048 PARADA
				ON PARADA.IDG046 = CARGA.IDG046

			INNER JOIN G005 REM
				ON REM.IDG005 = PARADA.IDG005OR
				AND REM.SNDELETE = 0

			INNER JOIN G005 DEST
				ON DEST.IDG005 = PARADA.IDG005DE
				AND REM.SNDELETE = 0

			INNER JOIN G049 RELDELIVE
				ON RELDELIVE.IDG048 = PARADA.IDG048

			INNER JOIN G043 DH
				ON DH.IDG043 = RELDELIVE.IDG043
				AND DH.SNDELETE = 0

			LEFT JOIN G052 DELIVERYCTE
				ON DELIVERYCTE.IDG043 = DH.IDG043

			LEFT JOIN G051 CTE
			    ON CTE.IDG051 = DELIVERYCTE.IDG051
				AND CTE.SNDELETE = 0
				AND CTE.STCTRC = 'A'

			WHERE
				CARGA.STCARGA <> 'C' AND
				CARGA.TPMODCAR <> 1 AND 
				CARGA.SNDELETE = 0 AND
				DH.IDG043 = ${req.params.id}`;

		return await gdao.executar(req, res, next).catch((err) => { throw err });
	}

	//-----------------------------------------------------------------------\\
	/**
		* @description Busca unidade
		*
		* @async
		* @function buscarUnidade
		* @param  {string} req.cdPesq G009.CDUNIDAD
		* @returns {Array} Retorna o ID do código informado
		*
		* @author Rafael Delfino Calzado
		* @since 20/04/2018
	*/
	api.buscarUnidade = async function (req, res, next) {

		req.sql = `SELECT IDG009 ID FROM G009 WHERE SNDELETE = 0 AND CDUNIDAD = '${req.cdPesq}'`;

		return await gdao.executar(req, res, next).catch((err) => { throw err });
	}

	//-----------------------------------------------------------------------\\
	/**
		* @description Traz o ID, Descrição, Referência do Fabricante, ID do Cliente do produto
		*
		* @async
		* @function buscarProduto
		* @param  {string} req.DSREFFAB Referência do Fabricante
		* @param  {number} req.IDFABRIC ID Fabricante
		* @returns {Array} Retorna um array com o resultado da pesquisa
		*
		* @author Rafael Delfino Calzado
		* @since 20/04/2018
	*/
	//-----------------------------------------------------------------------\\

	api.buscarProduto = async function (req, res, next) {

		req.sql =
			`SELECT
					G010.IDG010 ID
				,	G010.DSPRODUT
				,	G010.DSREFFAB
				,	G010.SNDELETE

	  		FROM G010 --PRODUTO

	  		INNER JOIN G016 --EMBPRODUTO
				ON G016.IDG010 = G010.IDG010
				AND G016.SNEMBPAD = 1

	  		INNER JOIN G011 --EMBALAGEM
				ON G011.IDG011 = G016.IDG011
				AND G011.SNDELETE = 0

	  		INNER JOIN G013 --CONVERSAO
				ON G013.IDG010 = G016.IDG010
				AND G013.IDG009DE = G011.IDG009
				AND G013.SNDELETE = 0

			  WHERE
			  	G010.SNDELETE = 0 AND
				G010.DSREFFAB = '${req.DSREFFAB}' AND
				G010.IDG014 = ${req.IDG014}`;

		return await gdao.executar(req, res, next).catch((err) => { throw err });
	}

	//-----------------------------------------------------------------------\\
	/**
		* @description Busca uma delivery
		*
		* @async
		* @function buscarDelivery
		* @param {String} req.CDDELIVE Código da delivery
		* @returns {Array} Retorna um array com o resultado da pesquisa
		*
		* @author Rafael Delfino Calzado
		* @since 20/04/2018
	*/
	//-----------------------------------------------------------------------\\

	api.buscarDelivery = async function (req, res, next) {

		try {

			var sql_pivot = await fldAdd.tabelaPivot({ objConn: req.objConn, nmTabela: 'G043' }, res, next);

			req.sql =
				`SELECT
					G043.IDG043 ID,
					G043.IDG005RE,
					G043.IDG005DE,
					G043.IDG009PS,
					G043.TPDELIVE,
					G043.CDPRIORI,
					G043.STETAPA,
					G043.STULTETA,
					G043.STDELIVE,
					G043.SNLIBROT,
					G043.VRVOLUME,
					G043.VRDELIVE,
					G043.PSBRUTO,
					G043.PSLIQUID,
					G043.NRNOTA,
					G043.DTENTREG,
					G043.DTENTCON,
					G043.TXINSTRU,
					CA.STRECUSA

					FROM G043

					LEFT JOIN (${sql_pivot}) CA 
					ON CA.ID = G043.IDG043
					
					WHERE G043.SNDELETE = 0 
					AND G043.CDDELIVE = '${req.CDDELIVE}'`;

			return await gdao.executar(req, res, next);

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\
	/**
		* @description Lista deliveries a ser importadas
		*
		* @async
		* @function listarImportacao
		* @returns {Array} Retorna um array com o resultado da pesquisa
		*
		* @author Rafael Delfino Calzado
		* @since 20/04/2018
	*/
	//-----------------------------------------------------------------------\\

	api.listarImportacao = async function (req, res, next) {

		try {

			req.sql =
				`SELECT
						IDI012
					,	CDDELIVE
					,	NMARQUIV
					,	TO_CHAR(DTCADAST, 'DD/MM/YYYY HH24:MI:SS') DTCADAST
				FROM I012

				WHERE
					SNDELETE = 0

				ORDER BY
					DTCADAST DESC`;

			return await gdao.executar(req, res, next);

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\

	api.buscarOrderReason = async function (req, res, next) {

		try {

			req.sql =
				`SELECT
					IDG074 ID FROM G074
				WHERE
					SNDELETE = 0
					AND STCADAST = 'A'
					AND IDG014 = ${req.IDG014}
					AND CDMOTIVO = '${req.CDMOTIVO}'`;

			return await gdao.executar(req, res, next);

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\

	api.removeItens = async function (req, res, next) {

		try {

			req.sql = `UPDATE G045 SET SNDELETE = 1 WHERE SNDELETE = 0 AND IDG043 = ${req.IDG043}`;

			return await gdao.executar(req, res, next);

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\

	api.removeLotes = async function (req, res, next) {

		try {

			req.sql =
				`UPDATE
					(SELECT
							G050.IDG050
						,	G050.SNDELETE
					FROM G050

					INNER JOIN G045
						ON G045.IDG045 = G050.IDG045
						AND G050.SNDELETE = 0

					WHERE
						G045.IDG043 = ${req.IDG043}) L
				SET L.SNDELETE = 1`;

			return await gdao.executar(req, res, next);

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\

	api.buscarDeliveryEspelho = async function (req, res, next) {

		try {

			req.sql =
				`SELECT IDG043, STETAPA, NRNOTA
				FROM G043
				WHERE
					SNDELETE = 0
					AND STDELIVE <> 'D'
					AND STETAPA NOT IN (7, 8)
					AND TPDELIVE = '4'
					AND IDG014 = ${req.IDG014}
					AND IDG043RF = ${req.IDG043RF}`;

			return await gdao.executar(req, res, next);

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\

	api.atualizarDeliveryEspelho = async function (req, res, next) {

		req.sql = `UPDATE G043 SET CDDELIVE = '${req.CDDELIVE}' WHERE IDG043 = ${req.IDG043}`;

		return await gdao.executar(req, res, next).catch((err) => { throw err });

	}

	//-----------------------------------------------------------------------\\

    /**
	 * @description Calcula a data de SLA para o sistema WebAGil, no momento 
	 *              que o usuário vai solicitar um retorno apenas com o remetente
	 *              e o destinatário da solicitação.
	 * @async
	 * @function buscarDiasSLA
	 * @return {Data}   Retorna a data de SLA
	 * @throws {Object} Retorna o erro da consulta.
	 * 
	 * @author Brenda Oliveira e Marllon França
	 * @since 21/01/2020
	 */
	api.buscarDiasSLA = async function (req, res, next) {
		
		try {
	
			var con           = await this.controller.getConnection(null, req.UserId);
			var dataSLA       = null;

			//Busca informações referente os dias de calendárização e o horário de corte
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
					(SELECT TO_DATE(TO_CHAR(current_date,
						'DD/MM/YYYY') || ' ' ||TO_CHAR(G105.DTCORTE,
						'HH24:mi:ss'), 'DD/MM/YYYY HH24:mi:ss')
							FROM G105 G105
							WHERE G105.TPTRANSP = '${req.tpTransp}'
								AND G105.IDG014 = ${req.cdOperacao}
								AND G105.SNDELETE = 0) AS CORTE
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
									   T001.SNDIA6 AS T002SNDIA6
								   
			 
								   FROM G005 G005DE
								   
								   INNER JOIN G003 G003DE
									 ON G003DE.IDG003 = G005DE.IDG003
								   
								   INNER JOIN G002 G002DE
									 ON G002DE.IDG002 = G003DE.IDG002
								   
								   INNER JOIN T002 T002
									 ON T002.IDG003 = G005DE.IDG003
								   
								   INNER JOIN T001 T001
									 ON T001.IDT001 = T002.IDT001
								   
								   INNER JOIN G005 G005RE
									 ON G005RE.IDG005 = ${req.clOrigem}
								   
								   JOIN G084 G084
									 ON G005RE.IDG028 = G084.IDG028
									 AND G084.IDG024 = T002.IDG024
								   
								   WHERE G005DE.IDG005 = ${req.clDestino}
										 AND T001.SNDELETE = 0
										 AND T002.SNDELETE = 0
										 AND T001.IDT005 NOT IN (1)
										 AND T001.IDT005 = 36
								   
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
						   Z.IDG024`,
					param: []
				}).then((res) => {
					return res;
				}).catch((err) => {
					throw err;
				});


				var dataProximaRota = 9;

				//# Data de partida para Calculo
				let dataAgora = new Date();

		
				if(verificaDados.length > 0){

					//# Horário de corte
					if(verificaDados[0].CORTE != null){
						
						var dataCorte = new Date(verificaDados[0].CORTE);

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
		
				}
		
				var qtdDiasAte = 0;
				
				//# Caso não exista rota para a delivery, utiliza-se o dia atual
				if(dataProximaRota != 9){

					if(dataAgora.getDay() == dataProximaRota){ //# mesmo dia
						qtdDiasAte = 0;
			
					}else if(dataAgora.getDay() > dataProximaRota){ //# maior, vai virar a semana
						qtdDiasAte = (7 - dataAgora.getDay()) + dataProximaRota;
						
					}else if(dataAgora.getDay() < dataProximaRota){ //# menor, mesma semana
						qtdDiasAte = (dataProximaRota - dataAgora.getDay());
					}
			
					for (let i = 0; i < qtdDiasAte; i++) {
						dataAgora.setDate(dataAgora.getDate() + 1);
					}
				}

				//# Mais um dia para a coleta
				dataAgora.setDate(dataAgora.getDate() + 1);

				/* Buscando cidade tarifa */
				var sqlCidadeTarifa = ` 
				SELECT
					NVL(QTDIAENT, 0) QTDIAENT,
					NVL(QTDIACOL, 0) QTDIACOL,
					NVL(QTDIENLO, 0) QTDIENLO,
					NVL(QTDIENIT, 0) QTDIENIT,
					COALESCE(TO_CHAR(HOFINOTI, 'HH24:MI'), '23:59') HOFINOTI

				FROM G053
				WHERE
					SNDELETE     = 0
					AND IDG014   =  ${req.cdOperacao}
					AND IDG003OR =  ${req.idOrigem}
					AND IDG003DE =  ${req.idDestino}
					AND TPTRANSP = '${req.tpTransp}' `;

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

				}
				
				//# Verifica dia útil
				dataAgora   = await utilsCurl.addDiasUteis(dataAgora, qtdDias, req.idDestino);
				dataSLA 	= new Date(dataAgora);

				await con.close();
				
				return dataSLA;
					
				
		}catch (err) {
			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		}
			
	}
	
	return api;
}
