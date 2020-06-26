module.exports = function (app, cb) {

	const utils  = app.src.utils.FuncoesObjDB;
	const gdao   = app.src.modGlobal.dao.GenericDAO;
	const fldAdd = app.src.modGlobal.controllers.XFieldAddController;

	var api = {};

    //-----------------------------------------------------------------------\\
	/**
	 * @description Core do SQL e Funções de Pesquisa
	 * @author Rafael Delfino Calzado
	 * @since 04/11/2019
	 *
	 * @async
	 * @function relDelivery
	 * @return 	{Array}  Retorna os registros encontrados
	 * @throws 	{Object} Retorna objeto com o erro encontrado
	*/
	//-----------------------------------------------------------------------\\	

	api.relDelivery = async function (req, res, next) {

		try {

			var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

			var objConn = await gdao.controller.getConnection(null, req.UserId); 

			var sqlPivot = await fldAdd.tabelaPivot({ objConn, nmTabela: 'G043' }, res, next);
	
			var arCols =
			[
				'G043.IDG043',	
				'G043.CDDELIVE',
				'G043.CDPRIORI',
				'G043.TPDELIVE',
				'G043.STDELIVE',
				'G043.STETAPA',
				'G043.DTDELIVE',
				'G043.DTLANCTO',	
				'G043.PSBRUTO',
				'G043.VRDELIVE',
				'G043.NRNOTA',
				'G043.CDG46ETA',
				'G043.TXINSTRU',			
				'G005RE.IDG005',
				'G005RE.NMCLIENT',			
				'G005DE.IDG005',
				'G005DE.NMCLIENT',
				'G005RC.IDG005',
				'G005RC.NMCLIENT',
				'G003RE.IDG003',
				'G003RE.NMCIDADE',			
				'G003DE.IDG003',
				'G003DE.NMCIDADE',			
				'G003RC.IDG003',
				'G003RC.NMCIDADE',			
				'G002RE.IDG002',
				'G002RE.CDESTADO',			
				'G002DE.IDG002',
				'G002DE.CDESTADO',
				'G002RC.IDG002',
				'G002RC.CDESTADO',
				'CA.CDGRUCLI',
				'CA.CDGRUPRE',
				'CA.SNRECORI',
				'CTO.TTCTO',
				'TLMIN.MIN_ENV_OTI', 
				'TLMIN.MIN_REC_OTI', 
				'TLMIN.MIN_ENV_PRE',
				'TLMIN.MIN_ENV_ASN',
				'TLMIN.MIN_ENV_INV',
				'TLMIN.MIN_ENV_AGP',
				'TLMIN.MIN_ENV_EAD',
				'TLMIN.MIN_ENV_ACP',
				'TLMIN.MIN_ENV_AAD',
				'TLMIN.MIN_ENV_CCLACP',
				'TLMIN.MIN_ENV_EPC',
				'TLMIN.MIN_ENV_ERO',
				'TLMIN.MIN_ENV_RPC',
				'TLMIN.MIN_ENV_RRO',
				'TLMAX.MAX_ENV_OTI', 
				'TLMAX.MAX_REC_OTI', 
				'TLMAX.MAX_ENV_PRE',
				'TLMAX.MAX_ENV_ASN',
				'TLMAX.MAX_ENV_INV',
				'TLMAX.MAX_ENV_AGP',
				'TLMAX.MAX_ENV_EAD',
				'TLMAX.MAX_ENV_ACP',
				'TLMAX.MAX_ENV_AAD',
				'TLMAX.MAX_ENV_CCLACP',
				'TLMAX.MAX_ENV_EPC',
				'TLMAX.MAX_ENV_ERO',
				'TLMAX.MAX_ENV_RPC',
				'TLMAX.MAX_ENV_RRO',
				'G048.IDG048',
				'QMINMS.MIN_EAD',
				'QMINMS.MIN_AGP',
				'QMINMS.MIN_ACP',
				'QMINMS.MIN_AAD',
				'QMINMS.MIN_EPC',
				'QMINMS.MIN_CCD',
				'QMINMS.MIN_ERO',
				'QMINMS.MIN_RPC',
				'QMINMS.MIN_RRO',
				'QMAXMS.MAX_EAD',
				'QMAXMS.MAX_AGP',
				'QMAXMS.MAX_ACP',
				'QMAXMS.MAX_AAD',
				'QMAXMS.MAX_CCD',
				'QMAXMS.MAX_EPC',
				'QMAXMS.MAX_ERO',
				'QMAXMS.MAX_RPC',
				'QMAXMS.MAX_RRO',
				'QRC.RC_AGP',
				'QRC.RC_EAD',
				'QRC.RC_ACP',
				'QRC.RC_AAD',
				'QRC.RC_CCD',
				'QRC.RC_EPC',
				'QRC.RC_ERO',
				'QRC.RC_RPC',
				'QRC.RC_RRO',
				'G046.IDG046',
				'G046.STCARGA', 
				'G046.TPMODCAR',
				'G046.SNCARPAR',
				'G046.DTAGENDA',
				'G046.PSCARGA',
				'G046.VRCARGA',
				'G030.IDG030',
				'G030.QTCAPPES',			
				'I011.IDTIPVEI',
				'G024.IDG024',
				'G024.NMTRANSP',
				'SLOT.HOINICIO',
				'SLOT.HOFINAL',
				'O005.STOFEREC',
				'QOFEREC.DTOFEMIN',
				'QOFEREC.DTOFEMAX',
				'QOFEREC.DTRESMAX',
				'QOFEREC.TTOFEREC',				
				'G051.IDG051',
				'G051.CDCTRC',
				'G051.STCTRC',
				'G051.DTEMICTR',
				'G051.VROPERAC',
				'G051.VRTOTFRE',
				'G051.VRISSQST',
				'G051.VRICMS',
				'G051.VRPEDAGI',
				'G051.VRFRETEV'			
			];
	
			//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
	
			var arColsSel = arCols.slice(0);
			var c = 13; 
	
			arColsSel[c++] += ' IDG005RE';
			arColsSel[c++] += ' NMREMETE';
			
			arColsSel[c++] += ' IDG005DE';
			arColsSel[c++] += ' NMDESTIN';

			arColsSel[c++] += ' IDG005RC';
			arColsSel[c++] += ' NMRECEBE';
	
			arColsSel[c++] += ' IDG003RE';
			arColsSel[c++]  = 'UPPER(G003RE.NMCIDADE) NMCIDREM';
	
			arColsSel[c++] += ' IDG003DE';
			arColsSel[c++]  = 'UPPER(G003DE.NMCIDADE) NMCIDDES';
	
			arColsSel[c++] += ' IDG003RC';
			arColsSel[c++]  = 'UPPER(G003RC.NMCIDADE) NMCIDREC';
	
			arColsSel[c++] += ' IDG002RE';
			arColsSel[c++]  = 'UPPER(G002RE.CDESTADO) UFREM';
	
			arColsSel[c++] += ' IDG002DE';
			arColsSel[c++]  = 'UPPER(G002DE.CDESTADO) UFDES';
	
			arColsSel[c++] += ' IDG002RC';
			arColsSel[c++]  = 'UPPER(G002RC.CDESTADO) UFREC';

			//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
	
			var sql = 
				`SELECT 
					${arColsSel.join()},
					${api.sqlFormatField()},
					MAX(G045.CDLOCVEN) CDLOCVEN,
					COUNT(*) OVER() COUNT_LINHA
					
				FROM G043 -- DELIVERY

				INNER JOIN G014 -- OPERACAO
					ON G014.IDG014 = G043.IDG014
				
				INNER JOIN G005 G005RE -- REMETENTE
					ON G005RE.IDG005 = G043.IDG005RE
					
				INNER JOIN G005 G005DE -- DESTINATARIO
					ON G005DE.IDG005 = G043.IDG005DE
					
				LEFT JOIN G005 G005RC -- RECEBEDOR
					ON G005RC.IDG005 = G043.IDG005RC	
					
				INNER JOIN G003 G003RE -- CIDADE REMETENTE
					ON G003RE.IDG003 = G005RE.IDG003
					
				INNER JOIN G003 G003DE -- CIDADE DESTINO 
					ON G003DE.IDG003 = G005DE.IDG003
					
				LEFT JOIN G003 G003RC -- CIDADE RECEBEDOR 
					ON G003RC.IDG003 = G005RC.IDG003	
					
				INNER JOIN G002 G002RE -- ESTADO REMETENTE
					ON G002RE.IDG002 = G003RE.IDG002 
					
				INNER JOIN G002 G002DE -- ESTADO DESTINO 
					ON G002DE.IDG002 = G003DE.IDG002
					
				LEFT JOIN G002 G002RC -- ESTADO RECEBEDOR 
					ON G002RC.IDG002 = G003RC.IDG002	
					
				LEFT JOIN (${sqlPivot}) CA -- CAMPOS ADICIONAIS
					ON CA.ID = G043.IDG043

				LEFT JOIN (${api.sqlCTO()}) CTO -- CANHOTO
					ON CTO.IDG043 = G043.IDG043

				LEFT JOIN (${api.sqlTimeline('MIN')}) TLMIN 
					ON TLMIN.IDG043 = G043.IDG043

				LEFT JOIN (${api.sqlTimeline('MAX')}) TLMAX 
					ON TLMAX.IDG043 = G043.IDG043
	
				INNER JOIN G045 -- ITENS 
					ON G045.IDG043 = G043.IDG043
						
				LEFT JOIN G049 -- DELIVERY x ETAPA 
					ON G049.IDG043 = G043.IDG043 
					
				LEFT JOIN G051 -- CTE 
					ON G051.IDG051 = G049.IDG051
					
				LEFT JOIN G048 -- ETAPA 
					ON G048.IDG048 = G049.IDG048 
	
				LEFT JOIN (${api.sqlMS('MIN')}) QMINMS
					ON QMINMS.IDG048 = G048.IDG048

				LEFT JOIN (${api.sqlMS('MAX')}) QMAXMS
					ON QMAXMS.IDG048 = G048.IDG048
	
				LEFT JOIN (${api.sqlRC()}) QRC
					ON QRC.IDG048 = G048.IDG048
					
				LEFT JOIN G046 -- CARGA 
					ON G046.IDG046 = G048.IDG046
					
				LEFT JOIN G030 -- TIPO VEÍCULO 
					ON G030.IDG030 = G046.IDG030
					
				LEFT JOIN I011 -- VEÍCULO 4PL 
					ON I011.IDG030 = G030.IDG030 
					AND I011.IDG014 = G043.IDG014
					
				LEFT JOIN G024 -- TRANSPORTADORA 
					ON G024.IDG024 = G046.IDG024

				LEFT JOIN (${api.sqlSlot()}) SLOT 
					ON SLOT.IDG046 = G046.IDG046
						
				LEFT JOIN O005 -- OFERECIMENTO ATIVO
					ON O005.IDG046 = G046.IDG046
					AND O005.IDG024 = G046.IDG024

				LEFT JOIN (${api.sqlOferec()}) QOFEREC
					ON QOFEREC.IDG046 = G046.IDG046
	
				${sqlWhere}
					AND G014.IDG097DO = 145 -- CHKRDC
					AND G045.SNDELETE = 0

					AND ((G046.IDG046 IS NULL) OR 
						((G046.SNDELETE = 0) AND 
						 (G046.STCARGA NOT IN ('C', 'F', 'E')) AND 
						 (G046.TPMODCAR <> 1)))

					AND ((G051.IDG051 IS NULL) OR 
						((G051.SNDELETE = 0) AND (G051.STCTRC = 'A')))
					
				GROUP BY
					${arCols.join()}
										
				ORDER BY G043.IDG043 
					
				${sqlPaginate}`;

			var arRS = await gdao.executar({ objConn, sql, bindValues }, res, next);

			return utils.construirObjetoRetornoBD(arRS, req.body);

		} catch (err) {

			throw err;

		}

	}

    //-----------------------------------------------------------------------\\
	/**
	 * @description SQL dos dados de Oferecimento
	 * @author Rafael Delfino Calzado
	 * @since 04/11/2019
	 *
	 * @function sqlOferec
	 * @return 	{String}  SQL
	*/
	//-----------------------------------------------------------------------\\	
		
	api.sqlOferec = function () {

		var sql = 
			`SELECT 
				IDG046,
				MIN(DTOFEREC) DTOFEMIN,
				MAX(DTOFEREC) DTOFEMAX,
				MAX(DTRESOFE) DTRESMAX,
				COUNT(*) TTOFEREC			
			FROM O005 
			GROUP BY IDG046`;

		return sql;

	}

    //-----------------------------------------------------------------------\\
	/**
	 * @description SQL do Eventos da Timeline da Delivery 
	 * @author Rafael Delfino Calzado
	 * @since 04/11/2019
	 *
	 * @param tpFuncAg  Função MIN/MAX para agrupamento de dados
	 * @function sqlTimeline
	 * @return 	{String}  SQL
	*/
	//-----------------------------------------------------------------------\\	

	api.sqlTimeline = function (tpFuncAg) {

		var sql = 
			`SELECT * FROM (

				SELECT 
					IDG043,
					IDI001, 
					${tpFuncAg}(DTEVENTO) DTEVENTO 
				FROM I008 
				WHERE 
					SNDELETE = 0 
				GROUP BY 
					IDG043, IDI001

			) PIVOT (${tpFuncAg}(DTEVENTO) FOR IDI001 IN (
				 2 ${tpFuncAg}_ENV_OTI, 
				 4 ${tpFuncAg}_REC_OTI, 
				10 ${tpFuncAg}_ENV_PRE,
				14 ${tpFuncAg}_ENV_ASN,
				15 ${tpFuncAg}_ENV_INV,
				16 ${tpFuncAg}_ENV_AGP,
				17 ${tpFuncAg}_ENV_EAD,
				19 ${tpFuncAg}_ENV_ACP,
				21 ${tpFuncAg}_ENV_AAD,
				26 ${tpFuncAg}_ENV_CCLACP,
				31 ${tpFuncAg}POD,
				33 ${tpFuncAg}_ENV_CCD,
				34 ${tpFuncAg}_ENV_EPC,
				35 ${tpFuncAg}_ENV_ERO,
				36 ${tpFuncAg}_ENV_RPC,
				37 ${tpFuncAg}_ENV_RRO
			))`;

		return sql;

	}

    //-----------------------------------------------------------------------\\
	/**
	 * @description SQL das Primeiras e Últimas datas informadas nos Milestones
	 * @author Rafael Delfino Calzado
	 * @since 04/11/2019
	 *
	 * @param tpFuncAg  Função MIN/MAX para agrupamento de dados
	 * @function sqlMS
	 * @return 	{String}  SQL
	*/
	//-----------------------------------------------------------------------\\	

	api.sqlMS = function (tpFuncAg) {

		var sql = 
			`SELECT * FROM (

				SELECT 
					I013O.IDG048,
					I013O.IDI001,
					I013O.DTALTEVE
				FROM I013 I013O
				INNER JOIN ( 
					SELECT 
						IDG048, 
						IDI001, 
						${tpFuncAg}(IDI013) IDI013 
					FROM I013 
					WHERE 
						SNDELETE = 0
					GROUP BY 
						IDG048, 
						IDI001
				) QMS 
					ON QMS.IDI013 = I013O.IDI013

			) PIVOT (${tpFuncAg}(DTALTEVE) FOR IDI001 IN (
				16 ${tpFuncAg}_AGP,
				17 ${tpFuncAg}_EAD,
				19 ${tpFuncAg}_ACP,
				21 ${tpFuncAg}_AAD,
				33 ${tpFuncAg}_CCD,
				34 ${tpFuncAg}_EPC,
				35 ${tpFuncAg}_ERO,
				36 ${tpFuncAg}_RPC,
				37 ${tpFuncAg}_RRO
			))`;

		return sql;

	}

    //-----------------------------------------------------------------------\\
	/**
	 * @description SQL dos Reason Codes informados nos Milestones
	 * @author Rafael Delfino Calzado
	 * @since 04/11/2019
	 *	 
	 * @function sqlRC
	 * @return 	{String}  SQL
	*/
	//-----------------------------------------------------------------------\\	

	api.sqlRC = function () {

		var sql = 
			`SELECT * FROM (

				SELECT 
					I013O.IDG048,
					I013O.IDI001,
					I007.IDREACOD

				FROM I013 I013O

				INNER JOIN I007 
					ON I007.IDI007 = I013O.IDI007

				INNER JOIN (

					SELECT 
						IDG048, 
						IDI001, 
						MAX(IDI013) IDI013 
					FROM I013 
					WHERE 
						SNDELETE = 0
					GROUP BY 
						IDG048, 
						IDI001

				) QMS 
					ON QMS.IDI013 = I013O.IDI013

			) PIVOT (MAX(IDREACOD) FOR IDI001 IN (
				16 RC_AGP,
				17 RC_EAD,
				19 RC_ACP,
				21 RC_AAD,
				33 RC_CCD,
				34 RC_EPC,
				35 RC_ERO,
				36 RC_RPC,
				37 RC_RRO
			))`;

		return sql;

	}

    //-----------------------------------------------------------------------\\
	/**
	 * @description SQL dos Totais de Canhotos digitalizados
	 * @author Rafael Delfino Calzado
	 * @since 04/11/2019
	 *
	 * @function sqlCTO
	 * @return 	{String}  SQL
	*/
	//-----------------------------------------------------------------------\\		

	api.sqlCTO = function () {

		var sql =
			`SELECT 
				G082.PKS007 IDG043, COUNT(*) TTCTO
			FROM G082 -- DIGITALIZAÇÕES
			INNER JOIN S007	-- TABELAS
				ON S007.IDS007 = G082.IDS007
			WHERE
				G082.SNDELETE = 0
				AND G082.TPDOCUME = 'CTO'
				AND S007.NMTABELA = 'G043'
			GROUP 
				BY G082.PKS007`;

		return sql;

	}

    //-----------------------------------------------------------------------\\
	/**
	 * @description SQL dos Horários de Slots reservados para a Carga
	 * @author Rafael Delfino Calzado
	 * @since 04/11/2019
	 *
	 * @function sqlSlot
	 * @return 	{String}  SQL
	*/
	//-----------------------------------------------------------------------\\		

	api.sqlSlot = function () {

		var sql = 
			`SELECT 
				QAGENDA.IDG046,
				QSLOT.IDH007,
				QSLOT.IDH006,
				TO_CHAR(QSLOT.HOINICIO, 'DD/MM/YYYY HH24:MI') HOINICIO,
				TO_CHAR(QSLOT.HOFINAL, 'DD/MM/YYYY HH24:MI') HOFINAL

			FROM H006 

			INNER JOIN 
			(

				SELECT 
					IDG046, 
					MAX(IDH006) IDH006, 
					COUNT(*) TTAGENDA
				FROM H024
				WHERE SNDELETE = 0
				GROUP BY IDG046

			) QAGENDA 
				ON QAGENDA.IDH006 = H006.IDH006
			
			INNER JOIN 
			(

				SELECT 
					IDH006,
					MAX(IDH007) IDH007, 
					MIN(HOINICIO) HOINICIO, 
					MAX(HOFINAL) HOFINAL 
				FROM H007 
				WHERE SNDELETE = 0 
				GROUP BY IDH006	

			) QSLOT 
				ON QSLOT.IDH006 = H006.IDH006
			
			WHERE 
				H006.SNDELETE = 0
				AND H006.STAGENDA <> 10`;

		return sql;

	}

    //-----------------------------------------------------------------------\\
	/**
	 * @description Formatação de Campos para a Grid
	 * @author Rafael Delfino Calzado
	 * @since 04/11/2019
	 *
	 * @function sqlFormatField
	 * @return 	{String}  SQL
	*/
	//-----------------------------------------------------------------------\\		

	api.sqlFormatField = function () {

		var strCase = 
			`
			/* DELIVERY */

			CASE
				WHEN G043.STETAPA IN (0,20) THEN 'BACKLOG'
				WHEN G043.STETAPA IN (1,21) THEN 'OTIMIZANDO'
				WHEN G043.STETAPA IN (2,22) THEN 'OFERECIMENTO'
				WHEN G043.STETAPA IN (3,23) THEN 'AGENDAMENTO'
				WHEN G043.STETAPA IN (4,24) THEN 'TRANSPORTE'
				WHEN G043.STETAPA IN (5,25) THEN 'ENCERRADO'
				WHEN G043.STETAPA = 6 THEN 'OCORRÊNCIA'
				WHEN G043.STETAPA = 7 THEN 'A CANCELAR'
				WHEN G043.STETAPA = 8 THEN 'CANCELADA'
				ELSE 'OUTRO'
			END DSDLVETA,

			CASE 
				WHEN G043.TPDELIVE = 1 THEN 'TRANSFERÊNCIA'
				WHEN G043.TPDELIVE = 2 THEN 'VENDA'
				WHEN G043.TPDELIVE = 3 THEN 'DEVOLUÇÃO'
				WHEN G043.TPDELIVE = 4 THEN 'RECUSA'
				WHEN G043.TPDELIVE = 5 THEN 'RETORNO DE AG'
				ELSE 'OUTRO'
			END DSDLVTIP,

			CASE
				WHEN G043.CDPRIORI = 1 THEN '1 - URGENTE'
				WHEN G043.CDPRIORI = 2 THEN '2 - PRIORIDADE ALTA'
				WHEN G043.CDPRIORI = 3 THEN '3 - PADRÃO'
				WHEN G043.CDPRIORI = 4 THEN '4 - PRIORIDADE BAIXA'
				ELSE 'OUTRO'
			END	DSDLVPRI,

			CASE
				WHEN G043.STDELIVE = 'R' THEN 'REPLACE'
				WHEN G043.STDELIVE = 'C' THEN 'CREATE'
				WHEN G043.STDELIVE = 'D' THEN 'DELETE'
				ELSE 'OUTRO'
			END DSSTDELIVE,

			CASE 
				WHEN CA.SNRECORI = 1 THEN 'SIM'
				ELSE 'NÃO'
			END DSRECORI,

			CASE
				WHEN G003RC.IDG003 IS NOT NULL THEN 
					UPPER(G003RC.NMCIDADE) || ' / ' || G002RC.CDESTADO
				ELSE ''
			END DSLOCENT,

			TO_CHAR(G043.DTLANCTO, 'DD/MM/YYYY HH24:MI:SS') DTIMPORT,

			/* CARGA */

			CASE 
				WHEN G046.SNCARPAR = 'N' THEN 'FTL'
				WHEN G046.SNCARPAR = 'S' THEN 'LTL'
				WHEN G046.SNCARPAR = 'I' THEN 'ITL'
				ELSE ''
			END DSCARPAR,

			CASE
				WHEN G046.STCARGA = 'B' THEN 'BACKLOG'
				WHEN G046.STCARGA = 'R' THEN 'DISTRIBUÍDA'
				WHEN G046.STCARGA = 'P' THEN 'PRÉ-AUTORIZAÇÃO'
				WHEN G046.STCARGA = 'O' THEN 'OFERECIDA'
				WHEN G046.STCARGA = 'X' THEN 'RECUSADA'
				WHEN G046.STCARGA = 'A' THEN 'ACEITA'
				WHEN G046.STCARGA = 'S' THEN 'AGENDADA'
				WHEN G046.STCARGA = 'T' THEN 'TRANSPORTE'
				WHEN G046.STCARGA = 'C' THEN 'CANCELADA'
				WHEN G046.STCARGA = 'E' THEN 'OCORRÊNCIA'
				WHEN G046.STCARGA = 'F' THEN 'PRÉ CARGA'
				WHEN G046.STCARGA = 'D' THEN 'ENTREGUE'
				ELSE ''
			END DSSTCGA,

			TO_CHAR(G046.DTAGENDA, 'DD/MM/YYYY HH24:MI') DTAGDCAR,

			/* OFERECIMENTO */

			CASE
				WHEN O005.STOFEREC = 'R' THEN 'DISTRIBUÍDA'
				WHEN O005.STOFEREC = 'P' THEN 'PRÉ-AUTORIZAÇÃO'
				WHEN O005.STOFEREC = 'O' THEN 'OFERECIDA'
				WHEN O005.STOFEREC = 'X' THEN 'RECUSADA'
				WHEN O005.STOFEREC = 'A' THEN 'ACEITA'
				WHEN O005.STOFEREC = 'S' THEN 'AGENDADA'
				ELSE ''
			END DSSTOFER,

			TO_CHAR(MIN(QOFEREC.DTOFEMIN), 'DD/MM/YYYY HH24:MI') DTOFEMINF,
			TO_CHAR(MAX(QOFEREC.DTOFEMAX), 'DD/MM/YYYY HH24:MI') DTOFEMAXF,
			TO_CHAR(MAX(QOFEREC.DTRESMAX), 'DD/MM/YYYY HH24:MI') DTRESMAXF,
			((NVL(QOFEREC.DTRESMAX, CURRENT_DATE) - QOFEREC.DTOFEMIN) * 86400) TMOFEREC,

			/* CTE */

			CASE
				WHEN G051.STCTRC = 'A' THEN 'ATIVO'
				WHEN G051.STCTRC = 'C' THEN 'CANCELADO'
				ELSE ''
			END DSSTCTE,
			
			ROUND((G051.VRTOTFRE - G051.VROPERAC - G051.VRISSQST), 2) VRFRECTE,

			TO_CHAR(G051.DTEMICTR, 'DD/MM/YYYY HH24:MI') DTEMICTE,

			/* MILESTONES - PRIMEIROS VALORES */

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN TO_CHAR(QMINMS.MIN_AGP, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(QMINMS.MIN_EPC, 'DD/MM/YYYY HH24:MI')
			END MIN_MS_PCOL,

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN TO_CHAR(QMINMS.MIN_EAD, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(QMINMS.MIN_ERO, 'DD/MM/YYYY HH24:MI')
			END MIN_MS_PENT,

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN TO_CHAR(QMINMS.MIN_ACP, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(QMINMS.MIN_RPC, 'DD/MM/YYYY HH24:MI')
			END MIN_MS_CCOL,

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN TO_CHAR(QMINMS.MIN_AAD, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(QMINMS.MIN_RRO, 'DD/MM/YYYY HH24:MI')
			END MIN_MS_CENT,

			TO_CHAR(QMINMS.MIN_CCD, 'DD/MM/YYYY HH24:MI') MIN_MS_CCD,

			/* MILESTONES - ÚLTIMOS VALORES */

			CASE
				WHEN ((TO_NUMBER(G043.TPDELIVE) < 3) AND (QMINMS.MIN_AGP <> QMAXMS.MAX_AGP)) THEN TO_CHAR(QMAXMS.MAX_AGP, 'DD/MM/YYYY HH24:MI')
				WHEN ((TO_NUMBER(G043.TPDELIVE) > 2) AND (QMINMS.MIN_EPC <> QMAXMS.MAX_EPC)) THEN TO_CHAR(QMAXMS.MAX_EPC, 'DD/MM/YYYY HH24:MI')
			END MAX_MS_PCOL,

			CASE
				WHEN ((TO_NUMBER(G043.TPDELIVE) < 3) AND (QMINMS.MIN_EAD <> QMAXMS.MAX_EAD)) THEN TO_CHAR(QMAXMS.MAX_EAD, 'DD/MM/YYYY HH24:MI')
				WHEN ((TO_NUMBER(G043.TPDELIVE) > 2) AND (QMINMS.MIN_ERO <> QMAXMS.MAX_ERO)) THEN TO_CHAR(QMAXMS.MAX_ERO, 'DD/MM/YYYY HH24:MI')
			END MAX_MS_PENT,

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN TO_CHAR(QMAXMS.MAX_ACP, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(QMAXMS.MAX_RPC, 'DD/MM/YYYY HH24:MI')
			END MAX_MS_CCOL,

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN TO_CHAR(QMAXMS.MAX_AAD, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(QMAXMS.MAX_RRO, 'DD/MM/YYYY HH24:MI')
			END MAX_MS_CENT,

			TO_CHAR(QMAXMS.MAX_CCD, 'DD/MM/YYYY HH24:MI') MAX_MS_CCD,

			/* MILESTONES - PRIMEIROS EVENTOS */

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN TO_CHAR(TLMIN.MIN_ENV_AGP, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(TLMIN.MIN_ENV_EPC, 'DD/MM/YYYY HH24:MI')
			END MIN_EVT_PCOL,

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN TO_CHAR(TLMIN.MIN_ENV_EAD, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(TLMIN.MIN_ENV_ERO, 'DD/MM/YYYY HH24:MI')
			END MIN_EVT_PENT,

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN TO_CHAR(TLMIN.MIN_ENV_ACP, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(TLMIN.MIN_ENV_RPC, 'DD/MM/YYYY HH24:MI')
			END MIN_EVT_CCOL,

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN TO_CHAR(TLMIN.MIN_ENV_AAD, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(TLMIN.MIN_ENV_RRO, 'DD/MM/YYYY HH24:MI')
			END MIN_EVT_CENT,

			/* MILESTONES - ÚLTIMOS EVENTOS */

			CASE
				WHEN (TO_NUMBER(G043.TPDELIVE) < 3) THEN TO_CHAR(TLMAX.MAX_ENV_AGP, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(TLMAX.MAX_ENV_EPC, 'DD/MM/YYYY HH24:MI')
			END MAX_EVT_PCOL,

			CASE
				WHEN (TO_NUMBER(G043.TPDELIVE) < 3) THEN TO_CHAR(TLMAX.MAX_ENV_EAD, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(TLMAX.MAX_ENV_ERO, 'DD/MM/YYYY HH24:MI')
			END MAX_EVT_PENT,

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN TO_CHAR(TLMAX.MAX_ENV_ACP, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(TLMAX.MAX_ENV_RPC, 'DD/MM/YYYY HH24:MI')
			END MAX_EVT_CCOL,

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN TO_CHAR(TLMAX.MAX_ENV_AAD, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(TLMAX.MAX_ENV_RRO, 'DD/MM/YYYY HH24:MI')
			END MAX_EVT_CENT,

			TO_CHAR(TLMAX.MAX_ENV_CCLACP, 'DD/MM/YYYY HH24:MI') MAX_EVT_CCLACP,
			TO_CHAR(TLMAX.MAX_ENV_INV, 'DD/MM/YYYY HH24:MI') MAX_EVT_INV,
			TO_CHAR(TLMAX.MAX_ENV_PRE, 'DD/MM/YYYY HH24:MI') MAX_EVT_PRE,
			TO_CHAR(TLMAX.MAX_ENV_ASN, 'DD/MM/YYYY HH24:MI') MAX_EVT_ASN,
			TO_CHAR(TLMAX.MAX_ENV_OTI, 'DD/MM/YYYY HH24:MI') MAX_EVT_EOTI,
			TO_CHAR(TLMAX.MAX_REC_OTI, 'DD/MM/YYYY HH24:MI') MAX_EVT_ROTI,

			/* MILESTONES - ÚLTIMOS EVENTOS - UPLOAD - DUPLICACAO PARA EXPORTACAO */

			CASE
				WHEN (TO_NUMBER(G043.TPDELIVE) < 3) THEN TO_CHAR(TLMAX.MAX_ENV_AGP, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(TLMAX.MAX_ENV_EPC, 'DD/MM/YYYY HH24:MI')
			END MAX_EVT_PCOL_UP,

			CASE
				WHEN (TO_NUMBER(G043.TPDELIVE) < 3) THEN TO_CHAR(TLMAX.MAX_ENV_EAD, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(TLMAX.MAX_ENV_ERO, 'DD/MM/YYYY HH24:MI')
			END MAX_EVT_PENT_UP,

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN TO_CHAR(TLMAX.MAX_ENV_ACP, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(TLMAX.MAX_ENV_RPC, 'DD/MM/YYYY HH24:MI')
			END MAX_EVT_CCOL_UP,

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN TO_CHAR(TLMAX.MAX_ENV_AAD, 'DD/MM/YYYY HH24:MI')
				ELSE TO_CHAR(TLMAX.MAX_ENV_RRO, 'DD/MM/YYYY HH24:MI')
			END MAX_EVT_CENT_UP,

			/* REASON CODES */

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN QRC.RC_AGP
				ELSE QRC.RC_EPC
			END RC_PCOL,

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN QRC.RC_EAD
				ELSE QRC.RC_ERO
			END RC_PENT,

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN QRC.RC_ACP
				ELSE QRC.RC_RPC
			END RC_CCOL,

			CASE
				WHEN TO_NUMBER(G043.TPDELIVE) < 3 THEN QRC.RC_AAD
				ELSE QRC.RC_RRO
			END RC_CENT
			`;

		return strCase;
	}

	//-----------------------------------------------------------------------\\		

	return api;
}