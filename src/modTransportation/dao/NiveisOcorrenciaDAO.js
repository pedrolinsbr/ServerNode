/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 04/05/2018
 *
*/

/**
 * @module dao/NiveisOcorrencia
 * @description G066.
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
   * @description Listar um dados da tabela G066.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G066',true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: ` Select G066.IDG066,
                        G066.IDG067,
                        G067.DSOCORRE AS G067_DSOCORRE,
                        G066.IDG024,
                        G066.IDS001,
                        G066.DTCADAST,
                        G066.STCADAST,
                        G066.SNDELETE,
                        G066.IDS001OC,
                        G066.IDG070,
                        G070.DSGRUPO AS G070_DSGRUPO,
                        G024.NMTRANSP AS G024_NMTRANSP,
                        S001.NMUSUARI AS S001_NMUSUARI,
                        COUNT(G066.IdG066) OVER () as COUNT_LINHA
                   From G066 G066
                   Join G067 G067 on G067.IDG067 = G066.IDG067
                   Join S001 S001 on S001.IDS001 = G066.IDS001OC
                   Join G024 G024 on G024.IDG024 = G066.IDG024
                   Join G070 G070 on G070.IDG070 = G066.IDG070
                   `+
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
   * @description Listar um dado na tabela G066.
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

      var id = req.body.IDG066;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select G066.IDG066,
                      G066.IDG067,
                      G067.DSOCORRE AS G067_DSOCORRE,
                      G066.IDG024,
                      G066.IDS001,
                      G066.DTCADAST,
                      G066.STCADAST,
                      G066.SNDELETE,
                      G066.IDS001OC,
                      G066.IDG070,
                      G070.DSGRUPO AS G070_DSGRUPO,
                      G024.NMTRANSP AS G024_NMTRANSP,
                      S001.NMUSUARI AS S001_NMUSUARI,
                      COUNT(G066.IdG066) OVER () as COUNT_LINHA
                 From G066 G066
                 Join G067 G067 on G067.IDG067 = G066.IDG067
                 Join S001 S001 on S001.IDS001 = G066.IDS001OC
                 Join G024 G024 on G024.IDG024 = G066.IDG024
                 Join G070 G070 on G070.IDG070 = G066.IDG070
                Where G066.IdG066   = : id
                  And G066.SnDelete = 0`,
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
   * @description Salvar um dado na tabela G066.
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
        tabela: 'G066',
        colunas: {

          IDG067: req.body.IDG067.id,
          IDG024: req.body.IDG024.id,
          IDG070: req.body.IDG070.id,
          // IDS001OC: req.body.IDS001OC.id,
          STCADAST: req.body.STCADAST,
          DTCADAST: new Date(),
          IDS001: req.UserId,

        },
        key: 'IdG066'
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
   * @description Atualizar um dado na tabela G066, .
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

      var id = req.body.IDG066;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'G066',
          colunas: {

            IDG067: req.body.IDG067.id,
            IDG024: req.body.IDG024.id,
            // IDS001OC: req.body.IDS001OC.id,
            IDG070: req.body.IDG070.id,
            STCADAST: req.body.STCADAST

          },
          condicoes: 'IdG066 = :id',
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
   * @description Delete um dado na tabela G066.
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
      var ids = req.body.IDG066;

    let result = await
      con.update({
        tabela: 'G066',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG066 in (`+ids+`)`
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
