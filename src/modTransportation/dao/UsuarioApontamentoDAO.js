/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de UsuarioApontamento
 * @author Desconhecido
 * @since 29/06/2018
 *
*/

/**
 * @module dao/UsuarioApontamento
 * @description G101.
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
   * @description Listar um dados da tabela G101.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G101',true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: ` Select G101.IDG101,
                        G101.IDG092,
                        G092.DSAPONTA,
                        G101.IDS001,
                        S001.NMUSUARI,
                        G101.SNDELETE,
                        G101.DTCADAST,
                        nvl(G101.STRETIFI,'I') as STRETIFI,
                        G024.NMTRANSP || ' [' || G024.IDG024 || '-' || G024.IDLOGOS || ']' AS NMTRANSP,
                        COUNT(G101.IdG101) OVER () as COUNT_LINHA
                   From G101 G101 
                   Join S001 S001 on S001.IDS001 = G101.IDS001 
                   Join G092 G092 on G092.IDG092 = G101.IDG092
                   Left Join G024 G024 on G024.IDG024 = G101.IDG024 `+
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
   * @description Listar um dado na tabela G101.
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

      var id = req.body.IDG101;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` 
        
             Select G101.IDG101,
                    G101.IDG092,
                    G101.IDS001,
                    S001.NMUSUARI,
                    G092.DSAPONTA,
                    G101.SNDELETE,
                    G101.DTCADAST,
                    G101.STRETIFI,
                    G024.IDG024,
                    nvl(G101.STRETIFI,'I') as STRETIFI,
                    G024.NMTRANSP || ' [' || G024.IDG024 || '-' || G024.IDLOGOS || ']' AS NMTRANSP,
                    COUNT(G101.IdG101) OVER () as COUNT_LINHA
                From G101 G101 
                Join S001 S001 on S001.IDS001 = G101.IDS001 
                Join G092 G092 on G092.IDG092 = G101.IDG092
                Left Join G024 G024 on G024.IDG024 = G101.IDG024
              Where G101.IdG101   = : id
                And G101.SnDelete = 0
        `,
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
   * @description Salvar um dado na tabela G101.
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
        tabela: 'G101',
        colunas: {

          IDG092: req.body.IDG092.id,
          IDS001: req.body.IDS001.id,
          IDG024: (req.body.IDG024 != null ? req.body.IDG024.id: null),
          STRETIFI: req.body.STRETIFI,
          DTCADAST: new Date(),
          SNDELETE: 0

        },
        key: 'IdG101'
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
   * @description Atualizar um dado na tabela G101, .
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

      var id = req.body.IDG101;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'G101',
          colunas: {

            IDG092: req.body.IDG092.id,
            IDS001: req.body.IDS001.id,
            IDG024: (req.body.IDG024 != null ? req.body.IDG024.id: null),
            STRETIFI: req.body.STRETIFI

          },
          condicoes: 'IdG101 = :id',
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
   * @description Delete um dado na tabela G101.
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
      var ids = req.body.IDG101;

    let result = await
      con.update({
        tabela: 'G101',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG101 in (`+ids+`)`
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
