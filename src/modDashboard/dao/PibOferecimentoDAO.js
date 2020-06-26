module.exports = function (app, cb) {
    
    const util = app.src.utils.FuncoesObjDB;
    const gdao = app.src.modGlobal.dao.GenericDAO;
    const acl  = app.src.modIntegrador.controllers.FiltrosController;
    var api    = {};
    api.controller = app.config.ControllerBD;

    //-----------------------------------------------------------------------\\ 
    
    api.listaCargas = async function (req) {

        try {

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = util.retWherePagOrd(req.body, 'G046', true);

            var sqlACL = await this.getACL(req);

            if (bindValues.G046_DTCARGA0 == undefined) {
                sqlWhere += " AND TO_CHAR(G046.DTCARGA,'MM/YYYY') = TO_CHAR(CURRENT_DATE, 'MM/YYYY') ";
            }

            var arCols =
                [
                    'G046.IDG046',
                    'G046.TPTRANSP',
                    'G046.STCARGA',
                    'G046.VRPOROCU',
                    'G046.SNCARPAR',
                    'G046.VRFREREC',
                    'G046.PSCARGA',
                    'G046.DTCARGA',
                    'G024.IDG024',
                    'G024.NMTRANSP',
                    'G028.IDG028',
                    'G028.NMARMAZE',
                    'G030.IDG030',
                    'G030.DSTIPVEI',
                    'G030.QTCAPPES',
                    'O005.IDO005',
                    'O005.STOFEREC',
                    'O005.TPOFEREC',
                    'O005.VRFREPAG',
                    'O005.DTOFEREC',
                    'O005.DTRESOFE',
                    'O004.IDO004',
                    'O004.DSMOTIVO'
                ]

            var sql = 
                `SELECT 
                    ${arCols.join()},
                    
                    TO_CHAR(O005.DTOFEREC, 'DD/MM/YYYY HH24:MI') DTOFECAR,
                    TO_CHAR(O005.DTRESOFE, 'DD/MM/YYYY HH24:MI') DTRESCAR,
                    TO_CHAR(G046.DTCARGA,  'DD/MM/YYYY HH24:MI') DATACARGA,
                    
                    CASE
                    	WHEN G046.SNCARPAR = 'S' THEN 'LTL'
                    	WHEN G046.SNCARPAR = 'N' THEN 'FTL'
                    	ELSE 'ITL'
                    END TPOCUPAC,
                    
                    CASE 
                        WHEN G046.STCARGA = 'B' THEN 'BACKLOG'
                        WHEN G046.STCARGA = 'R' THEN 'DISTRIBUÍDA'
                        WHEN G046.STCARGA = 'O' THEN 'OFERECIDA'
                        WHEN G046.STCARGA = 'X' THEN 'RECUSADA'
                        WHEN G046.STCARGA = 'A' THEN 'ACEITA'
                        WHEN G046.STCARGA = 'S' THEN 'AGENDADA'
                        WHEN G046.STCARGA = 'P' THEN 'PRÉ-APROVAÇÃO'
                        WHEN G046.STCARGA = 'T' THEN 'TRANSPORTE'
                        WHEN G046.STCARGA = 'C' THEN 'CANCELADA'
                        ELSE 'OUTRO'
                    END DSSTACAR,
                    
                 	CASE
                        WHEN O005.TPOFEREC = 'B' THEN 'BID'
                        WHEN O005.TPOFEREC = 'S' THEN 'SAVE'
                        WHEN O005.TPOFEREC = 'O' THEN 'SPOT'
                        ELSE 'OUTRO'
                    END AS DSMODELO,
                    
                    COUNT(*) OVER() COUNT_LINHA

                FROM G046 
                	
                INNER JOIN G028 
                	ON G028.IDG028 = G046.IDG028
                	
				INNER JOIN G030 
					ON G030.IDG030 = G046.IDG030
                    
               ${this.getSqlInn()}
                
                LEFT JOIN G024 
                	ON G024.IDG024 = G046.IDG024

                LEFT JOIN O005 
                    ON O005.IDG046 = G046.IDG046
                    AND O005.IDG024 = G046.IDG024
                    
                LEFT JOIN O004 
                	ON O004.IDO004 = O005.IDO004

                ${sqlWhere} 
                ${sqlACL}
                ${this.getSqlDefault()}
                    
                GROUP BY 
                    ${arCols.join()}
                    
                ${sqlOrder}
                ${sqlPaginate}
                `;


            await gdao.controller.setConnection(req.objConn);
            var arRS = await gdao.executar({ sql, bindValues, objConn: req.objConn });
            return util.construirObjetoRetornoBD(arRS);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.totalOferecimentosGrupo = async function (req, res, next) {

        try {

        delete req.body.STCARGA;

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = util.retWherePagOrd({parameter:req.body}, 'G046', true);

        if (bindValues.G046_DTCARGA0 == undefined) {
            sqlWhere += " AND TO_CHAR(G046.DTCARGA,'MM/YYYY') = TO_CHAR(CURRENT_DATE, 'MM/YYYY') ";
        }

            var sql = 
                `SELECT
                    SUM(CASE WHEN QTOFEREC = 1 THEN 1 ELSE 0 END) TTOFERE1,
                    SUM(CASE WHEN QTOFEREC = 2 THEN 1 ELSE 0 END) TTOFERE2,
                    SUM(CASE WHEN QTOFEREC > 2 THEN 1 ELSE 0 END) TTOFEREM
                FROM
                (
            
                    SELECT 
                        G046A.IDG046,
                        COUNT(*) QTOFEREC
                    FROM G046 G046A
                    
                    INNER JOIN O005 
                        ON O005.IDG046 = G046A.IDG046
                    
                    INNER JOIN (
                    
                        SELECT 
                            G046.IDG046
                        FROM G046 
                    
                        ${this.getSqlInn()}
                    
                            ${sqlWhere}
                            -- AND G046.STCARGA IN ('B','R','O','X','S','P')
                            AND G046.STCARGA = 'S'
                            ${req.sqlACL}
                            ${this.getSqlDefault()}                        
                        
                        GROUP BY
                            G046.IDG046                    
                    
                    ) Q ON Q.IDG046 = G046A.IDG046
            
                    GROUP BY G046A.IDG046
                )`;
    
            await gdao.controller.setConnection(req.objConn);
    
            return await gdao.executar({ sql, bindValues, objConn: req.objConn }, res, next);

        } catch (err) {

            throw err;

        }

    };

    //-----------------------------------------------------------------------\\    

    api.buscarVeiculos = async function (req, res, next) {

        try {

            var arCols =
                [
                    'G030.IDG030',
                    'G030.DSTIPVEI',
                    'G030.QTCAPPES'
                ];

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = util.retWherePagOrd({parameter:req.body}, 'G046', true);

            if (bindValues.G046_DTCARGA0 == undefined) {
                sqlWhere += " AND TO_CHAR(G046.DTCARGA,'MM/YYYY') = TO_CHAR(CURRENT_DATE, 'MM/YYYY') ";
            }

            var sql = 
                `SELECT 
                    ${arCols.join()},
                    AVG(NVL(G046A.VRPOROCU, 0)) MDOCUPAC,
                    COUNT(G046A.IDG046) TTCARVEI,
                    SUM(COUNT(G046A.IDG046)) OVER() TTCARGAS,
                    ((COUNT(G046A.IDG046) / SUM(COUNT(G046A.IDG046)) OVER()) * 100) PCTIPCAR

                FROM G030 -- VEICULOS
                
                INNER JOIN G046 G046A -- CARGAS
                    ON G046A.IDG030 = G030.IDG030

                INNER JOIN 
                (
                    SELECT 
                        G046.IDG046
                    FROM G046 
        
                    ${this.getSqlInn()}

                    ${sqlWhere}
                    ${req.sqlACL}
                    ${this.getSqlDefault()}
                    AND G046.SNCARPAR <> 'S'
                    AND G046.STCARGA IN ('B','R','O','X','S','P')
                    

                    GROUP BY
                        G046.IDG046
                )  Q 
                    ON Q.IDG046 = G046A.IDG046                

                GROUP BY 
                    ${arCols.join()}
                    
                ORDER BY G030.QTCAPPES`;
    
            await gdao.controller.setConnection(req.objConn);
    
            return await gdao.executar({ sql, bindValues, objConn: req.objConn });

        } catch (err) {

            throw err;

        }

    };

    //-----------------------------------------------------------------------\\    

    api.buscarQualidadeOferecimento = async function (req, res, next) {

        try {

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = util.retWherePagOrd({parameter:req.body}, 'G046', true);

            if (bindValues.G046_DTCARGA0 == undefined) {
                sqlWhere += " AND TO_CHAR(G046.DTCARGA,'MM/YYYY') = TO_CHAR(CURRENT_DATE, 'MM/YYYY') ";
            }

            var sql = 
                `SELECT
                    G046A.SNCARPAR,
                    CASE
                        WHEN G046A.SNCARPAR = 'S' THEN 'LTL'
                        ELSE 'FTL'
                    END TPOCUPAC,
                    SUM(G046A.PSCARGA) PSOCUPAC,
                    SUM(SUM(G046A.PSCARGA)) OVER() PSTOTOCU,
                    ((SUM(G046A.PSCARGA) / SUM(SUM(G046A.PSCARGA)) OVER()) * 100) PCTOTOCU,
                    COUNT(G046A.IDG046) TTCARTIP,
                    SUM(COUNT(G046A.IDG046)) OVER() TTCARGER,
                    (COUNT(G046A.IDG046) / SUM(COUNT(G046A.IDG046)) OVER() * 100) PCTIPCAR

                FROM
                    G046 G046A 
                
                INNER JOIN 
                (
                    SELECT 
                        G046.IDG046
                    FROM G046 
        
                    ${this.getSqlInn()}

                    ${sqlWhere}
                    ${req.sqlACL}
                    ${this.getSqlDefault()}
                    AND G046.STCARGA IN ('B','R','O','X','S','P')

                    GROUP BY
                        G046.IDG046
                )  Q 
                    ON Q.IDG046 = G046A.IDG046
            
                GROUP BY
                    G046A.SNCARPAR   
                `;
    
            await gdao.controller.setConnection(req.objConn);
    
            return await gdao.executar({ sql, bindValues, objConn: req.objConn });

        } catch (err) {

            throw err;

        }

    };

     //-----------------------------------------------------------------------\\   

    api.buscarStatus = async function (req, res, next) {

        try {

        delete req.body.STCARGA;

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = util.retWherePagOrd({parameter:req.body}, 'G046', true);

        if (bindValues.G046_DTCARGA0 == undefined) {
            sqlWhere += " AND TO_CHAR(G046.DTCARGA,'MM/YYYY') = TO_CHAR(CURRENT_DATE, 'MM/YYYY') ";
        }

            var sql = 
                `SELECT 	
                    G046A.STCARGA,
                    SUM(CASE WHEN Q.TMHORA < 2 THEN 1 ELSE 0 END) TTHORA1,
                    SUM(CASE WHEN ((Q.TMHORA >=2) AND (Q.TMHORA < 3)) THEN 1 ELSE 0 END) TTHORA2,
                    SUM(CASE WHEN (Q.TMHORA >= 3) THEN 1 ELSE 0 END) TTHORAM,
                    COUNT(*) TTSTATUS
                
                FROM G046 G046A
            
                INNER JOIN 
                (
                    SELECT
                        G046.IDG046,
                        (24 * (CURRENT_DATE - G046.DTCARGA)) TMHORA

                    FROM G046    

                    ${this.getSqlInn()}

                        ${sqlWhere}
                        AND G046.STCARGA IN ('B','R','O','X','S','P')
                        ${req.sqlACL}
                        ${this.getSqlDefault()}
                                        
                    GROUP BY
                        G046.IDG046,
                        G046.DTCARGA
                ) Q ON Q.IDG046 = G046A.IDG046
        
                GROUP BY 
                    G046A.STCARGA`;
    
            await gdao.controller.setConnection(req.objConn);
    
            return await gdao.executar({ sql, bindValues, objConn: req.objConn });

        } catch (err) {

            throw err;

        }

    };

    //-----------------------------------------------------------------------\\  

    api.getACL = async function (req) {

        try {

            var sqlACL = await acl.montar({
                ids001: req.headers.ids001,
                dsmodulo: 'dashboard',
                nmtabela: [{ G014: 'G014' }],
                esoperad: 'And '
            });
    
            if (typeof(sqlACL) == 'undefined') sqlACL = '';

            return sqlACL;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    
    api.getSqlInn = () => {

        var sqlInn = 
            `
            INNER JOIN G048
                ON G048.IDG046 = G046.IDG046
            INNER JOIN G049
                ON G049.IDG048 = G048.IDG048
            INNER JOIN G043
                ON G043.IDG043 = G049.IDG043
            INNER JOIN G014
                ON G014.IDG014 = G043.IDG014 
            `;

        return sqlInn;

    }

    //-----------------------------------------------------------------------\\  

    api.getSqlDefault = () => {

        var sql = 
            `
                AND G046.TPMODCAR IN (2,3) -- 4PL / MISTO
                AND G046.IDG028 IS NOT NULL 
                AND G046.IDG030 IS NOT NULL
                AND NVL(G046.SNVIRA,'N') = 'N'
            `;

        return sql;

    }

    //-----------------------------------------------------------------------\\  

    return api;
}
