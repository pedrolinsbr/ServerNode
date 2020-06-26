/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 27/06/2018
 *
*/

/**
 * @module dao/ArmazemTransp
 * @description 
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
   * @description Listar um dados da tabela g084.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na ArmazemTransp.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.listarArmazemTransp = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection(null, req.UserId);

    //ACL
    var user = null;
      if(req.UserId != null){
        user = req.UserId;
      }else if(req.headers.ids001 != null){
        user = req.headers.ids001;
      }else if(req.body.ids001 != null){
        user = req.body.ids001;
      }

      //Para testes!!!!!!!!
      //user = 1399;
      
      var acl1 = '';
      acl1 = await acl.montar({
        ids001: user,
        dsmodulo: 'transportation',
        nmtabela: [{
        G024: 'G024'
        }],
        //dioperad: ' ',
        esoperad: 'And '
      });

      if(typeof acl1 == 'undefined'){
        acl1 = '';
      }

    try {

      logger.debug("Parametros recebidos:", req.body);

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G084',true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let sqlArmazemTransp = ` Select
                          G084.IDG084,
                          G084.IDG024,
                          G084.IDG028,
                          G024.NMTRANSP || ' [' || G084.IDG024 || ']' AS NMTRANSP,
                          G028.NMARMAZE || ' [' || G084.IDG028 || ']' AS NMARMAZE,
                          COUNT(G084.IDG084) OVER() as COUNT_LINHA
                        From G084 G084
                        JOIN G024 G024 ON G024.IDG024 = G084.IDG024
                        JOIN G028 G028 ON G028.IDG028 = G084.IDG028
                        ` +
                          sqlWhere 
                          + acl1
                          ;


                          let resultCount = await con.execute(
                            {
                              sql: ` select count(x.IDG084) as QTD from (`+sqlArmazemTransp +`) x `,
                              param: bindValues
                            })
                            .then((result) => {
                              logger.debug("Retorno:", result);
                              return result[0];
                            })
                            .catch((err) => {
                              err.stack = new Error().stack + `\r\n` + err.stack;
                              logger.error("Erro:", err);
                              throw err;
                            });
                    

      let result = await con.execute(
        {
          sql:      sqlArmazemTransp +
                    sqlOrder +
                    sqlPaginate,
          param: bindValues
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          result[0].COUNT_LINHA = resultCount.QTD;
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
   * @description Listar um dado na tabela g084.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na ArmazemTransp.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.buscarArmazemTransp = async function (req, res, next) {

    logger.debug("Inicio buscar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var id = req.body.IDG084;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select
                  G084.IDG084,
                  G084.IDG024,
                  G084.IDG028,
                  G024.NMTRANSP || ' [' || G084.IDG024 || ']' AS NMTRANSP,
                  G028.NMARMAZE || ' [' || G084.IDG028 || ']' AS NMARMAZE,
                  COUNT(G084.IDG084) OVER() as COUNT_LINHA
                From G084 G084
                JOIN G024 G024 ON G024.IDG024 = G084.IDG024
                JOIN G028 G028 ON G028.IDG028 = G084.IDG028
                Where G084.IDG084   = : id
                  And G084.SnDelete = 0`,
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
   * @description Salvar um dado na tabela g084.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na ArmazemTransp.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.salvarArmazemTransp = async function (req, res, next) {

    logger.debug("Inicio salvar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);


            //# Buscar apolice transportadora BRAVO
            let result6 = await con.execute(
              {
                  sql: `Select G084.IDG084,
                        G084.IDG024,
                        G084.IDG028
                    From g084 g084

                  Where g084.Sndelete = 0
                    And g084.idg024 = :idtransp
                    And g084.idg028 = :idarmazem `,
                param: {
                  idtransp: req.body.IDG024.id,
                  idarmazem: req.body.IDG028.id
                }
              });
            if(result6.length >= 1){
              // logger.error("Erro buscar apolice transportadora BRAVO", id);
              res.status(500);
      
              return {response: "Armazém/Transportadora cadastrados"}; //# forcando erro;
            }

      let result = await con.insert({
        tabela: 'G084',
        colunas: {

          IDG024: req.body.IDG024.id,
          IDG028: req.body.IDG028.id
        },
        key: 'IDG084'
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
   * @description Atualizar um dado na tabela g084.
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na ArmazemTransp.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.atualizarArmazemTransp = async function (req, res, next) {

    logger.debug("Inicio atualizar");
    let con = await this.controller.getConnection(null, req.UserId);
    try {

      var id = req.body.IDG084;
      logger.debug("Parametros recebidos:", req.body);

        //# Buscar apolice transportadora BRAVO
        let result6 = await con.execute(
          {
              sql: `Select G084.IDG084,
                    G084.IDG024,
                    G084.IDG028
                From g084 g084

              Where g084.Sndelete = 0
                And g084.idg024 = :idtransp
                And g084.idg028 = :idarmazem `,
            param: {
              idtransp: req.body.IDG024.id,
              idarmazem: req.body.IDG028.id
            }
          });
        if(result6.length >= 1){
          // logger.error("Erro buscar apolice transportadora BRAVO", id);
          res.status(500);
  
          return {response: "Transportadora e armazém ja cadastrados"}; //# forcando erro;
        }

      let result = await
        con.update({
          tabela: 'G084',
          colunas: {
            IDG024: req.body.IDG024.id,
            IDG028: req.body.IDG028.id
          },
          condicoes: 'IDG084 = :id',
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
   * @description Delete um dado na tabela g084.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na ArmazemTransp.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.excluirArmazemTransp = async function (req, res, next) {

    logger.debug("Inicio excluir");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("ID selecionados");
      var ids = req.body.IDG084;

      let result = await con.execute(
        {
            sql: `delete g084 g084
            Where g084.Sndelete = 0
              And g084.IDG084 IN (${ids}) `,
          param: []
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
