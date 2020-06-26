/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de Campanha
 * @author Desconhecido
 * @since 29/06/2018
 *
*/

/**
 * @module dao/Campanha
 * @description G090.
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
   * @description Listar um dados da tabela G090.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G090',true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: ` Select G090.IDG090,
                        G090.DSCAMPAN,
                        G090.DTINICIO,
                        G090.DTFIM,
                        G090.PTINICIO,
                        G090.PTMENSAL,
                        G090.DSPREMIA,
                        G090.SNDELETE,
                        G090.DTCADAST,

                        (Select LISTAGG(g024.NMTRANSP, ',') WITHIN Group(Order By g024.NMTRANSP)  
                        From g024 g024 
                        JOIN G091 G091 ON G091.idg090 = g090.idg090
                        Where g024.idg024 = g091.idg024) As  dstransp,

                        COUNT(G090.IdG090) OVER () as COUNT_LINHA
                   From G090 G090 `+
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
   * @description Listar um dado na tabela G090.
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

      var id = req.body.IDG090;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select G090.IDG090,
                      G090.DSCAMPAN,
                      G090.DTINICIO,
                      G090.DTFIM,
                      G090.PTINICIO,
                      G090.PTMENSAL,
                      G090.DSPREMIA,
                      G090.SNDELETE,
                      G090.DTCADAST,
                      '' as IDG091,
                      COUNT(G090.IdG090) OVER () as COUNT_LINHA
                 From G090 G090
                Where G090.IdG090   = : id
                  And G090.SnDelete = 0 `,
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




      let result2 = await con.execute(
        {
          sql: ` Select G091.IDG090,
                        G091.IDG024 as id,
                        G024.NMTRANSP as text
                   From G091 G091
                   Join G024 G024 on G024.idg024 = G091.idg024
                  Where G091.IdG090   = : id`,
          param: {
            id: id
          }
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          //return (result[0]);
          return utils.array_change_key_case(result);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

      result.IDG091 = result2;

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
   * @description Salvar um dado na tabela G090.
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
        tabela: 'G090',
        colunas: {

          DSCAMPAN: req.body.DSCAMPAN,
          DTINICIO:  new Date( req.body.DTINICIO.date.year, (req.body.DTINICIO.date.month-1),  req.body.DTINICIO.date.day,0,0,0,0), 
          DTFIM:  new Date( req.body.DTFIM.date.year, (req.body.DTFIM.date.month-1),  req.body.DTFIM.date.day,0,0,0,0), 
          PTINICIO: req.body.PTINICIO,
          PTMENSAL: req.body.PTMENSAL,
          DSPREMIA: req.body.DSPREMIA,
          DTCADAST: new Date(),
          SNDELETE: 0,

        },
        key: 'IdG090'
      })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
        return { response: req.__('tp.sucesso.insert') };
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
        });



      await con.execute(
        {
          sql: `DELETE FROM G091
                WHERE idg090 in (${result})`,
          param: []
        })
        .then((result) => {
          return true;
        })
        .catch((err) => {
          con.closeRollBack();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

      let result2 = null;

      for (let k = 0; k < req.body.IDG024.length; k++) {

        result2 = await con.insert({
          tabela: 'G091',
          colunas: {
            IDG090: result,
            IDG024: req.body.IDG024[k].id,
          },
          key: 'IdG090'
        })
        .then((result1) => {
          logger.debug("Retorno:", result1);
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
        
      }

      
      await con.close();
      logger.debug("Fim salvar");
      return { response: req.__('tp.sucesso.insert') };

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };

  /**
   * @description Atualizar um dado na tabela G090, .
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

      var id = req.body.IDG090;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'G090',
          colunas: {

            DSCAMPAN: req.body.DSCAMPAN,
            DTINICIO:  new Date( req.body.DTINICIO.date.year, (req.body.DTINICIO.date.month-1),  req.body.DTINICIO.date.day,0,0,0,0), 
            DTFIM:  new Date( req.body.DTFIM.date.year, (req.body.DTFIM.date.month-1),  req.body.DTFIM.date.day,0,0,0,0), 
            PTINICIO: req.body.PTINICIO,
            PTMENSAL: req.body.PTMENSAL,
            DSPREMIA: req.body.DSPREMIA
          },
          condicoes: 'IdG090 = :id',
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

      await con.execute(
        {
          sql: `DELETE FROM G091
                WHERE idg090 in (${id})`,
          param: []
        })
        .then((result) => {
          return true;
        })
        .catch((err) => {
          con.closeRollBack();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

        let result2 = null;

      for (let k = 0; k < req.body.IDG024.length; k++) {

        result2 = await con.insert({
          tabela: 'G091',
          colunas: {
            IDG090: id,
            IDG024: req.body.IDG024[k].id,
          },
          key: 'IdG090'
        })
        .then((result1) => {
          logger.debug("Retorno:", result1);
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
        
      }

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
   * @description Delete um dado na tabela G090.
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
      var ids = req.body.IDG090;

    let result = await
      con.update({
        tabela: 'G090',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG090 in (`+ids+`)`
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
