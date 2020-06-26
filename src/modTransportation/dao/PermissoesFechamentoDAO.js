/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de TipoApontamento
 * @author Desconhecido
 * @since 29/06/2018
 *
*/

/**
 * @module dao/TipoApontamento
 * @description G103.
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
   * @description Listar um dados da tabela G103.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G103',true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: ` 
                SELECT G103.IDG103,
                      G103.IDS001,
                      S001.NMUSUARI,
                      G103.IDG090,
                      G090.DSCAMPAN,
                      G103.IDG024,
                      G024.NMTRANSP,
                      G103.IDG097,
                      G097.DSVALUE,
                      G097.IDKEY,
                      G103.IDS001PA,
                      S001PA.NMUSUARI AS NMUSUARIPA,
                      G103.DTCADAST,
                      G103.SNDELETE,
                      COUNT(G103.IDG103) OVER() AS COUNT_LINHA
                  FROM G103 G103
                  LEFT JOIN G090 G090
                    ON G090.IDG090 = G103.IDG090
                  LEFT JOIN G024 G024
                    ON G024.IDG024 = G103.IDG024
                  JOIN G097 G097
                    ON G097.IDG097 = G103.IDG097
                  AND IDGRUPO = 8
                  LEFT JOIN S001 S001
                    ON S001.IDS001 = G103.IDS001
                  LEFT JOIN S001 S001PA
                    ON S001PA.IDS001 = G103.IDS001PA
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
   * @description Listar um dado na tabela G103.
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

      var id = req.body.IDG103;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: `

         SELECT G103.IDG103,
                G103.IDS001,
                S001.NMUSUARI,
                G103.IDG090,
                G090.DSCAMPAN,
                G103.IDG024,
                G024.NMTRANSP,
                G103.IDG097,
                G097.DSVALUE,
                G097.IDKEY,
                G103.IDS001PA,
                S001PA.NMUSUARI AS NMUSUARIPA,
                G103.DTCADAST,
                G103.SNDELETE,
                COUNT(G103.IDG103) OVER() AS COUNT_LINHA
            FROM G103 G103
            LEFT JOIN G090 G090
              ON G090.IDG090 = G103.IDG090
            LEFT JOIN G024 G024
              ON G024.IDG024 = G103.IDG024
            JOIN G097 G097
              ON G097.IDG097 = G103.IDG097
            AND IDGRUPO = 8
            LEFT JOIN S001 S001
              ON S001.IDS001 = G103.IDS001
            LEFT JOIN S001 S001PA
              ON S001PA.IDS001 = G103.IDS001PA
           Where G103.IdG103   = :id
             And G103.SnDelete = 0 `,
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
   * @description Salvar um dado na tabela G103.
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
        tabela: 'G103',
        colunas: {

          IDS001: req.body.IDS001.id,
          IDG090: req.body.IDG090.id,
          IDG024: req.body.IDG024.id,
          IDG097: req.body.IDG097,
          IDS001PA: req.body.IDS001PA.id,
          DTCADAST: new Date(),
          SNDELETE: 0

        },
        key: 'IdG103'
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
   * @description Atualizar um dado na tabela G103, .
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

      var id = req.body.IDG103;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'G103',
          colunas: {

            IDS001: req.body.IDS001.id,
            IDG090: req.body.IDG090.id,
            IDG024: req.body.IDG024.id,
            IDG097: req.body.IDG097,
            IDS001PA: req.body.IDS001PA.id
          },
          condicoes: 'IdG103 = :id',
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
   * @description Delete um dado na tabela G103.
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
      var ids = req.body.IDG103;

    let result = await
      con.update({
        tabela: 'G103',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG103 in (`+ids+`)`
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
