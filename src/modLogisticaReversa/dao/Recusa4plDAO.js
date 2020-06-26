module.exports = function (app, cb) {

	const gdao   = app.src.modGlobal.dao.GenericDAO;
	const fldAdd = app.src.modGlobal.controllers.XFieldAddController;
	const utils = app.src.utils.FuncoesObjDB;

	var api = {};
	api.controller = gdao.controller;

	//-----------------------------------------------------------------------\\

	api.alteraStatusCarga = async function (req, res, next) {

		var parm = { objConn: req.objConn };

		parm.sql = `UPDATE G046 SET STCARGA = '${req.STCARGA}' WHERE IDG046 = ${req.IDG046}`;

		return await gdao.executar(parm, res, next).catch((err) => { throw err });

	}

	//-----------------------------------------------------------------------\\

	api.retiraBacklogRecusa = async function (req, res, next) {

		try {

			var parm = {};
			parm.objConn  = await gdao.controller.getConnection();
			parm.nmTabela = 'G043';
			parm.idTabela = req.params.id;
			parm.STRECUSA = 2;
			
			var arValores = await fldAdd.inserirValoresAdicionais(parm, res, next);

			await parm.objConn.close();

			return arValores;

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\	

	api.buscaRecusa4plCards = async function (req, res, next) {

		var parm = { nmTabela: 'G043' };

		parm.objConn = await gdao.controller.getConnection();			
		var sqlPivot = await fldAdd.tabelaPivot(parm, res, next);

		await gdao.controller.setConnection(parm.objConn);

		parm.sql = 
			`SELECT
				'B' STETAPA, COUNT(*) QTSTATUS	
			
			FROM G043

			INNER JOIN G014
				ON G014.IDG014 = G043.IDG014
			
			INNER JOIN (${sqlPivot}) CA 
				ON CA.ID = G043.IDG043
		
			WHERE 
				G014.SN4PL = 1 -- CHKRDC
				AND G043.SNDELETE = 0	
				AND G043.STETAPA = 5				
				AND G043.DTENTREG IS NOT NULL
				AND CA.NRPROTOC IS NOT NULL
				AND CA.STRECUSA = '1' 
			
			UNION
		
			SELECT 
				'O' STETAPA, COUNT(*) QTSTATUS
			
			FROM G043

			INNER JOIN G014
				ON G014.IDG014 = G043.IDG014			

			INNER JOIN G049
				ON G049.IDG043 = G043.IDG043RF

			INNER JOIN G048 
				ON G048.IDG048 = G049.IDG048

			INNER JOIN G046 
				ON G046.IDG046 = G048.IDG046
		
			WHERE 				
				G014.SN4PL = 1 -- CHKRDC					
				AND G046.SNDELETE = 0
				AND G046.STCARGA <> 'C'
				AND G043.SNDELETE = 0
				AND G043.TPDELIVE = '4' -- RECUSA
				AND G043.STETAPA = 21   -- OTIMIZANDO
				
			UNION

			SELECT 
				G046.STCARGA STETAPA, COUNT(*) QTSTATUS
			
			FROM G046
		
			WHERE 
				G046.SNDELETE = 0
				AND G046.IDG024 IS NOT NULL
				AND G046.STCARGA IN ('T', 'D')								
				AND G046.TPTRANSP = 'R'
			GROUP BY 
				G046.STCARGA`;

		var rs = await gdao.executar(parm, res, next);

		await parm.objConn.close();
	
		return rs;

	}

	//-----------------------------------------------------------------------\\	

	api.buscaRecusa4plBacklog = async function (req, res, next) {

		try {

			var parm = { nmTabela: 'G043' };

			var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, parm.nmTabela, true);

			parm.objConn = await gdao.controller.getConnection();			
			var sqlPivot = await fldAdd.tabelaPivot(parm, res, next);

			await gdao.controller.setConnection(parm.objConn);
	
			parm.sql = 
				`SELECT
					G043.IDG043, 
					G043.CDPRIORI, 
					G043.CDDELIVE,
					G043.SNINDSEG,
					G043.TXINSTRU,
					G043.NRNOTA,
					G043.DSEMACLI,
					G043.DSEMARTV,

					TO_CHAR(G043.DTDELIVE, 'DD/MM/YYYY') DTDELIVE,
					TO_CHAR(G043.DTENTREG, 'DD/MM/YYYY') DTENTREG,
					TO_CHAR(G043.DTEMINOT, 'DD/MM/YYYY') DTEMINOT,
					TO_CHAR(G043.DTLANCTO, 'DD/MM/YYYY') DTLANCTO,

					G005RE.NMCLIENT NMREMETE,						
					G005DE.NMCLIENT NMDESTIN,

					UPPER(G003RE.NMCIDADE) || '/' || G002RE.CDESTADO NMCIDORI,
					UPPER(G003DE.NMCIDADE) || '/' || G002DE.CDESTADO NMCIDDES,					

					CA.NRPROTOC,
					CA.SNPALETI,

					COUNT(*) OVER () COUNT_LINHA
							
					FROM G043

					INNER JOIN G014 -- OPERACAO
						ON G014.IDG014 = G043.IDG014
					
					INNER JOIN G005 G005RE -- REMETENTE
						ON G005RE.IDG005 = G043.IDG005RE
						
					INNER JOIN G005 G005DE -- DESTINATARIO
						ON G005DE.IDG005 = G043.IDG005DE
						
					INNER JOIN G003 G003RE -- CIDADE REMETENTE
						ON G003RE.IDG003 = G005RE.IDG003
						
					INNER JOIN G003 G003DE -- CIDADE DESTINATARIO
						ON G003DE.IDG003 = G005DE.IDG003	
					
					INNER JOIN G002 G002RE -- ESTADO REMETENTE
						ON G002RE.IDG002 = G003RE.IDG002
						
					INNER JOIN G002 G002DE -- ESTADO DESTINATARIO
						ON G002DE.IDG002 = G003DE.IDG002		
						
					INNER JOIN (${sqlPivot}) CA 
						ON CA.ID = G043.IDG043
					
					${sqlWhere}
						
						AND G014.SN4PL = 1 -- CHKRDC
						AND G043.STETAPA = 5						
						AND G043.DTENTREG IS NOT NULL
						AND CA.NRPROTOC IS NOT NULL
						AND CA.STRECUSA = '1'
						
					${sqlOrder} ${sqlPaginate}`;
	
			parm.bindValues = bindValues;					
			var rs = await gdao.executar(parm, res, next);

			await parm.objConn.close();

			return utils.construirObjetoRetornoBD(rs);

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\	

	api.buscaDadosDelivery = async function (req, res, next) {

		var sql = 
			`SELECT

				G043.IDG043,
				G043.IDG014,  
				
				G043.IDG005RE,
				G043.IDG005DE,
				G043.IDG009PS,
				
				G043.CDDELIVE,
				
				G043.STETAPA,
				G043.STULTETA,

				G043.CDFILIAL,
				G043.IDEXTCLI,
				
				G043.TPDELIVE,
				G043.STDELIVE,
				G043.SNINDSEG,
				
				G043.SNLIBROT,
				G043.CDPRIORI,
				
				G043.DTDELIVE, 
				G043.DTLANCTO, 
				G043.DTFINCOL, 
				G043.DTENTCON,
				
				G043.NRNOTA,
				G043.NRSERINF,
				G043.DSMODENF,
				G043.DTEMINOT,
				G043.NREMBSEC,
				
				G043.PSBRUTO,
				G043.PSLIQUID,
				
				G043.VRVOLUME,
				G043.VRDELIVE,
				
				G043.TXINSTRU,

				G014.IDG014,
				G014.DSOPERAC,

				G009.CDUNIDAD,
				G009.DSUNIDAD,

				G005RE.IDG005 		IDG005RE,
				G005RE.NMCLIENT		NMREMETE,
				
				G005DE.IDG005 		IDG005DE,
				G005DE.NMCLIENT		NMDESTIN,
				
				G045.IDG045,
				G045.IDG010,
				G045.IDG009PS 		UNPESITE,
				G045.IDG009UM 		UNMEDITE,
				
				G045.NRORDITE,
				G045.NRONU,
				
				G045.VRUNIPRO,
				G045.PSBRUTO, 
				
				G050.IDG050,
				G050.QTPRODUT,
				G050.DSLOTE
					
			FROM G043 -- DELIVERY

			INNER JOIN G005 G005RE -- REMETENTE
				ON G005RE.IDG005 = G043.IDG005RE

			INNER JOIN G005 G005DE -- DESTINATÁRIO
				ON G005DE.IDG005 = G043.IDG005DE

			INNER JOIN G014 -- OPERAÇÕES
				ON G014.IDG014 = G043.IDG014	
			
			INNER JOIN G009 --UNIDADE
				ON G009.IDG009 = G043.IDG009PS
			
			INNER JOIN G045 -- ITENS
				ON G045.IDG043 = G043.IDG043
				AND G045.SNDELETE = 0
				
			INNER JOIN G050 -- LOTES
				ON G050.IDG045 = G045.IDG045
				AND G050.SNDELETE = 0
				
			WHERE 
				G043.SNDELETE = 0 
				AND G043.IDG043 = ${req.params.id}
				
			ORDER BY 
				G043.IDG043,
				G045.IDG045`;			

		return await gdao.executar({sql}, res, next).catch((err) => { throw err });

	}

	//-----------------------------------------------------------------------\\	

	api.buscaRecusa4plOtimiza = async function (req, res, next) {

  		try {

			var parm = {};

			var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

			parm.sql = 
				`SELECT
					G046.IDG046,
					--G046.IDG024,
					G046.IDG030,

					G024.IDG024,
					G024.NMTRANSP,
				
					G048.IDG048,

					G005RE.IDG005 	IDG005RE, 
					G005RE.NMCLIENT NMREMETE,
				
					G005DE.IDG005 	IDG005DE,
					G005DE.NMCLIENT NMDESTIN,
			
					UPPER(G003RE.NMCIDADE) || '/' || G002RE.CDESTADO NMCIDORI,
					UPPER(G003DE.NMCIDADE) || '/' || G002DE.CDESTADO NMCIDDES,					
				
					LISTAGG(G043.IDG043, ',')  WITHIN GROUP(ORDER BY G043.CDDELIVE) IDG043,					
					LISTAGG(G043.CDDELIVE, ',')  WITHIN GROUP(ORDER BY G043.CDDELIVE) CDDELIVE,
					LISTAGG(G043.NRNOTA, ',')  WITHIN GROUP(ORDER BY G043.NRNOTA) NRNOTA,
				
					SUM(G043.PSBRUTO) PSBRUTO,
					
					COUNT(*) TTDELIVE,
					
					COUNT(*) OVER() COUNT_LINHA
					
				FROM G043 -- DELIVERY

				INNER JOIN G014 -- OPERACAO
					ON G014.IDG014 = G043.IDG014
				
				INNER JOIN G005 G005RE -- REMETENTE
					ON G005RE.IDG005 = G043.IDG005RE
				
				INNER JOIN G005 G005DE -- DESTINATARIO
					ON G005DE.IDG005 = G043.IDG005DE
					
				INNER JOIN G003 G003RE -- CIDADE REMETENTE
					ON G003RE.IDG003 = G005RE.IDG003
					
				INNER JOIN G003 G003DE -- CIDADE DESTINO
					ON G003DE.IDG003 = G005DE.IDG003
				
				INNER JOIN G002 G002RE -- ESTADO REMETENTE
					ON G002RE.IDG002 = G003RE.IDG002
					
				INNER JOIN G002 G002DE -- ESTADO DESTINO
					ON G002DE.IDG002 = G003DE.IDG002
					
				INNER JOIN G049 -- DELIVERIES x ETAPA 
					ON G049.IDG043 = G043.IDG043RF
					
				INNER JOIN G048 -- ETAPA
					ON G048.IDG048 = G049.IDG048 
					
				INNER JOIN G046 -- CARGA
					ON G046.IDG046 = G048.IDG046

				INNER JOIN G024 -- TRANSPORTADORA
					ON G024.IDG024 = G046.IDG024
					
					${sqlWhere}
					AND G046.SNDELETE = 0
					AND G046.STCARGA <> 'C'
					AND G014.SN4PL = 1 -- CHKRDC
					AND G043.TPDELIVE = '4' -- RECUSA
					AND G043.STETAPA = 21 -- OTIMIZANDO
								
				GROUP BY 
					G046.IDG046,
					--G046.IDG024,
					G046.IDG030,

					G024.IDG024,
					G024.NMTRANSP,
				
					G048.IDG048,

					G005RE.IDG005, 
					G005RE.NMCLIENT,	
					G003RE.IDG003,
					G003RE.NMCIDADE,	
					G002RE.IDG002,
					G002RE.CDESTADO,
					
					G005DE.IDG005, 
					G005DE.NMCLIENT,
					G003DE.IDG003,
					G003DE.NMCIDADE,
					G002DE.IDG002,
					G002DE.CDESTADO
				
				ORDER BY 
					G046.IDG046,
					G048.IDG048

				 ${sqlPaginate}`;

			parm.bindValues = bindValues;
            var objRet = await gdao.executar(parm, res, next);
    
            return utils.construirObjetoRetornoBD(objRet);    

        } catch (err) {

            throw err;

		}
		
	}
	
	//-----------------------------------------------------------------------\\	

	api.buscaRecusa4plTransporte = async function (req, res, next) {

		try {

			var parm = {};

			var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);

		parm.sql = 
				`SELECT 
					G046.IDG046,					
					G046.DTAGENDA,
					G046.DTPRESAI,
					G046.DTSAICAR,
					TO_CHAR(G046.DTCARGA, 'DD/MM/YYYY HH24:MI') DTCARGA,
					TO_CHAR(G046.DTCOLATU, 'DD/MM/YYYY') DTCOLATU,
					ROUND (G046.PSCARGA, 2)  PSCARGA,
					ROUND (G046.VRCARGA, 2)  VRCARGA,
					G046.SNCARPAR,
					G046.TPTRANSP,

					CASE
						WHEN G046.SNCARPAR = 'S' THEN 'LTL' 
						ELSE 'FTL'
					END TPOCUPAC,

					CASE
						WHEN G046.TPTRANSP = 'T' THEN 'TRANSFERÊNCIA' 
						WHEN G046.TPTRANSP = 'V' THEN 'VENDA' 
						WHEN G046.TPTRANSP = 'D' THEN 'DEVOLUÇÃO' 
						WHEN G046.TPTRANSP = 'R' THEN 'RECUSA' 
						WHEN G046.TPTRANSP = 'G' THEN 'RETORNO AG' 
						ELSE 'OUTRO'
					END TPOPERAC,
					
					G030.IDG030,
					G030.DSTIPVEI   G030_DSTIPVEI,
				
					G024.IDG024,
					G024.NMTRANSP,
					
					UPPER(G003RE.NMCIDADE) || '/' || G002RE.CDESTADO NMCIDORI,
					UPPER(G003DE.NMCIDADE) || '/' || G002DE.CDESTADO NMCIDDES,

					LISTAGG(G043.IDG043, ',')  WITHIN GROUP(ORDER BY G043.CDDELIVE) IDG043,					
					LISTAGG(G043.CDDELIVE, ',')  WITHIN GROUP(ORDER BY G043.CDDELIVE) CDDELIVE,
					LISTAGG(G043.NRNOTA, ',')  WITHIN GROUP(ORDER BY G043.NRNOTA) NRNOTA,
										
					COUNT(*) OVER() COUNT_LINHA
			
				FROM G046 -- CARGAS
				
				INNER JOIN G030 -- TIPO DE VEICULO
					ON G030.IDG030 = G046.IDG030
					
				INNER JOIN G024 -- TRANSPORTADORA
					ON G024.IDG024 = G046.IDG024

				INNER JOIN (SELECT IDG046, MIN(NRSEQETA) ORIGEM, MAX(NRSEQETA) DESTINO FROM G048 GROUP BY IDG046) ETAPA
					ON ETAPA.IDG046 = G046.IDG046	

				INNER JOIN G048 G048O -- ORIGEM
					ON G048O.IDG046 = G046.IDG046
					AND G048O.NRSEQETA = ETAPA.ORIGEM

				INNER JOIN G048 G048D -- DESTINO
					ON G048D.IDG046 = G046.IDG046
					AND G048D.NRSEQETA = ETAPA.DESTINO

				INNER JOIN G048
					ON G048.IDG046 = G046.IDG046
                     
				INNER JOIN G049 
					ON G049.IDG048 = G048.IDG048
					
				INNER JOIN G043
					ON G043.IDG043 = G049.IDG043
				
				INNER JOIN G005 G005RE -- REMETENTE
					ON G005RE.IDG005 = G048O.IDG005OR
				
				INNER JOIN G005 G005DE -- DESTINATÁRIO
					ON G005DE.IDG005 = G048D.IDG005DE
				
				INNER JOIN G003 G003RE -- CIDADE REMETENTE
					ON G003RE.IDG003 = G005RE.IDG003
					
				INNER JOIN G003 G003DE -- CIDADE DESTINATÁRIO
					ON G003DE.IDG003 = G005DE.IDG003	
				
				INNER JOIN G002 G002RE -- ESTADO REMETENTE
					ON G002RE.IDG002 = G003RE.IDG002
					
				INNER JOIN G002 G002DE -- ESTADO DESTINATÁRIO
					ON G002DE.IDG002 = G003DE.IDG002	

					${sqlWhere}
					AND G046.TPTRANSP = 'R'

				GROUP BY 
				
					G046.IDG046,					
					G046.DTAGENDA,
					G046.DTPRESAI,
					G046.DTSAICAR,
					G046.DTCARGA,
					G046.DTCOLATU,
					G046.PSCARGA,
					G046.VRCARGA,
					G046.SNCARPAR,
					G046.TPTRANSP,
	
					G030.IDG030,
					G030.DSTIPVEI,
					
					G024.IDG024,
					G024.NMTRANSP,
						
					UPPER(G003RE.NMCIDADE) || '/' || G002RE.CDESTADO,
					UPPER(G003DE.NMCIDADE) || '/' || G002DE.CDESTADO
				
				${sqlOrder} ${sqlPaginate}`;

			parm.bindValues = bindValues;
            var objRet = await gdao.executar(parm, res, next);
    
            return utils.construirObjetoRetornoBD(objRet);

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\

	api.buscarDadosOtimizacao = async function (req, res, next) {

		try {

			var sql =
				`SELECT
					G043.IDG043,
					G043.IDG014,
					G043.IDG005RE,
					G043.IDG005DE,
					G043.IDG009PS,
					G043.CDDELIVE,
					G043.TPDELIVE,
					G043.STETAPA,
					G043.NRNOTA,
					G043.PSBRUTO,
					G043.PSLIQUID,
					G043.VRVOLUME,
					G043.VRDELIVE,

					G005RE.NMCLIENT NMCLIREM,
					G003RE.NMCIDADE NMCIDREM,
					G003RE.IDG003   CDCIDREM,
					G002RE.CDESTADO CDESTREM,

					NVL(G005RE.NRLATITU, G003RE.NRLATITU) NRLATITURE,
					NVL(G005RE.NRLONGIT, G003RE.NRLONGIT) NRLONGITRE,

					G005DE.NMCLIENT NMCLIDES,
					G003DE.NMCIDADE NMCIDDES,
					G003DE.IDG003   CDCIDDES,
					G002DE.CDESTADO CDESTDES,

					NVL(G005DE.NRLATITU, G003DE.NRLATITU) NRLATITUDE,
					NVL(G005DE.NRLONGIT, G003DE.NRLONGIT) NRLONGITDE,

					G009.CDUNIDAD,
					G009.DSUNIDAD,
					
					G046.IDG046,
					G046.IDG030,
					G046.IDG024,

					G046.IDG031M1,
					G046.IDG031M2,
					G046.IDG031M3,

					G046.IDG032V1,
					G046.IDG032V2,
					G046.IDG032V3,

					G030.QTCAPPES

				FROM
					G043 -- DELIVERY

					INNER JOIN G009 -- UNIDADE
						ON G009.IDG009 = G043.IDG009PS

					INNER JOIN G005 G005RE -- REMETENTE 
						ON G005RE.IDG005 = G043.IDG005RE

					INNER JOIN G003 G003RE -- CIDADE REMETENTE
						ON G003RE.IDG003 = G005RE.IDG003

					INNER JOIN G002 G002RE -- ESTADO REMETENTE
						ON G002RE.IDG002 = G003RE.IDG002

					INNER JOIN G005 G005DE -- DESTINATARIO
						ON G005DE.IDG005 = G043.IDG005DE

					INNER JOIN G003 G003DE -- CIDADE DESTINATARIO
						ON G003DE.IDG003 = G005DE.IDG003

					INNER JOIN G002 G002DE -- ESTADO DESTINATARIO
						ON G002DE.IDG002 = G003DE.IDG002

					LEFT JOIN G049 -- ETAPAS x DELIVERY
						ON G049.IDG043 = G043.IDG043RF

					LEFT JOIN G048 -- ETAPAS
						ON G048.IDG048 = G049.IDG048

					LEFT JOIN G046 -- CARGAS
						ON G046.IDG046 = G048.IDG046
						AND G046.SNDELETE = 0 
						AND G046.STCARGA <> 'C'

					LEFT JOIN G030 -- TIPO DO VEICULO
						ON G030.IDG030 = G046.IDG030
					
					LEFT JOIN G031 G031M1 -- MOTORISTA 1
						ON G031M1.IDG031 = G046.IDG031M1

					LEFT JOIN G031 G031M2 -- MOTORISTA 2
						ON G031M2.IDG031 = G046.IDG031M2

					LEFT JOIN G031 G031M3 -- MOTORISTA 3
						ON G031M3.IDG031 = G046.IDG031M3

					LEFT JOIN G032 G032V1 -- VEICULO 1
						ON G032V1.IDG032 = G046.IDG032V1

					LEFT JOIN G032 G032V2 -- VEICULO 2
						ON G032V2.IDG032 = G046.IDG032V2

					LEFT JOIN G032 G032V3 -- VEICULO 3
						ON G032V3.IDG032 = G046.IDG032V3

				WHERE
					G043.SNDELETE = 0
					AND G043.TPDELIVE IN ('3', '4')
					AND G043.IDG043 IN (${req.arDelivery})`;

			return await gdao.executar({ sql }, res, next);

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\

    return api;   
}
