module.exports = function (app, cb) {
    var api = {};
    var logger = app.config.logger;
    var acl = app.src.modIntegrador.controllers.FiltrosController;
    var utils = app.src.utils.FuncoesObjDB;
    api.controller = app.config.ControllerBD;
    const gdao = app.src.modGlobal.dao.GenericDAO;

    api.listarNfs = async function (req, res, next) {
        let con = await this.controller.getConnection();
        let defaulMonth = false;
        try {
            let sqlWhereAcl = await acl.montar({
                ids001: req.headers.ids001,
                dsmodulo: "dashboard",
                nmtabela: [
                    {
                        G014: 'G014'
                    }
                ],
                esoperad: 'And '
            });
            if (typeof sqlWhereAcl == 'undefined') {
                sqlWhereAcl = '';
            }
            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', false);
            //Variavel responsavel por verificar se está sendo passado o filtro de data
            const filter = sqlWhere.indexOf('DTENTREG');
            if (filter >= 0) {
                defaulMonth = true;
            }
            //Query responsavel por retornar todas as notas fiscais com data de entrega e situação de etapa 5 = entregue
            let result = await con.execute(
                {
                    sql: `
                    SELECT 	
                        COUNT(G002.CDESTADO) AS LABEL,
                        G002.CDESTADO,
                        NVL(G005.NRLATITU, G003.NRLATITU) AS NRLATITU,
                        NVL(G005.NRLONGIT, G003.NRLONGIT) AS NRLONGIT,
                        EXTRACT(MONTH FROM SYSDATE) AS MONTH
                    FROM G043 G043
                    INNER JOIN G005 G005 ON (G005.IDG005 = G043.IDG005RE)
                    INNER JOIN G003 G003 ON (G003.IDG003 = G005.IDG003)
                    INNER JOIN G002 G002 ON (G002.IDG002 = G003.IDG002)
                    ${defaulMonth
                            ? sqlWhere
                            : `WHERE EXTRACT(MONTH FROM G043.DTEMINOT)  =  EXTRACT(MONTH FROM SYSDATE)
                           AND EXTRACT (YEAR FROM G043.DTEMINOT) = EXTRACT(YEAR FROM SYSDATE)`}
                    ${sqlWhereAcl}
                    and G043.DTENTREG IS NULL
                    AND G043.STETAPA in (4, 24)
                    GROUP BY G002.CDESTADO, G005.NRLONGIT, NVL(G005.NRLATITU, G003.NRLATITU), NVL(G005.NRLONGIT, G003.NRLONGIT), EXTRACT(MONTH FROM SYSDATE)
                    ORDER BY G002.CDESTADO ASC
                    `,
                    param: defaulMonth ? bindValues : []
                }
            ).then(async resultEstado => {
                if (resultEstado) {
                    let resultCidade = await con.execute(
                        {
                            sql: `
                            SELECT 	
                                COUNT(G003.NMCIDADE) AS LABEL,
                                G003.NMCIDADE,
                                G003.NRLATITU,
                                G003.NRLONGIT,
                                EXTRACT(MONTH FROM SYSDATE) AS MONTH
                            FROM G043 G043
                            INNER JOIN G005 G005 ON (G005.IDG005 = G043.IDG005RE)
                            INNER JOIN G003 G003 ON (G003.IDG003 = G005.IDG003)
                            ${defaulMonth
                                    ? sqlWhere
                                    : `WHERE EXTRACT(MONTH FROM G043.DTEMINOT)  =  EXTRACT(MONTH FROM SYSDATE)
                                    AND EXTRACT (YEAR FROM G043.DTEMINOT) = EXTRACT(YEAR FROM SYSDATE)`}
                            AND G043.DTENTREG IS NULL
                            AND G043.STETAPA in (4, 24)
                            GROUP BY G003.NMCIDADE, G003.NRLATITU, G003.NRLONGIT, EXTRACT(MONTH FROM SYSDATE)
                            ORDER BY G003.NMCIDADE ASC
                            `,
                            param: defaulMonth ? bindValues : []
                        }
                    ).then(result2 => {
                        if (result2) {
                            return result2;
                        }
                    })
                    return nfs = { resultEstado, resultCidade };
                } else {
                    return nfs = {};
                }
            }).catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                logger.error("Erro:", err);
                throw err;
            });
            await con.close();
            logger.debug("Fim listar");
            return result;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    }

    api.buscarDadosLocalizacao = async function (req, res, next) {

        let sqlWhereAcl = await acl.montar({
            ids001: req.headers.ids001,
            dsmodulo: "dashboard",
            nmtabela: [
                {
                    G014: 'G014'
                }
            ],
            esoperad: 'And '
        });
        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        req.sql = `
        SELECT

            G043.IDG043,
            G043.NRNOTA,
            G043.DTEMINOT,
            
            NVL(G060.NRLATITU, G005RE.NRLATITU) NRLATITU,
            NVL(G060.NRLONGIT, G005RE.NRLONGIT) NRLONGIT
            
            FROM G043 
            
                INNER JOIN G052 ON G052.IDG043 = G043.IDG043
                
                INNER JOIN G051 ON G052.IDG051 = G051.IDG051

                INNER JOIN G060 ON G060.IDG043 = G043.IDG043 AND G060.DTPOSICA = (SELECT MAX(G060X.DTPOSICA) FROM G060 G060X WHERE G060X.IDG043 = G043.IDG043)
                
                INNER JOIN G005 G005RE ON G043.IDG005RE = G005RE.IDG005

                INNER JOIN G003 G003RE ON G003RE.IDG003 = G005RE.IDG003

                INNER JOIN G014 G014 ON (G043.IDG014 = G014.IDG014) -- OPERACAO
            
                WHERE G043.SNDELETE = 0
                AND G051.SNDELETE = 0
                AND G051.STCTRC = 'A'
                AND G043.DTENTREG IS NULL
                ${req.body.date}
                ${req.body.tptransp}
                ${req.body.auxG014}
                ${req.body.auxG005}
                ${sqlWhereAcl}
            
            GROUP BY
            G043.IDG043,
            G043.NRNOTA,
            G043.DTEMINOT,
            G060.NRLATITU,
            G060.NRLONGIT,
            G005RE.NRLATITU,
            G005RE.NRLONGIT`

        return await gdao.executar(req, res, next).catch((err) => { throw err });

    }

    api.buscarDadosCalor = async function (req, res, next) {

        let sqlWhereAcl = await acl.montar({
            ids001: req.headers.ids001,
            dsmodulo: "dashboard",
            nmtabela: [
                {
                    G014: 'G014'
                }
            ],
            esoperad: 'And '
        });
        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        let DTINIPER = (req.body.DTINIPER)? req.body.DTINIPER : '2018-01-01 00:00:00';
        let DTFINPER = (req.body.DTFINPER)? req.body.DTFINPER : '2018-02-01 00:00:00';

        req.sql = `
        SELECT

            G043.IDG043,
            G043.NRNOTA,
            G043.DTEMINOT,
            G014.IDG014,
            
            NVL(G005DE.NRLATITU, '') NRLATITU,
            NVL(G005DE.NRLONGIT, '') NRLONGIT
            
            FROM G043 
            
                INNER JOIN G052 ON G052.IDG043 = G043.IDG043
                
                INNER JOIN G051 ON G052.IDG051 = G051.IDG051

                LEFT JOIN G046 ON G046.IDG046 = G051.IDG046 AND G046.SNDELETE = 0 -- CARGA
                            
                LEFT JOIN G024 G024 ON (G046.IDG024 = G024.IDG024) -- TRANSPORTADORA 
                
                LEFT JOIN G048 ON G048.IDG046 = G046.IDG046 -- PARADA

                JOIN G049 ON G049.IDG048 = G048.IDG048 and G049.IDG043 = G043.IDG043
                
                INNER JOIN G005 G005DE ON G043.IDG005DE = G005DE.IDG005

                INNER JOIN G003 G003DE ON G003DE.IDG003 = G005DE.IDG003

                INNER JOIN G014 G014 ON (G043.IDG014 = G014.IDG014) -- OPERACAO
            
                WHERE G043.SNDELETE = 0
                AND G051.SNDELETE = 0
                AND G051.STCTRC = 'A'
                AND G043.DTEMINOT >=  TO_DATE('${DTINIPER}', 'YYYY-MM-DD HH24:MI:SS')
                AND G043.DTEMINOT <=   TO_DATE('${DTFINPER}', 'YYYY-MM-DD HH24:MI:SS')
                --${req.body.aux}
                --${req.body.date}
                ${req.body.DTENTREG}
                ${req.body.tptransp}
                ${req.body.auxG014}
                ${req.body.auxG005}
                ${sqlWhereAcl}
            
            GROUP BY
            G043.IDG043,
            G043.NRNOTA,
            G043.DTEMINOT,
            G014.IDG014,
            G005DE.NRLATITU,
            G005DE.NRLONGIT`

        return await gdao.executar(req, res, next).catch((err) => { throw err });

    }

    api.buscarDadosCalorMesAnterior = async function (req, res, next) {

        let sqlWhereAcl = await acl.montar({
            ids001: req.headers.ids001,
            dsmodulo: "dashboard",
            nmtabela: [
                {
                    G014: 'G014'
                }
            ],
            esoperad: 'And '
        });
        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        req.sql = `
        SELECT

            G043.IDG043,
            G043.NRNOTA,
            G043.DTEMINOT,
            G014.IDG014,
            
            NVL(G005DE.NRLATITU, '') NRLATITU,
            NVL(G005DE.NRLONGIT, '') NRLONGIT
            
            FROM G043 
            
                INNER JOIN G052 ON G052.IDG043 = G043.IDG043
                
                INNER JOIN G051 ON G052.IDG051 = G051.IDG051

                LEFT JOIN G046 ON G046.IDG046 = G051.IDG046 AND G046.SNDELETE = 0 -- CARGA
                            
                LEFT JOIN G024 G024 ON (G046.IDG024 = G024.IDG024) -- TRANSPORTADORA 
                
                LEFT JOIN G048 ON G048.IDG046 = G046.IDG046 -- PARADA

                JOIN G049 ON G049.IDG048 = G048.IDG048 and G049.IDG043 = G043.IDG043
                
                INNER JOIN G005 G005DE ON G043.IDG005DE = G005DE.IDG005

                INNER JOIN G003 G003DE ON G003DE.IDG003 = G005DE.IDG003

                INNER JOIN G014 G014 ON (G043.IDG014 = G014.IDG014) -- OPERACAO
            
                WHERE G043.SNDELETE = 0
                AND G051.SNDELETE = 0
                AND G051.STCTRC = 'A'
                AND TO_CHAR(G043.DTEMINOT , 'YYYY-MM') = '${req.body.dataAUX}' 
                AND G043.DTENTREG IS NULL
                ${req.body.tptransp}
                ${req.body.auxG014}
                ${req.body.auxG005}
                ${sqlWhereAcl}
            
            GROUP BY
            G043.IDG043,
            G043.NRNOTA,
            G043.DTEMINOT,
            G014.IDG014,
            G005DE.NRLATITU,
            G005DE.NRLONGIT`

        return await gdao.executar(req, res, next).catch((err) => { throw err });

    }

    return api;
}