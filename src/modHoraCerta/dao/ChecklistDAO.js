/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Ademário Marcolino
 * @since 22/05/2018
 * 
*/

/** 
 * @module dao/Checklist
 * @description H018
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api        = {};
  var utils      = app.src.utils.FuncoesObjDB;
  var dtatu      = app.src.utils.DataAtual;
  var db         = app.config.database;
  var acl        = app.src.modIntegrador.controllers.FiltrosController;
  var logger     = app.config.logger;
  var sqlWhere;
  api.controller = app.config.ControllerBD;

  /**
   * @description Salvar um dado na tabela H018.
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
    try {

      logger.debug("Parametros recebidos:", req.body);

      let Checklist = await con.insert({
        tabela: 'H018',
        colunas: {

          IDH006:   req.body.IDH006,
          NRCHELIS: req.body.NRCHELIS,
          DTCHELIS: dtatu.retornaData(req.body.DTCHELIS),
          SNAPROV:  req.body.SNAPROV,
          IDS001: req.body.IDS001
        },
        key: 'IdH018'
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
      return { res: Checklist};
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }
    
  };

  /**
   * @description Listar um dado na tabela H018.
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
    if(req.body.idh006){
      sqlWhere = 'Where  H018.IDH006 = ' + req.body.idh006;
    }else if(req.body.idh018){
      sqlWhere = 'Where  H018.IDH018 = ' + req.body.idh018;
    }
    try {

      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select  
                      H018.IDH018, 
                      H018.IDH006,
                      H018.NRCHELIS,
                      TO_CHAR(H018.DTCHELIS, 'DD/MM/YYYY HH24:MI:SS') DTCHELIS,
                      H018.SNAPROV,
                      ARQANEXO
              From   H018 H018 
              ${sqlWhere}`,
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
   * @description Atualiza um dado da tabela H018.
   *
   * @async
   * @function api/update
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
 api.update = async function (req, res, next) {
  var id = req.body.IDH018;
  return await
    db.update({
      tabela: `H018`,
      colunas: {
        SNAPROV:   req.body.SNAPROV,
        DTCHELIS:   dtatu.retornaData(req.body.DTCHELIS),
        IDS001: req.body.IDS001
      },
      condicoes: `H018.IDH018 = :id`,
      parametros: {
        id: id
      }
    })
  .then( (result1) => {
    return { response : "Checklist alterado com sucesso" };
  })
  .catch((err) => {
    err.stack = new Error().stack + `\r\n` + err.stack;
    throw err;
  });
};

/**
   * @description Atualiza a quantidade de arquivos de upload do agendamento na tabela H018.
   *
   * @async
   * @function api/update
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
 
 api.updateQtdArqanexo = async function (req, res, next) {
  logger.debug("Parametros recebidos:", req);
  var id = req.IDH006;
  return await
    db.update({
      tabela: `H018`,
      colunas: {
        ARQANEXO:   req.ARQANEXO
      },
      condicoes: `H018.IDH006 = :id`,
      parametros: {
        id: id
      }
    })
  .catch((err) => {
    err.stack = new Error().stack + `\r\n` + err.stack;
    throw err;
  });
};

  

  return api;
};
