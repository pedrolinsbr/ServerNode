/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 04/05/2018
 *
*/

/**
 * @module dao/GrupoOcorrencia
 * @description G070.
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
   * @description Listar um dados da tabela G070.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G070',true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: ` Select G070.IDG070,
                        G070.DSGRUPO,
                        G070.IDG024,
                        G070.IDS001,
                        G070.DTCADAST,
                        G070.STCADAST,
                        G070.SNDELETE,
                        G024.NMTRANSP || ' [' || G024.IDG024   || '-' || G024.IDLOGOS || ']' AS G024_NMTRANSP,
                        (Select COUNT(G071.IDS001OC) from G071 G071 Where G071.IDG070 = G070.IDG070 and G071.SNDELETE = 0) AS QTDUSER,
                        COUNT(G070.IdG070) OVER () as COUNT_LINHA
                   From G070 G070
                   Left Join S001 S001 on S001.IDS001 = G070.IDS001
                   Left Join G024 G024 on G024.IDG024 = G070.IDG024
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
   * @description Listar um dado na tabela G070.
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

      var id = req.body.IDG070;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select G070.IDG070,
                      G070.DSGRUPO,
                      G070.IDG024,
                      G070.IDS001,
                      G070.DTCADAST,
                      G070.STCADAST,
                      G070.SNDELETE,
                      G024.NMTRANSP AS G024_NMTRANSP,
                      COUNT(G070.IdG070) OVER () as COUNT_LINHA
                 From G070 G070
                 Left Join S001 S001 on S001.IDS001 = G070.IDS001
                 Left Join G024 G024 on G024.IDG024 = G070.IDG024
                Where G070.IdG070   = : id
                  And G070.SnDelete = 0`,
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
   * @description Salvar um dado na tabela G070.
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



      let grupoOcorrencia = await con.execute(
        {
          sql: `Select g070.Idg070 
                  From g070 g070 
                 Where g070.idg024 = ${req.body.IDG024.id}
                   And g070.Sndelete = 0 `,
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

        if(grupoOcorrencia.length >= 1 ){
          await con.closeRollback();
          res.status(500);
          return {response: "Há transportadora informada já possui parâmetros cadastrados"};
        }


      let result = await con.insert({
        tabela: 'G070',
        colunas: {

          IDG024: req.body.IDG024.id,
          DSGRUPO: req.body.DSGRUPO,
          STCADAST: req.body.STCADAST,
         // TPMODCAR: req.body.TPMODCAR.id,
          DTCADAST: new Date(),
          IDS001: req.UserId,

        },
        key: 'IdG070'
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
   * @description Atualizar um dado na tabela G070, .
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

      var id = req.body.IDG070;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'G070',
          colunas: {

            IDG024: req.body.IDG024.id,
            DSGRUPO: req.body.DSGRUPO,
            STCADAST: req.body.STCADAST,
            TPMODCAR: req.body.TPMODCAR.id,

          },
          condicoes: 'IdG070 = :id',
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
   * @description Delete um dado na tabela G070.
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
      var ids = req.body.IDG070;

    let result = await
      con.update({
        tabela: 'G070',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG070 in (`+ids+`)`
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
