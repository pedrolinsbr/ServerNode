/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de cargas
 * @author Desconhecido
 * @since 01/08/2018
 *
 */

/**
 * @module dao/Carga
 * @description G046.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
 */
module.exports = function(app, cb) {

    var api = {};
    var utils = app.src.utils.FuncoesObjDB;
    var utilsCurl = app.src.utils.Utils;
    var dicionario = app.src.utils.Dicionario;
    var dtatu = app.src.utils.DataAtual;
    var acl = app.src.modIntegrador.controllers.FiltrosController;
    var logger = app.config.logger;
    api.controller = app.config.ControllerBD;


    /**
     * @description Listar dados da tabela G046.
     *
     * @async
     * @function api/listar
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */

    api.listar = async function(req, res, next) {

        logger.debug("Inicio listar");
        let con = await this.controller.getConnection(null, req.UserId);

        try {

            logger.debug("Parametros recebidos:", req.body);

            var snDesLog = req.body['parameter[SNDESLOG][id]'];
            var snDesMon = req.body['parameter[SNDESMON][id]'];

            var tpModCar = req.body['parameter[TPMODCAR][id]'];
            var porcentCarga = req.body['parameter[VRPERCAR][id]'];
            var snCroDoc = req.body['parameter[SNCRODOC][id]'];
            var snConhec = req.body['parameter[SNCONHEC][id]'];

            var snVira = req.body['parameter[G046_SNVIRA][id]'];

            delete req.body['parameter[SNDESLOG][id]'];
            delete req.body['parameter[SNDESLOG][text]'];

            delete req.body['parameter[SNDESMON][id]'];
            delete req.body['parameter[SNDESMON][text]'];

            delete req.body['parameter[TPMODCAR][id]'];
            delete req.body['parameter[TPMODCAR][text]'];

            delete req.body['parameter[VRPERCAR][id]'];
            delete req.body['parameter[VRPERCAR][text]'];

            delete req.body['parameter[SNCRODOC][id]'];
            delete req.body['parameter[SNCRODOC][text]'];

            delete req.body['parameter[SNCONHEC][id]'];
            delete req.body['parameter[SNCONHEC][text]'];

            delete req.body['parameter[G046_SNVIRA][id]'];
            delete req.body['parameter[G046_SNVIRA][text]'];

            if (snDesLog == undefined) {
                snDesLog = 0;
            }

            if (snDesMon == undefined) {
                snDesMon = 0;
            }

            if (tpModCar == undefined) {
                tpModCar = 0;
            }

            if (snVira == undefined) {
                snVira = 0;
            }


            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);

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
                esoperad: 'And '
            });

            if (typeof acl1 == 'undefined') {
                acl1 = '';
            }

            var sqlWhereAux = "";

            if (snDesLog == 1) {
                sqlWhereAux += " AND G046.IDCARLOG is not null ";
            } else if (snDesLog == 2) {
                sqlWhereAux += " AND G046.IDCARLOG is null ";
            } else if (snDesLog) {
                sqlWhereAux += " ";
            }

            if (snDesMon == 1) {
                sqlWhereAux += " AND G046.CDVIATRA is not null ";
            } else if (snDesMon == 2) {
                sqlWhereAux += " AND G046.CDVIATRA is null ";
            } else if (snDesMon) {
                sqlWhereAux += " ";
            }


            if (tpModCar == 1) {
                sqlWhereAux += " AND G046.TPMODCAR = 1 ";
            } else if (tpModCar == 2) {
                sqlWhereAux += " AND G046.TPMODCAR = 2 ";
            } else if (tpModCar == 3) {
                sqlWhereAux += " AND G046.TPMODCAR = 3";
            }

            if (snCroDoc == 2) {
                sqlWhereAux += " AND nvl(g048.idg024,0) = 0 ";
            } else if (snCroDoc == 1) {
                sqlWhereAux += " AND nvl(g048.idg024,0) <> 0 ";
            } else if (snCroDoc == 0) {
                sqlWhereAux += " ";
            }

            if (snConhec == 2) { // nao
                sqlWhereAux += " AND nvl(g049.idg051,0) = 0 ";
            } else if (snConhec == 1) { //sim
                sqlWhereAux += " AND nvl(g049.idg051,0) <> 0 ";
            } else if (snConhec == 0) { //todos
                sqlWhereAux += " ";
            }

            if (porcentCarga == 1 && porcentCarga != null && porcentCarga != undefined) {
                sqlWhereAux += " and G046.VRPERCAR = 100";
            } else if (porcentCarga == 2 && porcentCarga != null && porcentCarga != undefined) {
                sqlWhereAux += " and G046.VRPERCAR >= 80 and G046.VRPERCAR <= 99";
            } else if (porcentCarga == 3 && porcentCarga != null && porcentCarga != undefined) {
                sqlWhereAux += " and G046.VRPERCAR >= 50 and G046.VRPERCAR <= 79";
            } else if (porcentCarga == 4 && porcentCarga != null && porcentCarga != undefined) {
                sqlWhereAux += " and G046.VRPERCAR >= 30 and G046.VRPERCAR <= 49";
            } else if (porcentCarga == 5 && porcentCarga != null && porcentCarga != undefined) {
                sqlWhereAux += " and G046.VRPERCAR >= 0 and G046.VRPERCAR <= 29";
            } else if (porcentCarga == 6 && porcentCarga != null && porcentCarga != undefined) {
                sqlWhereAux += " and G046.VRPERCAR = 0 ";
            } else if (porcentCarga == 7 && porcentCarga != null && porcentCarga != undefined) {
                sqlWhereAux += "";
            }

            if (snVira == 2) { // nao
                sqlWhereAux += " AND G046.SNVIRA = 'N' ";
            } else if (snVira == 1) { //sim
                sqlWhereAux += " AND G046.SNVIRA = 'S' ";
            } else if (snVira == 0) { //todos
                sqlWhereAux += " ";
            }


            // TIPO TRANSPORTE
            var G046_TPTRANSP = [];
            if (bindValues.G046_TPTRANSP) {

                for (var key in bindValues.G046_TPTRANSP) {

                    G046_TPTRANSP[key] = "'" + bindValues.G046_TPTRANSP[key]['id'] + "'";

                }

                G046_TPTRANSP = G046_TPTRANSP.join(',');

                sqlWhereAux += " AND G046.TPTRANSP in (" + G046_TPTRANSP + ") ";

                sqlWhere = sqlWhere.replace("G046.TPTRANSP = :G046_TPTRANSP And", "");
                delete bindValues.G046_TPTRANSP;

            }

            // STATUS CARGA
            var G046_STCARGA = [];
            if (bindValues.G046_STCARGA) {

                for (var key in bindValues.G046_STCARGA) {

                    G046_STCARGA[key] = "'" + bindValues.G046_STCARGA[key]['id'] + "'";

                }

                G046_STCARGA = G046_STCARGA.join(',');

                sqlWhereAux += " AND G046.STCARGA in (" + G046_STCARGA + ") ";

                sqlWhere = sqlWhere.replace("G046.STCARGA = :G046_STCARGA And", "");
                delete bindValues.G046_STCARGA;

            }

            if(bindValues.T012_IDG046) {
                sqlWhere = sqlWhere.replace("T012.IDG046 = :T012_IDG046", `T012.IDG046 ${bindValues.T012_IDG046}` )
                delete bindValues.T012_IDG046;
            }

            let sql = `
					SELECT DISTINCT G046.IDG046,
									G046.DSCARGA,
									G046.IDG031M1,
									G046.IDG031M2,
									G046.IDG031M3,
									G046.IDG032V1,
									G046.IDG032V2,
									G046.IDG032V3,
									G046.IDG024,
									G046.CDVIAOTI,
									G046.SNESCOLT,
									G046.DTCARGA,
									G046.DTSAICAR,
									G046.DTPRESAI,
									G046.PSCARGA,
									G046.VRCARGA,
									G046.IDS001,
									G046.SNDELETE,
									G046.QTVOLCAR,
									G046.TPCARGA,
									G046.QTDISPER,
									G046.VRPOROCU,
									G046.IDG030,
									G046.DTAGENDA,
									G046.STCARGA,
									G046.STINTCLI,
									G046.SNCARPAR,
									G046.OBCANCEL,
									G046.IDS001CA,
									G046.DTCANCEL,
									G046.SNURGENT,
									G046.IDG028,
									
									G028.NMARMAZE || ' [' || G046.IDG028 || ']' AS NMARMAZE,
									
									G046.DTCOLORI,
									G046.DTCOLATU,
									
									G046.TPORIGEM,
									G046.STENVLOG,
									
									S001.NMUSUARI || ' [' || S001.IDS001 || ']' AS NMUSUARI,
									
									G030.DSTIPVEI || ' [' || G030.IDG030 || ']' AS DSTIPVEI,
									S001CA.NMUSUARI AS NMUSUARICA,
									G031M1.NMMOTORI || ' [' || G031M1.IDG031 || '-' ||
									G031M1.NRMATRIC || ']' AS NMMOTORI1,
									G031M2.NMMOTORI AS NMMOTORI2,
									G031M3.NMMOTORI AS NMMOTORI3,
									G032V1.DSVEICUL || ' [' || G032V1.IDG032 || '-' ||
									G032V1.NRFROTA || ']' AS DSVEICULV1,
									G032V2.DSVEICUL AS DSVEICULV2,
                                    G032V3.DSVEICUL AS DSVEICULV3,

                                    S001GFV1.NMUSUARI AS NMUSUARIV1,
									S001GFV2.NMUSUARI AS NMUSUARIV2,
                                    S001GFV3.NMUSUARI AS NMUSUARIV3,
                                    
									G046.DTPSMANU,
									G046.STPROXIM,
									G046.IDG034,
									G046.VRPERCAR,
									G046.IDCARLOG,
									G046.TPMODCAR,
									G046.TPTRANSP,
									G046.CDVIATRA,
									G046.DTINITRA,
                                    G046.DTFIMTRA,
                                    G046.SNVIRA,
									NVL(G046.DTCOLATU, G046.DTCOLORI) AS DTCOLETA,
									
									C01.SNCRODOC,
									
									C02.SNMANFES,
									
									C03.SNCONHEC,
									
									G024.NMTRANSP || ' [' || G024.IDG024 || '-' || G024.IDLOGOS || ']' AS NMTRANSP,
									
									G046.SNMOBILE,
									
									C04.DESTINO,
                                
                                    CASE -- VERIFICA SE A CARGA PASSOU NA VALIDACAO DO MALOTE
										WHEN NVL(T012.IDG046, NULL) IS NULL
										THEN 'NÃO'
										ELSE 'SIM'
                                    END SNMALOTE,
                                    
									C05.ORIGEM,
									
									G046.QTDISBAS,
									'' AS QTDISTOT,
									COUNT(G046.IDG046) OVER() AS COUNT_LINHA
					
					FROM G046 G046
					LEFT JOIN G024 G024
						ON G024.IDG024 = G046.IDG024
					LEFT JOIN S001 S001
						ON S001.IDS001 = G046.IDS001
					LEFT JOIN G030 G030
						ON G030.IDG030 = G046.IDG030
					LEFT JOIN S001 S001CA
						ON S001CA.IDS001 = G046.IDS001CA
					LEFT JOIN G028 G028
						ON G028.IDG028 = G046.IDG028
					
					LEFT JOIN G031 G031M1
						ON G031M1.IDG031 = G046.IDG031M1
					LEFT JOIN G031 G031M2
						ON G031M2.IDG031 = G046.IDG031M2
					LEFT JOIN G031 G031M3
						ON G031M3.IDG031 = G046.IDG031M3
					
					LEFT JOIN G032 G032V1
						ON G032V1.IDG032 = G046.IDG032V1
					LEFT JOIN G032 G032V2
						ON G032V2.IDG032 = G046.IDG032V2
					LEFT JOIN G032 G032V3
                        ON G032V3.IDG032 = G046.IDG032V3
                        
                    LEFT JOIN S001 S001GFV1
						ON S001GFV1.IDS001 = G032V1.IDS001GF 
					LEFT JOIN S001 S001GFV2
						ON S001GFV2.IDS001 = G032V2.IDS001GF 
					LEFT JOIN S001 S001GFV3
						ON S001GFV3.IDS001 = G032V3.IDS001GF 
					
					LEFT JOIN G048 G048
						ON G048.IDG046 = G046.IDG046
					LEFT JOIN G049 G049
						ON G049.IDG048 = G048.IDG048
					
					LEFT JOIN G051 G051
						ON G051.IDG051 = G049.IDG051
					LEFT JOIN G052 G052
						ON G052.IDG051 = G051.IDG051
					LEFT JOIN G043 G043
						ON G043.IDG043 = G052.IDG043
                    LEFT JOIN T012 T012
                        ON T012.IDG046 = G046.IDG046

					CROSS APPLY
					
					(SELECT NVL(SUM(IDG024), 0) AS SNCRODOC
						FROM G048 G048A
					WHERE G048A.IDG046 = G046.IDG046) C01
					
					CROSS APPLY
					
					(SELECT COUNT(F001X.IDF001) AS SNMANFES
						FROM F003 F003X
					INNER JOIN G046 G046X
						ON G046X.IDG046 = F003X.IDG046
					INNER JOIN F001 F001X
						ON F001X.IDF001 = F003X.IDF001
					WHERE F001X.STMDF NOT IN ('C', 'R')
						AND G046X.IDG046 = G046.IDG046) C02
					
					CROSS APPLY
					
					(SELECT NVL(SUM(X.IDG051), 0) AS SNCONHEC
						FROM (SELECT
							
							CASE
								WHEN NVL(G049.IDG051, 0) = 0 THEN
								1
								ELSE
								0
							END AS IDG051
								FROM G048 G048A
								JOIN G049 G049
								ON G049.IDG048 = G048A.IDG048
							WHERE G048A.IDG046 = G046.IDG046) X) C03
					
					OUTER APPLY
					
					(SELECT NVL(G005DE.NRLATITU, G003DE.NRLATITU) || ',' ||
							NVL(G005DE.NRLONGIT, G003DE.NRLONGIT) AS DESTINO
					
						FROM G046 G046X
					
						JOIN G048 G048DE
						ON (G048DE.IDG046 = G046X.IDG046 AND
							G048DE.NRSEQETA =
							(SELECT MAX(G048DE_2.NRSEQETA)
								FROM G048 G048DE_2
								WHERE G048DE_2.IDG046 = G048DE.IDG046))
					
						JOIN G005 G005DE
						ON (G005DE.IDG005 = G048DE.IDG005DE)
						JOIN G003 G003DE
						ON (G003DE.IDG003 = G005DE.IDG003)
					
					WHERE G046X.IDG046 = G046.IDG046
						AND G046X.IDG024 IS NOT NULL
					
					) C04
					
					OUTER APPLY
					
					(SELECT NVL(G003.NRLATITU, G003.NRLATITU) || ',' ||
							NVL(G003.NRLONGIT, G003.NRLONGIT) AS ORIGEM
						FROM G046 G046X
						JOIN G024 G024X
						ON G024X.IDG024 = G046X.IDG024
						JOIN G003 G003
						ON G003.IDG003 = G024X.IDG003
					WHERE G046X.IDG046 = G046.IDG046
						AND G046X.IDG024 IS NOT NULL
					
					) C05
							${sqlWhere}
							${sqlWhereAux}
							${acl1}

							`;


            let resultCount = await con.execute({
                    sql: ` select count(x.IDG046) as QTD from (` + sql + `) x `,
                    param: bindValues
                })
                .then((result) => {
                    logger.debug("Retorno:", result);
                    return result[0];
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });

            var reqAux = req;
            let result = await con.execute(

                    {
                        sql: sql +
                            sqlOrder +
                            sqlPaginate,
                        param: bindValues
                    })
                .then((result) => {
                    logger.debug("Retorno:", result);
                    return result;
                    //return (utils.construirObjetoRetornoBD(result, reqAux.body));
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });

            if (result.length > 0) {
                result[0].COUNT_LINHA = resultCount.QTD;
                for (let j = 0; j < result.length; j++) {
                    if (result[j].QTDISBAS == null) {
                        if (result[j].ORIGEM != null && result[j].DESTINO != null) {
                            result[j].QTDISBAS = await utilsCurl.calcularDistancia(result[j].ORIGEM, result[j].DESTINO);
                        } else {
                            result[j].QTDISBAS = 0;
                        }
                    }
                    result[j].QTDISTOT = result[j].QTDISBAS + result[j].QTDISPER;
                }
            }

            result = (utils.construirObjetoRetornoBD(result, reqAux.body));


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
     * @description Listar documentos para desmontar carga
     *
     * @async
     * @function api/listarDocumentos
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */


    api.listarDocumentos = async function(req, res, next) {

        logger.debug("Inicio listarDocumentos");
        let con = await this.controller.getConnection(null, req.UserId);

        try {

            logger.debug("Parametros recebidos:", req.body);

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', false);
            var cargas = req.body['arIds'];
            if (typeof cargas != "string") {
                cargas = cargas.join(",");
            }
            logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
            let result = null;

            if (req.body['tipo'] == 1) {
                result = await con.execute({
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
					REPLACE ( G043.DSINFCPL , '''' , '' )   as DSINFCPL,
					G043.SNOTIMAN,
					G043.SNAG	,
					G043.DTBLOQUE,
					G043.DTDESBLO,
					G043.STLOGOS	,
					G043.CDRASTRE,
					g046.idg046
					From g046 g046
					Join g048 g048 On g048.idg046 = g046.idg046
					Join g049 g049 On g049.idg048 = g048.idg048
					Join g043 g043 On g043.idg043 = g049.idg043
					Where g046.idg046 in (${cargas})
					and g046.STCARGA in ('F', 'C', 'A') ` +
                            /* sqlWhere +*/
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
            } else if (req.body['tipo'] == 2) {

                result = await con.execute({
                        sql: ` Select distinct G051.IDG051		,
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
						G051.BSISSQN		,
						G051.VRISSQN		,
						G051.VRISSQST	,
						G051.PCALIISS	,
						G051.VRDESCON	,
						G051.DTLANCTO	,
						REPLACE ( G051.DSINFCPL , '''' , '' )   as DSINFCPL,
						G051.DTCALANT	,
						G051.DTCOLETA	,
						G051.DTENTPLA	,
						G051.DTCALDEP	,
						G051.DTAGENDA	,
						G051.DTCOMBIN	,
						G051.DTROTERI	,
						G051.TPTRANSP	,
						G051.CDCARGA		,
						G051.IDG059		,
						G051.STLOGOS		,
						G051.SNLOTACA	,
						G051.CDSATISF	,
						G051.IDG024AT	,
						G051.SNPRIORI	,
						G051.NRPESO	,

						g024.NMTRANSP   || ' [' || g024.idg024   || '-' || g024.idlogos   || ']'  as NMTRANSP,

						g024AT.NMTRANSP || ' [' || g024AT.idg024 || '-' || g024AT.idlogos || ']'  as NMTRANSPAT,


						g005RE.NMCLIENT AS NMCLIENTRE,
						g005DE.NMCLIENT AS NMCLIENTDE,
						g005RC.NMCLIENT AS NMCLIENTRC,
						g005EX.NMCLIENT AS NMCLIENTEX,
						g005CO.NMCLIENT AS NMCLIENTCO,

						G051.IDG046
						From g046 g046
						Join g048 g048 On g048.idg046 = g046.idg046
						Join g049 g049 On g049.idg048 = g048.idg048
						Join g051 g051 On g051.idg051 = g049.idg051

						Join g005 g005RE On g005RE.IDG005 = g051.IDG005RE
						Join g005 g005DE On g005DE.IDG005 = g051.IDG005DE 
						Join g005 g005RC On g005RC.IDG005 = g051.IDG005RC 
						Join g005 g005EX On g005EX.IDG005 = g051.IDG005EX
						Join g005 g005CO On g005CO.IDG005 = g051.IDG005CO
						Join g024 g024   On g024.IDG024   = g051.IDG024
						Join g024 g024AT On g024AT.IDG024 = g051.IDG024AT

						Where g046.idg046 in (${cargas})
						/*and g046.STCARGA in ('F', 'C', 'A')*/ 
						and g051.idg046 is not null` +
                            /* sqlWhere +*/
                            // sqlOrder +
                            sqlPaginate,
                        param: {}, //bindValues
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


            }






            await con.close();
            logger.debug("Fim listarDocumentos");
            return result;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;

        }

    };


    /**
     * @description Validação para cancelamento de carga
     *
     * @async
     * @function api/validaCancelar
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */

    api.validaCancelar = async function(req, res, next) {

        logger.debug("Inicio validaCancelar");
        let con = await this.controller.getConnection(null, req.UserId);

        try {

            var id = req.body.IDG046S;
            logger.debug("Parametros buscar:", req.body);

            let result = await con.execute({
                    sql: `Select Count(G046.Idg046)  As QTD
						From g046 g046
						Where g046.STCARGA In ('C','O')
						And G046.Idg046 In (` + id + `)
						And G046.SnDelete = 0
						/*Or G046.DtSaiCar is not null*/`,
                    param: []
                })
                .then((result) => {
                    logger.debug("Retorno:", result);
                    return (result[0]);
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            await con.close();

            logger.debug("Fim buscar");
            return result;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }

    };




    /**
     * @description Validação montagem de carga 4PL
     *
     * @async
     * @function api/validaCancelar
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */

    api.validaMontarCarga4PL = async function(req, res, next) {

        logger.debug("Inicio validaMontarCarga4PL");
        let con = await this.controller.getConnection(null, req.UserId);

        try {

            var id = req.UserId;

            if (id == undefined) {
                id = req.body.IDS001;
            }
            logger.debug("Parametros buscar:", req.body);

            if (id == undefined) {
                id = 0;
            }

            let result = await con.execute({
                    sql: ` SELECT NVL(SNCAR4PL,0) AS SNCAR4PL FROM S001 S001 WHERE S001.IDS001 = ` + id,
                    param: []
                })
                .then((result) => {
                    logger.debug("Retorno:", result);
                    return (result);
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            await con.close();

            if (result.length >= 1) {
                result = { SNCAR4PL: result[0].SNCAR4PL };
            } else {
                result = { SNCAR4PL: 0 };
            }

            logger.debug("Fim validaMontarCarga4PL");
            return result;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }

    };




    /**
     * @description Insere a data de cancelamento
     *
     * @async
     * @function cancelarCarga
     * @param {Object} req Possui as requisições para a função.
     * @param {Object} req.body
     * @param {Object} req.body.carga
     *
     * @return {Object} Retorna um objeto JSON.
     * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
     *
     */
    api.cancelarCarga = async function(req, res, next) {

        logger.debug("Inicio cancelarCarga");

        var objConn = await this.controller.getConnection(req.objConn, req.UserId);
        var dataFormatada = dtatu.tempoAtual('YYYY-MM-DD HH:mm:ss');

        var cargas = req.body.IDG046S;

        if (typeof cargas != "string" && typeof cargas != "number") {
            cargas = cargas.join(",");
        }
        req.body.IDG046S = cargas;
        var objValidation = await api.validaCancelar(req, res, next);

        if (objValidation.QTD >= 1) {
            logger.error("Não foi possível efetuar o cancelamento");
            res.status(500);
            return { nrlogerr: -1, response: ["Não foi possível efetuar o cancelamento"] };
        }

        //# retirar g046 da g051 OK
        // let resConhecimento = await
        // objConn.update({
        // 	tabela: 'G051',
        // 	colunas: {
        // 	IDG046: null,
        // 	CDCARGA: null
        // 	},
        // 	condicoes: ` IDG046 in (`+cargas+`) `
        // })
        // 	.then((result1) => {
        // 	logger.debug("Retorno:", result1);
        // })
        // .catch((err) => {
        // 	err.stack = new Error().stack + `\r\n` + err.stack;
        // 	logger.error("Erro:", err);
        // 	throw err;
        // });

        var sql = '';

        sql = `  UPDATE G051
						SET IDG046 = '',
							CDCARGA = ''
					  WHERE IDG046 in (${cargas}) `;

        let resConhecimento = await objConn.execute({ sql, param: [] })
            .then((result) => {
                logger.debug("Retorno:", result);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });



        sql = `  UPDATE G046
						SET STCARGA = 'C',
							DTCANCEL = TO_DATE('${dataFormatada}', 'YYYY-MM-DD HH24:MI:SS'),
							DTSAICAR = '',
							IDS001CA = ${(req.UserId != undefined ? req.UserId: null)}
					  WHERE IDG046 in (${cargas}) `;

        let result = await objConn.execute({ sql, param: [] })
            .then((result) => {
                objConn.close();
                return { response: "Cancelamento feito com sucesso: " + cargas };
            })
            .catch((err) => {
                objConn.closeRollback();
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });

        return result;

    }




    /**
     * @description Update dados conhecimentos
     *
     * @async
     * @function api/desmontarCarga
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */

    api.desmontarCarga = async function(req, res, next) {

        logger.debug("Inicio desmontarCarga");

        var objConn = await this.controller.getConnection(req.objConn, req.UserId);
        var dataFormatada = dtatu.tempoAtual('YYYY-MM-DD HH:mm:ss');

        var transp = req.body.EMPREDES.id;
        var result = null;

        if (req.body.IDG051.length > 0) {
            //var ctrc = req.body.IDG051.join(",");
            var ctrc = req.body.IDG051;
            var sql = `  UPDATE G051
							SET IDG046 = '',
								IDG024AT = ${transp},
								CDCARGA = ''
						  WHERE IDG051 in (${ctrc})`;

            result = await objConn.execute({ sql, param: [] })
                .then((result) => {
                    objConn.close();
                    return { response: "Desmontagem realizada com sucesso" };
                })
                .catch((err) => {
                    objConn.closeRollback();
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

        }
        return result;
    }

    /**
     * @description BUsca Indicadores da Mountagem de carga.
     *
     * @async
     * @function api/indicadoresCarga
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     * @author Adryell Batista.

     */
    api.indicadoresCarga = async function(req, res, next) {
        var tplObjRet = [{
                label: "Aceitas",
                indNum: 0,
                bgColor: "#35c298",
                icon: "fas fa-check",
                filtParam: "A"
            },
            {
                label: "Backlog",
                indNum: 0,
                bgColor: "#cccccc",
                icon: "fas fa-check",
                filtParam: "B"
            },
            {
                label: "Canceladas",
                indNum: 0,
                bgColor: "#c94141",
                icon: "fas fa-times-circle",
                filtParam: "C"
            },
            {
                label: "Ocorrências",
                indNum: 0,
                bgColor: "#fe8963",
                icon: "fas fa-exclamation-triangle",
                filtParam: "E"
            },
            {
                label: "Pré.",
                indNum: 0,
                bgColor: "#d75e95",
                icon: "fas fa-cube",
                filtParam: "F"
            },
            {
                label: "Oferecidas",
                indNum: 0,
                bgColor: "#fae243",
                icon: "fas fa-paper-plane",
                filtParam: "O"
            },
            {
                label: "Roterizadas",
                indNum: 0,
                bgColor: "#1565c0",
                icon: "fas fa-road",
                filtParam: "R"
            },
            {
                label: "Agendadas",
                indNum: 0,
                bgColor: "#5dc7d7",
                icon: "far fa-calendar-alt",
                filtParam: "S"
            },
            {
                label: "Transporte",
                indNum: 0,
                bgColor: "#51316f",
                icon: "fas fa-truck",
                filtParam: "T"
            },
            {
                label: "Recusadas",
                indNum: 0,
                bgColor: "#d87675",
                icon: "far fa-times-circle",
                filtParam: "X"
            }
        ];

        var objConn = await this.controller.getConnection(req.objConn, req.UserId);
        try {

            req.body.tableName = "DH";
            req.body.DH_STETAPA = { in: req.body.in };
            delete req.body.in;
            var [sqlWhere, bindValues] = utils.buildWhere(req.body, true);
            sqlWhere = "";
            bindValues = [];

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

            var result = await objConn.execute({
                sql: `Select Count(G046.Idg046) As Qtd, Stcarga
						From G046 G046
						Left Join G024 G024
							On G024.Idg024 = G046.Idg024
						Left Join S001 S001
							On S001.Ids001 = G046.Ids001
						Left Join G030 G030
							On G030.Idg030 = G046.Idg030
						Left Join S001 S001ca
							On S001ca.Ids001 = G046.Ids001ca
						Left Join G028 G028
							On G028.Idg028 = G046.Idg028

						Left Join G031 G031m1
							On G031m1.Idg031 = G046.Idg031m1
						Left Join G031 G031m2
							On G031m2.Idg031 = G046.Idg031m2
						Left Join G031 G031m3
							On G031m3.Idg031 = G046.Idg031m3
						Left Join G032 G032v1
							On G032v1.Idg032 = G046.Idg032v1
						Left Join G032 G032v2
							On G032v2.Idg032 = G046.Idg032v2
						Left Join G032 G032v3
							On G032v3.Idg032 = G046.Idg032v3
					 Where G046.Sndelete = 0
					 ${acl1}
					 Group By G046.Stcarga
					 Order By G046.Stcarga`,
                param: []
            }).then((res) => {
                for (var key in res) {
                    for (var k in tplObjRet) {
                        if (res[key].STCARGA == tplObjRet[k].filtParam) {
                            tplObjRet[k].indNum = res[key].QTD;
                        }
                    }
                }
                return tplObjRet;
            }).catch((err) => {
                throw err;
            });
            objConn.close();
            return result;

        } catch (err) {
            objConn.closeRollBack();
            throw err;
        }
    }

    /**
     * @description Atribuir Veículo e Motorista
     *
     * @async
     * @function api/tp/carga/atribuirVeiculoMotorista
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */

    api.atribuirVeiculoMotorista = async function(req, res, next) {

        logger.debug("Inicio Atribuir Veículo e Motorista");
        let con = await this.controller.getConnection(null, req.UserId);
        var stCarga = "A";
        var stProxim = "A";
        var idOcorre = "";

        var carga = req.body.IDG046;

        var auxM1 = req.body.IDG031M1 ? req.body.IDG031M1.id : null;
        var auxM2 = req.body.IDG031M2 ? req.body.IDG031M2.id : null;
        var auxM3 = req.body.IDG031M3 ? req.body.IDG031M3.id : null;
        var auxV1 = req.body.IDG032V1 ? req.body.IDG032V1.id : null;
        var auxV2 = req.body.IDG032V2 ? req.body.IDG032V2.id : null;
        var auxV3 = req.body.IDG032V3 ? req.body.IDG032V3.id : null;

        var mobile = req.body.SNMOBILE ? req.body.SNMOBILE.id : null;


        try {


            /*
            //# INICIO VALIDACAO
            */

            var objConn = await this.controller.getConnection(req.objConn, req.UserId);
            var montagemCargaDAO = app.src.modTransportation.dao.MontagemCargaDAO;


            var resultCarga = await objConn.execute({
                sql: `
					SELECT  G046.STCARGA, 
							G046.TPMODCAR,
							G046.SNCARPAR 
					  FROM  G046 G046
					 WHERE  G046.IDG046 = :id `,
                param: {
                    id: carga
                }
            }).then((res) => {
                return res[0];
            }).catch((err) => {
                throw err;
            });

            if (resultCarga.TPMODCAR != 1) {
                stProxim = resultCarga.STCARGA;
                stCarga = stProxim;
            } else if (resultCarga.STCARGA != 'F') {
                stProxim = resultCarga.STCARGA;
                stCarga = stProxim;
            }

            //# caso utilize mobile, deve ter cadastro na M001
            if (mobile == 'S') {
                var resultVlidaMotorista = await objConn.execute({
                    sql: `
						SELECT nvl(M001.IDG031, 0) as IDG031
							FROM G031 G031 
							LEFT JOIN M001 M001 ON M001.IDG031 =  G031.IDG031
						WHERE G031.IDG031 = :id `,
                    param: {
                        id: auxM1
                    }
                }).then((res) => {
                    return res[0];
                }).catch((err) => {
                    throw err;
                });

                if (resultVlidaMotorista.IDG031 == '0') {
                    res.status(500);
                    return { response: "Motorista não cadastrado para utilizar mobile" };
                }
            }

            var resultQuery = await objConn.execute({
                sql: `
						Select g046.vrcarga, 
								g046.pscarga, 
								g046.idg024, 
								g046.tpmodcar,
								(Select LISTAGG(g048.idg005de, ',') WITHIN Group(Order By g048.idg005de)  
								From g048 Where g048.idg046 = g046.idg046) As  idg005,

								(Select LISTAGG(g049.idg051, ',') WITHIN Group(Order By g049.idg051)  
								From g049 Where g049.idg048 In (Select idg048 From g048 Where idg046 = g046.idg046)) As  idg051,
								
								(Select LISTAGG(g049.idg043, ',') WITHIN Group(Order By g049.idg043)  
								From g049 Where g049.idg048 In (Select idg048 From g048 Where idg046 = g046.idg046)) As  idg043,

								(SELECT count(idt004) AS qtd FROM t004 t004 WHERE t004.idg046 = g046.idg046 and t004.idg067 not in (2)) AS QTT004
						From g046 g046 
						Where g046.idg046 = :id `,
                param: {
                    id: carga
                }
            }).then((res) => {
                return res[0];
            }).catch((err) => {
                throw err;
            });
            objConn.close();




            var arClientes = resultQuery.IDG005.split(',');
            var arMotoristas = [];
            var arVeiculos = [];
            var aux = null;

            aux = req.body.IDG031M1 ? arMotoristas.push(req.body.IDG031M1.id) : null;
            aux = req.body.IDG031M2 ? arMotoristas.push(req.body.IDG031M2.id) : null;
            aux = req.body.IDG031M3 ? arMotoristas.push(req.body.IDG031M3.id) : null;

            aux = req.body.IDG032V1 ? arVeiculos.push(req.body.IDG032V1.id) : null;
            aux = req.body.IDG032V2 ? arVeiculos.push(req.body.IDG032V2.id) : null;
            aux = req.body.IDG032V3 ? arVeiculos.push(req.body.IDG032V3.id) : null;

            req.body.valida = {
                IDG030: (req.body.IDG032V1 ? req.body.IDG032V1.idg030 : null),
                IDG032: arVeiculos,
                IDG031: arMotoristas,
                IDG005: arClientes,
                PSBRUTO: (resultQuery.PSCARGA ? resultQuery.PSCARGA : null),
                VRMERCAD: (resultQuery.VRCARGA ? resultQuery.VRCARGA : null),
                LSDOCUME: { IDG051: resultQuery.IDG051, IDG043: resultQuery.IDG043 },
                IDG024_CARGA: req.body.IDG024
            };

            var objValidation = await montagemCargaDAO.validarCarga(req, res, next);

            //console.log("API Brenda::",objValidation);
            if (!(resultCarga.TPMODCAR == 2 && resultCarga.SNCARPAR == 'S')) {

                //# Estouro de peso
                if (objValidation.psbruto == 0) {
                    stCarga = "E";
                    idOcorre = idOcorre + '1,';
                }

                //# Estouro de apólice
                // if(objValidation.vrmercad == 0){
                //   stCarga = "E";
                //   idOcorre = idOcorre + '2,';
                // }

                //# Mínimo de peso
                if (objValidation.pcocupac == 0) {
                    stCarga = "E";
                    idOcorre = idOcorre + '3,';
                }

            }

            //# Caso já tenha ocorrência cadastrada, não criar novamente
            if (resultQuery.QTT004 >= 1) {
                stCarga = stProxim;
            }

            //verificando a placa do veiculo
            var resultPlaca = await objConn.execute({
                sql: `
					           
					SELECT upper(g032.NRPLAVEI) as NRPLAVEI FROM g032 g032 WHERE g032.idg032 = :id `,
                param: {
                    id: auxV1
                }
            }).then((res) => {
                return res[0];
            }).catch((err) => {
                throw err;
            });



            let resCarga = await
            con.update({
                    tabela: 'G046',
                    colunas: {
                        STCARGA: stCarga,

                        /* Atribuir caso 3pl */
                        IDG031M1: auxM1,
                        /*Motorista 1*/
                        IDG031M2: auxM2,
                        /*Motorista 2*/
                        IDG031M3: auxM3,
                        /*Motorista 3*/
                        IDG032V1: auxV1,
                        /*Veículo 1*/
                        IDG032V2: auxV2,
                        /*Veículo 2*/
                        IDG032V3: auxV3,
                        /*Veículo 3*/

                        IDG030: req.body.IDG032V1.idg030,

                        VRPOROCU: objValidation.pcpsesto,
                        STPROXIM: stProxim,

                        SNMOBILE: mobile,

                        NRPLAVEI: resultPlaca.NRPLAVEI

                    },
                    condicoes: ` IDG046 in (` + carga + `)`
                })
                .then((result1) => {
                    logger.debug("Retorno:", result1);
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });



            if (idOcorre.length > 0 && stCarga == "E") {

                idOcorre = idOcorre.substr(0, idOcorre.length - 1).split(',');
                var calculoOcorrencia = 0;
                var sendOcorre = [];
                for (let c = 0; c < idOcorre.length; c++) {

                    //#
                    // 1 - Estouro de peso
                    // 2 - Estoura Apólice
                    // 3 - Percentual mínimo de peso não atingido

                    if (idOcorre[c] == 1) {
                        calculoOcorrencia = objValidation.pcpsesto;
                    } else if (idOcorre[c] == 2) {
                        calculoOcorrencia = objValidation.pcvresto;
                    } else if (idOcorre[c] == 3) {
                        calculoOcorrencia = objValidation.pcpsfalta;
                    }

                    let resultUserOcorrencia = await con.execute({
                            sql: `Select G071.*, G071.Ids001oc, Pcparam
								  From G070 G070
								  Join G071 G071
									On G071.Idg070 = G070.Idg070
								 Where G070.Idg024 = :idg024
								   And G070.Sndelete = 0
								   And G071.Sndelete = 0
									 And G071.Stcadast = 'A'
									 And G071.TpModCar = :tpmodcar
								   And G071.IDG067   = ` + idOcorre[c],
                            param: {
                                idg024: resultQuery.IDG024,
                                tpmodcar: 1
                            }
                        })
                        .then((result) => {
                            logger.debug("Retorno:", result);
                            return (result);
                        })
                        .catch((err) => {
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });

                    if (resultUserOcorrencia.length <= 0) {
                        await con.closeRollback();
                        res.status(500);
                        return { response: "Não há configuração de ocorrência para a transportadora informada" };
                    }

                    for (let y = 0; y < resultUserOcorrencia.length; y++) {

                        sendOcorre[idOcorre[c]] = 0;
                        if (idOcorre[c] != 3) {

                            if ((resultUserOcorrencia[y].PCPARAM + 100) <= calculoOcorrencia) {
                                let resOcorre = await con.insert({
                                        tabela: 'T004',
                                        colunas: {

                                            IDG046: carga,
                                            STSITUAC: "P",
                                            IDS001: resultUserOcorrencia[y].IDS001OC,
                                            DTVALIDA: null,
                                            DTCADAST: new Date(),
                                            TXVALIDA: null,
                                            IDG067: idOcorre[c],
                                            IDG012: null
                                        },
                                        key: 'IdT004'
                                    })
                                    .then((result1) => {
                                        sendOcorre[idOcorre[c]] += 1;
                                        return (result1);
                                    })
                                    .catch((err) => {
                                        err.stack = new Error().stack + `\r\n` + err.stack;
                                        throw err;
                                    });
                            }

                        } else if (idOcorre[c] == 3) {

                            if (calculoOcorrencia <= resultUserOcorrencia[y].PCPARAM) {
                                let resOcorre = await con.insert({
                                        tabela: 'T004',
                                        colunas: {

                                            IDG046: carga,
                                            STSITUAC: "P",
                                            IDS001: resultUserOcorrencia[y].IDS001OC,
                                            DTVALIDA: null,
                                            DTCADAST: new Date(),
                                            TXVALIDA: null,
                                            IDG067: idOcorre[c],
                                            IDG012: null
                                        },
                                        key: 'IdT004'
                                    })
                                    .then((result1) => {
                                        sendOcorre[idOcorre[c]] += 1;
                                        return (result1);
                                    })
                                    .catch((err) => {
                                        err.stack = new Error().stack + `\r\n` + err.stack;
                                        throw err;
                                    });
                            }
                        }
                    }
                }
                for (let w = 0; w < idOcorre.length; w++) {
                    if (sendOcorre[idOcorre[w]] == 0) {
                        res.status(500);
                        return { response: "Não há usuário vinculado para aprovação de ocorrência - Cód.: " + idOcorre[w] };
                    }
                }
            }


            if (resultQuery.TPMODCAR != 1) {

                var resultUpdateDoc = await con.execute({
                        sql: `UPDATE G048 G048
								 SET G048.STINTCLI = 7
							   WHERE G048.STINTCLI = 2
								 AND G048.IDG046   = :id`,
                        param: {
                            id: carga
                        }
                    })
                    .then((result) => {
                        logger.debug("Retorno:", result);
                        return (result);
                    })
                    .catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });

            }


            //resultQuery.TPMODCAR

            await con.close();
            // Processo para sincronização entre Logos x Evolog
            let host = 'srvaplsl01.bravo.com.br';
            let path = '/' + process.env.APP_ENV.toLocaleLowerCase() + '/evologos/public/evolog/logos/atribuirmotoristaveiculo';
            let postObj = {
                'idg046': carga
            };

            await utilsCurl.curlHttpPost(host, path, postObj);


            logger.debug("Fim salvarCarga");
            return { response: "Carga " + carga + " atualizada com sucesso!" };
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    }




    /**
     * @description Listar um dado na tabela G058.
     *
     * @async
     * @function api/buscar
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.mapaCarga = async function(req, res, next) {

        logger.debug("Inicio buscarMapa");
        let con = await this.controller.getConnection(null, req.UserId);

        try {

            var id = req.body.IDG046;
            logger.debug("Parametros buscar:", req.body);

            let result = await con.execute({
                    sql: ` Select distinct
		G046.Idg046,
		G046.Dscarga,
		G046.idcarlog,
		G046.Idg031m1,
		G046.Idg031m2,
		G046.Idg031m3,
		G046.Idg032v1,
		G046.Idg032v2,
		G046.Idg032v3,
		G046.Idg024,
		G046.Cdviaoti,
		G046.Snescolt,
		G046.Dtcarga,
		G046.Dtsaicar,
		G046.Dtpresai,
		G046.Pscarga,
		G046.Vrcarga,
		G046.Ids001,
		G046.Sndelete,
		G046.Qtvolcar,
		G046.Tpcarga,
		G046.Qtdisper,
		G046.Vrporocu,
		G046.Idg030,
		G046.Dtagenda,
		G046.Stcarga,
		G046.Stintcli,
		G046.Sncarpar,
		G046.Obcancel,
		G046.Ids001ca,
		G046.Dtcancel,
		G046.Snurgent,
		G046.Idg028,
		G046.Dtcolori,
		G046.Dtcolatu,
		G046.Tporigem,
		G046.Stenvlog,
		G024.Nmtransp,
		S001.Nmusuari,
		G030.Dstipvei,
		S001ca.Nmusuari As Nmusuarica,
		G028.Nmarmaze,
		G031M1.NMMOTORI || ' [' || G031M1.IDG031 || '-' ||
        G031M1.NRMATRIC || ']' AS NMMOTORI1,
        G031M1.CJMOTORI As CJMOTORI1,
		G031m2.Nmmotori As Nmmotori2,
		G031m3.Nmmotori As Nmmotori3,
		G032v1.Dsveicul As Dsveiculv1,
		G032v2.Dsveicul As Dsveiculv2,
		G032v3.Dsveicul As Dsveiculv3,
		G046.DTPSMANU,
		G046.STPROXIM,
		G046.IDG034,
		G046.VRPERCAR,
		G032v1.NRPLAVEI as nrplaveiv1,
		G032v1.NRFROTA as nrfrotav1,
		Count(G046.Idg046) Over() As COUNT_LINHA
	From G046 G046
	Left Join G024 G024
		On G024.Idg024 = G046.Idg024
	Left Join S001 S001
		On S001.Ids001 = G046.Ids001
	Left Join G030 G030
		On G030.Idg030 = G046.Idg030
	Left Join S001 S001ca
		On S001ca.Ids001 = G046.Ids001ca
	Left Join G028 G028
		On G028.Idg028 = G046.Idg028

	Left Join G031 G031m1
		On G031m1.Idg031 = G046.Idg031m1
	Left Join G031 G031m2
		On G031m2.Idg031 = G046.Idg031m2
	Left Join G031 G031m3
		On G031m3.Idg031 = G046.Idg031m3

	Left Join G032 G032v1
		On G032v1.Idg032 = G046.Idg032v1
	Left Join G032 G032v2
		On G032v2.Idg032 = G046.Idg032v2
	Left Join G032 G032v3
		On G032v3.Idg032 = G046.Idg032v3	
		

	Left Join g048 g048 On g048.idg046 = g046.idg046
	Left Join g049 g049 On g049.idg048 = g048.idg048
	Left Join g051 g051 On g051.idg051 = g049.idg051
	
	Where G046.idg046 = :id `,
                    param: {
                        id: id
                    }
                })
                .then((result) => {
                    logger.debug("Retorno:", result);
                    return (result[0]);
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });


            let result2 = await con.execute({
                    sql: ` 
                    SELECT DISTINCT G046.IDG046,
                    NVL(G005DE.RSCLIENT, G005DE.NMCLIENT) || ' [' ||
                    FN_FORMAT_CNPJ_CPF(G005DE.CJCLIENT) || ' - ' ||
                    G005DE.IECLIENT || ' / ' || G005DE.IDG005 || ' ]' AS NMCLIEDE,
                    NVL(G005RE.RSCLIENT, G005RE.NMCLIENT) || ' [' ||
                    FN_FORMAT_CNPJ_CPF(G005RE.CJCLIENT) || ' - ' ||
                    G005RE.IECLIENT || ' / ' || G005RE.IDG005 || ' ]' AS NMCLIERE,

                    G083.VRVOLUME,

                    nvl(G043.NRNOTA,G083.NRNOTA) AS NRNOTA,

                    nvl(G083.VRNOTA,G043.VRDELIVE) as VRDELIVE,

                    nvl(G083.PSBRUTO,G043.PSBRUTO) as PSBRUTO,

                    nvl(G083.PSLIQUID,G043.PSLIQUID) as PSLIQUID,

                    G043.IDG043,
                    G043.CDDELIVE,
                    G043.SNLIBROT,
                    G043.DTLANCTO,
                    G043.IDS001,
                    G043.DTDELIVE,
                    G043.TPDELIVE,
                    G043.STDELIVE,
                    
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

                    G043.NRDIVISA,
                    G043.STETAPA,
                    
                    G043.NREMBSEC,
                    G043.SNINDSEG,
                    G043.VRALTURA,
                    G043.VRLARGUR,
                    G043.VRCOMPRI,
                    G043.CJDESTIN,
                    G043.IEDESTIN,
                    G043.IMDESTIN,
                    G043.IDG014,
                    G043.CDCLIEXT,
                    
                    G043.IDG009PS,
                    G043.DTENTREG,
                    G043.STULTETA,
                    G043.DTENTCON,
                    G043.TXINSTRU,
                    G043.TXCANHOT,
                    G043.IDG005TO,
                    G043.SNOTIMAN,
                    G043.DSINFCPL,
                    G043.IDG024TR,
                    G043.SNAG,
                    G043.DTBLOQUE,
                    G043.DTDESBLO,
                    G043.STLOGOS,
                    G043.CDRASTRE,
                    G043.IDG043RF,
                    G043.IDI015,
                    G043.DSEMACLI,
                    G043.DSEMARTV,
                    G043.IDG005RC,
                    G043.IDG074,
                    G043.CDG46ETA,
                    G043.IDS001CA,
                    G043.DTCANCEL,
                    G043.DTAUXILI,
                    G043.IDEXTCLI,
                    G043.OBCANCEL,
                    G043.NRINTSUB,
                    G051.CDCTRC,
                    
                    SUBSTR(NVL(G005DE.RSCLIENT, G005DE.NMCLIENT), 0, 20) AS NMCLIEDEMIN,
                    SUBSTR(NVL(G005RE.RSCLIENT, G005RE.NMCLIENT), 0, 20) AS NMCLIEREMIN,
                    
                    G051.DTAGENDA,
                    G051.DTCOMBIN,
                    G051.DTCALDEP,
                    
                    G024A.IDLOGOS,
                    G024B.IDG024 AS IDG024CD,
                    g024B.NMTRANSP AS NMTRANSPCD,
                    g024B.DSENDERE AS DSENDERECD,
                    G003DE.NMCIDADE AS NMCIDADEDE,
                    G003CD.NMCIDADE AS NMCIDADECD,
                    G005DE.DSENDERE,
                    G005DE.NRENDERE,
                    G048.IDG048,
                    G048.NRSEQETA,
                    g048.IDG024
                   
                    
            FROM G046 G046
            JOIN G048 G048
                ON G048.IDG046 = G046.IDG046
            JOIN G049 G049
                ON G049.IDG048 = G048.IDG048
            JOIN G043 G043
                ON G043.IDG043 = G049.IDG043
            LEFT JOIN G051 G051
                ON G051.IDG051 = G049.IDG051
            LEFT JOIN G024 G024A
                ON G051.IDG024 = G024A.IDG024
            LEFT JOIN G024 G024B
                ON G048.IDG024 = G024B.IDG024    
            LEFT JOIN G005 G005DE
                ON G005DE.IDG005 =
                    COALESCE(/*G043.IDG005RC, G043.IDG005DE,*/ G051.IDG005RC, G051.IDG005DE) -- DESTINATARIO NFE
            LEFT JOIN G003 G003DE
                ON G003DE.IDG003 = G005DE.IDG003
            LEFT JOIN G003 G003CD
                ON G003CD.IDG003 = G024B.IDG003
            LEFT JOIN G002 G002DE
                ON G002DE.IDG002 = G003DE.IDG002
            LEFT JOIN G005 G005RE
                ON G005RE.IDG005 =
                    COALESCE(/*G043.IDG005RE,*/G051.IDG005EX, G051.IDG005RE) -- REMETENTE NFE
            LEFT JOIN G003 G003RE
                ON G003RE.IDG003 = G005RE.IDG003
            LEFT JOIN G002 G002RE
                ON G002RE.IDG002 = G003RE.IDG002
            JOIN G083 G083
                ON G083.IDG043 = G043.IDG043 AND G083.SNDELETE = 0
        WHERE G046.IDG046 = :id
        ORDER BY G048.IDG048 asc, G048.NRSEQETA`,
                    param: {
                        id: id
                    }
                })
                .then((result2) => {
                    logger.debug("Retorno:", result2);
                    return (result2);
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });


            let result3 = await con.execute({
                    sql: `SELECT H.*, TO_CHAR(((H.VRMERCAD * 100) / H.VRCARGA), '999999990D99') AS PCVALOR
			    FROM (SELECT N.*,
									 
						(SELECT SUM(nvl(G083.PSBRUTO,G043A.PSBRUTO)) AS NRPESO
						FROM G046 G046A
						JOIN G048 G048A
							ON G048A.IDG046 = G046A.IDG046
						JOIN G049 G049A
							ON G049A.IDG048 = G048A.IDG048
			 LEFT JOIN G051 G051A
							ON G051A.IDG051 = G049A.IDG051
						JOIN G043 G043A
							ON G043A.IDG043 = G049A.IDG043
						LEFT JOIN G005 G005re
							ON G005re.IDG005 = NVL(G043A.IDG005RE,NVL(G051A.IDG005EX, G051A.IDG005RE))
						JOIN G083 G083
						  ON G083.IDG043 = G043A.IDG043 AND G083.SNDELETE = 0
						WHERE G046A.IDG046 = N.IDG046
							AND SUBSTR(G005RE.CJCLIENT,0,8) = N.CJCLIENTRE) AS NRPESO,
									 
						(SELECT SUM(nvl(G083.VRNOTA, G043A.VRDELIVE)) AS VRMERCAD
						FROM G046 G046A
						JOIN G048 G048A
							ON G048A.IDG046 = G046A.IDG046
						JOIN G049 G049A
							ON G049A.IDG048 = G048A.IDG048
			 LEFT JOIN G051 G051A
							ON G051A.IDG051 = G049A.IDG051
						JOIN G043 G043A
							ON G043A.IDG043 = G049A.IDG043
						LEFT JOIN G005 G005re
							ON G005re.IDG005 = NVL(G043A.IDG005RE,NVL(G051A.IDG005EX, G051A.IDG005RE))
						JOIN G083 G083
						  ON G083.IDG043 = G043A.IDG043 AND G083.SNDELETE = 0
						WHERE G046A.IDG046 = N.IDG046
							AND SUBSTR(G005RE.CJCLIENT,0,8) = N.CJCLIENTRE) AS VRMERCAD,
											 
						(SELECT G005RE.RSCLIENT 
							FROM G005 G005RE 
						WHERE SUBSTR(G005RE.CJCLIENT,0,8) = N.CJCLIENTRE AND ROWNUM = 1 and G005RE.Sndelete = 0) AS RSCLIENT
						
					FROM (
										
							SELECT  SUBSTR(G005RE.cjclient,0,8) AS cjclientre,
										G046.VRCARGA,
										G046.IDG046
							FROM G046 G046
							JOIN G048 G048 ON G048.IDG046 = G046.IDG046
							JOIN G049 G049 ON G049.IDG048 = G048.IDG048
							JOIN G043 G043 ON G043.IDG043 = G049.IDG043
							LEFT JOIN G051 G051 
											ON G051.IDG051 = G049.IDG051
							/*LEFT JOIN G005 G005DE
								ON G005DE.IDG005 = NVL(G051.IDG005RC, G051.IDG005DE) */-- DESTINATARIO
							LEFT JOIN G005 G005DE
										ON G005DE.IDG005 = NVL(G043.IDG005DE,NVL(G051.IDG005RC, G051.IDG005DE)) -- DESTINATARIO NFE
							LEFT JOIN G003 G003DE
								ON G003DE.IDG003 = G005DE.IDG003
							LEFT JOIN G002 G002DE
								ON G002DE.IDG002 = G003DE.IDG002
						
							LEFT JOIN G005 G005RE
								ON G005RE.IDG005 = NVL(G043.IDG005RE,NVL(G051.IDG005EX, G051.IDG005RE)) -- REMETENTE NFE
							LEFT JOIN G003 G003RE
								ON G003RE.IDG003 = G005RE.IDG003
							LEFT JOIN G002 G002RE
								ON G002RE.IDG002 = G003RE.IDG002
						
							LEFT JOIN G005 G005CO
								ON G005CO.IDG005 = G051.IDG005CO
							LEFT JOIN G003 G003CO
								ON G003CO.IDG003 = G005CO.IDG003
							LEFT JOIN G002 G002CO
								ON G002CO.IDG002 = G003CO.IDG002
						
							WHERE G046.IDG046 = :id  
							GROUP BY SUBSTR(G005RE.cjclient,0,8),
											G046.VRCARGA,
											G046.IDG046) N) H
		 		ORDER BY H.VRMERCAD DESC`,
                    param: {
                        id: id
                    }
                })
                .then((result3) => {
                    logger.debug("Retorno:", result3);
                    return (result3);
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            let objCarga = { carga: result, notas: result2, apolice: result3 }



            await con.close();
            logger.debug("Fim buscarMapa");
            return objCarga;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }

    };

    api.mapaExpedicao = async function(req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        try {

            var id = req.body.IDG046;

            logger.debug("Parametros buscar:", req.body);

            let result = await con.execute({
                    sql: `SELECT DISTINCT G046.IDG046,
					G046.DTCARGA,
					G046.PSCARGA,
					G046.IDS001,
					G046.IDCARLOG,
					
					
					
					CASE
						WHEN G046.STCARGA = 'R' THEN 'Roteirizada'
						WHEN G046.STCARGA = 'S' THEN 'Agendada'
						WHEN G046.STCARGA = 'O' THEN 'Oferecida'
						WHEN G046.STCARGA = 'B' THEN 'Backlog'	
						WHEN G046.STCARGA = 'X' THEN 'Recusada'
						WHEN G046.STCARGA = 'T' THEN 'Transporte'
						WHEN G046.STCARGA = 'C' THEN 'Cancelada'
						WHEN G046.STCARGA = 'E' THEN 'Ocorrência'
						WHEN G046.STCARGA = 'F' THEN 'Pré carga'
						WHEN G046.STCARGA = 'A' THEN 'Aceita'
						WHEN G046.STCARGA = 'D' THEN 'Entregue'
						ELSE ''
					END G046_STCARGA,





					G024.NMTRANSP,
					
					REPLACE(REPLACE(nvl(G032_1.NRPLAVEI, G046.NRPLAVEI), '-'),
							' ') As NRPLAVEI1, /* Número da Placa 1 */
					REPLACE(G032_2.NRPLAVEI, '-') As NRPLAVEI2, /* Número da Placa 2 */
					REPLACE(G032_3.NRPLAVEI, '-') As NRPLAVEI3, /* Número da Placa 3 */
					
					REPLACE(REPLACE(REPLACE(REPLACE(G031_1.CJMOTORI, '-'), '.'),
									'_'),
							'+') As CJMOTORI1, /* CPF do Motorista 1 */
					REPLACE(REPLACE(REPLACE(REPLACE(G031_2.CJMOTORI, '-'), '.'),
									'_'),
							'+') As CJMOTORI2, /* CPF do Motorista 2 */
					REPLACE(REPLACE(REPLACE(REPLACE(G031_3.CJMOTORI, '-'), '.'),
									'_'),
							'+') As CJMOTORI3, /* CPF do Motorista 3 */
					
					G032_1.NRFROTA As NRFROTA1, /* Número frota do veiculo 1 */
					G032_2.NRFROTA As NRFROTA2, /* Número frota do veiculo 2 */
					G032_3.NRFROTA As NRFROTA3, /* Número frota do veiculo 3 */
					
					G030.IDG030,
					G030.DSTIPVEI,
					G030.QTCAPPES,
					
					H006.IDH006,
					H006.DTCADAST,
						
					CASE WHEN LENGTH(S001.NMUSUARI) >= 30 THEN CONCAT(SUBSTR(S001.NMUSUARI, 1, 30), '...') ELSE S001.NMUSUARI END as USERG046,
                    CASE WHEN LENGTH(S001H6.NMUSUARI) >= 30 THEN CONCAT(SUBSTR(S001H6.NMUSUARI, 1, 30), '...') ELSE S001H6.NMUSUARI END as USERH006,
                    --SUBSTR(S001.NMUSUARI, 1, 30)   AS USERG046, /*Alternativa sem '...'*/
					--SUBSTR(S001H6.NMUSUARI, 1, 30) AS USERH006, /*Alternativa sem '...'*/
					
					H007.HOINICIO,
					H007.HOFINAL

			FROM G046

			LEFT JOIN G024 G024
			ON G024.IDG024 = G046.IDG024

			JOIN G030 G030
			ON G030.IDG030 = G046.IDG030

			LEFT JOIN H024 H024
			ON H024.IDG046 = G046.IDG046

			LEFT JOIN H006 H006
			ON H024.IDH006 = H006.IDH006

			JOIN S001 S001
			ON S001.IDS001 = G046.IDS001

			Left Join G032 G032_1 /* Veículos 1 */
			On (G032_1.IDG032 = G046.IDG032V1)
			Left Join G032 G032_2 /* Veículos 2 */
			On (G032_2.IDG032 = G046.IDG032V2)
			Left Join G032 G032_3 /* Veículos 3 */
			On (G032_3.IDG032 = G046.IDG032V3)
			Left Join G031 G031_1 /* Motoristas 1 */
			On (G031_1.IDG031 = G046.IDG031M1)
			Left Join G031 G031_2 /* Motoristas 2 */
			On (G031_2.IDG031 = G046.IDG031M2)
			Left Join G031 G031_3 /* Motoristas 3 */
			On (G031_3.IDG031 = G046.IDG031M3)
			
			LEFT Join G028 G028 /* Armazém */
			On (G028.IDG028 = G046.IDG028)

			LEFT JOIN S001 S001H6
			ON S001H6.IDS001 = H006.IDS001

			LEFT JOIN H007 H007
			ON H007.IDH006 = H006.IDH006
  
			Where G046.idg046 = :id `,
                    param: {
                        id: id
                    }
                })
                .then((result) => {
                    logger.debug("Retorno:", result);
                    return (result[0]);
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            let result2 = await con.execute({
                    sql: ` 
                    SELECT G048.NRSEQETA,
                    nvl(G043.NRNOTA,G083.NRNOTA) AS NRNOTA,
                    G003RE.NMCIDADE || ' - ' || G002RE.CDESTADO As NMCIDADERE,
                    G005TO.RSCLIENT as NMCLIENT,
                    G005TO.CJCLIENT,
                    G005DE.RSCLIENT as NMDEST,
                    nvl(G083.DSINFCPL, G043.DSINFCPL) AS DSOBSERV,
                    G043.IDG043,
                    G043.IDG005DE as IDDEST,
                    G083.VRVOLUME,
                    nvl(G083.PSLIQUID,G043.PSLIQUID) as PSLIQUID,
                    nvl(G083.PSBRUTO,G043.PSBRUTO) as PSBRUTO
                FROM G046 G046
                JOIN G048 G048
                  ON (G046.IDG046 = G048.IDG046)
                JOIN G049 G049
                  ON (G049.IDG048 = G048.IDG048)
                JOIN G043 G043
                            ON (G043.IDG043 = G049.IDG043)
                            
                Join G005 G005RE
                  On (G005RE.IDG005 = nvl(G043.IDG005TO, G043.IDG005RE))

                Join G005 G005DE
                  On (G005DE.IDG005 = G043.IDG005DE)

                Join G003 G003RE
                  On (G005RE.IDG003 = G003RE.IDG003)
                Join G002 G002RE
                            On (G002RE.IDG002 = G003RE.IDG002)
                            
                Join G051 G051TO 
                  ON (G051TO.IDG051 = G049.IDG051)
                            
                Join G005 G005TO
                  On (G005TO.IDG005 = nvl(G051TO.IDG005CO, G051TO.IDG005RE))
                JOIN G083 G083
                  ON G083.IDG043 = G043.IDG043 AND G083.SNDELETE = 0
        
                WHERE G046.idg046 = :id
                ORDER BY G048.NRSEQETA DESC
				
				`,
                    param: {
                        id: id
                    }
                })
                .then((result2) => {
                    logger.debug("Retorno:", result2);
                    return (result2);
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });
            let totPSLIQUID = 0;
            let totPSBRUTO = 0;
            let totVRVOLUME = 0;
            let totProd = 0;
            //let qtVol = 0;
            let arNotas = [];
            for (let j = 0; j < result2.length; j++) {
                result2.totProd = 0;
                //result2.qtVol = 0;
                let objAux = result2[j];
                objAux.itens = null;

                let result3 = await con.execute({
                        sql: ` 
                        SELECT DISTINCT G004.IDG004,
                        G004.DSREFFAB,
                        G004.DSPRODUT,
                        G004.NRONU,
                        G004.DSINFAD,
                        
                        G004.DSLOTE,
                        G004.QTPRODUT,
                        
                        UPPER(NVL(G009.DSUNIDAD, G004.DSUNCOM)) AS DSUNIDAD,
                        '' NRISCO
                FROM G046 G046
                JOIN G048 G048
                    ON G048.IDG046 = G046.IDG046
                JOIN G049 G049
                    ON G049.IDG048 = G048.IDG048
                JOIN G043 G043
                    ON G043.IDG043 = G049.IDG043
                JOIN G083 G083
                    ON G083.IDG043 = G043.IDG043
                JOIN G004 G004
                    ON G004.IDG083 = G083.IDG083
                LEFT JOIN G009 G009
                    ON G009.IDG009 = G004.IDG009UM
                
                WHERE G046.idg046 = :id
                    AND g043.idg043 in (${result2[j].IDG043})
						`,
                        param: {
                            id: id
                        }
                    })
                    .then((result3) => {
                        logger.debug("Retorno:", result3);
                        return (result3);
                    })
                    .catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });

                if(result3.length == 0){

                    result3 = await con.execute({
                        sql: `SELECT Y.DSREFFAB, Y.DSPRODUT, Y.DSINFAD, Y.DSLOTE, Y.QTPRODUT, 
                                     NVL((SELECT initcap(G009.DSUNIDAD) FROM G009 WHERE G009.CDUNIDAD = TRIM(Y.DSUNIDAD)), Y.DSUNIDAD) AS DSUNIDAD, 
                                     Y.IDG004, Y.NRONU, Y.NRISCO 
                                FROM (SELECT DISTINCT x.*,'' NRONU,'' NRISCO
                                        FROM G046 G046
                                        JOIN G048 G048
                                          ON G048.IDG046 = G046.IDG046
                                        JOIN G049 G049
                                          ON G049.IDG048 = G048.IDG048
                                        JOIN G043 G043
                                          ON G043.IDG043 = G049.IDG043
                                        JOIN G083 G083
                                           ON G083.IDG043 = G043.IDG043
                                        JOIN F004 F004
                                          ON F004.NRCHADOC = G083.NRCHADOC
                                    ,XMLTABLE(XMLNAMESPACES(DEFAULT 'http://www.portalfiscal.inf.br/nfe'),'//nfeProc/NFe/infNFe/det' PASSING XMLTYPE.createXML(F004.txxml)
                                    COLUMNS DSREFFAB VARCHAR2(4000) PATH 'prod/cProd'
                                    ,DSPRODUT VARCHAR2(4000) PATH 'prod/xProd'
                                    ,DSINFAD VARCHAR2(4000) PATH 'infAdProd'
                                    ,DSLOTE VARCHAR2(4000) PATH 'prod/rastro/nLote'
                                    ,QTPRODUT number PATH 'prod/qCom'
                                    ,DSUNIDAD VARCHAR2(4000) PATH 'prod/uCom'
                                    ,IDG004 VARCHAR2(4000) PATH '@nItem') x 
                                WHERE G046.idg046 = :id
                                  AND g043.idg043 in (${result2[j].IDG043}))Y`,
                        param: {
                            id: id
                        }
                    })
                    .then((result3) => {
                        logger.debug("Retorno:", result3);
                        return (result3);
                    })
                    .catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });

                }

                for (let qt of result3) {
                    totProd += qt.QTPRODUT;
                    // qtVol++;
                }

                for (let nt of result2) {
                    nt.PSBRUTO = (nt.PSBRUTO != null ? Number(nt.PSBRUTO.toFixed(2)) : 0);
                    nt.PSLIQUID = (nt.PSLIQUID != null ? Number(nt.PSLIQUID.toFixed(2)) : 0);
                    totPSBRUTO += nt.PSBRUTO;
                    totPSLIQUID += nt.PSLIQUID;
                    totVRVOLUME += (nt.VRVOLUME != null ? Number(nt.VRVOLUME.toFixed(2)) : 0)

                }

                result.totPSLIQUID = totPSLIQUID;
                result.totPSBRUTO = totPSBRUTO;
                result.totVRVOLUME = totVRVOLUME;


                objAux.totProd = totProd;
                //objAux.qtVol = qtVol;

                objAux.itens = result3;
                arNotas[j] = objAux;

                totProd = totVRVOLUME = totPSBRUTO = totPSLIQUID = 0;



            }
            let objCarga = { carga: result, notas: arNotas }


            await con.close();
            logger.debug("Fim buscarMapa");
            return objCarga;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }

    };



    /**
     * @description Listar documentos para desmontar carga
     *
     * @async
     * @function api/listarDocumentos
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */


    api.listarAtribuirOutrosDocumentos = async function(req, res, next) {

        logger.debug("Inicio listarAtribuirOutrosDocumentos");
        let con = await this.controller.getConnection(null, req.UserId);

        try {

            logger.debug("Parametros recebidos:", req.body);

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', false);
            // var cargas = req.body['arIds'];
            // if(typeof cargas != "string"){
            // 	cargas = cargas.join(",");
            // }
            logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
            let result = null;


            result = await con.execute({
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
					REPLACE ( G043.DSINFCPL , '''' , '' )   as DSINFCPL,
					G043.SNOTIMAN,
					G043.SNAG	,
					G043.DTBLOQUE,
					G043.DTDESBLO,
					G043.STLOGOS	,
					G043.CDRASTRE,
					Count(G043.IdG043) Over() As COUNT_LINHA

					from g043 g043 
          where g043.idg005re || g043.idg005de in (select g043x.idg005re || g043x.idg005de
          From g046 g046x
          Join g048 g048x On g048x.idg046 = g046x.idg046
          Join g049 g049x On g049x.idg048 = g048x.idg048
          Join g043 g043x On g043x.idg043 = g049x.idg043
					Where  g046x.IDG046 in (${req.body.IDG046}) ) and G043.STETAPA = 1
					
					 ` +
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
            logger.debug("Fim listarAtribuirOutrosDocumentos");
            return result;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;

        }

    };






    api.deliverysCarga = async function(req, res, next) {

        let con = await this.controller.getConnection();

        try {

            var id = req.body.IDG046;

            let result = await con.execute({
                    sql: `  select g049.idg043, g049.nrordem, 
			g005de.nrlatitu as nrlatitude, 
			g005de.nrlongit as nrlongitde,

			g005re.nrlatitu as nrlatiture, 
			g005re.nrlongit as nrlongitre

			from g046 g046
			join g048 g048
			  on g048.idg046 = g046.idg046
			join g049 g049
			  on g048.idg048 = g049.idg048
	  
			join g043 g043
			  on g043.idg043 = g049.idg043
	  
			join g005 g005de 
			  on g005de.idg005 = g043.idg005de

			join g005 g005re 
			  on g005re.idg005 = g043.idg005re


		   where g046.idg046 = :id
		   order by g049.nrordem asc`,
                    param: {
                        id: id
                    }
                })
                .then((result) => {
                    return result;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            await con.close();
            return result;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }

    };





    api.deliverysSelecionadasCarga = async function(req, res, next) {

        let con = await this.controller.getConnection();

        try {

            var ids = req.body.IDG043S;

            let result = await con.execute({
                    sql: ` 
      
			Select g043.idg043, 

			g005de.nrlatitu as nrlatitude, 
			g005de.nrlongit as nrlongitde,

			g005re.nrlatitu as nrlatiture, 
			g005re.nrlongit as nrlongitre


			from g043 g043 
			
			join g005 g005de 
			  on g005de.idg005 = g043.idg005de

			join g005 g005re 
			  on g005re.idg005 = g043.idg005re

			where idg043 in (${ids}) `,
                    param: {}
                })
                .then((result) => {
                    return result;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            await con.close();
            return result;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }

    };

    /**
     * @description Quantidade de situação de cargas
     *
     * @async
     * @function api/validaCancelar
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */

    api.qtdSituacaoCargas = async function(req, res, next) {

        logger.debug("Inicio quantidade situação cargas");
        let con = await this.controller.getConnection(null, req.UserId);

        try {

            var id = req.body.IDG046;
            logger.debug("Parametros buscar:", req.body);


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
                esoperad: ' And '
            });

            if (typeof acl1 == 'undefined') {
                acl1 = '';
            }

            let result = await con.execute({
                    sql: `select count(*) as qtd, g046.stcarga
						from g046 g046
						join g024 g024 on g024.idg024 = g046.idg024
						where 1=1 ${acl1}
			   			group by g046.stcarga
			  			union
						  select (select count(*) from g046 g
						  join g024 g024 on g024.idg024 = g.idg024
						  where 1=1 ${acl1}) as qtd, 'Z' as stcarga
					from dual`,
                    param: []
                })
                .then((result) => {
                    return result;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            await con.close();
            console.log("Fim quantidade de situação de carga")
            return result;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    };



    /**
     * @description Quantidade de situação de cargas
     *
     * @async
     * @function api/validaCancelar
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */

    api.qtdTotal = async function(req, res, next) {

        logger.debug("Inicio quantidade situação cargas");
        let con = await this.controller.getConnection(null, req.UserId);

        try {

            logger.debug("Parametros recebidos:", req.body);

            var snDesLog = req.body['parameter[SNDESLOG][id]'];
            var tpModCar = req.body['parameter[TPMODCAR][id]'];
            var porcentCarga = req.body['parameter[VRPERCAR][id]'];
            var snCroDoc = (req.body['parameter[SNCRODOC]']) ? req.body['parameter[SNCRODOC]'].id : null;

            delete req.body['parameter[SNDESLOG][id]'];
            delete req.body['parameter[SNDESLOG][text]'];

            delete req.body['parameter[TPMODCAR][id]'];
            delete req.body['parameter[TPMODCAR][text]'];

            delete req.body['parameter[VRPERCAR][id]'];
            delete req.body['parameter[VRPERCAR][text]'];

            delete req.body['parameter[SNCRODOC]'];


            if (snDesLog == undefined) {
                snDesLog = 0;
            }

            if (tpModCar == undefined) {
                tpModCar = 0;
            }


            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);

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
                esoperad: 'And '
            });

            if (typeof acl1 == 'undefined') {
                acl1 = '';
            }

            var sqlWhereAux = "";

            if (snDesLog == 1) {
                sqlWhereAux += " AND G046.IDCARLOG is not null ";
            } else if (snDesLog == 2) {
                sqlWhereAux += " AND G046.IDCARLOG is null ";
            } else if (snDesLog) {
                sqlWhereAux += " ";
            }


            if (tpModCar == 1) {
                sqlWhereAux += " AND G046.TPMODCAR = 1 ";
            } else if (tpModCar == 2) {
                sqlWhereAux += " AND G046.TPMODCAR = 2 ";
            } else if (tpModCar == 3) {
                sqlWhereAux += " AND G046.TPMODCAR = 3";
            }

            if (snCroDoc == 2) {
                sqlWhereAux += " AND nvl(g048.idg024,0) = 0 ";
            } else if (snCroDoc == 1) {
                sqlWhereAux += " AND nvl(g048.idg024,0) <> 0 ";
            } else if (snCroDoc == 0) {
                sqlWhereAux += " ";
            }

            if (porcentCarga == 1 && porcentCarga != null && porcentCarga != undefined) {
                sqlWhereAux += " and G046.VRPERCAR = 100";
            } else if (porcentCarga == 2 && porcentCarga != null && porcentCarga != undefined) {
                sqlWhereAux += " and G046.VRPERCAR >= 80 and G046.VRPERCAR <= 99";
            } else if (porcentCarga == 3 && porcentCarga != null && porcentCarga != undefined) {
                sqlWhereAux += " and G046.VRPERCAR >= 50 and G046.VRPERCAR <= 79";
            } else if (porcentCarga == 4 && porcentCarga != null && porcentCarga != undefined) {
                sqlWhereAux += " and G046.VRPERCAR >= 30 and G046.VRPERCAR <= 49";
            } else if (porcentCarga == 5 && porcentCarga != null && porcentCarga != undefined) {
                sqlWhereAux += " and G046.VRPERCAR >= 0 and G046.VRPERCAR <= 29";
            } else if (porcentCarga == 6 && porcentCarga != null && porcentCarga != undefined) {
                sqlWhereAux += " and G046.VRPERCAR = 0 ";
            } else if (porcentCarga == 7 && porcentCarga != null && porcentCarga != undefined) {
                sqlWhereAux += "";
            }




            // TIPO TRANSPORTE
            var G046_TPTRANSP = [];
            // if (bindValues.G046_TPTRANSP) {

            // 	for (var key in bindValues.G046_TPTRANSP) {

            // 		G046_TPTRANSP[key] = "'"+bindValues.G046_TPTRANSP[key]['id']+"'";

            // 	}

            // 	G046_TPTRANSP = G046_TPTRANSP.join(',');

            // 	sqlWhereAux += " AND G046.TPTRANSP in ("+G046_TPTRANSP+") ";

            // 	sqlWhere = sqlWhere.replace("G046.TPTRANSP = :G046_TPTRANSP0 And", "");
            // 	delete bindValues.G046_TPTRANSP;

            // }

            // STATUS CARGA
            //console.log(bindValues.G046_STCARGA);
            var G046_STCARGA = [];
            // if (bindValues.G046_STCARGA) {

            // 	for (var key in bindValues.G046_STCARGA) {

            // 		G046_STCARGA[key] = "'"+bindValues.G046_STCARGA[key]['id']+"'";

            // 	}

            // 	G046_STCARGA = G046_STCARGA.join(',');

            // 	sqlWhereAux += " AND G046.STCARGA in ("+G046_STCARGA+") ";

            // 	sqlWhere = sqlWhere.replace("G046.STCARGA = :G046_STCARGA0 And", "");
            // 	delete bindValues.G046_STCARGA;

            // }else{
            // 	delete bindValues.G046_STCARGA;
            // }




            logger.debug("Parametros buscar:", req.body);

            let result = await con.execute({
                    sql: `
				SELECT 
					COUNT(T_IDG046) AS TT_IDG046,
					SUM(T_VRCARGA) as TT_VRCARGA,
					SUM(T_PSCARGA) AS TT_PSCARGA,
					SUM(T_CAENTR) AS TT_CAENTR
				FROM (
					
				select distinct
				
								nvl(G046.IDG046,0) AS T_IDG046,
				
								 CASE WHEN  G046.STCARGA = 'D' THEN 1
								  ELSE 0
								END T_CAENTR,
				
								nvl(G046.VRCARGA,0) AS T_VRCARGA,
								nvl(G046.PSCARGA,0) AS T_PSCARGA
								From G046 G046
											Left Join G024 G024
												On G024.Idg024 = G046.Idg024
											Left Join S001 S001
												On S001.Ids001 = G046.Ids001
											Left Join G030 G030
												On G030.Idg030 = G046.Idg030
											Left Join S001 S001ca
												On S001ca.Ids001 = G046.Ids001ca
											Left Join G028 G028
												On G028.Idg028 = G046.Idg028
				
											Left Join G031 G031m1
												On G031m1.Idg031 = G046.Idg031m1
											Left Join G031 G031m2
												On G031m2.Idg031 = G046.Idg031m2
											Left Join G031 G031m3
												On G031m3.Idg031 = G046.Idg031m3
				
											Left Join G032 G032v1
												On G032v1.Idg032 = G046.Idg032v1
											Left Join G032 G032v2
												On G032v2.Idg032 = G046.Idg032v2
											Left Join G032 G032v3
												On G032v3.Idg032 = G046.Idg032v3	
												
				
											Left Join g048 g048 On g048.idg046 = g046.idg046
											Left Join g049 g049 On g049.idg048 = g048.idg048
											Left Join g051 g051 On g051.idg051 = g049.idg051
											Left Join g051 g051 On g051.idg051 = g049.idg051
											Left Join g052 g052 On g052.idg051 = g051.idg051
											Left Join g043 g043 On g043.idg043 = g052.idg043 
											${sqlWhere}
											${sqlWhereAux}
									
				) 
						`,
                    param: bindValues
                })
                .then((result) => {
                    return result;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            await con.close();
            console.log("Fim quantidade de situação de carga")
            return result;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    };




    /**
     * @description Update dados conhecimentos
     *
     * @async
     * @function api/atribuicaoMobileCarga
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */

    api.atribuicaoMobileCarga = async function(req, res, next) {

        logger.debug("Inicio atribuicaoMobileCarga");

        var objConn = await this.controller.getConnection(null);

        if (req.body.IDG046 != undefined || req.body.IDG046 != null) {

            var idCarga = req.body.IDG046;
            var snMobile = 'S';
            var sql = '';
            sql = `  SELECT G046.SNMOBILE,
							G046.IDG031M1,
							G046.DTINITRA,
							G046.DTFIMTRA,
							G046.STCARGA,
							(SELECT idm001
							FROM m001
							WHERE idg031 IN (G046.IDG031M1)
								AND STQRCODE = 'U'
								AND rownum <= 1) AS SNMOTMOB
					FROM G046 G046
					WHERE IDG046 IN (${idCarga}) `;

            var returCarga = await objConn.execute({ sql, param: [] })
                .then((result) => {
                    return result[0];
                })
                .catch((err) => {
                    objConn.closeRollback();
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            if (returCarga.DTINITRA != null || returCarga.DTFIMTRA != null || returCarga.STCARGA == 'T') {
                res.status(500);
                return { nrlogerr: -1, armensag: "A Carga já está em transporte" };
            }


            if (returCarga.SNMOBILE == 'S') {
                snMobile = 'N';
            } else {
                snMobile = 'S';
                if (returCarga.SNMOTMOB == null) {
                    res.status(500);
                    return { nrlogerr: -1, armensag: "O motorista não está configurado para utilizar o mobile. Por favor, verifique o cadastro" };
                }
            }

            sql = `  UPDATE G046
						SET SNMOBILE = '${snMobile}'
						WHERE IDG046 in (${idCarga}) `;

            var result = await objConn.execute({ sql, param: [] })
                .then((result) => {
                    objConn.close();
                    if (snMobile == 'S') {
                        return { response: "Atribuição REALIZADA com sucesso" };
                    } else {
                        return { response: "Atribuição RETIRADA com sucesso" };
                    }
                })
                .catch((err) => {
                    objConn.closeRollback();
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

        }
        return result;
    }

    /**
     * @description Busca dados Manifesto de Carga
     *
     * @async
     * @function api/getManifesto
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */

    api.getManifesto = async function(req, res, next) {

        logger.debug("Inicio relatorioMDF");

        var con = await this.controller.getConnection(null);

        try {

            let sql = `SELECT
												--CARGA
													G046.IDG046																												G046_IDG046
												, G046.IDCARLOG																											G046_IDCARLOG
												, TO_CHAR(G046.DTCARGA, 'dd/mm/yyyy')																G046_DTCARGA
												, TO_CHAR(G046.DTPSMANU, 'dd/mm/yyyy hh:mm')												G046_DTPSMANU

												--ARMAZÉM
												, G028.IDG028																												G028_IDG028
												, G028.NMARMAZE																											G028_NMARMAZE

												--TRANSPORTADORA
												, NVL(LPAD(G024.IDLOGOS, 4, '0'), LPAD(G024.IDG024, 4, '0'))				G024_IDTRANSP
												, G024.IDG024																												G024_IDG024
												, G024.IDLOGOS																											G024_IDLOGOS

												--MOTORISTA
												, G031.IDG031																												G031_IDG031
												, G031.NRMATRIC																											G031_NRMATRIC
												, G031.NMMOTORI																											G031_NMMOTORI
												, G031.CJMOTORI																											G031_CJMOTORI

												--VEÍCULO
												, G032.IDG032																												G032_IDG032
												, G032.NRFROTA																											G032_NRFROTA
												, G032.NRPLAVEI																											G032_NRPLAVEI
												, G032.DSRENAVA																											G032_DSRENAVA

												--PARADA
												, LPAD(G048.NRSEQETA, 3, '0')																				G048_NRSEQETA

												--CROSSDOCKING
												, NVL(LPAD(G024CD.IDLOGOS, 4, '0'), LPAD(G024CD.IDG024, 4, '0'))		G024CD_IDTRANSP
												, G024CD.IDG024																											G024CD_IDG024
												, G024CD.IDLOGOS																										G024CD_IDLOGOS
												, G024CD.NMTRANSP																										G024CD_NMTRANSP

												--DELIVERY
												, ( SELECT SUM(VRDELIVE) FROM ( SELECT
																													 DISTINCT G043A.VRDELIVE
																															 FROM G043 G043A
																													LEFT JOIN G049 G049A ON G049A.IDG043 = G043A.IDG043
																															WHERE G049A.IDG051   = G051.IDG051
																																AND G043A.SNDELETE = 0)
													) G043_VRDELIVE

												--CONHECIMENTO
												, G051.IDG051																												G051_IDG051
												, LPAD(G051.CDCTRC, 6, '0')																					G051_CDCTRC
												, G051.NRPESO																												G051_NRPESO
												, G051.VRTOTPRE																											G051_VRTOTPRE
												, G051.DSINFCPL																											G051_DSINFCPL

												--REMETENTE
												, G005RE.IDG005																											G005RE_IDG005
												, G005RE.NMCLIENT																										G005RE_NMCLIENT
												, G005RE.DSENDERE																										G005RE_DSENDERE

												--DESTINATÁRIO
												, G005DE.IDG005																											G005DE_IDG005
												, G005DE.NMCLIENT																										G005DE_NMCLIENT
												, G005DE.DSENDERE																										G005DE_DSENDERE

												--CIDADE DESTINATÁRIO
												, G003DE.IDG003																											G003DE_IDG003
												, G003DE.NMCIDADE																										G003DE_NMCIDADE

												--UF DESTINATÁRIO
												, G002DE.IDG002																											G002DE_IDG002
												, G002DE.CDESTADO																										G002DE_CDESTADO

												--NOTA
												, (SELECT LISTAGG(LPAD(NRNOTA, 8, '0'), ';') WITHIN GROUP(ORDER BY NRNOTA) NRNOTA
																 FROM G083 G083A
														LEFT JOIN G052 G052A ON G052A.IDG083 = G083A.IDG083
																WHERE G052A.IDG051 = G051.IDG051
													) G083_NRNOTA

										 FROM G046 G046																				--CARGA
								LEFT JOIN G028 G028   ON G028.IDG028   = G046.IDG028			--ARMAZÉM
								
								LEFT JOIN G031 G031   ON G031.IDG031   = G046.IDG031M1		--MOTORISTA
								LEFT JOIN G032 G032   ON G032.IDG032   = G046.IDG032V1		--VEÍCULO
								LEFT JOIN G048 G048   ON G048.IDG046   = G046.IDG046			--PARADAS
								LEFT JOIN G024 G024CD ON G024CD.IDG024 = G048.IDG024			--CROSSDOCKING
								LEFT JOIN G049 G049   ON G049.IDG048   = G048.IDG048			--CTE/PARADA
								LEFT JOIN G051 G051   ON G051.IDG051   = G049.IDG051			--CONHECIMENTO
                                                                         AND G051.SNDELETE = 0
                                LEFT JOIN G024 G024   ON G024.IDG024   = G051.IDG024	    --TRANSPORTADORA
								LEFT JOIN G005 G005RE ON G005RE.IDG005 = G051.IDG005RE		--REMETENTE
								LEFT JOIN G005 G005DE ON G005DE.IDG005 = G051.IDG005DE		--DESTINATÁRIO
								LEFT JOIN G003 G003DE ON G003DE.IDG003 = G005DE.IDG003		--CIDADE DESTINATÁRIO
								LEFT JOIN G002 G002DE ON G002DE.IDG002 = G003DE.IDG002		--UF DESTINATÁRIO

										WHERE G046.SNDELETE = 0
											AND G046.IDG046 In (${req.body.IDG046})

								GROUP BY
												--CARGA
													G046.IDG046
												, G046.IDCARLOG
												, G046.DTCARGA
												, G046.DTPSMANU

												--ARMAZÉM
												, G028.IDG028
												, G028.NMARMAZE

												--TRANSPORTADORA
												, G024.IDG024
												, G024.IDLOGOS

												--MOTORISTA
												, G031.IDG031
												, G031.NRMATRIC
												, G031.NMMOTORI
												, G031.CJMOTORI

												--VEÍCULO
												, G032.IDG032
												, G032.NRFROTA
												, G032.NRPLAVEI
												, G032.DSRENAVA

												--PARADA
												, G048.NRSEQETA

												--CROSSDOCKING
												, G024CD.IDG024
												, G024CD.IDLOGOS
												, G024CD.NMTRANSP

												--CONHECIMENTO
												, G051.IDG051
												, G051.CDCTRC
												, G051.NRPESO
												, G051.VRTOTPRE
												, G051.DSINFCPL

												--REMETENTE
												, G005RE.IDG005
												, G005RE.NMCLIENT
												, G005RE.DSENDERE

												--DESTINATÁRIO
												, G005DE.IDG005
												, G005DE.NMCLIENT
												, G005DE.DSENDERE

												--CIDADE DESTINATÁRIO
												, G003DE.IDG003
												, G003DE.NMCIDADE

												--UF DESTINATÁRIO
												, G002DE.IDG002
												, G002DE.CDESTADO

								 ORDER BY G048_NRSEQETA`;

            let result = await con.execute({ sql, param: [] })
                .then((result) => {
                    logger.debug("Retorno:", result);
                    return result;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });

            await con.close();
            logger.debug("Fim relatorioMDF");
            return result;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;

        }

    }

    //Salvar log de impressao 
    api.savePrintLog = async function(req, res, next) {
        logger.info("Inicio salvar arquivo upload (savePrintLog)");
        try {
            var con = await this.controller.getConnection(null, req.UserId);
            var sql = `INSERT INTO T015 
					(IDG046, IDS001, TPLOG) 
					VALUES 
					(${req.body.IDG046}, ${req.body.IDS001}, ${req.body.TPLOG})`

            let result = await con.execute({
                    sql,
                    param: {},
                })
                .then((result) => {
                    logger.info("Result", result)
                    return { response: "Configuração de EDI cadastrado com sucesso." };
                })
                .catch((err) => {
                    logger.error("Erro: ", err)
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            await con.close();
            return result;

        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    }

    /**
     * @description #listPrintLog um dados da tabela T015.
     *
     * @async
     * @function api/listPrintLog
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.listPrintLog = async function(req, res, next) {
        logger.debug("Inicio listPrintLog");
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            logger.debug("Parametros recebidos:", req.body);

            let result = await con.execute({
                    sql: `select T015.IDT015, T015.IDG046, T015.IDS001, T015.DTIMPRES, S001.NMUSUARI From T015 
                            Left join S001 on S001.IDS001 = T015.IDS001 
                    where T015.IDG046 = :parameter and T015.TPLOG = :parameter1 `,
                    param: {
                        parameter: req.body.IDG046,
                        parameter1: req.body.TPLOG
                    }
                })
                .then((result) => {
                    logger.debug("Retorno:", result);
                    return result;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });

            await con.close();
            logger.debug("Fim listar");
            return res.json(result);

        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;

        }

    };



    return api;
};