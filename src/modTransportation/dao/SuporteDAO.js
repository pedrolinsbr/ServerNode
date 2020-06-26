/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 28/06/2018
 * 
 */

/** 
 * @module dao/OcorrenciaCarga
 * @description G067.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
 */
module.exports = function (app, cb) {

    var api = {};
    var utils = app.src.utils.FuncoesObjDB;
    var dicionario = app.src.utils.Dicionario;
    var dtatu = app.src.utils.DataAtual;
    var acl = app.src.modIntegrador.controllers.FiltrosController;
    var logger = app.config.logger;
    api.controller = app.config.ControllerBD;
    const tmz = app.src.utils.DataAtual;


    /**
     * @description Listar um dado na tabela G067.
     *
     * @async
     * @function api/buscar
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */


    api.getInfoByCarga = async function (req, res, next) {
        logger.debug("Inicio getInfoByCarga");
        let con = await this.controller.getConnection(null, req.UserId);
        let objRetorno = null;
        
        try {
            
            logger.debug("Parametros buscar:", req.body);

            let params = await con.execute({
                sql: `SELECT G046.IDG046, G046.IDCARLOG, G046.IDG024, G046.IDG031M1, G046.IDG032V1 
                        FROM G046 WHERE (G046.IDG046 = :idEvolog or G046.IDCARLOG = :idLogos ) `,
                param: { idEvolog:  req.body.CARGA,
                         idLogos: req.body.IDCARLOG }
            }).then((result) => {
                logger.info("Paramtros consulta ", result);
                return result[0];
            }).catch((err) => {
                logger.info("Erro na busca dos parametros ", err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                return '';
            });

            if ( (typeof params == "undefined") || (params == '' ) || (params == null ) || (params == "undefined") ) {
                return { response: 'Código de carga não encontrado.' };
            }else {
                //Inicio das validações
                let STCARGA = await con.execute({
                    sql: ` select G046.STCARGA From G046 G046 where G046.IDG046 = ${params.IDG046} `,
                    param: {}
                }).then((result1) => {
                    return result1[0];
                }).catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

                // Verifica se há veiculo
                let HASVEICULO = await con.execute({
                    sql: ` select COALESCE(count(IDG032V1), 0, 1) HASVEICULO From G046 where IDG046 = ${params.IDG046} `,
                    param: {}
                }).then((result) => {
                    return (result[0]);
                }).catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

                // Verifica se há motorista
                let HASMOTORISTA = await con.execute({
                    sql: ` select COALESCE(count(IDG031M1), 0, 1) HASMOTORISTA From G046 where IDG046 =  ${params.IDG046} `,
                    param: { }
                }).then((result) => {
                    logger.debug("Retorno:", result);
                    return (result[0]);
                }).catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

                // Verifica se COF do motorista tem 11 digitos 
                let HASMOTOVALID = await con.execute({
                    sql: ` select G031.CJMOTORI HASMOTOVALID From G046 left join G031 ON G031.IDG031 = G046.IDG031M1 where G046.IDG046 = ${params.IDG046} `,
                    param: { }
                }).then((result) => {
                    logger.debug("Retorno HASMOTOVALID:", result);
                    return (result[0]);
                }).catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });


                // Verifica se há cte cancelado 
                let HASCTECANCEL = await con.execute({
                    sql: `select count(G051.IDG051) HASCTECANCEL from G051 where G051.IDG046 =  ${params.IDG046} AND G051.STCTRC <> 'A'  `,
                    param: {}
                }).then((result) => {
                    logger.debug("Retorno:", result);
                    return (result[0]);
                }).catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

                //Verifica se carga é municipal 
                let ISINTERMUNI = await con.execute({
                    sql: ` select COUNT(IDG051) ISINTERMUNI from G051 where G051.IDG046 =  ${params.IDG046} AND G051.DSMODENF <> 'NF' AND G051.NRCHADOC is not null  `,
                    // NAO GERAR 
                    param: { }
                }).then((result) => {
                    logger.info("Retorno ISINTERMUNI:", result);
                    return (result[0]);
                }).catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

                /**Valida se as deliveries estão ativas */
                let ISDELIVERYATIVA = await con.execute(
                    {
                        sql: `SELECT COUNT(G043.IDG043) AS ISDELIVERYATIVA 
                        FROM G046
                        INNER JOIN G048 G048 ON G048.IDG046 = G046.IDG046
                        INNER JOIN G049 G049 ON G049.IDG048 = G048.IDG048 
                        INNER JOIN G052 G052 ON G052.IDG051 = G049.IDG051 
                                            AND G052.IDG043 = G049.IDG043
                        INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
                        INNER JOIN G043 G043 ON G043.IDG043 = G052.IDG043 
                        WHERE G046.IDG046 =  ${params.IDG046}
                        AND NVL(G043.STETAPA,0) IN (7,8)`,
                        param: { }
                    })
                    .then((result) => {
                        return result[0];
                    })
                    .catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        return '';
                    });

                let HASMANIFMOTVEI = await con.execute({
                    sql: `SELECT LISTAGG(X.NRMDF, ', ') WITHIN GROUP(ORDER BY X.NRMDF) AS QTD FROM (
                        SELECT DISTINCT F001.NRMDF, G024.NMTRANSP
                        FROM F001 F001
                        INNER JOIN F003 F003 ON F001.IDF001 = F003.IDF001
                          INNER JOIN F002 F002 ON F002.IDF001 = F001.IDF001 AND F002.NRSEQUEN = (SELECT MAX(X.NRSEQUEN) FROM F002 X WHERE X.IDF001 = F001.IDF001)
                          INNER JOIN G046 G046 ON G046.IDG046 = F003.IDG046
                          INNER JOIN G048 G048 ON G048.IDG046 = G046.IDG046
                          INNER JOIN G005 G005 ON G005.IDG005 = G048.IDG005DE
                          INNER JOIN G003 G003 ON G003.IDG003 = G005.IDG003
                          INNER Join G024 G024 On (G024.IDG024 = F001.IDG024)
                          WHERE F001.IDG024 = ${params.IDG024}
                            AND G046.IDG032V1 = ${params.IDG032V1}
                            AND G046.IDG031M1 = ${params.IDG031M1}
                            AND G048.IDF001 IS NOT NULL
                            AND F002.IDG002 IN (SELECT DISTINCT G003X.IDG002
                            FROM G046 G046X
                          INNER JOIN G048 G048X
                              ON G048X.IDG046 = G046X.IDG046
                          INNER JOIN G005 G005X
                              ON G005X.IDG005 = G048X.IDG005DE
                          INNER JOIN G003 G003X
                              ON G003X.IDG003 = G005X.IDG003
                          WHERE G046X.IDG046 =  ${params.IDG046} AND G048X.IDF001 IS NULL)
                            AND F001.STMDF NOT IN ('R', 'C', 'I'))X
                    GROUP BY X.NMTRANSP `,
                        param: { }
                    })
                    .then((result) => {
                        return result[0];
                    })
                    .catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        return '';          
                    });

                
                objRetorno = {
                    STCARGA: (STCARGA != undefined && STCARGA != null ? STCARGA.STCARGA : null), 
                    ISINTERMUNI: (ISINTERMUNI != undefined && ISINTERMUNI != null ? ISINTERMUNI.ISINTERMUNI : null), 
                    HASVEICULO: HASVEICULO['HASVEICULO'],
                    HASMOTORISTA: HASMOTORISTA['HASMOTORISTA'], 
                    HASMOTOVALID: HASMOTOVALID['HASMOTOVALID'],
                    HASCTECANCEL: HASCTECANCEL['HASCTECANCEL'], 
                    ISDELIVERYATIVA: ISDELIVERYATIVA['ISDELIVERYATIVA'],  
                    HASMANIFMOTVEI: (HASMANIFMOTVEI != undefined && HASMANIFMOTVEI != null ? HASMANIFMOTVEI.HASMANIFMOTVEI : null)
                }                
                return objRetorno;
            } 
        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }

    };

    //getInfoByMdf
    api.getInfoByMdf = async function (req, res, next) {
        logger.debug("Inicio getInfoByMdf");
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            var id = req.body.MDF;
            logger.debug("Parametros buscar:", req.body);
            let IDG046 = await con.execute({
                sql: ` Select DISTINCT F003.IDG046 IDG046 
                    From F001 
                    Join F003 on F003.IDF001 = F001.IDF001 
                    where F001.IDG024 = ${req.body.IDG024.id}  and F001.NRMDF = ${req.body.MDF}   `,
                param: {}
            })
            .then((result) => {
                return (result[0]);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });

            let STMDF = await con.execute({
                sql: ` select F001.STMDF STMDF From F001 where F001.IDG024 = ${req.body.IDG024.id}  and F001.NRMDF = ${req.body.MDF}   `,
                param: {}
            })
            .then((result) => {
                return (result[0]);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });

            let VALIDCHAVE = await con.execute({
                sql: `Select count(IdF001) VALIDCHAVE
                From F001 
                Where nrchamdf <> Substr(BlobToVarchar(TxXmlMdf), (InStr(Upper(BlobToVarchar(TxXmlMdf)), 'ID="MDFE') + 8), 44)
                and txxmlmdf is not null
                and F001.IDG024 = ${req.body.IDG024.id} and F001.NRMDF = ${req.body.MDF} `,
                    param: { }
                })
                .then((result) => {
                    return result[0];
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    return '';          
                });
            
            let TIMEAUTMDF = await con.execute({
                sql: `Select 
                round(24* (current_date-F001.DTMANIFE)) TIMEAUTMDF From F001 Where F001.IDG024 = ${req.body.IDG024.id} and F001.NRMDF = ${req.body.MDF}  `,
                    param: { }
                })
                .then((result) => {
                    return result[0];
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    return '';          
                });  


            await con.close();
            logger.debug("Fim buscar");


            console.log("VALIDCHAVE ",VALIDCHAVE)    
            objRetorno = {
                STMDF: (STMDF != undefined && STMDF != null ? STMDF.STMDF : null), 
                TIMEAUTMDF: (TIMEAUTMDF != undefined && TIMEAUTMDF != null ? TIMEAUTMDF.TIMEAUTMDF : null),
                IDG046: (IDG046 != undefined && IDG046 != null ? IDG046.IDG046 : null),                
                VALIDCHAVE: (VALIDCHAVE != undefined && VALIDCHAVE != null ? VALIDCHAVE.VALIDCHAVE : null)
            }                
            return objRetorno;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }

    };


    //Encerrar
    api.getInfoCloseMdf = async function (req, res, next) {
        logger.debug("Inicio getInfoCloseMdf");
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            var id = req.body.CARGA;
            logger.debug("Parametros buscar:", req.body);
            let result = await con.execute({
                sql: `  select 
                        (select F001.STMDF From F001 where F001.IDG024 = :idFilial and F001.NRMDF = :id) ISALLOW 
                        FROM DUAL `,
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
    
    //Editar 
    api.getInfoEditMdf = async function (req, res, next) {
        logger.debug("Inicio getInfoEditMdf");
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            logger.debug("Parametros buscar:", req.body);
            let result = await con.execute({
                sql: `  select 
                (select F001.STMDF From F001 where F001.IDG024 = :idFilial and F001.NRMDF = :idMdf) ISERROR 
                FROM DUAL `,
                param: {
                    idFilial: req.body.IDG024.id,
                    idMdf: req.body.MDF
                }
            })
                .then((result) => {
                    console.log('result ',result[0])
                    return result;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });
            await con.close();
            logger.debug("Fim getInfoEditMdf");
            return result;

        } catch (err) {
            logger.error("Erro:", err);
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

     //indicadores  
     api.getIndMdfVenc = async function (req, res, next) {
        logger.debug("Inicio getIndMdfVenc");
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            logger.debug("Parametros buscar:", req.body);
            let result = await con.execute({
                sql: ` select 
                (SELECT count(F001.IDF001) FROM F001 WHERE F001.IDG024 = G024.IDG024 AND TRUNC(CURRENT_DATE -30 ) >= TRUNC(F001.DTMANIFE) AND F001.STMDF = 'A' ) QTDMDF, 
                G024.NMTRANSP 
                from G024
                WHERE G024.IDG023 = 2 AND G024.NMTRANSP LIKE 'BRAVO%'  `,
                param: { 
                }
            })
                .then((result) => {
                    console.log('result ',result[0])
                    return result;
                    //return result[0];                    
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });
            await con.close();
            logger.debug("Fim getInfoEditMdf");
            return result;

        } catch (err) {
            logger.error("Erro:", err);
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };


    // - Função para validar parâmetros de função que estejam vazios
    api.validateField = async function (field) {
        if (field != '' && field != undefined && field != null &&  field != undefined) {
            return true;
        } else {
            return false;
        }
    }

    //Suporte Helpdesk CTE
    api.getInfoCTE  = async function (req, res, next) {
        logger.debug("Inicio getInfoCTE");
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            logger.debug("Parametros buscar:", req.body);
            let transportadora = 0;
            let cdctrc = 0;
            let idg051 = 0;

            if (this.validateField(req.body.IDG051)) idg051 = req.body.IDG051;
            if (this.validateField(req.body.CDCTRC)){
                console.log('cd ', cdctrc)
            } 
            if (this.validateField(req.body.IDG024)) transportadora = req.body.IDG024.id;

            let params = await con.execute({
                sql: ` Select DISTINCT G051.IDG051, G051.CDCTRC, G051.DTEMICTR, G051.SNDELETE  FROM G051 
                    where G051.SNDELETE = 0 And G051.IDG024 = '${transportadora}'  and (G051.CDCTRC = '${cdctrc}' or G051.IDG051 = '${idg051}' ) `,
                param: {}
            })
            .then((result) => {
                return (result[0]);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });

            if ( (typeof params == "undefined") || (params == '' ) || (params == null ) || (params == "undefined") ) {
                return { response: 'Conhecimento não encontrado.' };
            }else {
                let DATASNF = await con.execute({
                    sql: ` select min(G043x.DTENTREG) DTENTREG, min(G043x.DTENTCON) DTENTCON from G043 G043x
                            join G049 G049x On G049x.IDG043 = G043x.IDG043
                            where G049x.IDG051 = '${params.IDG051}'   `,
                    param: {}
                })
                .then((result) => {
                    return (result[0]);
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

                let DADOSNF = await con.execute({
                    sql: ` select count(G043.SNDELETE) G043_SNDELETE,
                    count(G083.SNDELETE) G083_SNDELETE from G049 G049
                    left join G043 G043 On G043.SNDELETE = 1 And G049.IDG043 = G043.IDG043
                    left join G083 G083 On g083.SNDELETE = 1 And G083.IDG043 = G043.IDG043 
                    where G049.IDG051 = '${params.IDG051}'   `,
                    param: {}
                })
                .then((result) => {
                    return (result[0]);
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });
                let DADOSCTE = await con.execute({
                    sql: ` select G051.STCTRC, G051.CDCARGA CARGALOG, G051.IDG046 CARGAEVO, G051.IDG046, G051.IDG024AT, G024.NMTRANSP from G051 
                            left join G024 ON G024.SNDELETE = 0 And G024.IDG024 = G051.IDG024AT 
                            where G051.IDG051 = '${params.IDG051}'   `,
                    param: {}
                })
                .then((result) => {
                    return (result[0]);
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

                let DELIVCANCEL = await con.execute(
                {
                    sql: `SELECT COUNT(G043.IDG043) AS DELIVCANCEL
                            FROM G046
                        INNER JOIN G048 G048 ON G048.IDG046 = G046.IDG046
                        INNER JOIN G049 G049 ON G049.IDG048 = G048.IDG048 
                        INNER JOIN G052 G052 ON G052.IDG051 = G049.IDG051 
                                            AND G052.IDG043 = G049.IDG043
                        INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
                        INNER JOIN G043 G043 ON G043.IDG043 = G052.IDG043 
                        WHERE G051.IDG051 = '${params.IDG051}'
                            AND NVL(G043.STETAPA,0) IN (7,8)`,
                    param: []
                })
                .then((result) => {
                    return result[0];
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

                let CARGA4PL = await con.execute(
                    {
                        sql: `SELECT COUNT(G046.IDG046) AS CARGA4PL 
                            FROM G046
                            INNER JOIN G048 G048 ON G048.IDG046 = G046.IDG046
                            INNER JOIN G049 G049 ON G049.IDG048 = G048.IDG048 
                            INNER JOIN G052 G052 ON G052.IDG051 = G049.IDG051 AND G052.IDG043 = G049.IDG043
                            INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
                            INNER JOIN G043 G043 ON G043.IDG043 = G052.IDG043 
                            WHERE G051.IDG051 =  '${params.IDG051}' AND G046.STCARGA <> 'C' AND G046.TPMODCAR = 2 `,
                        param: []
                    })
                    .then((result) => {
                        return result[0];
                    })
                    .catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });

                await con.close();
                logger.debug("Fim buscar");

                objRetorno = {
                    DTENTREG: (DATASNF != undefined && DATASNF != null ? DATASNF.DTENTREG : null),
                    DTENTCON: (DATASNF != undefined && DATASNF != null ? DATASNF.DTENTCON : null),                 
                    G043_SNDELETE: (DADOSNF != undefined && DADOSNF != null ? DADOSNF.G043_SNDELETE : 0), 
                    G083_SNDELETE: (DADOSNF != undefined && DADOSNF != null ? DADOSNF.G083_SNDELETE : 0), 
                    CARGALOG: (DADOSCTE.CARGALOG != undefined && DADOSCTE.CARGALOG != null ? DADOSCTE.CARGALOG : null), 
                    CARGAEVO: (DADOSCTE.CARGAEVO != undefined && DADOSCTE.CARGAEVO != null ? DADOSCTE.CARGAEVO : null), 
                    IDG046: (DADOSCTE.IDG046 != undefined && DADOSCTE.IDG046 != null ? DADOSCTE.IDG046 : null),
                    IDG024AT: (DADOSCTE.IDG024AT != undefined && DADOSCTE.IDG024AT != null ? DADOSCTE.IDG024AT : null),
                    STCTRC: (DADOSCTE.STCTRC != undefined && DADOSCTE.STCTRC != null ? DADOSCTE.STCTRC : null),
                    DELIVCANCEL: (DELIVCANCEL.DELIVCANCEL != undefined && DELIVCANCEL.DELIVCANCEL != null ? DELIVCANCEL.DELIVCANCEL : null),
                    CARGA4PL: (CARGA4PL != undefined && CARGA4PL != null ? CARGA4PL.CARGA4PL : null),
                    CTEINTEGRADO: (params != undefined && params != null ? params.IDG051 : 0),
                    DTEMICTR: (params != undefined && params != null ? params.DTEMICTR : null),
                    NMTRANSP: (DADOSCTE != undefined && DADOSCTE != null ? DADOSCTE.NMTRANSP : 0)         

                }                
                return objRetorno;
            }

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }

    };

    return api;
};