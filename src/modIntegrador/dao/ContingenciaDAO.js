module.exports = function (app, cb) {

	const tmz = app.src.utils.DataAtual;
	const fldAdd = app.src.modGlobal.controllers.XFieldAddController;
	var db = app.config.database;
	var utils = app.src.utils.FuncoesObjDB;
	var api = {};
    api.controller = app.config.ControllerBD;

    //-----------------------------------------------------------------------\\

	/**
	 * @description Relatorio de Contingencia
	 * @author Luiz Gustavo Borges Bosco
	 * @since 18/12/2018
	 *
	 * @async
	 * @function RelatorioContingencia
	 * @return {Array} 
	 * @throws {Object} 
	*/

	api.listarContingencia = async function (req, res, next) {
		var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, "CARGA", true);

		return await db.execute(
			{
                sql: `
                SELECT
				---------------------------------DELIVERY----------------------------------------
                    DELIVERY.CDDELIVE 									DELIVERY_CDDELIVE,
                    
                    'America/São_Paulo' 								AS TIMEZONE,
				
				-----------------------------CARGAS----------------------------------------
					CARGA.IDG046 									CARGA_IDG046,
					CASE
						WHEN CARGA.SNCARPAR = 'S' THEN 'LTL'
						WHEN CARGA.SNCARPAR = 'N' THEN 'FTL'
					END 											CARGA_SNCARPAR,
						UPPER(NVL(VE01.NRPLAVEI, CARGA.NRPLAVEI))	NRPLACA1,
						ROUND(NVL(CARGA.QTDISTOD, CARGA.QTDISPER), 0) DISTANCE,
						CARGA.NRSEQETA 								CARGA_NRSEQETA,
						CARGA.SNDELETE								CARGA_SNDELETE,
									
				------------------------------TRANSPORTADORA---------------------------------
					TRANSPORTADORA.NMTRANSP 						TRANSPORTADORA_NOME,
					
					CASE
                        WHEN TROPCID.IDTRAOPE IS NULL THEN TROPUF.IDTRAOPE
                        ELSE TROPCID.IDTRAOPE
                    END IDTRANSF,
                    					
				--------------------------------VEICULOS-------------------------------------
					VEICULO.IDTIPVEI 								TIPOVEICULO_ID,
					
				-- MILESTONES COM REASON CODES
				-------------------------AGP----------------------------------
					AGP.DTALTEVE    			DT_AGP,
					--ALTERACAO_AGP.DTALTEVE   	DTALTERACAO_AGP, --SE HOUVE ALTERAÇÃO DA PREVISÃO
					REASONCODE_AGP.IDREACOD 	REASONCODE_AGP,
				
				-------------------------EAD----------------------------------
					EAD.DTALTEVE 				DT_EAD,
					--ALTERACAO_EAD.DTALTEVE   	DTALTERACAO_EAD, --SE HOUVE ALTERAÇÃO DA PREVISÃO
					REASONCODE_EAD.IDREACOD 	REASONCODE_EAD,
				
				-------------------------ACP----------------------------------
					--ACP.DTALTEVE  				DT_ACP,
					--REASONCODE_ACP.IDREACOD 	REASONCODE_ACP,
									
				-------------------------AAD----------------------------------
					AAD.DTALTEVE	 			DT_AAD,
					REASONCODE_AAD.IDREACOD 	REASONCODE_AAD,
				
				-------------------------CCD----------------------------------
					CCD.DTALTEVE	 			DT_CCD,
					--ALTERACAO_CCD.DTALTEVE   	DTALTERACAO_CCD, --SE HOUVE ALTERAÇÃO DA PREVISÃO
					REASONCODE_CCD.IDREACOD 	REASONCODE_CCD,
					
				-------------------------ERO----------------------------------
					ERO.DTALTEVE	 			DT_ERO,
					--ALTERACAO_ERO.DTALTEVE   	DTALTERACAO_ERO, --SE HOUVE ALTERAÇÃO DA PREVISÃO
					REASONCODE_ERO.IDREACOD 	REASONCODE_ERO,
					
				-------------------------EPC----------------------------------
					EPC.DTALTEVE	 			DT_EPC,
					--ALTERACAO_EPC.DTALTEVE   	DTALTERACAO_EPC, --SE HOUVE ALTERAÇÃO DA PREVISÃO
					REASONCODE_EPC.IDREACOD 	REASONCODE_EPC,
					
				-------------------------RPC----------------------------------
					--RPC.DTALTEVE	 			DT_RPC,
					--REASONCODE_RPC.IDREACOD 	REASONCODE_AAD,
					
				-------------------------RRO----------------------------------
					--RRO.DTALTEVE	 			DT_RRO,
					--REASONCODE_RRO.IDREACOD 	REASONCODE_RRO,
					
					
					COUNT(DELIVERY.IDG043) OVER () AS COUNT_LINHA
				
				FROM G043 DELIVERY
					
				--DELIVERY-----------------------------------------------
				INNER JOIN G005 DELIVERY_REMETENTE
					ON DELIVERY_REMETENTE.IDG005 = DELIVERY.IDG005RE
					AND DELIVERY_REMETENTE.SNDELETE = 0
					AND DELIVERY.SNDELETE = 0
					AND DELIVERY.STDELIVE NOT LIKE 'D'
				
				--OPERACAO----------------------------------------------------------------------------------------------------	
				INNER JOIN G014 OPERACAO
					ON OPERACAO.IDG014 = DELIVERY.IDG014
					AND OPERACAO.IDG097DO = 145 -- CHKRDC
				
				--CARGA E PARADA-------------------------------------------------------------------------------	
				LEFT JOIN (
						SELECT
							CARGA.IDG046,
							CARGA.DTAGENDA,
							CARGA.PSCARGA,
							CARGA.VRCARGA,
							CARGA.SNCARPAR,
							CARGA.STCARGA,
							CARGA.IDG024,
							CARGA.IDG030,
                            CARGA.IDG032V1,
                            CARGA.SNDELETE,
							PARADA.IDG048,
							PARADA.NRSEQETA,
							PARADA.QTDISPER,
							PARADA.QTDISTOD,
							CARGA.NRPLAVEI,
							G049.IDG043
						FROM G046 CARGA
						INNER JOIN G048 PARADA
							ON PARADA.IDG046 = CARGA.IDG046
						INNER JOIN G049
							ON G049.IDG048 = PARADA.IDG048
						WHERE CARGA.STCARGA <> 'C'
							AND CARGA.SNDELETE = 0) CARGA
					ON CARGA.IDG043 = DELIVERY.IDG043
				
				--TRANSPORTADORA--------------------------------------------------------------------------	
				LEFT JOIN G024 TRANSPORTADORA
					ON TRANSPORTADORA.IDG024 = CARGA.IDG024
					AND TRANSPORTADORA.SNDELETE = 0
					
					INNER JOIN (SELECT IDG046, MIN(NRSEQETA) INICIO FROM G048 GROUP BY IDG046) ETAPA
                ON ETAPA.IDG046 = CARGA.IDG046
					
					INNER JOIN G048 G048O --ETAPA INICIAL
                ON G048O.IDG046 = CARGA.IDG046
                AND G048O.NRSEQETA = ETAPA.INICIO

				INNER JOIN G022 G022O --ORIGEM
					ON G022O.IDG005 = G048O.IDG005OR
					AND G022O.SNDELETE = 0

				INNER JOIN G005 --CLIENTE
					ON G005.IDG005 = G022O.IDG005
					AND G005.SNDELETE = 0
					
				INNER JOIN G003 --CIDADE
					ON G003.IDG003 = G005.IDG003
					AND G003.SNDELETE = 0
	
				INNER JOIN I014 --CCUF
					ON I014.IDG002 = G003.IDG002
					AND I014.SNDELETE = 0
	
				INNER JOIN G056 TROPUF -- OPERADOR DE TRANSPORTE UF
					ON TROPUF.IDG024 = I014.IDG024
					AND TROPUF.SNDELETE = 0
	
				LEFT JOIN I014 CCCID
					ON CCCID.IDG002  = G003.IDG002
					AND CCCID.IDG003 = G003.IDG003
					AND CCCID.SNDELETE = 0
	
				LEFT JOIN G056 TROPCID -- OPERADOR DE TRANSPORTE CIDADE
					ON TROPCID.IDG024 = CCCID.IDG024
					AND TROPCID.SNDELETE = 0
				
				--TIPO DE VEICULO-------------------------------------------------------------------------	
				LEFT JOIN G030 TIPO_VEICULO
					ON TIPO_VEICULO.IDG030 = CARGA.IDG030
					AND TIPO_VEICULO.SNDELETE = 0
				
				--VEICULO---------------------------------------------------------------------------------	
				LEFT JOIN I011 VEICULO
					ON VEICULO.IDG030 = TIPO_VEICULO.IDG030 
					AND VEICULO.SNDELETE = 0
					
				LEFT JOIN G032 VE01 -- VEICULO 1
	            	ON VE01.IDG032 = CARGA.IDG032V1
	            	AND VE01.SNDELETE = 0
					
				
				--MILESTONES E REASON CODES
				--AGP-------------------------------------------------------------------------
				LEFT JOIN(SELECT
						IDG048,
						/*MIN(IDI013) PRIMEIRO,
						MAX(IDI013) ALTERACAO*/
						MAX(IDI013) IDI013
						FROM I013 
						WHERE IDI001 = 16 
							AND SNDELETE = 0
						GROUP BY IDG048) ID_AGP
					ON ID_AGP.IDG048 = CARGA.IDG048

				LEFT JOIN I013 AGP
					--ON AGP.IDI013 = ID_AGP.PRIMEIRO
					ON AGP.IDI013 = ID_AGP.IDI013
					AND AGP.SNDELETE = 0
					AND AGP.IDI007 IS NULL

				/*LEFT JOIN I013 ALTERACAO_AGP
					ON ALTERACAO_AGP.IDI013 = ID_AGP.ALTERACAO
					AND ALTERACAO_AGP.STPROPOS = 'A'
					AND ALTERACAO_AGP.SNDELETE = 0*/

				LEFT JOIN I007 REASONCODE_AGP
					ON REASONCODE_AGP.IDI007 = AGP.IDI007

				--EAD-----------------------------------------------------------------------
				LEFT JOIN(SELECT
						IDG048,
						/*MIN(IDI013) PRIMEIRO,
						MAX(IDI013) ALTERACAO*/
						MAX(IDI013) IDI013
						FROM I013 
						WHERE IDI001 = 17
							AND SNDELETE = 0
						GROUP BY IDG048) ID_EAD
					ON ID_EAD.IDG048 = CARGA.IDG048
						
				LEFT JOIN I013 EAD
					--ON EAD.IDI013 = ID_EAD.PRIMEIRO
					ON EAD.IDI013 = ID_EAD.IDI013
					AND EAD.SNDELETE = 0
					AND EAD.IDI007 IS NULL
						
				/*LEFT JOIN I013 ALTERACAO_EAD
					ON ALTERACAO_EAD.IDI013 = ID_EAD.ALTERACAO	
					AND ALTERACAO_EAD.STPROPOS = 'A'
					AND ALTERACAO_EAD.SNDELETE = 0*/
					
				LEFT JOIN I007 REASONCODE_EAD
					ON REASONCODE_EAD.IDI007 = EAD.IDI007

				--ACP------------------------------------------------------
				LEFT JOIN(SELECT
						IDG048,
						MAX(IDI013) IDI013
						FROM I013
						WHERE IDI001 = 19 
							AND SNDELETE = 0
						GROUP BY IDG048) ID_ACP
					ON ID_ACP.IDG048 = CARGA.IDG048

				LEFT JOIN I013 ACP
					ON ACP.IDI013 = ID_ACP.IDI013	
					AND ACP.SNDELETE = 0

				LEFT JOIN I007 REASONCODE_ACP
					ON REASONCODE_ACP.IDI007 = ACP.IDI007

				--AAD------------------------------------------------
				LEFT JOIN(SELECT 
						IDG048, 
						MAX(IDI013) IDI013
						FROM I013 
						WHERE IDI001 = 21
							AND SNDELETE = 0
						GROUP BY IDG048) ID_AAD
					ON ID_AAD.IDG048 = CARGA.IDG048
				
				LEFT JOIN I013 AAD
					ON AAD.IDI013 = ID_AAD.IDI013
					AND AAD.SNDELETE = 0
					
				LEFT JOIN I007 REASONCODE_AAD
					ON REASONCODE_AAD.IDI007 = AAD.IDI007
					
				--CCD------------------------------------------------
				LEFT JOIN(SELECT 
						IDG048, 
						/*MIN(IDI013) PRIMEIRO,
						MAX(IDI013) ALTERACAO*/
						MAX(IDI013) IDI013
						FROM I013 
						WHERE IDI001 = 33
							AND SNDELETE = 0
						GROUP BY IDG048) ID_CCD
					ON ID_CCD.IDG048 = CARGA.IDG048
				
				LEFT JOIN I013 CCD
					--ON CCD.IDI013 = ID_CCD.PRIMEIRO
					ON CCD.IDI013 = ID_CCD.IDI013
					AND CCD.SNDELETE = 0
				
				/*LEFT JOIN I013 ALTERACAO_CCD
					ON ALTERACAO_CCD.IDI013 = ID_CCD.ALTERACAO	
					AND ALTERACAO_CCD.STPROPOS = 'A'
					AND ALTERACAO_CCD.SNDELETE = 0*/
					
				LEFT JOIN I007 REASONCODE_CCD
					ON REASONCODE_CCD.IDI007 = CCD.IDI007
					
				--EPC------------------------------------------------
				LEFT JOIN(SELECT 
						IDG048, 
						/*MIN(IDI013) PRIMEIRO,
						MAX(IDI013) ALTERACA*/
						MAX(IDI013) IDI013
						FROM I013 
						WHERE IDI001 = 34
							AND SNDELETE = 0
						GROUP BY IDG048) ID_EPC
					ON ID_EPC.IDG048 = CARGA.IDG048	
				
				LEFT JOIN I013 EPC
					--ON EPC.IDI013 = ID_EPC.PRIMEIRO
					ON EPC.IDI013 = ID_EPC.IDI013	
					AND EPC.SNDELETE = 0
					
				/*LEFT JOIN I013 ALTERACAO_EPC
					ON ALTERACAO_EPC.IDI013 = ID_EPC.ALTERACAO	
					AND ALTERACAO_EPC.STPROPOS = 'A'
					AND ALTERACAO_EPC.SNDELETE = 0*/
					
				LEFT JOIN I007 REASONCODE_EPC
					ON REASONCODE_EPC.IDI007 = EPC.IDI007
					
				--ERO------------------------------------------------
				LEFT JOIN(SELECT 
						IDG048, 
						/*MIN(IDI013) PRIMEIRO,
						MAX(IDI013) ALTERACA*/
						MAX(IDI013) IDI013
						FROM I013 
						WHERE IDI001 = 35
							AND SNDELETE = 0
						GROUP BY IDG048) ID_ERO
					ON ID_ERO.IDG048 = CARGA.IDG048	
				
				LEFT JOIN I013 ERO
					--ON ERO.IDI013 = ID_ERO.PRIMEIRO
					ON ERO.IDI013 = ID_ERO.IDI013	
					AND ERO.SNDELETE = 0
					
				/*LEFT JOIN I013 ALTERACAO_ERO
					ON ALTERACAO_ERO.IDI013 = ID_ERO.ALTERACAO	
					AND ALTERACAO_ERO.STPROPOS = 'A'
					AND ALTERACAO_ERO.SNDELETE = 0*/
					
				LEFT JOIN I007 REASONCODE_ERO
					ON REASONCODE_ERO.IDI007 = ERO.IDI007
					
				--RPC------------------------------------------------
				LEFT JOIN(SELECT 
						IDG048, 
						MAX(IDI013) IDI013
						FROM I013 
						WHERE IDI001 = 36
							AND SNDELETE = 0
						GROUP BY IDG048) ID_RPC
					ON ID_RPC.IDG048 = CARGA.IDG048	
				
				LEFT JOIN I013 RPC
					ON RPC.IDI013 = ID_RPC.IDI013	
					AND RPC.SNDELETE = 0
					
				LEFT JOIN I007 REASONCODE_RPC
					ON REASONCODE_RPC.IDI007 = RPC.IDI007
					
				--RRO------------------------------------------------
				LEFT JOIN(SELECT 
						IDG048, 
						MAX(IDI013) IDI013
						FROM I013 
						WHERE IDI001 = 37
							AND SNDELETE = 0
						GROUP BY IDG048) ID_RRO
					ON ID_RRO.IDG048 = CARGA.IDG048	
				
				LEFT JOIN I013 RRO
					ON RRO.IDI013 = ID_RRO.IDI013	
					AND RRO.SNDELETE = 0
					
				LEFT JOIN I007 REASONCODE_RRO
					ON REASONCODE_RRO.IDI007 = RRO.IDI007

					${sqlWhere}
					
				GROUP BY
					DELIVERY.IDG043,
					DELIVERY.CDDELIVE,

					CARGA.IDG046,
					CARGA.NRSEQETA,
					CARGA.SNCARPAR,
					CARGA.NRPLAVEI,
					CARGA.QTDISPER,
					CARGA.QTDISTOD,
					CARGA.SNDELETE,
					
					TRANSPORTADORA.NMTRANSP	,
					
					TROPUF.IDTRAOPE,
					TROPCID.IDTRAOPE,

					VEICULO.IDTIPVEI, 
					VE01.NRPLAVEI,
						
					AGP.DTALTEVE,
					--ALTERACAO_AGP.DTALTEVE, --SE HOUVE ALTERAÇÃO DA PREVISÃO
					REASONCODE_AGP.IDREACOD,
					
					EAD.DTALTEVE,
					--ALTERACAO_EAD.DTALTEVE, --SE HOUVE ALTERAÇÃO DA PREVISÃO
					REASONCODE_EAD.IDREACOD,
					
					--ACP.DTALTEVE,
					--REASONCODE_ACP.IDREACOD,
					
					AAD.DTALTEVE,
					REASONCODE_AAD.IDREACOD,
					
					CCD.DTALTEVE,
					--ALTERACAO_CCD.DTALTEVE,
					REASONCODE_CCD.IDREACOD,
					
					ERO.DTALTEVE,
					--ALTERACAO_ERO.DTALTEVE,
					REASONCODE_ERO.IDREACOD,
					
					EPC.DTALTEVE,
					--ALTERACAO_EPC.DTALTEVE,
					REASONCODE_EPC.IDREACOD
					
					--RPC.DTALTEVE,
					--REASONCODE_RPC.IDREACOD,
					
					--RRO.DTALTEVE,
					--REASONCODE_RRO.IDREACOD

					${sqlOrder}

					${sqlPaginate}`,
				param: (bindValues != undefined ? bindValues : [])

			}).then((result) => {
				return (utils.construirObjetoRetornoBD(result));

			}).catch((err) => {
				throw err;
			});
	}
    return api;
};