/**
 * @file Relatório de deliveries Syngenta. Mostra todo os dados relacionados a ela desde a importação a entrega.
 * @module modIntegrador/dao/RelatorioPIBDAO
 * 
 * @requires config/database
 * @requires utils/FuncoesObjDB
*/
module.exports = function (app, cb) {

	/**
	 * @description Relatório de itens por delivery.
	 * @author Jean Carlos B. G. Costa
	 * @since 10/07/2018
	 *
	 * @async
	 * @function RelatorioPIBDAO
	 * @return {Array} Deliveries não deletadas e com carga não deletada, apenas CTE ativo e agendamentos não deletados.
	 * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
	*/

	var api = {};

	const db = app.config.database;
	const utils = app.src.utils.FuncoesObjDB;

	api.listar = async function (req, res, next) {

		var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, "G043", true);


		return await db.execute(
			{
				sql: `
				SELECT
					COUNT(G043.IDG043) OVER () 				AS COUNT_LINHA,

					G043.IDG043 							G043_IDG043,
					G043.CDDELIVE 							G043_CDDELIVE,
					G043.CDPRIORI							G043_CDPRIORI,
					G043.TXINSTRU							G043_TXINSTRU,
					G043.VRDELIVE 							G043_VRDELIVE,
					G043.PSBRUTO 							G043_PSBRUTO,
					G043.PSLIQUID 							G043_PSLIQUID,
					TO_CHAR(G043.DTLANCTO, 'DD/MM/YYYY') 	G043_DTLANCTO,
					CASE 
						WHEN G043.TPDELIVE = 1 THEN 'TRANSFERÊNCIA'
						WHEN G043.TPDELIVE = 2 THEN 'VENDA'
						WHEN G043.TPDELIVE = 3 THEN 'DEVOLUÇÃO'
						WHEN G043.TPDELIVE = 4 THEN 'RECUSA'
						WHEN G043.TPDELIVE = 5 THEN 'RETORNO DE AG'
						ELSE 'OUTRO'
					END 									G043_TPDELIVE,
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
					END 									G043_STRETAPA,

					G005RE.NMCLIENT 						G005RE_NMCLIENT,
					G005DE.NMCLIENT 						G005DE_NMCLIENT,

					G045.DSPRODUT 							G045_DSPRODUT,
					G045.DSREFFAB 							G045_DSREFFAB,


					G058RE.SNVIRA 							G058RE_SNVIRA,

					SUM(G050.QTPRODUT) 						G050_QTPRODUT,

					CARGA.IDG046 							G046_IDG046

				FROM G043

				INNER JOIN G014
					ON G014.IDG014 = G043.IDG014

				INNER JOIN G045 ON
					G045.IDG043 = G043.IDG043
					AND G045.SNDELETE = 0

				INNER JOIN G005 G005RE ON
					G005RE.IDG005 = G043.IDG005RE
					AND G005RE.SNDELETE = 0

				INNER JOIN G005 G005DE ON
					G005DE.IDG005 = G043.IDG005DE
					AND G005DE.SNDELETE = 0

				INNER JOIN G050 ON
					G050.IDG045 = G045.IDG045
					AND G050.SNDELETE = 0

				LEFT JOIN
						(
							SELECT
								CARGA.IDG046,
								CARGA.DTAGENDA,
								CARGA.PSCARGA,
								CARGA.VRCARGA,
								CARGA.SNCARPAR,
								CARGA.STCARGA,
								CARGA.IDG024,
								CARGA.IDG030,
								PARADA.IDG048,
								PARADA.NRSEQETA,			
								G049.IDG043				
							FROM G046 CARGA			
							INNER JOIN G048 PARADA
								ON PARADA.IDG046 = CARGA.IDG046				
							INNER JOIN G049 
								ON G049.IDG048 = PARADA.IDG048
							WHERE CARGA.STCARGA <> 'C'
								AND CARGA.SNDELETE = 0
						) CARGA
					ON CARGA.IDG043 = G043.IDG043

				LEFT JOIN /*COLUNA G058RE.SNVIRA = 1 (TRANSFERENCIA, VENDA, RECUSA, DEVOLUCAO E AG), SE VAZIO É VIRA*/
						( 
							SELECT
								G058.IDG058, G058.IDG005RE, G058.IDG005DE, COUNT(*) SNVIRA
							FROM
								G058
							INNER JOIN G005 SEL ON
								SEL.IDG005 = G058.IDG005RE
							INNER JOIN G005 BUY ON
								BUY.IDG005 = G058.IDG005DE
							GROUP BY
								G058.IDG058, G058.IDG005RE, G058.IDG005DE 
						) G058RE ON
							( 
								(G058RE.IDG005RE = G005DE.IDG005)
							AND (G058RE.IDG005DE = G005RE.IDG005)
							)

					${sqlWhere}
					AND G014.SN4PL = 1 -- CHKRDC
					AND G043.STDELIVE <> 'D'

				GROUP BY
					G043.IDG043,
					G043.CDDELIVE,
					G043.CDPRIORI,
					G043.TXINSTRU,
					G043.VRDELIVE,
					G043.PSBRUTO,
					G043.PSLIQUID,
					G043.DTLANCTO,
					G043.TPDELIVE,
					G043.STETAPA,
					
					G045.IDG045,
					G045.DSREFFAB,
					G045.DSPRODUT,
					
					G005RE.NMCLIENT,
					G005DE.NMCLIENT,
					
					CARGA.IDG046
					
				${sqlOrder}  
				${sqlPaginate}`,

				param: (
					bindValues != undefined ? bindValues : []
				)

			}).then((result) => {
				return (utils.construirObjetoRetornoBD(result));

			}).catch((err) => {
				throw err;
			});
	}

	return api;
};