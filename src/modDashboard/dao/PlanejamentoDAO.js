/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 28/06/2018
 * 
*/

/** 
 * @module dao/Planejamento
 * @description G079.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  var dicionario = app.src.utils.Dicionario;
  var dtatu = app.src.utils.DataAtual;
  var acl = app.src.modIntegrador.controllers.FiltrosController;
  var logger = app.config.logger;
  api.controller = app.config.ControllerBD;

  /**
   * @description Listar um dados da tabela G079.
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
      let sqlWhereAcl = await acl.montar({
        ids001: req.UserId,
        dsmodulo: "dashboard",
        nmtabela: [
          {
            G014: 'G014'
          }
        ],
        esoperad: 'And '
      });
      if(typeof sqlWhereAcl == 'undefined'){
        sqlWhereAcl = '';
      }
      logger.debug("Parametros recebidos:", req.body);

      var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G079', true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: ` Select 
                  G079.IDG079, 
                  G079.IDG014, 
                  G028.IDG028, 
                  G028.NMARMAZE AS G028_NMARMAZE,
                  G079.NRPSCONT,
                  G079.NRPSPREV, 
                  G079.NRPSREAL, 
                  G079.NRPLCONT, 
                  G079.NRPLPREV, 
                  G079.NRPLREAL, 
                  G079.DTREGIST,
                  COUNT(G079.IDG079) OVER () as COUNT_LINHA

                  FROM G079 G079
                  Left Join G014 G014   On (G079.IDG014 = G014.IDG014)
                  INNER JOIN G028 G028
                    ON G028.IDG028 = G079.IDG028

                  ${sqlWhere}
                  ${sqlWhereAcl}

                  ${sqlOrder} ${sqlPaginate}
                   `,
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
   * @description Listar um dado na tabela G079.
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

      var id = req.body.IDG079;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
        {
          sql: ` Select 
                      G079.IDG079		,
                      G079.IDG014		,
                      G079.IDG028   ,
                      G079.NRPSCONT	,
                      G079.NRPSPREV	,
                      G079.NRPSREAL	,
                      G079.NRPLCONT	,
                      G079.NRPLPREV	,
                      G079.NRPLREAL	,
                      G079.DTREGIST , 
                      G028.NMARMAZE AS G028_NMARMAZE,
                      COUNT(G079.IdG079) OVER () as COUNT_LINHA
                 From G079 G079
                 Join G028 G028 on G028.IDG028 = G079.IDG028
                Where G079.IdG079   = : id
                  And G079.SnDelete = 0`,
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
   * @description Listar um dado na tabela G079 buscando através da data.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
    */
   api.buscarData = async function (req, res, next) {

    logger.debug("Inicio buscar");
    let con = await this.controller.getConnection();

    try {
      let sqlWhereAcl = await acl.montar({
        ids001: req.headers.ids001,
        dsmodulo: "dashboard",
        nmtabela: [
          {
            G014: 'G014'
          }
        ],
        esoperad: 'And '
      });
      if(typeof sqlWhereAcl == 'undefined'){
        sqlWhereAcl = '';
      }
      var data = req.body.DTREGIST.formatted;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
        {
          sql: ` SELECT 
                    G079.IDG079,
                    G079.DTREGIST,
                    COUNT(G079.IdG079) OVER () as COUNT_LINHA
                  FROM  G079 G079
                  Left Join G014 G014   On (G079.IDG014 = G014.IDG014)                  
                  WHERE G079.SNDELETE = 0
                    AND G079.DTREGIST = TO_DATE(: data, 'DD/MM/YYYY')
                    AND G079.IDG028 = ${req.body.IDG028.id}
                    
                    ${sqlWhereAcl}`,
          param: {
            data: data
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
   * @description Salvar um dado na tabela G069.
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
    let con = await this.controller.getConnection();
    let strSql = `Select S028.DSVALUE From 
    S001
    Join S027 S027 On S027.IDS001 = S001.IDS001
    Join S026 S026 On S026.IDS026 = S027.IDS026
    Join S028 S028 On S028.IDS026 = S026.IDS026
    Join S007 S007 On S007.IDS007 = S028.IDS007
    Join S025 S025 On S025.IDS025 = S026.IDS025
    Where 
    S007.NMTABELA = 'G014'
    And S001.IDS001 = ${req.headers.ids001}
    And S025.Dsmodulo = 'Dashboard'
    And S026.Tpgrupo In ('P', 'A')
    `;
    let result1 = await con.execute(
      {
        sql: strSql
        ,
        param: []
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return (result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });
    try {
      logger.debug("Parametros recebidos:", req.body);
      let operacao = 1;
      if(result1.length > 0){
        operacao = result1[0].DSVALUE;
      }
      let result = await con.insert({
        tabela: 'G079',
        colunas: {


          IDG014: operacao,
          IDG028: req.body.IDG028.id,	//alterar
          NRPSCONT: req.body.NRPSCONT,
          NRPSPREV: req.body.NRPSPREV,
          NRPLCONT: req.body.NRPLCONT,
          NRPLPREV: req.body.NRPLPREV,
          SNDELETE: 0,
          DTREGIST: new Date(req.body.DTREGIST.jsdate),

        },
        key: 'IdG079'
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
   * @description Atualizar um dado na tabela G069, .
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
    let con = await this.controller.getConnection();
    try {

      var id = req.body.IDG079;
      logger.debug("Parametros recebidos:", req.body);
      var n = req.body.DTREGIST.date;
      let result = await
        con.update({
          tabela: 'G079',
          colunas: {

            
            IDG028: req.body.IDG028.id,
            NRPSCONT: req.body.NRPSCONT,
            NRPSPREV: req.body.NRPSPREV,
            NRPSREAL: req.body.NRPSREAL,
            DTREGIST: new Date(n.year, n.month - 1, n.day)

          },
          condicoes: 'IdG079 = :id',
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
   * @description Delete um dado na tabela G069.
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
    let con = await this.controller.getConnection();

    try {

      logger.debug("ID selecionados");
      var ids = req.body.IDG079;

      let result = await
        con.update({
          tabela: 'G079',
          colunas: {
            SNDELETE: 1
          },
          condicoes: ` IdG079 in (` + ids + `)`
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
