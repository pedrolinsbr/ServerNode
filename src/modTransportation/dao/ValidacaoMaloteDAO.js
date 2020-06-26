/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 31/10/2019
 *
*/

/**
 * @module dao/ValidacaoMaloteDAO
 * @description T012.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

    var api = {};
    var logger = app.config.logger;
    api.controller = app.config.ControllerBD;
    var moment = require('moment');

    api.listChadocs = async function (req, res, next) {
        logger.debug("Inicio listar");
        let con = await this.controller.getConnection(null, req.UserId);
        //RECEBENDO OS PARAMETROS
        const { NRCHADOC } = req.body;

        try {
            sql = `
                SELECT F003.IDG046
                FROM F003 F003
                WHERE F003.IDF001 IN (
                                        SELECT F001.IDF001
                                        FROM F001 F001
                                        WHERE F001.NRCHAMDF = '${NRCHADOC}'
                                        AND F001.STMDF = 'A'
                                    )
            `;
            let result = await con.execute({ sql, param: {} }).then(async carga => {
                if (carga.length > 0) {
                    let IDG046 = carga[0].IDG046;
                    let sql = `
                            SELECT 
                            DISTINCT F001.IDF001, F001.NRCHAMDF AS NRCHADOC, F001.NRMDF, 1 as STCHADOC, G031.NMMOTORI, G046.IDG031M1
                            FROM F001 F001
                            JOIN F003 F003 ON F003.IDF001 = F001.IDF001
                            JOIN G046 G046 ON G046.IDG046 = F003.IDG046
                            LEFT JOIN G031 G031 ON G031.IDG031 = G046.IDG031M1
                            WHERE F001.IDF001 IN (
                                                    SELECT F003.IDF001
                                                    FROM F003 F003
                                                    WHERE F003.IDG046 = ${IDG046}	
                                                 )
                            AND F001.STMDF IN ('A', 'P')
                    `;
                    let resultMDF = await con.execute({ sql, param: {} }).then(async mdfs => {
                        if (mdfs.length > 0) {
                            let nrMDFPendentes = '';
                            let mdfsPendentes = mdfs.filter(mdf => {
                                if(mdf.STMDF == 'P') {
                                    nrMDFPendentes += `${mdf.NRMDF}, `
                                    return mdf;
                                }
                            });
                            if(mdfsPendentes.length > 0) {
                                return res.status(403).json({ chadocs: [], msg: `Existe o(s) MDF-e, ${nrMDFPendentes} pendente para ser ativos.` });
                            }
                            let sql = `
                                    SELECT DISTINCT 
                                        G051.IDG051,
                                        NVL(G051.NRCHADOC, G051.CDCTRC) AS NRCHADOC,
                                        G046.IDG046,
                                        G051.CDCTRC,
                                        1 as STCHADOC                  
                                    FROM G046 G046
                                    JOIN G048 G048
                                    ON G048.IDG046 = G046.IDG046
                                    JOIN G049 G049
                                    ON G049.IDG048 = G048.IDG048
                                    JOIN G051 G051
                                    ON G051.IDG051 = G049.IDG051          
                                    WHERE G046.IDG046 IN (${IDG046})
                                    AND G051.SNDELETE = 0
                                `;
                            let resultCTES = await con.execute({ sql, param: {} }).then(async ctes => {
                                if (ctes.length > 0) {
                                    let allNfs = [];
                                    for (const [index, cte] of ctes.entries()) {                                        
                                        let sql = `
                                            SELECT 
                                                DISTINCT 
                                                G052.IDG051,
                                                G083.IDG043,
                                                G083.NRNOTA,
                                                NVL(G083.NRCHADOC, G083.NRNOTA) AS NRCHADOC,
                                                G046.IDG046,
                                                G083.IDG083,
                                                1 as STCHADOC
                                            FROM G046 G046
                                            JOIN G048 G048
                                                ON G048.IDG046 = G046.IDG046
                                            JOIN G049 G049
                                                ON G049.IDG048 = G048.IDG048
                                            JOIN G052 G052
                                                ON G052.IDG051 = G049.IDG051
                                            JOIN G083 G083
                                                ON G083.IDG083 = G052.IDG083
                                                WHERE G052.IDG051 IN (${cte.IDG051})
                                                AND G046.IDG046 = ${IDG046}
                                                AND G083.SNDELETE = 0
                                        `;
                                        await con.execute({ sql, param: {} }).then(async nfs => {
                                            if (nfs.length > 0) {
                                                nfs.forEach(nf => {
                                                    allNfs.push(nf);                                                    
                                                });
                                                cte.nfs = [...nfs];
                                                if(index + 1 === ctes.length) {
                                                    chadocs = {
                                                        ctes: [...ctes],
                                                        mdfs: [...mdfs],
                                                        nfs: [...allNfs]
                                                    };
                                                    let sql = `
                                                        SELECT T012.IDG046
                                                        FROM T012 T012
                                                        WHERE T012.IDG046 = ${IDG046}
                                                    `;
                                                    await con.execute({ sql, param: {} }).then(async valid => {
                                                        chadocs.valid = valid.length > 0 ? true : false;
                                                        await con.close();
                                                        return res.json({ chadocs, msg: 'Chadocs retornado com sucesso!' });
                                                    })
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                } else {
                    await con.close();
                    return res.status(403).json({ chadocs: [], msg: 'Nenhuma carga encontrada com esse código de barra.' });
                }
            }).catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                logger.error("Erro:", err);
                throw err;
            });
        } catch (error) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    }

    api.createValidation = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        //RECEBENDO OS PARAMETROS
        const { chadocs } = req.body;
        
        try {
            let query = '';
            chadocs.map(insert => {
                let data = insert.DTVALIDA ? new moment(insert.DTVALIDA).format('YYYY-MM-DD HH:mm:ss') : new moment().format('YYYY-MM-DD HH:mm:ss');
                query += `
                        INTO T012(IDG043, IDG051, IDG046, IDG083, IDF001, DTVALIDA, IDS025, IDS001)
                        VALUES(${insert.IDG043 ? insert.IDG043 : null}, ${insert.IDG051 ? insert.IDG051 : null}, ${insert.IDG046 ? insert.IDG046 : null}, ${insert.IDG083 ? insert.IDG083 : null}, ${insert.IDF001 ? insert.IDF001 : null}, TO_DATE('${data.toLocaleString()}', 'YYYY-MM-DD HH24:MI:SS'), ${insert.IDS025 ? insert.IDS025 : 7}, ${req.body.IDS001})
                    `;
            });
            let sql = `
                INSERT ALL
                ${query}
                SELECT * FROM DUAL
                `;
            let result = await con.execute({ sql, param: {} }).catch(err => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                logger.error("Erro:", err);
                throw err;
            });
            await con.close();
            return result;
        } catch (error) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    }

    return api;
}
