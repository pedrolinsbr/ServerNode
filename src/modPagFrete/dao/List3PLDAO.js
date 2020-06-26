module.exports = function (app, cb) {

	const utils = app.src.utils.FuncoesObjDB;
	const gdao  = app.src.modGlobal.controllers.dbGearController;

	var api = {};

	//-----------------------------------------------------------------------\\
    /**
    * @description Lista as cargas que faltam documentação do 3PL
    * @function listSync3PL
    * @author Rafael Delfino Calzado
    * @since 08/11/2019
    *
    * @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
	//-----------------------------------------------------------------------\\    

	api.listSync3PL = async function (req) {

		try {

			var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);

			var arCols = 
				[
					'G046.IDG046',
					'G046.STCARGA',
					'G046.TPTRANSP',
					'G046.SNCARPAR',
					'G046.PSCARGA',
					'G046.VRCARGA',
					'G046.DTSAICAR',
					'G046.QTDISPER',
					'G046.QTDISBAS',
					'G028.IDG028',
					'G028.NMARMAZE',
					'G024.IDG024',
					'G024.NMTRANSP',
					'G003O.IDG003',
					'G003O.NMCIDADE',
					'G002O.IDG002',
					'G002O.CDESTADO',
					'G003D.IDG003',
					'G003D.NMCIDADE',
					'G002D.IDG002',
					'G002D.CDESTADO',
					'QSTAAGE.IDH006',
					'QSLOT.HOINICIO',
					'QSLOT.HOFINAL'
				];

			var arColsSel = arCols.slice(0);
			var start = arColsSel.length;

			arColsSel[start-11] += ' IDCIDORI';
			arColsSel[start-10]  = "UPPER(G003D.NMCIDADE) || ' / ' || G002D.CDESTADO NMCIDDES";
			arColsSel[start-9]  += ' IDESTORI';
			arColsSel[start-8]  += ' CDESTORI';			
			arColsSel[start-7]  += ' IDCIDDES';
			arColsSel[start-6]   = "UPPER(G003O.NMCIDADE) || ' / ' || G002O.CDESTADO NMCIDORI";
			arColsSel[start-5]  += ' IDESTDES';
			arColsSel[start-4]  += ' CDESTDES';

			var sql = 
				`SELECT 
					${arColsSel.join()},	

					CASE 
						WHEN G046.SNCARPAR = 'S' THEN 'LTL'
						WHEN G046.SNCARPAR = 'N' THEN 'FTL'
						ELSE 'ITL'
					END TPLOAD, 
					
					CASE   
						WHEN G046.TPTRANSP = 'T' THEN 'TRANSFERÊNCIA' 
						WHEN G046.TPTRANSP = 'V' THEN 'VENDA' 
						WHEN G046.TPTRANSP = 'D' THEN 'DEVOLUÇÃO' 
						WHEN G046.TPTRANSP = 'R' THEN 'RECUSA' 
						WHEN G046.TPTRANSP = 'G' THEN 'RETORNO AG' 
						ELSE 'OUTRO'
					END DSTPTRA,
					
					COUNT(DISTINCT G0514PL.IDG051) TTCTE4PL,
					COUNT(DISTINCT G064.IDG051AN) TTCTE3PL,
					COUNT(DISTINCT G083.IDG083) TTNFE,

					COUNT(*) OVER() COUNT_LINHA
				
				FROM G046 -- CARGA
				
				INNER JOIN G028 -- ARMAZEM
					ON G028.IDG028 = G046.IDG028
				
				INNER JOIN G024 -- 3PL
					ON G024.IDG024 = G046.IDG024
				
				INNER JOIN (SELECT IDG046, MIN(NRSEQETA) INICIO, MAX(NRSEQETA) FIM FROM G048 GROUP BY IDG046) ETAPA
					ON ETAPA.IDG046 = G046.IDG046
				
				INNER JOIN G048 G048O -- ETAPA ORIGEM
					ON G048O.IDG046 = G046.IDG046                        
					AND G048O.NRSEQETA = ETAPA.INICIO
				
				INNER JOIN G048 G048D -- ETAPA DESTINO
					ON G048D.IDG046 = G046.IDG046                        
					AND G048D.NRSEQETA = ETAPA.FIM
				
				INNER JOIN G005 G005O -- CLIENTE ORIGEM
					ON G005O.IDG005 = G048O.IDG005OR
				
				INNER JOIN G005 G005D -- CLIENTE DESTINO 
					ON G005D.IDG005 = G048D.IDG005DE
				
				INNER JOIN G003 G003O -- CIDADE DA ORIGEM
					ON G003O.IDG003 = G005O.IDG003
				
				INNER JOIN G003 G003D -- CIDADE DESTINO
					ON G003D.IDG003 = G005D.IDG003
				
				INNER JOIN G002 G002O -- UF ORIGEM
					ON G002O.IDG002 = G003O.IDG002
				
				INNER JOIN G002 G002D -- UF DESTINO
					ON G002D.IDG002 = G003D.IDG002	
				
				INNER JOIN (
				
					SELECT 
						H024.IDG046, 
						MAX(H006.IDH006) IDH006 
					FROM H024 -- AGENDAMENTOS
					INNER JOIN H006 ON -- STATUS DO AGENDAMENTO
						H006.IDH006 = H024.IDH006
					WHERE 
						H024.SNDELETE = 0 
						AND H006.SNDELETE = 0
						AND H006.TPMOVTO = 'C'
						AND H006.STAGENDA NOT IN (9,10) -- FALTOU, CANCELADO
					GROUP BY H024.IDG046
				
				) QSTAAGE ON 
					QSTAAGE.IDG046 = G046.IDG046
				
				INNER JOIN (
				
					SELECT 
						H007.IDH006, 
						MAX(H007.IDH007) IDH007,
						MAX(H007.HOINICIO) HOINICIO,
						MAX(H007.HOFINAL) HOFINAL
					FROM H007 -- SLOTS
					WHERE 
						H007.SNDELETE = 0
					GROUP BY H007.IDH006
				
				) QSLOT ON  
					QSLOT.IDH006 = QSTAAGE.IDH006
				
				INNER JOIN G048 -- ETAPA
					ON G048.IDG046 = G046.IDG046 
					
				INNER JOIN G049 -- DELIVERIES X ETAPA
					ON G049.IDG048 = G048.IDG048 			 

                LEFT JOIN G052 -- CTE x NF
					ON G052.IDG051 = G049.IDG051
					AND G052.IDG043 = G049.IDG043

				LEFT JOIN G051 G0514PL -- CTE4PL
					ON G0514PL.IDG051 = G052.IDG051

                LEFT JOIN G083 -- NF
                    ON G083.IDG083 = G052.IDG083					
					
				LEFT JOIN G064 -- CTE4PL x CTE3PL
					ON G064.IDG051AN = G0514PL.IDG051 
					
				LEFT JOIN G051 G0513PL -- CTE3PL
					ON G0513PL.IDG051 = G064.IDG051AT
					
				${sqlWhere}
					AND G046.STCARGA <> 'C'
					AND G024.IDG023 <> 2 -- 3PL NÃO BRAVO
					-- AND TRUNC(G046.DTCOLATU) = TRUNC(CURRENT_DATE)

                    AND (
                        	(G0514PL.IDG051 IS NULL) OR 
                        	(
                            	(G0514PL.SNDELETE = 0) AND 
                            	(G0514PL.STCTRC = 'A')
                        	)
						)
					
					AND (
                        	(G0513PL.IDG051 IS NULL) OR 
                        	(
                            	(G0513PL.SNDELETE = 0) AND 
                            	(G0513PL.STCTRC = 'A')
                        	)
						)

                    AND (
                        	(G083.IDG083 IS NULL) OR 
                        	(G083.SNDELETE = 0)
                    	)
					
				GROUP BY 
					${arCols.join()}

				HAVING 
					SUM(CASE 
						WHEN G0514PL.IDG051 IS NULL THEN 1 ELSE 0
					END) = 0 
					
					AND

					SUM(CASE 
						WHEN G083.IDG083 IS NULL THEN 1 ELSE 0
					END) = 0 

					AND

					SUM(CASE 
						WHEN G0513PL.IDG051 IS NULL THEN 1 ELSE 0
					END) > 0 
					
				${sqlOrder} ${sqlPaginate}
				`;

			var objConn = await gdao.controller.getConnection(null, req.UserID);

			var arRS = await gdao.execute({ sql, objConn, bindValues });

			return utils.construirObjetoRetornoBD(arRS);

		} catch (err) {

			throw err;

		}

	}

    //-----------------------------------------------------------------------\\
    /**
    * @description Apresenta os dados dos CTe's e NFe's sincronizadas com a carga até o momento
    * @function detailSync3PL
    * @author Rafael Delfino Calzado
    * @since 10/12/2019
    *
    * @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\    

    api.detailSync3PL = async function (req, res, next) {

        try {

			var sql = 
				`SELECT 
					G046.IDG046,
					G046.TPTRANSP,
					G046.SNCARPAR,
					G046.PSCARGA,
					G046.VRCARGA,
					G046.QTDISPER,
					G024.IDG024,
					G024.NMTRANSP,
					O005.IDO005,
					NVL(O005.VRFREPAG, 0) VRFREPAG,
					UPPER(G003O.NMCIDADE) || ' / ' || G002O.CDESTADO  NMCIDORI,
					UPPER(G003D.NMCIDADE) || ' / ' || G002D.CDESTADO  NMCIDDES,	
					G0514PL.IDG051 		IDCTE4PL,
					G0514PL.CDCTRC 		CDCTE4PL,
					G0514PL.NRCHADOC	NRCHA4PL,
					G0514PL.VRTOTFRE	VRCTE4PL,
					G005.IDG005,
					G005.NMCLIENT,
					G0513PL.IDG051 		IDCTE3PL,
					G0513PL.CDCTRC 		CDCTE3PL,
					G0513PL.NRCHADOC 	NRCHA3PL,
					NVL(G0513PL.VRTOTFRE, 0) VRCTE3PL,
					G049.IDG049,
					G049.IDG043,
					G083.IDG083,
                    G083.IDF004,
                    G083.NRNOTA,
                    G083.VRNOTA,
                    TO_CHAR(G083.DTEMINOT, 'DD/MM/YYYY') AS DTEMINOT,
                    G083.NRCHADOC AS NRCHANFE,
					CASE   
						WHEN G046.TPTRANSP = 'T' THEN 'TRANSFERÊNCIA' 
						WHEN G046.TPTRANSP = 'V' THEN 'VENDA' 
						WHEN G046.TPTRANSP = 'D' THEN 'DEVOLUÇÃO' 
						WHEN G046.TPTRANSP = 'R' THEN 'RECUSA' 
						WHEN G046.TPTRANSP = 'G' THEN 'RETORNO AG' 
						ELSE 'OUTRO'
					END DSTPTRA,
					CASE
						WHEN G046.SNCARPAR = 'S' THEN 'LTL'
						WHEN G046.SNCARPAR = 'N' THEN 'FTL'
						ELSE 'ITL'
					END TPLOAD
				
				FROM G046 -- CARGA
				
				INNER JOIN G024 -- 3PL
					ON G024.IDG024 = G046.IDG024
					
				LEFT JOIN O005 -- OFERECIMENTO ATIVO
					ON O005.IDG046 = G046.IDG046
					AND O005.IDG024 = G046.IDG024
				
				INNER JOIN  
				(
					SELECT 
						IDG046, 
						MIN(NRSEQETA) INICIO,
						MAX(NRSEQETA) FIM 
					FROM G048
					GROUP BY IDG046
				) ETAPA 
					ON ETAPA.IDG046 = G046.IDG046
					
				INNER JOIN G048 G048O -- ETAPA ORIGEM
					ON G048O.IDG046 = ETAPA.IDG046
					AND G048O.NRSEQETA = ETAPA.INICIO
				
				INNER JOIN G048 G048D -- ETAPA DESTINO
					ON G048D.IDG046 = ETAPA.IDG046
					AND G048D.NRSEQETA = ETAPA.FIM	
					
				INNER JOIN G005 G005O -- CLIENTE ORIGEM
					ON G005O.IDG005 = G048O.IDG005OR
					
				INNER JOIN G005 G005D -- CLIENTE DESTINO
					ON G005D.IDG005 = G048D.IDG005DE
					
				INNER JOIN G003 G003O -- CIDADE ORIGEM
					ON G003O.IDG003 = G005O.IDG003
					
				INNER JOIN G003 G003D -- CIDADE DESTINO
					ON G003D.IDG003 = G005D.IDG003
					
				INNER JOIN G002 G002O -- ESTADO ORIGEM
					ON G002O.IDG002 = G003O.IDG002
					
				INNER JOIN G002 G002D -- ESTADO DESTINO
					ON G002D.IDG002 = G003D.IDG002	
					
				INNER JOIN G048 -- ETAPA
					ON G048.IDG046 = G046.IDG046
				
				INNER JOIN G049 -- DELIVERIES x ETAPA
					ON G049.IDG048 = G048.IDG048

				INNER JOIN G052 -- CTE x NF
					ON G052.IDG051 = G049.IDG051
					AND G052.IDG043 = G049.IDG043	

                INNER JOIN G083 -- NF
                	ON G083.IDG083 = G052.IDG083					
					
				INNER JOIN G051 G0514PL -- CTE 4PL
					ON G0514PL.IDG051 = G052.IDG051

				INNER JOIN G005 -- DESTINATARIO
                    ON G005.IDG005 = G0514PL.IDG005DE  
					
				LEFT JOIN G064 -- CTE 4PL x CTE 3PL
					ON G064.IDG051AN = G0514PL.IDG051
					
				LEFT JOIN G051 G0513PL -- CTE 3PL
					ON G0513PL.IDG051 = G064.IDG051AT
					
				WHERE 
					G046.SNDELETE = 0
					AND G0514PL.SNDELETE = 0
					AND G0514PL.STCTRC = 'A'
					AND G046.IDG046 = ${req.params.id}
					
				ORDER BY 
					G0514PL.IDG051,
					G0513PL.IDG051,
					G049.IDG043				
				`;

			var objConn = await gdao.controller.getConnection(null, req.UserID);

			return await gdao.execute({ sql, objConn });

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\

	return api;

}