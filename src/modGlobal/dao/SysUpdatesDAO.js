/**
 * @module modGlobal/dao/SysUpdatesDAO
 *
 * @requires module:utils/FuncoesObjDB
 * @requires module:config/ControllerBD
 * @param {application} app - Configurações do app.
*/
module.exports = function (app, cb) {

    var utils = app.src.utils.FuncoesObjDB;
    var utilsCurl = app.src.utils.Utils;
    var dicionario = app.src.utils.Dicionario;
    var dtatu = app.src.utils.DataAtual;
    const tmz = app.src.utils.DataAtual;
    var convert = app.src.utils.ConversorArquivos;

    var acl = app.src.modIntegrador.controllers.FiltrosController;
    var logger = app.config.logger;
    var api = {};
    api.controller = app.config.ControllerBD;

    //-----------------------------------------------------------------------\\
    /**
     * @description Lista os registros da tabela com filtro
     * @function listar
     * @author Pedro
     * @since 15/02/2018
     *
     * @async
     * @param   {Object} req Parâmetros da requisição
     * @returns {Array}      Retorna resultado da pesquisa em um array
     * @throws  {Object}     Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listar = async function (req, res, next) {
        logger.debug("Inicio listar");
        let con = await this.controller.getConnection(null, req.UserId);
        let modulo = req.body.DSMODULO;
        try {
            let result = await con.execute({
                sql: `select 
                S043.IDS043, 
                S043.IDS025,                 
                S043.NRVERSAO, 
                S043.DSRELEAS,
                S043.DTVERSAO, 
                S043.SNUPDOBG,
                S025.DSMODULO, 
                S025.DSSISTEMA,                 
                (SELECT COUNT(S044.IDS044) FROM S044 WHERE S044.IDS043 = S043.IDS043 AND S044.IDS042 = 1) NRFEATURE, 
                (SELECT COUNT(S044.IDS044) FROM S044 WHERE S044.IDS043 = S043.IDS043 AND S044.IDS042 = 2) NRBUG 
                FROM S043 
                INNER JOIN S025 ON S025.IDS025 = S043.IDS025 
                where upper(S025.DSMODULO) = upper('`+ modulo + `')  order by S043.IDS043 desc`,
                param: {

                }
            })
                .then((result) => {
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
    }
    // Preenche datagrid das atualizacoes
    api.getListUpdates = async function (req, res, next) {
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'S043', false);
        logger.info("Inicio getListUpdates");
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            logger.info("Parametros recebidos (getListUpdates): " + req.body.parameter);
            var id = 6;
            let result = await con.execute({
                sql: `select 
                    S043.IDS043, 
                    S043.IDS025, 
                    S043.NRVERSAO, 
                    S043.DTVERSAO, 
                    S043.DSRELEAS,
                    S043.SNUPDOBG,
                    S025.DSMODULO, 
                    S025.DSSISTEMA,  
                    (SELECT COUNT(S044.IDS044) FROM S044 WHERE S044.IDS043 = S043.IDS043 AND S044.IDS042 = 1) NRFEATURE, 
                    (SELECT COUNT(S044.IDS044) FROM S044 WHERE S044.IDS043 = S043.IDS043 AND S044.IDS042 = 2) NRBUG, 
                    COUNT(S043.IDS043) OVER() as COUNT_LINHA 
                    From S043 
                    INNER JOIN S025 ON S025.IDS025 = S043.IDS025 ` +
                    sqlWhere +
                    sqlOrder +
                    sqlPaginate,
                param: bindValues
            })
                .then((result) => {
                    return (utils.construirObjetoRetornoBD(result));
                }).catch((err) => {
                    logger.error("Erro:", err);
                    throw err;
                });
            await con.close();
            logger.debug("Fim buscar");
            return result;
        } catch (err) {
            logger.error("Erro:", err);
            throw new Error(err);
        }
    }


    api.getListItensUpdates = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        let modulo = req.body.DSMODULE;
        try {
            let result = await con.execute({
                sql: `select 
                S043.IDS043, 
                S043.IDS025,                 
                S043.NRVERSAO, 
                S043.DTVERSAO, 
                S043.SNUPDOBG,
                S025.DSMODULO, 
                S043.DSRELEAS,
                S025.DSSISTEMA, 
                S025.SNDELETE, 
                (SELECT COUNT(S044.IDS044) FROM S044 WHERE S044.IDS043 = S043.IDS043 AND S044.IDS042 = 1) NRFEATURE, 
                (SELECT COUNT(S044.IDS044) FROM S044 WHERE S044.IDS043 = S043.IDS043 AND S044.IDS042 = 2) NRBUG,                  
                S044.DTCRIACA, 
                S044.DSVERSAO, 
                S044.NMJIRA, 
                S044.NRSDB, 
                S044.DSOBS,
                S042.IDS042,   
                S042.DSTIPO,
                S044.IDG097,
                G097.DSVALUE 
                FROM S043 
                INNER JOIN S025 ON S025.IDS025 = S043.IDS025
                LEFT JOIN S044 ON S044.IDS043 = S043.IDS043 
                LEFT JOIN S042 ON S042.IDS042 = S044.IDS042 
                LEFT JOIN G097 ON G097.IDGRUPO=9 And S044.IDG097 = G097.IDG097 
                where upper(S025.DSMODULO) = upper('`+ modulo + `')  order by S043.IDS043 desc `,
                param: {}
            })
                .then((result) => {
                    logger.debug("Retorno:", result);
                    return result;
                }).catch((err) => {
                    logger.error("Erro:", err);
                    throw err;
                });
            await con.close();
            logger.debug("Fim buscar");
            return res.json(result);
        } catch (err) {
            logger.error("Erro:", err);
            throw new Error(err);
        }
    };


    //-----------------------------------------------------------------------\\
    /**
     * @description Lista os registros da tabela com filtro
     * @function tiposUpdate
     * @author Pedro
     * @since 15/02/2018
     *
     * @async
     * @param   {Object} req Parâmetros da requisição
     * @returns {Array}      Retorna resultado da pesquisa em um array
     * @throws  {Object}     Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.tiposUpdate = async function (req, res, next) {
        logger.info("Inicio tiposUpdate");
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            let result = await con.execute({
                sql: `select S042.IDS042 id, S042.DSTIPO text, S042.NRPODER FROM S042 order by  S042.DSTIPO `,
                param: {

                }
            })
                .then((result) => {
                    logger.info("Retorno:", result);
                    return utils.array_change_key_case(result);
                })
                .catch((err) => {
                    logger.error("Erro:", err);
                    err.stack = new Error().stack + `\r\n` + err.stack;
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


    
    
    //-----------------------------------------------------------------------\\
    /**
     * @description Lista os MODULOIS DO SISTEMA
     * @function getModulos
     * @author Pedro
     * @since 15/02/2018
     */
    //-----------------------------------------------------------------------\\

    api.getSistemas = async function (req, res, next) {
        logger.info("Inicio getSistemas");
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            let result = await con.execute({
                sql: `select S025.IDS025 id, S025.DSMODULO text FROM S025 order by S025.DSMODULO `,
                param: {

                }
            })
                .then((result) => {
                    logger.info("Retorno:", result);
                    return utils.array_change_key_case(result);
                })
                .catch((err) => {
                    logger.error("Erro:", err);
                    err.stack = new Error().stack + `\r\n` + err.stack;
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
    //IDS044	IDS043	DSVERSAO	NMJIRA	NRSDB	DSOBS 
    //-----------------------------------------------------------------------\\
    /**
     * @description Lista os registros da tabela com filtro
     * @function getUpdates
     * @author Pedro
     * @since 15/02/2018
     *
     * @async
     * @param   {Object} req Parâmetros da requisição
     * @returns {Array}      Retorna resultado da pesquisa em um array
     * @throws  {Object}     Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.getUpdates = async function (req, res, next) {

        logger.info("Inicio getUpdates");
        let con = await this.controller.getConnection(null, req.UserId);
        let ids043 = req.body.IDS043;
        try {
            logger.info("Parametros recebidos (getUpdates): ");
            let result = await con.execute({
                sql: `select S044.IDS044, S044.IDS043, S042.IDS042, S043.IDS025, 
                    S044.DSVERSAO, S044.NMJIRA, S044.NRSDB, S044.DSOBS, S044.DTCRIACA, 
                    S043.NRVERSAO, S043.DSRELEAS, S043.DTVERSAO, S043.SNUPDOBG,
                    S042.DSTIPO, S042.NRPODER, S025.DSMODULO, S025.DSSISTEMA, 
                    S025.SNDELETE,S044.IDG097, G097.DSVALUE,
                    (SELECT COUNT(S044.IDS044) FROM S044 WHERE S044.IDS043 = S043.IDS043 AND S044.IDS042 = 1) NRFEATURE, 
                    (SELECT COUNT(S044.IDS044) FROM S044 WHERE S044.IDS043 = S043.IDS043 AND S044.IDS042 = 2) NRBUG 
                    FROM S043 
                    INNER JOIN S025 ON S025.IDS025 = S043.IDS025
                    LEFT JOIN S044 ON S044.IDS043 = S043.IDS043 
                    LEFT JOIN S042 ON S042.IDS042 = S044.IDS042 
                    LEFT JOIN G097 ON G097.IDGRUPO=9 And S044.IDG097 = G097.IDG097 
                    where S043.IDS043 = '`+ ids043 + `' `,
                param: {

                }
            })
                .then((result) => {
                    return (result[0]);
                }).catch((err) => {
                    logger.error("Erro:", err);
                    throw err;
                });
            await con.close();
            logger.debug("Fim buscar");
            return result;
        } catch (err) {
            logger.error("Erro:", err);
            throw new Error(err);
        }
    }

    //-----------------------------------------------------------------------\\
    /**
     * @description Lista os registros da tabela com filtro
     * @function getItemUpdate
     * @author Pedro
     * @since 15/02/2018
     *
     * @async
     * @param   {Object} req Parâmetros da requisição
     * @returns {Array}      Retorna resultado da pesquisa em um array
     * @throws  {Object}     Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.getItemUpdate = async function (req, res, next) {

        logger.info("Inicio getItemUpdate");
        let con = await this.controller.getConnection(null, req.UserId);
        let ids044 = req.body.IDS044;
        try {
            logger.info("Parametros recebidos (getItemUpdate): ");
            var id = 6;
            let result = await con.execute({
                sql: `select 
                    S044.IDS044, 
                    S044.DSVERSAO, 
                    S044.NMJIRA, 
                    S044.NRSDB, 
                    S044.DSOBS, 
                    S044.IDS042,
                    S044.DTCRIACA,
                    S042.DSTIPO,
                    S044.IDG097,
                    G097.DSVALUE
                    FROM S044
                    LEFT JOIN S042 ON S042.IDS042 = S044.IDS042  
                    LEFT JOIN G097 ON G097.IDGRUPO=9 And S044.IDG097 = G097.IDG097 
                    where upper(S044.IDS044) = '`+ ids044 + `' `,
                param: {

                }
            })
                .then((result) => {
                    return (result[0]);
                }).catch((err) => {
                    logger.error("Erro:", err);
                    throw err;
                });
            await con.close();
            logger.debug("Fim buscar");
            return result;
        } catch (err) {
            logger.error("Erro:", err);
            throw new Error(err);
        }
    }

    /**
 * @description Lista os registros da tabela com filtro
 * @function getItensUpdate
 * @author Pedro
 * @since 15/10/2019
 *
 * @async
 * @param   {Object} req Parâmetros da requisição
 * @returns {Array}      Retorna resultado da pesquisa em um array
 * @throws  {Object}     Retorna um objeto de erro caso ocorra
 */
    //-----------------------------------------------------------------------\\

    api.getItensUpdate = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        let ids043 = req.body.IDS043;
        try {
            logger.info("Parametros recebidos (getItensUpdate): ");
            let result = await con.execute({
                sql: `select 
                    S043.IDS043,
                    S042.IDS042,
                    S042.DSICONE,
                    S044.DSVERSAO,
                    S044.DTCRIACA,                                          
                    S042.DSTIPO,
                    S044.IDG097,
                    G097.DSVALUE 
                    FROM S043 
                    LEFT JOIN S044 ON S044.IDS043 = S043.IDS043 
                    LEFT JOIN S042 ON S042.IDS042 = S044.IDS042 
                    LEFT JOIN S042 ON S042.IDS042 = S044.IDS042 
                    LEFT JOIN G097 ON G097.IDGRUPO=9 And S044.IDG097 = G097.IDG097 
                    order by S042.IDS042, DTCRIACA DESC`,
                param: {

                }
            })
                .then((result) => {
                    return (result);
                }).catch((err) => {
                    logger.error("Erro:", err);
                    throw err;
                });
            await con.close();
            logger.debug("Fim buscar");
            return result;
        } catch (err) {
            logger.error("Erro:", err);
            throw new Error(err);
        }
    }

    api.itensUpdate = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            logger.info("Parametros recebidos (itensUpdate):");
            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'S044', false);
            let parametro = 0;
            let parametros = bindValues;
            parametro = (parametros.S044_IDS043 != undefined ? parametros.S044_IDS043 : 0);
            // console.log('parametros ')
            // console.log(parametro)
            let result = await con.execute({
                sql: `SELECT 
                    S044.IDS044, 
                    S044.IDS043, 
                    S044.IDS042, 
                    S044.DSVERSAO, 
                    S044.NMJIRA, 
                    S044.NRSDB, 
                    S044.DSOBS,  
                    S044.DTCRIACA,  
                    S042.DSTIPO,
                    S044.IDG097, 
                    G097.DSVALUE,
                    COUNT(S044.IDS044) OVER() as COUNT_LINHA 
                    FROM S044 
                    LEFT JOIN S042 ON S042.IDS042 = S044.IDS042  
                    LEFT JOIN G097 ON G097.IDGRUPO=9 And S044.IDG097 = G097.IDG097 
                    WHERE IDS043 = '`+ parametro + `' order by S044.DTCRIACA desc`,
                param: {}
            })
                .then((result) => {
                    logger.info('result ' + result);
                    return (utils.construirObjetoRetornoBD(result));
                }).catch((err) => {
                    logger.error("Erro:", err);
                    throw err;
                });
            await con.close();
            logger.debug("Fim buscar");
            return result;
        } catch (err) {
            logger.error("Erro:", err);
            throw new Error(err);
        }
    };


    api.salvarUpdate = async function (req, res, next) {
        logger.info("Inicio salvarUpdate: ");
        let con = await this.controller.getConnection(null, req.UserId);
        try {

            logger.info("Parametros recebidos:", req.body);
            let result = await con.insert({
                tabela: 'S043',
                colunas: {
                    IDS025: req.body.IDS025.id,
                    NRVERSAO: req.body.NRVERSAO,
                    DTVERSAO: new Date( req.body.DTVERSAO.year, (req.body.DTVERSAO.month-1),  req.body.DTVERSAO.day,0,0,0,0),
                    SNUPDOBG: req.body.SNUPDOBG ,
                    DSRELEAS: req.body.DSRELEAS,
                },
                key: 'IDS043'
            })
                .then((result1) => {
                    req.body.IDS043 = result1;
                    logger.info("Retorno, criado IDS043: ", result1);
                    api.salvarItemUpdate(req, res, next);

                    return result1;
                })
                .catch((err) => {
                    logger.error("Erro:", err);
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            await con.close();
            logger.debug("Fim salvar");
            return result;

        } catch (err) {
            await con.closeRollback();
            logger.error("Erro:", err);
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    api.salvarItemUpdate = async function (req, res, next) {
        logger.info("Inicio salvarItemUpdate: ");
        let con = await this.controller.getConnection(null, req.UserId);
        try {

            logger.info("Parametros recebidos:", req.body);
            let result = await con.insert({
                tabela: 'S044',
                colunas: {
                    IDS043: req.body.IDS043,
                    DSVERSAO: req.body.DSVERSAO,
                    NMJIRA: req.body.NMJIRA,
                    NRSDB: req.body.NRSDB,
                    DSOBS: req.body.DSOBS,
                    IDS042: req.body.IDS042.id,
                    IDG097: req.body.IDG097.id,                    
                    DTCRIACA:  new Date( req.body.DTCRIACA.year, (req.body.DTCRIACA.month-1),  req.body.DTCRIACA.day,req.body.HRCRIACA.hour,req.body.HRCRIACA.minute,0,0),

                },
                key: 'IDS044'
            })
                .then((result1) => {
                    logger.info("Retorno, criado IDS044: ", result1);
                    return result1;
                })
                .catch((err) => {
                    logger.error("Erro:", err);
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            await con.close();
            logger.debug("Fim salvar");
            return result;
        } catch (err) {
            await con.closeRollback();
            logger.error("Erro:", err);
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    /**
    * @description Atualizar um dado na tabela G094, .
    *
    * @async
    * @function api/editarItemUpdate
    * @param {request} req - Possui as requisições para a função.
    * @param {response} res - A resposta gerada na função.
    * @param {next} next - Caso haja algum erro na rota.
    * @return {JSON} Retorna um objeto JSON.
    * @throws Caso falso, o número do log de erro aparecerá no console.
    */
    api.editarItemUpdate = async function (req, res, next) {
        logger.debug("Inicio editarItemUpdate");
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            var id = req.body.IDS044;
            logger.debug("Parametros recebidos:", req.body);
            let result = await
                con.update({
                    tabela: 'S044',
                    colunas: {
                        DSVERSAO: req.body.DSVERSAO,
                        NMJIRA: req.body.NMJIRA,
                        NRSDB: req.body.NRSDB,
                        DSOBS: req.body.DSOBS,
                        IDS042: req.body.IDS042.id,
                        DTCRIACA: new Date( req.body.DTCRIACA.year, (req.body.DTCRIACA.month-1),  req.body.DTCRIACA.day,req.body.HRCRIACA.hour,req.body.HRCRIACA.minute,0,0),
                        IDG097: req.body.IDG097.id,
                    },
                    condicoes: 'IDS044 = :id',
                    parametros: {
                        id: id
                    }
                })
                    .then((result1) => {
                        logger.debug("Retorno:", result1);
                        return { response: req.__('tp.sucesso.update') };
                    })
                    .catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        logger.error("Erro:", err);
                        throw err;
                    });
            await con.close();
            logger.debug("Fim atualizar");
            return result;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    };

    /**
* @description Atualizar um dado na tabela G094, .
*
* @async
* @function api/editarItemUpdate
* @param {request} req - Possui as requisições para a função.
* @param {response} res - A resposta gerada na função.
* @param {next} next - Caso haja algum erro na rota.
* @return {JSON} Retorna um objeto JSON.
* @throws Caso falso, o número do log de erro aparecerá no console.
*/
    api.editaUpdate = async function (req, res, next) {
        logger.debug("Inicio editaUpdate");
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            var id = req.body.IDS043;
            logger.debug("Parametros recebidos:", req.body);
            let result = await
                con.update({
                    tabela: 'S043',
                    colunas: {
                        IDS025: req.body.IDS025.id,
                        NRVERSAO: req.body.NRVERSAO,
                        DTVERSAO: new Date( req.body.DTVERSAO.year, (req.body.DTVERSAO.month-1),  req.body.DTVERSAO.day,0,0,0,0),
                        SNUPDOBG: req.body.SNUPDOBG,
                        DSRELEAS: req.body.DSRELEAS,
                    },
                    condicoes: 'IDS043 = :id',
                    parametros: {
                        id: id
                    }
                })
                    .then((result1) => {
                        logger.debug("Retorno:", result1);
                        return { response: req.__('tp.sucesso.update') };
                    })
                    .catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        logger.error("Erro:", err);
                        throw err;
                    });
            await con.close();
            logger.debug("Fim atualizar");
            return result;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    };


    /**
 * @description Deleta registro de atualizacao e seus itens (S043 e S044)
 *
 * @async
 * @function api/removeUpdate
 * @param {request} req - Possui as requisições para a função.
 * @param {response} res - A resposta gerada na função.
 * @param {next} next - Caso haja algum erro na rota.
 * @return {JSON} Retorna um objeto JSON.
 * @throws Caso falso, o número do log de erro aparecerá no console.
 */
    api.removeUpdate = async function (req, res, next) {
        logger.debug("Inicio excluir");
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            logger.debug("ID selecionados");
            var id = req.body.IDS043;
            let result = await con.execute({
                sql: `Delete From S044 Where IDS043 = ${id} `,
                param: []
            }).then((result1) => {
                    logger.debug("Retorno:", result1);
                    return { response: req.__('tp.sucesso.delete') };
            }).catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
            });

            let result_S043 = await con.execute({
                sql: `Delete From S043 Where IDS043 = ${id} `,
                param: []
            }).then((result1) => {
                    logger.debug("Retorno:", result1);
                    return { response: req.__('tp.sucesso.delete') };
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
            });
            await con.close();
            logger.debug("Fim excluir");
            return result_S043;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    };

        /**
 * @description Deleta registro de atualizacao e seus itens (S043 e S044)
 *
 * @async
 * @function api/removeItemUpdate
 * @param {request} req - Possui as requisições para a função.
 * @param {response} res - A resposta gerada na função.
 * @param {next} next - Caso haja algum erro na rota.
 * @return {JSON} Retorna um objeto JSON.
 * @throws Caso falso, o número do log de erro aparecerá no console.
 */
api.removeItemUpdate = async function (req, res, next) {
    logger.debug("Inicio removeItemUpdate");
    let con = await this.controller.getConnection(null, req.UserId);
    try {
        var id = req.body.IDS044;
        let result = await con.execute({
            sql: `Delete From S044 Where IDS044 = ${id} `,
            param: []
        }).then((result1) => {
                logger.info("Retorno:", result1);
                return { response: req.__('tp.sucesso.delete') };
        }).catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                logger.error("Erro:", err);
                throw err;
        });  
        await con.close();
        logger.debug("Fim excluir");
        return result;
    } catch (err) {
        await con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
    }
};

api.verificaVersao = async function (req, res, next) {    
    let con = await this.controller.getConnection(null, req.UserId);
    let DSMODULO = req.body.DSMODULO;
    let IDS001 = req.body.IDS001;

    try {
        var id = 6;
        let result = await con.execute({
            sql: `SELECT x.*
            FROM (SELECT s044.*
            FROM s044 s044
            Join s043 s043 on s043.ids043 = s044.ids043
            join S025 ON S025.IDS025 = S043.IDS025                 
            WHERE s044.DTCRIACA >
            (SELECT s001.DTULTACE FROM s001 s001 WHERE ids001 = `+ IDS001 + `)
            and upper(S025.DSMODULO) = upper('`+ DSMODULO + `') 
            ORDER BY DTCRIACA) x
            WHERE ROWNUM = 1 `,
            param: {

            }
        })
            .then((result) => {
                return (result);
            }).catch((err) => {
                logger.error("Erro:", err);
                throw err;
            });
        await con.close();
        logger.debug("Fim buscar");
        return result;
    } catch (err) {
        logger.error("Erro:", err);
        throw new Error(err);
    }
}

//Buscas modulos do sistema, Ex.: Cadastro de Veiculos
api.getModulos = async function (req, res, next) {
    logger.info("Inicio getModulos");
    let con = await this.controller.getConnection(null, req.UserId);
    try {
        let result = await con.execute({
            sql: `select IDG097 id, IDKEY, DSVALUE text from G097  Where IDGRUPO = 9 order by IDKEY `,
            param: {

            }
        })
            .then((result) => {
                logger.info("Retorno:", result);
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                logger.error("Erro:", err);
                err.stack = new Error().stack + `\r\n` + err.stack;
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

    //-----------------------------------------------------------------------\\

    return api;
}