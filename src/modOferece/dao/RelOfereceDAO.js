/**
 * @file Relatorio de cargas para Oferecimento
 * @module modOferece/dao/RelOfereceDAO
 * 
 * @requires config/database
 * @requires utils/FuncoesObjDB
*/
module.exports = function (app, cb) {

	/**
	 * @description Relatorio de cargas para Oferecimento
	 * @author Luiz Gustavo Borges Bosco
	 * @since 4/10/2018
	 *
	 * @async
	 * @function RelatorioPIBDAO
	 * @return {Array} 
	 * @throws {Object} 
	*/

	var api = {};

	const db = app.config.database;
	const utils = app.src.utils.FuncoesObjDB;

	api.listar = async function (req, res, next) {
		var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, "G046", true);

		return await db.execute(
			{
                sql: `
                        
                        SELECT 
                            G046.IDG046     G046_IDG046   
                            ,	G046.IDG024 IDTRANSP
                            ,   G046.PSCARGA G046_PSCARGA
                            ,   G046.SNCARPAR
                            ,   G046.TPTRANSP
                            , CASE
                            WHEN G046.IDG024 = O005.IDG024 THEN 'Ativo'
                            ELSE 'Inativo'
                            END SNATIVO

                            ,   CASE
                                WHEN G046.SNCARPAR = 'S' THEN 'LTL' 
                                ELSE 'FTL'
                            END LOADTRUCK

                            ,   CASE
                                WHEN G046.TPTRANSP = 'T' THEN 'TRANSFERÊNCIA' 
                                WHEN G046.TPTRANSP = 'V' THEN 'VENDA' 
                                WHEN G046.TPTRANSP = 'D' THEN 'DEVOLUÇÃO' 
                                WHEN G046.TPTRANSP = 'G' THEN 'RETORNO AG'
                                ELSE 'OUTRO'
                            END TPOPERAC

                            ,	O005.IDO005

                            , TO_CHAR(O005.DTOFEREC, 'DD/MM/YYYY HH24:MI') DTOFEREC
                            , TO_CHAR(O005.DTRESOFE, 'DD/MM/YYYY HH24:MI') DTRESOFE

                            ,	CASE
                            WHEN O005.IDO009 IS NULL THEN 'Sim' 
                            ELSE 'Não' 
                            END AS SNSPOT

                            ,	CASE 
                            WHEN O005.STOFEREC = 'B' THEN 'BACKLOG'
                            WHEN O005.STOFEREC = 'R' THEN 'ROTEIRIZADA'
                            WHEN O005.STOFEREC = 'O' THEN 'OFERECIDA'
                            WHEN O005.STOFEREC = 'X' THEN 'RECUSADA'
                            WHEN O005.STOFEREC = 'A' THEN 'ACEITA'
                            WHEN O005.STOFEREC = 'S' THEN 'AGENDADA'
                            WHEN O005.STOFEREC = 'T' THEN 'EM TRANSPORTE'
                            WHEN O005.STOFEREC = 'C' THEN 'CANCELADA'
                            ELSE 'OUTRO'
                            END AS DSOFEREC

                            ,	G024.IDG024         G024_IDG024
                            ,	G024.NMTRANSP       G024_NMTRANSP

                            ,	G030.IDG030         G030_IDG030
                            ,	G030.DSTIPVEI       G030_DSTIPVEI
                            ,	G030.QTCAPPES       G030_QTCAPPES

                            ,	G005.NMCLIENT		G005_NMCLIENT

                            ,	O004.IDO004         O004_IDO004                 
                            ,	O004.DSMOTIVO       O004_DSMOTIVO
                            ,   COUNT(G046.IDG046) OVER () AS COUNT_LINHA

                            FROM G046 -- CARGA

                            INNER JOIN G030 -- TIPO DO VEÍCULO
                            ON G030.IDG030 = G046.IDG030

                            INNER JOIN O005 -- OFERECIMENTO
                            ON O005.IDG046 = G046.IDG046

                            INNER JOIN G024 -- 3PL
                            ON G024.IDG024 = O005.IDG024

                            INNER JOIN G048 --DESTINO
                            ON G046.IDG046 = G048.IDG046

                            INNER JOIN G005	--DESTINO
                            ON G048.IDG005DE = G005.IDG005

                            LEFT JOIN O004 -- MOTIVO RECUSA
                            ON O004.IDO004 = O005.IDO004

                            ${sqlWhere} 

                            AND G046.STCARGA <> 'C'

                            ${sqlOrder}

                            ${sqlPaginate}
                
                `,
				param: (bindValues != undefined ? bindValues : [])

			}).then((result) => {
				return (utils.construirObjetoRetornoBD(result));

			}).catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});
	}

	return api;
};