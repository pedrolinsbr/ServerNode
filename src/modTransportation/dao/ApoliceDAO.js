/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de Apolice
 * @author Desconhecido
 * @since 29/06/2018
 *
*/

/**
 * @module dao/Apolice
 * @description G047.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api        = {};
  var utils      = app.src.utils.FuncoesObjDB;
  var dicionario = app.src.utils.Dicionario;
  var dtatu      = app.src.utils.DataAtual;
  var acl        = app.src.modIntegrador.controllers.FiltrosController;
  var logger     = app.config.logger;
  api.controller = app.config.ControllerBD;

  /**
   * @description Listar um dados da tabela G047.
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
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G047',true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: ` Select G047.IDG047,
                        G047.NRAPOSEG,
                        G047.VRMAXCAR,
                        G047.VRMAXESC,
                        G047.DTVENAPO,
                        G047.SNSEGPRO,
                        G047.IDG041,
                        G047.TPTRANSP,
                        G047.IDG014,
                        G047.IDS001,
                        G047.SNDELETE,
                        G047.DTCADAST,
                        G047.STCADAST,
                        G014.DSOPERAC AS G014_DSOPERAC,
                        G041.RSSEGURA AS G041_RSSEGURA,
                        COUNT(G047.IdG047) OVER () as COUNT_LINHA
                   From G047 G047
                   INNER JOIN G014 G014
                        ON G014.IDG014 = G047.IDG014
                   INNER JOIN G041 G041
                        ON G041.IDG041 = G047.IDG041`+
                    sqlWhere +
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
   * @description Listar um dado na tabela G047.
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
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var id = req.body.IDG047;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select G047.IDG047,
                      G047.NRAPOSEG,
                      G047.VRMAXCAR,
                      G047.VRMAXESC,
                      G047.DTVENAPO,
                      G047.SNSEGPRO,
                      G047.IDG041,
                      G047.TPTRANSP,
                      G047.IDG014,
                      G047.IDS001,
                      G047.SNDELETE,
                      G047.DTCADAST,
                      G047.STCADAST,
                      G014.DSOPERAC,
                      G041.RSSEGURA AS G041_RSSEGURA,
                      COUNT(G047.IdG047) OVER () as COUNT_LINHA
                 From G047 G047
                 Inner Join G014 G014 
                    on G014.IDG014 = G047.IDG014
                 INNER JOIN G041 G041
                    ON G041.IDG041 = G047.IDG041
                Where G047.IdG047   = : id
                  And G047.SnDelete = 0`,
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


  /**
   * @description Salvar um dado na tabela G047.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.salvar = async function (req, res, next) {

    logger.debug("Inicio salvar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      let result = await con.insert({
        tabela: 'G047',
        colunas: {

          NRAPOSEG: req.body.NRAPOSEG,
          VRMAXCAR: req.body.VRMAXCAR,
          VRMAXESC: req.body.VRMAXESC,
          DTVENAPO: new Date(req.body.DTVENAPO),
          SNSEGPRO: req.body.SNSEGPRO,
          IDG041:   req.body.IDG041.id,
          TPTRANSP: req.body.TPTRANSP,
          IDG014:   req.body.IDG014.id,
          STCADAST: req.body.STCADAST,
          DTCADAST: new Date(),
          SNDELETE: 0,
          IDS001: req.UserId,

        },
        key: 'IdG047'
      })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return { response: req.__('tp.sucesso.insert') };
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
        });


      await con.close();
      logger.debug("Fim salvar");
      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };

  /**
   * @description Atualizar um dado na tabela G047, .
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.atualizar = async function (req, res, next) {

    logger.debug("Inicio atualizar");
    let con = await this.controller.getConnection(null, req.UserId);
    try {

      var id = req.body.IDG047;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'G047',
          colunas: {

            NRAPOSEG: req.body.NRAPOSEG,
            VRMAXCAR: req.body.VRMAXCAR,
            VRMAXESC: req.body.VRMAXESC,
            DTVENAPO: new Date(req.body.DTVENAPO),
            SNSEGPRO: req.body.SNSEGPRO,
            IDG041:   req.body.IDG041.id,
            TPTRANSP: req.body.TPTRANSP,
            IDG014:   req.body.IDG014.id,
            STCADAST: req.body.STCADAST
          },
          condicoes: 'IdG047 = :id',
          parametros: {
            id: id
          }
        })
          .then((result1) => {
          logger.debug("Retorno:", result1);
          return {response: req.__('tp.sucesso.update')};
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
   * @description Delete um dado na tabela G047.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.excluir = async function (req, res, next) {

    logger.debug("Inicio excluir");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("ID selecionados");
      var ids = req.body.IDG047;

    let result = await
      con.update({
        tabela: 'G047',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG047 in (`+ids+`)`
      })
        .then((result1) => {
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
      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };


  return api;
};
