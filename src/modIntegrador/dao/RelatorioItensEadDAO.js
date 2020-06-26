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

	const count = 40;

	api.montarSQLPivot = async function () {


		var pivotDtEvento = ``;
		var pivotDtAlteve = ``;

		var camposPivotDtEvento = ``;
		var camposPivotDtAlteve = ``;

		var sqlPivot = ``;

		for (let i = 1; i <= count; i++) {
			if (i == 1) {
				camposPivotDtEvento += `'EVENTO${i}' EVENTO${i}`;

				camposPivotDtAlteve += `'ALTEVE${i}' ALTEVE${i}`;
			} else {
				camposPivotDtEvento += `, 'EVENTO${i}' EVENTO${i}`;

				camposPivotDtAlteve += `, 'ALTEVE${i}' ALTEVE${i}`;
			}	
		}

		if (camposPivotDtEvento != '' && camposPivotDtAlteve != '') {
			pivotDtEvento = ` PIVOT (
										MAX(DTEVENTO)
										FOR EVENTO IN (${camposPivotDtEvento})
									)`;
			
			pivotDtAlteve = ` PIVOT (
										MAX(DTALTEVE)
										FOR ALTEVE IN (${camposPivotDtAlteve})
									)`;	
		}

		if (pivotDtEvento != '' && pivotDtAlteve != '') {			

			for (let i = 1; i <= count; i++) {

				sqlPivot +=`(
								SELECT COALESCE(EVENTO${i},null) FROM 
								(
									SELECT IDG048, DTEVENTO, 'EVENTO' || ROWNUM AS EVENTO FROM 
									(
										SELECT I013.IDG048, I013.DTEVENTO
										FROM I013
										WHERE I013.SNDELETE = 0 AND I013.IDI001 = 17 AND I013.IDG048 = G048.IDG048
										ORDER BY I013.IDI013
										OFFSET 0 ROWS FETCH NEXT ${count} ROWS ONLY
									)
								)
								
								${pivotDtEvento}
							) DTEVENTO${i},
							(
								SELECT COALESCE(ALTEVE${i},null) FROM 
								(
									SELECT IDG048, DTALTEVE, 'ALTEVE' || ROWNUM AS ALTEVE FROM 
									(
										SELECT I013.IDG048, I013.DTALTEVE
										FROM I013 
										WHERE I013.SNDELETE = 0 AND I013.IDI001 = 17 AND I013.IDG048 = G048.IDG048
										ORDER BY I013.IDI013
										OFFSET 0 ROWS FETCH NEXT ${count} ROWS ONLY
									)
								)
								
								${pivotDtAlteve}
							) DTALTEVE${i},`;
			}
		}
		
		return sqlPivot;
		
	}

	api.listar = async function (req, res, next) {

		var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, "G043", true);

		var sqlPivot = await api.montarSQLPivot();

		var sql =`
		WITH
			G043A AS (
						SELECT G043.IDG043, 
								G043.CDDELIVE,
								G043.DTDELIVE,
								G043.DTEMINOT,
								${sqlPivot}
								(SELECT min(X.DTEVENTO) FROM I013 X WHERE X.IDG048 = G048.IDG048 AND X.IDI001 = 21 AND X.SNDELETE = 0 AND X.STENVIO = 1) EVENTOAAD,
								(SELECT min(X.DTALTEVE) FROM I013 X WHERE X.IDG048 = G048.IDG048 AND X.IDI001 = 21 AND X.SNDELETE = 0 AND X.STENVIO = 1) AAD,
								(SELECT DISTINCT COUNT(I013.IDI013) OVER() FROM I013 WHERE I013.SNDELETE = 0 AND I013.IDI001 = 17 AND I013.IDG048 = G048.IDG048) COUNT_I013,
								COUNT(*) OVER() AS COUNT_LINHA
							FROM G043
							JOIN G049 ON G049.IDG043 = G043.IDG043
							JOIN G048 ON G048.IDG048 = G049.IDG048
							JOIN I013 ON I013.IDG048 = G048.IDG048
							JOIN G046 ON G046.IDG046 = G048.IDG046
								${sqlWhere}
							AND CDDELIVE LIKE 'F%'
							AND I013.IDI001 = 17
							AND I013.SNDELETE = 0
							AND I013.STENVIO = 1
							AND I013.STPROPOS <> 'R'
							AND G043.STETAPA <> 8
							AND G046.STCARGA <> 'C'
							AND G046.SNDELETE = 0
					   GROUP BY G043.IDG043, G043.CDDELIVE, G048.IDG048, G043.DTDELIVE, G043.DTEMINOT
						${sqlOrder}
					)
			SELECT * FROM G043A WHERE G043A.COUNT_I013 < 41  
			${sqlPaginate}`;

		return await db.execute(
			{
				sql: sql,

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