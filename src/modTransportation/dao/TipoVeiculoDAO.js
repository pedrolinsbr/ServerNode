/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 27/06/2018
 *
*/

/**
 * @module dao/Rota
 * @description T001, T002, T003.
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
   * @description Listar um dados da tabela G030.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G030',true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let sql = ` Select  distinct
                        G030.IDG030,
                        G030.DSTIPVEI,
                        G030.DSTIPVEI || ' [' || G030.IDG030 || ']' as DSIDG030,
                        G030.STCADAST,
                        G030.PCPESMIN,
                        G030.QTCAPPES,
                        G030.QTCAPVOL,
                        G030.IDVEIOTI,
                        G030.PCMIN4PL,
                        G030.TPRODADO,
                        G030.TPCARROC,
                        G030.PSTARA,
                        G030.CDCATEGO,



                        NVL(G030.NRCARRET,0) AS NRCARRET,
                        COUNT(G030.IdG030) OVER () as COUNT_LINHA
                        From G030 G030
                        ` +
                    sqlWhere ;


      let resultCount = await con.execute(
        {
          sql: ` select count(x.IDG030) as QTD from (`+sql +`) x `,
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
          sql:      sql +
                    sqlOrder +
                    sqlPaginate,
          param: bindValues
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          if(result.length > 0){
            result[0].COUNT_LINHA = resultCount.QTD;
          }
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
   * @description Listar um dado na tabela T001.
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

      var id = req.body.IDG030;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select G030.IDG030,
                      G030.STCADAST,
                      G030.DSTIPVEI,
                      G030.PCPESMIN,
                      G030.QTCAPPES,
                      G030.QTCAPVOL,
                      G030.IDVEIOTI,
                      G030.PCMIN4PL,
                      G030.TPRODADO,
                      G030.TPCARROC,
                      G030.PSTARA,
                      G030.CDCATEGO,
                      NVL(G030.NRCARRET,0) AS NRCARRET,
                      COUNT(G030.IdG030) OVER () as COUNT_LINHA
                      From G030 G030
                Where G030.Idg030   = : id
                  And G030.SnDelete = 0`,
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
   * @description Salvar um dado na tabela T001.
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
      var ids001 = req.UserId == undefined ? req.body.IDS001 : req.UserId;

      let result = await con.insert({
        tabela: 'g030',
        colunas: {

          QTCAPPES: req.body.QTCAPPES,
          QTCAPVOL: req.body.QTCAPVOL,
          PCPESMIN: req.body.PCPESMIN,
          PCMIN4PL: req.body.PCMIN4PL,
          DSTIPVEI: req.body.DSTIPVEI,
          STCADAST: req.body.STCADAST,
          TPRODADO: req.body.TPRODADO.id,
          TPCARROC: req.body.TPCARROC.id,
          PSTARA: req.body.PSTARA,
          
          IDS001:   ids001,
          DTCADAST: new Date(),
          NRCARRET: req.body.NRCARRET,

        },
        key: 'idg030'
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
   * @description Atualizar um dado na tabela T001, .
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

      var id = req.body.IDG030;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'G030',
          colunas: {

          STCADAST: req.body.STCADAST,
          DSTIPVEI: req.body.DSTIPVEI,
          PCPESMIN: req.body.PCPESMIN,
          QTCAPPES: req.body.QTCAPPES,
          QTCAPVOL: req.body.QTCAPVOL,
          PCMIN4PL: req.body.PCMIN4PL,
          NRCARRET: req.body.NRCARRET,
          TPRODADO: req.body.TPRODADO.id,
          TPCARROC: req.body.TPCARROC.id,
          PSTARA: req.body.PSTARA,
          

          },
          condicoes: 'IdG030 = :id',
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
   * @description Delete um dado na tabela T001.
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
      var ids = req.body.IDG030;

      var resultValidaCarga = await con.execute({
        sql:`
        SELECT G046.IDG046
          FROM G046 G046 
         WHERE G046.IDG030 in ( :id ) 
           AND G046.STCARGA in ('B','R','O') `,
        param:{
          id: ids
        }
      }).then((res) => {
        return res;
      }).catch((err) => {
        throw err;
      });

      if(resultValidaCarga.length >= 1){
        res.status(500);
        return {response: "É possivel deletar apenas tipo de veiculo que não possui vinculo com carga ativa."};
      }

    let result = await
      con.update({
        tabela: 'G030',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG030 in (`+ids+`)`
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



