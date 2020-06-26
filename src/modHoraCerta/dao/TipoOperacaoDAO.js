/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de tipo de operação
 * @author Desconhecido
 * @since 03/07/2019
 * 
*/

/** 
 * @module dao/TipoOperacao
 * @description G097, G098.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api        = {};
  var utils      = app.src.utils.FuncoesObjDB;
  var dtatu      = app.src.utils.DataAtual;
  var acl        = app.src.modIntegrador.controllers.FiltrosController;
  var logger     = app.config.logger;
  api.controller = app.config.ControllerBD;

  const gdao = app.src.modGlobal.dao.GenericDAO;

  /**
   * @description Listar um dados da tabela G097 com IDGRUPO = 1.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.listar = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {

      logger.debug("Parametros recebidos:", req.body);

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G097',true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: ` SELECT
                        G097.IDG097,							--ID
                        G097.IDGRUPO,							--ID DO TIPO
                        G097.IDKEY 	 AS IDOPERAC,	--ID DA OPERAÇÃO
                        G097.DSVALUE AS DSOPERAC,	--DESCRIÇÃO DA OPERAÇÃO
                        (
                          SELECT COALESCE(TOLERA1,0) FROM 
                          (
                            SELECT IDG097PA, TO_NUMBER(DSVALUE) AS QTTOLERA, 'TOLERA' || ROWNUM AS TOLERA FROM 
                            (
                              SELECT G098.IDG097PA, G098.DSVALUE
                              FROM G098 
                              WHERE G098.IDG097PA = G097.IDG097
                              ORDER BY G098.IDG097FI ASC
                              OFFSET 0 ROWS FETCH NEXT 2 ROWS ONLY
                            )
                          )

                          PIVOT (
                                  MAX(QTTOLERA)
                                  FOR TOLERA IN ('TOLERA1' TOLERA1, 'TOLERA2' TOLERA2)
                              )
                        ) TOLERA1, --TOLERANCIA A MAIS
                        (
                          SELECT COALESCE(TOLERA2,0) FROM 
                          (
                            SELECT IDG097PA, TO_NUMBER(DSVALUE) AS QTTOLERA, 'TOLERA' || ROWNUM AS TOLERA FROM 
                            (
                              SELECT G098.IDG097PA, G098.DSVALUE
                              FROM G098 
                              WHERE G098.IDG097PA = G097.IDG097
                              ORDER BY G098.IDG097FI ASC
                              OFFSET 0 ROWS FETCH NEXT 2 ROWS ONLY
                            )
                          )

                          PIVOT (
                                  MAX(QTTOLERA)
                                  FOR TOLERA IN ('TOLERA1' TOLERA1, 'TOLERA2' TOLERA2)
                              )
                        ) TOLERA2, --TOLERANCIA A MENOS
                        COUNT(G097.IDG097) OVER () as COUNT_LINHA
                   FROM G097`+
                    sqlWhere +
                   `AND G097.IDGRUPO = 1    --TIPO DE OPERAÇÃO` +
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
   * @description Listar um dado na tabela G097 com IDGRUPO = 1.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.buscar = async function (req, res, next) {

    logger.debug("Inicio buscar");
    let con = await this.controller.getConnection();

    try {
      var sqlWhere = ``;

      if (req.body.IDG097) {
        sqlWhere = `AND G097.IDG097 = ${req.body.IDG097}`;
      }

      if (req.body.IDOPERAC) {
        sqlWhere = `AND G097.IDKEY = ${req.body.IDOPERAC}`;
      }

      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
          sql: ` SELECT
                        G097.IDG097,							--ID
                        G097.IDGRUPO,							--ID DO TIPO
                        G097.IDKEY 	 AS IDOPERAC,	--ID DA OPERAÇÃO
                        G097.DSVALUE AS DSOPERAC,	--DESCRIÇÃO DA OPERAÇÃO
                        (
                          SELECT COALESCE(TOLERA1,0) FROM 
                          (
                            SELECT IDG097PA, TO_NUMBER(DSVALUE) AS QTTOLERA, 'TOLERA' || ROWNUM AS TOLERA FROM 
                            (
                              SELECT G098.IDG097PA, G098.DSVALUE
                              FROM G098 
                              WHERE G098.IDG097PA = G097.IDG097
                              ORDER BY G098.IDG097FI ASC
                              OFFSET 0 ROWS FETCH NEXT 2 ROWS ONLY
                            )
                          )

                          PIVOT (
                                  MAX(QTTOLERA)
                                  FOR TOLERA IN ('TOLERA1' TOLERA1, 'TOLERA2' TOLERA2)
                              )
                        ) TOLERA1, --TOLERANCIA A MAIS
                        (
                          SELECT COALESCE(TOLERA2,0) FROM 
                          (
                            SELECT IDG097PA, TO_NUMBER(DSVALUE) AS QTTOLERA, 'TOLERA' || ROWNUM AS TOLERA FROM 
                            (
                              SELECT G098.IDG097PA, G098.DSVALUE
                              FROM G098 
                              WHERE G098.IDG097PA = G097.IDG097
                              ORDER BY G098.IDG097FI ASC
                              OFFSET 0 ROWS FETCH NEXT 2 ROWS ONLY
                            )
                          )

                          PIVOT (
                                  MAX(QTTOLERA)
                                  FOR TOLERA IN ('TOLERA1' TOLERA1, 'TOLERA2' TOLERA2)
                              )
                        ) TOLERA2, --TOLERANCIA A MENOS
                        COUNT(G097.IDG097) OVER () as COUNT_LINHA
                   FROM G097
                  WHERE G097.IDGRUPO  = 1    --TIPO DE OPERAÇÃO
                    AND G097.SNDELETE = 0
                    ${sqlWhere}`,
        param: { }
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
   * @description Buscar último ID de Tipo de Operação.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.buscarIDG097 = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    req.sql = `SELECT COUNT(IDG097)+1 AS IDOPERAC FROM G097 WHERE IDGRUPO = 1`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  /**
   * @description Salvar um dado na tabela G097 com IDGRUPO = 1.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.salvarTipoOperacao = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    var objBanco = {
        table:    'G097'
      , key:      ['IDG097']
      , vlFields:  {}
    }

    objBanco.vlFields.IDGRUPO = 1;
    objBanco.vlFields.IDKEY   = req.body.IDOPERAC;
    objBanco.vlFields.DSVALUE = req.body.DSOPERAC;

    objBanco.objConn = req.objConn;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.inserir(objBanco, res, next).catch((err) => { throw err });
  };

    /**
   * @description Salvar um dado na tabela G098 com IDG097FI igual 16 ou 17.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.salvarTolerancia = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    var objBanco = {
        table:    'G098'
      , key:      ['IDG098']
      , vlFields:  {}
    }

    objBanco.vlFields.IDG097PA = req.IDG097;
    objBanco.vlFields.IDG097FI = req.TPTOLERA;
    objBanco.vlFields.DSVALUE  = req.QTTOLERA;

    objBanco.objConn = req.objConn;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.inserir(objBanco, res, next).catch((err) => { throw err });
  };

  /**
   * @description Atualizar um dado na tabela G097 com IDGRUPO = 1.
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.atualizarTipoOperacao = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    req.sql = ` UPDATE G097 SET DSVALUE = '${req.body.DSOPERAC}'
                WHERE IDGRUPO = 1 AND IDG097 = ${req.body.IDG097}`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  /**
   * @description Atualizar um dado na tabela G098 com IDG097FI igual 16 ou 17.
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.atualizarTolerancia = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    req.sql = ` UPDATE G098 SET DSVALUE = '${req.QTTOLERA}'
                WHERE IDG097PA = ${req.IDG097} AND IDG097FI = ${req.TPTOLERA}`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  /**
   * @description Delete um dado na tabela G097 com IDGRUPO = 1.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.excluirTipoOperacao = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    req.sql = ` UPDATE G097 SET SNDELETE = 1
                WHERE IDGRUPO = 1 AND IDG097 = ${req.body.IDG097}`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });

  };

  /**
   * @description Delete dados na tabela G098 com IDG097FI in (16,17).
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.excluirTolerancias = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    req.sql = ` UPDATE G098 SET SNDELETE = 1
                WHERE IDG097PA = ${req.body.IDG097}`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });

  };

  return api;
};
