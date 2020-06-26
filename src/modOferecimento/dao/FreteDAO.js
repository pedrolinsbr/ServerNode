
module.exports = function (app, cb) {

	'use strict';

	const db = app.src.modGlobal.controllers.dbGearController;

	var api = {};

	api.db = db;

    //-----------------------------------------------------------------------\\
    /**
     * Soma o valor total da cotação agrupado por tipo de cotação e 3PL
     * @function somaCotacao
     * @author Rafael Delfino Calzado
     * @since 05/12/2019
     *
     * @async 
     * @return {Array}      Retorna um array com o resultado encontrado
     * @throws {Object}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

	api.somaCotacao = async function (parm, objConn) {

		try {

			var arCols =
				[
					'T017.IDG046',
					'T017.TPCOTACA',
					'T017.IDG085',
					'T017.IDG024',
					'G024.NMTRANSP'
				];

			var arTipo = (parm.TPCOTACA) ? parm.TPCOTACA : ["'C'", "'T'"];

			var sql =
				`SELECT 
					${arCols.join()},
					SUM(T018.VRTARIFA) VRFRETE

				FROM T017 -- COTACOES

				LEFT JOIN G024 -- TRANSPORTADORAS
					ON G024.IDG024 = T017.IDG024
					
				INNER JOIN T018 -- TARIFAS DA COTACAO
					ON T018.IDT017 = T017.IDT017
				
				WHERE 
					T017.IDG046 IN (${parm.IDG046.join()})
					AND T017.TPCOTACA IN (${arTipo.join()})
				GROUP BY
					${arCols.join()}
				
				ORDER BY 
					T017.IDG046,
					T017.TPCOTACA,
					T017.IDG024			
				`;

			await db.controller.setConnection(objConn);
			return await db.execute({ sql, objConn });

		} catch (err) {

			throw err;

		}

	}

    //-----------------------------------------------------------------------\\
    /**
     * Remove tarifas de um conjunto de cargas
     * @function removeTarifas
     * @author Rafael Delfino Calzado
     * @since 05/12/2019
     *
     * @async 
     * @return {Object}     Retorna um objeto com o resultado da operação
     * @throws {Object}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

	api.removeTarifas = async function (parm, objConn) {

		try {

			var sql = `DELETE FROM T018 WHERE IDT017 IN (SELECT IDT017 FROM T017 WHERE IDG046 IN (${parm.IDG046}))`;

			await db.controller.setConnection(objConn);
			return await db.execute({ sql, objConn });

		} catch (err) {

			throw err;

		}

	}

    //-----------------------------------------------------------------------\\
    /**
     * Remove as cotações de um conjunto de cargas
     * @function removeCotacoes
     * @author Rafael Delfino Calzado
     * @since 05/12/2019
     *
     * @async 
     * @return {Object}     Retorna um objeto com o resultado da operação
     * @throws {Object}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

	api.removeCotacoes = async function (parm, objConn) {

		try {

			var sql = `DELETE FROM T017 WHERE IDG046 IN (${parm.IDG046})`;

			await db.controller.setConnection(objConn);
			return await db.execute({ sql, objConn });

		} catch (err) {

			throw err;

		}

	}

    //-----------------------------------------------------------------------\\
    /**
     * Consulta as cargas no Backlog do Oferecimento que ainda não possuem cotação
     * @function buscaBacklog
     * @author Rafael Delfino Calzado
     * @since 05/12/2019
     *
     * @async 
     * @return {Array}      Retorna um array com o resultado da operação
     * @throws {Object}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

	api.buscaBacklog = async function (parm, objConn) {

		try {

			var sqlAux = (parm.id) ? `AND IDG046 = ${parm.id}` : ``;

			var qtRows = 5;

			var sql =
				`SELECT 
					IDG046 
				FROM G046 
				WHERE 
					SNDELETE = 0 
					AND STCARGA = 'B'
					AND TPMODCAR IN (2,3) -- 4PL / MISTO
					AND IDG028 IS NOT NULL 
					AND IDG030 IS NOT NULL
					AND IDG024 IS NULL
					${sqlAux}
				ORDER BY IDG046 DESC
				OFFSET 0 ROWS FETCH NEXT ${qtRows} ROWS ONLY`;

			await db.controller.setConnection(objConn);
			return await db.execute({ sql, objConn });

		} catch (err) {

			throw err;

		}

	}

    //-----------------------------------------------------------------------\\
    /**
     * Retorna percentual de ocupação por operação de uma carga
     * @function triagemOperacao
     * @author Rafael Delfino Calzado
     * @since 05/12/2019
     *
     * @async 
     * @return {Array}      Retorna um array com o resultado da operação
     * @throws {Object}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

	api.triagemOperacao = async function (arID, objConn) {

		try {

			var arCols =
				[
					'G046.IDG046',
					'G046.SNCARPAR',
					'G030.QTCAPPES',
					'G014.IDG014',
					'G014.PCMIN4PL'
				];

			var sql =
				`SELECT 
					${arCols.join()},
					104 IDG085,
					MAX(G043.IDG043) IDG043,
					ROUND(((SUM(G043.PSBRUTO) / G030.QTCAPPES) * 100), 2) PCOCUPAC

				FROM G046 -- CARGA

				INNER JOIN G030 -- VEICULO
					ON G030.IDG030 = G046.IDG030

				INNER JOIN G048 -- ETAPA
					ON G048.IDG046 = G046.IDG046 

				INNER JOIN G049 -- DELIVERY x ETAPA
					ON G049.IDG048 = G048.IDG048

				INNER JOIN G043 -- DELIVERY
					ON G043.IDG043 = G049.IDG043 

				INNER JOIN G014 -- OPERAÇÃO
					ON G014.IDG014 = G043.IDG014

				WHERE 
					G046.SNDELETE = 0
					AND G043.SNDELETE = 0
					AND G046.IDG046 IN (${arID.join()})

				GROUP BY
					${arCols.join()}

				ORDER BY 
					G046.IDG046,
					G014.IDG014`;

			await db.controller.setConnection(objConn);
			return await db.execute({ sql, objConn });

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\
	/**
	 * Busca pelos dados da tabela de preço de acordo com os parâmetros
	 * @function api/buscaTabelaFrete
	 * @author Rafael Delfino Calzado
	 * @since 26/11/2019
	 * 
	 * @async
	 * @returns  {Array}    Retorna um array com o resultado da pesquisa
	 * @throws   {Object}   Retorna um objeto com o erro encontrado
	 */
	//-----------------------------------------------------------------------\\

	api.buscaTabelaFrete = async function (parm, objConn) {

		try {

			var sqlAux   = ``;
			var sqlInn   = ``;
			var sqlOpDlv = ``;
			var arOrder = [];

			switch (parm.TPTABELA) {

				case 'P': //PESO
					sqlAux =
						`
						AND G085.TPTABELA = 'P' 
						AND EXISTS 
						(
							SELECT IDG086 
							FROM G086 G086X
							WHERE
								G086X.IDG085 = G085.IDG085
								AND G086X.NRPESO >= QCARGA.PSTOTDEL
							GROUP BY
								G086X.IDG086,
								G086.NRPESO
							HAVING
								MIN(G086X.NRPESO) = G086.NRPESO 
						) 
						`;
					break;

				case 'V': //VEÍCULO
				default:
					sqlAux =
						`
						AND G085.TPTABELA = 'V' 
						AND G086.IDG030 = G046.IDG030
						`;
					break;

			}

			//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

			switch (parm.TPFRETE) {

				case 'T': //TRANSPORTADORA
					sqlAux  += `AND G088.IDG024 IS NOT NULL `;
					arOrder.push('G088.IDG024');
					break;

				case 'C': //CLIENTE
				default:
					sqlInn   = `AND G088.IDG005 = G005O.IDG005 `;
					sqlOpDlv = `AND G043.IDG014 = ${parm.IDG014} `;
					break;


			}

			arOrder.push('G046.IDG046');
			arOrder.push('G048.NRSEQETA');

			//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

			var sql =
				`SELECT
					G046.IDG046,
					G046.IDG030,
					G046.IDG024,
					G046.SNCARPAR,
					G046.TPTRANSP,
					G048.IDG048,
					QCARGA.VRTOTDEL,
					QCARGA.PSTOTDEL,
					QCARGA.TTDELIVE,
					QDEST.TTENTREG,
					G005O.IDG005 IDCLIORI,
					G005D.IDG005 IDCLIDES,
					G005O.IDG003 IDCIDORI,
					G005D.IDG003 IDCIDDES,
					G043.IDG043,
					G043.PSBRUTO,
					G043.VRDELIVE,
					G085.IDG085,
					G088.IDG024 ID3PLCOT,
					G087.IDG087,
					G087.TPAPLICA,
					G087.QTENTREG,
					NVL(G087.VRMINCOB, 0) VRMINCOB,
					G087.VRTABELA,
					G089.IDG089,
					G089.SNRATEIO

				FROM G046 -- CARGA

				INNER JOIN 
				(
					SELECT 
						G048.IDG046, 
						SUM(G043.PSBRUTO) PSTOTDEL,
						SUM(G043.VRDELIVE) VRTOTDEL,
						COUNT(G043.IDG043) TTDELIVE
					FROM G048
					INNER JOIN G049
						ON G049.IDG048 = G048.IDG048
					INNER JOIN G043 
						ON G043.IDG043 = G049.IDG043
					WHERE 	
						G043.SNDELETE = 0
						${sqlOpDlv}
					GROUP BY
						G048.IDG046
				) QCARGA 
					ON QCARGA.IDG046 = G046.IDG046

				INNER JOIN G048 -- ETAPA 
					ON G048.IDG046 = G046.IDG046

				INNER JOIN G005 G005O -- CLIENTE ORIGEM
					ON G005O.IDG005 = G048.IDG005OR

				INNER JOIN G005 G005D -- CLIENTE DESTINO 
					ON G005D.IDG005 = G048.IDG005DE

				INNER JOIN 
				(
					SELECT 
						IDG046,
						IDG005DE,
						COUNT(*) TTENTREG
					FROM G048 
					GROUP BY 
						IDG046,
						IDG005DE
				) QDEST
					ON QDEST.IDG046 = G048.IDG046
					AND QDEST.IDG005DE = G048.IDG005DE

				INNER JOIN G049 -- DELIVERY x ETAPA 
					ON G049.IDG048 = G048.IDG048

				INNER JOIN G043 -- DELIVERY
					ON G043.IDG043 = G049.IDG043

				INNER JOIN G086 -- DETALHE PREÇO
					ON G086.TPTRANSP = NVL(DECODE(G046.TPTRANSP, 'G', 'V'), G046.TPTRANSP)
					AND G086.IDG003OR = G005O.IDG003
					AND G086.IDG003DE = G005D.IDG003

				INNER JOIN G085 -- TABELA FRETE
					ON G085.IDG085 = G086.IDG085
					AND G085.IDG014 = 5 -- CONVENÇÃO

				INNER JOIN G087 -- CÁLCULO PREÇO
					ON G087.IDG086 = G086.IDG086

				INNER JOIN G089 -- TIPO DE TARIFA
					ON G089.IDG089 = G087.IDG089

				INNER JOIN G088 -- TABELA FRETE x CLIENTE
					ON G088.IDG085 = G085.IDG085
					${sqlInn}

				WHERE
					G046.SNDELETE = 0
					AND G043.SNDELETE = 0 
					AND G046.IDG046 = ${parm.IDG046}
					AND CURRENT_DATE BETWEEN G085.DTINIVIG AND G085.DTFIMVIG
					${sqlOpDlv}
					${sqlAux}

					ORDER BY 
						${arOrder.join()}                               
				`;

			await db.controller.setConnection(objConn);
			return await db.execute({ sql, objConn });

		} catch (err) {

			throw err;

		}

	}

    //-----------------------------------------------------------------------\\
    /**
     * Retorna o somatório das previsões de frete
     * @function fretePanorama
     * @author Rafael Delfino Calzado
     * @since 24/05/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna uma objecto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.fretePanorama = async function (req) {

        try {

            var sql = 
                `SELECT 
                    NVL(SUM(G046.VRFREREC), 0) VRFREREC,
                    NVL(SUM(G046.VRFREMIN), 0) VRFREMIN,
                    NVL(SUM(O005.VRFREPAG), 0) VRFREPAG

                FROM G046 -- CARGAS

                INNER JOIN O005 -- OFERECIMENTOS
                    ON O005.IDG046 = G046.IDG046
                    AND O005.STOFEREC = G046.STCARGA

                INNER JOIN O009 -- PARTICIPANTES
                    ON O009.IDO009 = O005.IDO009
                    AND O009.IDG024 = G046.IDG024

                WHERE 
                    G046.SNDELETE = 0
                    AND G046.STCARGA = '${req.params.status}'
                    AND G046.VRFREREC IS NOT NULL
                    AND G046.VRFREMIN IS NOT NULL
					AND O005.VRFREPAG IS NOT NULL`;
					
			var objConn = await db.controller.getConnection(null, req.UserId);

			return await db.execute({ sql, objConn });

        } catch (err) {

            throw err;

        }

	}
	
    //-----------------------------------------------------------------------\\
    /**
     * Retorna o somatório da cotação de frete a receber por operação de uma carga
     * @function detalheCotacaoCliente
     * @author Rafael Delfino Calzado
     * @since 05/12/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna uma objecto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

	api.detalheCotacaoCliente = async function (req) { 
	
		try { 

			var arCols =
				[
					'G046.IDG046',
					'T017.IDT017',
					'G014.IDG014',
					'G014.DSOPERAC',
					'G048.IDG048',
					'G048.NRSEQETA',
					'G005.IDG005',
					'G005.NMCLIENT',
					'G005.CJCLIENT',
					'G003.IDG003',
					'G003.NMCIDADE',
					'G002.IDG002',
					'G002.CDESTADO',
					'G089.IDG089',
					'G089.DSTPFRET'
				];
	
			var sql =
				`SELECT 
					${arCols.join()},
					UPPER(G003.NMCIDADE) NMCIDDES,
					SUM(T018.VRTARIFA) VRTARIFA

			FROM T017 -- COTACOES

			INNER JOIN T018 -- TARIFA DAS COTACOES
				ON T018.IDT017 = T017.IDT017

			INNER JOIN G089 -- TIPO DE TARIFA
				ON G089.IDG089 = T018.IDG089

			INNER JOIN G043 -- DELIVERIES
				ON G043.IDG043 = T018.IDG043

			INNER JOIN G014 -- OPERACAO 
				ON G014.IDG014 = G043.IDG014

			INNER JOIN G049 -- DELIVERIES x ETAPA
				ON G049.IDG043 = G043.IDG043

			INNER JOIN G048 -- ETAPA
				ON G048.IDG048 = G049.IDG048
				AND G048.IDG046 = T017.IDG046

			INNER JOIN G005 -- CLIENTE DESTINO
				ON G005.IDG005 = G048.IDG005DE

			INNER JOIN G003 -- CIDADE DESTINO
				ON G003.IDG003 = G005.IDG003

			INNER JOIN G002 -- ESTADO DESTINO
				ON G002.IDG002 = G003.IDG002

			INNER JOIN G046 -- CARGA
				ON G046.IDG046 = G048.IDG046

			WHERE 
				T017.TPCOTACA = 'C'
				AND G046.IDG046 = ${req.params.id}

			GROUP BY 
				${arCols.join()}

			ORDER BY 
				G046.IDG046,
				T017.IDT017,
				G014.IDG014,
				G048.NRSEQETA,
				G089.IDG089`;

			var objConn = await db.controller.getConnection(null, req.UserId);

			return await db.execute({ sql, objConn });
	
		} catch (err) { 
	
			throw err; 
	
		} 
	
	} 
	
	//-----------------------------------------------------------------------\\

	api.listaPartRegra = async function (req) { //remover
	
		try { 
	
			var sql = 
				`SELECT 
					IDG024 
				FROM O009 
				WHERE IDO008 IN (${req.IDO008.join()})
				GROUP BY IDG024`;
			
			await db.controller.setConnection(req.bjConn);
			return await db.execute({ sql, objConn: req.objConn });
	
		} catch (err) { 
	
			throw err; 
	
		} 
	
	} 
	
	//-----------------------------------------------------------------------\\

	return api;

}