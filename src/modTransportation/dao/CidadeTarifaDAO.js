/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 28/06/2018
 * 
*/

/** 
 * @module dao/OcorrenciaCarga
 * @description G053.
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
   * @description Listar um dados da tabela G053.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G053',true);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      
      let result = await con.execute(
        {
          sql: `Select G053.IDG053,

                G003OR.NMCIDADE || ' [' || G002OR.CDESTADO || ']' as NMCIDADEOR,
                G003DE.NMCIDADE || ' [' || G002DE.CDESTADO || ']' as NMCIDADEDE,
                G053.IDG014,
                G053.IDG003OR,
                G053.IDG003DE,
                G053.QTDIAENT,
                G053.QTDIACOL,
                G053.HOFINOTI,
                G053.STCADAST,
                G053.DTCADAST,
                G053.IDS001,
                G053.SNDELETE,
                G053.CDTARIFA,
                G053.QTDIENLO,
                G053.TPDIAS,
                G005.NMCLIENT || ' [' || G005.IDG005 || ']' as G005_NMCLIENT,
                G053.IDG005,
                G014.DSOPERAC || ' [' || G014.IDG014 || ']' as operacao,
                G053.TPTRANSP,
                COUNT(G053.IdG053) OVER () as COUNT_LINHA
              From G053 G053

              LEFT JOIN G003 G003OR ON (G003OR.IDG003 = G053.IDG003OR)
              LEFT JOIN G003 G003DE ON (G003DE.IDG003 = G053.IDG003DE)

              LEFT JOIN G002 G002OR ON (G003OR.IDG002  = G002OR.IDG002)
              LEFT JOIN G002 G002DE ON (G003DE.IDG002  = G002DE.IDG002)

              LEFT JOIN G005 G005 ON (G005.IDG005 = G053.IDG005)
              LEFT JOIN G014 G014 ON (G053.IDG014  = G014.IDG014) `+
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
   * @description Listar um dado na tabela G053.
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

      var id = req.body.IDG053;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select G053.IDG053,

        G003OR.NMCIDADE || ' [' || G002OR.CDESTADO || ']' as NMCIDADEOR,
        G003DE.NMCIDADE || ' [' || G002DE.CDESTADO || ']' as NMCIDADEDE,
        G053.IDG014,
        G053.IDG003OR,
        G053.IDG003DE,
        G053.QTDIAENT,
        G053.QTDIACOL,
        G053.HOFINOTI,
        G053.STCADAST,
        G053.DTCADAST,
        G053.IDS001,
        G053.SNDELETE,
        G053.CDTARIFA,
        G053.QTDIENLO,
        G053.TPDIAS,
        G005.NMCLIENT,
        G053.IDG005,
        G014.DSOPERAC,
        G053.TPTRANSP,
        COUNT(G053.IdG053) OVER () as COUNT_LINHA
      From G053 G053
                LEFT JOIN G003 G003OR ON (G003OR.IDG003 = G053.IDG003OR)
                LEFT JOIN G003 G003DE ON (G003DE.IDG003 = G053.IDG003DE)

                LEFT JOIN G002 G002OR ON (G003OR.IDG002  = G002OR.IDG002)
                LEFT JOIN G002 G002DE ON (G003DE.IDG002  = G002DE.IDG002)

                LEFT JOIN G005 G005 ON (G005.IDG005 = G053.IDG005)
                LEFT JOIN G014 G014 ON (G053.IDG014  = G014.IDG014) 
                Where G053.Idg053   = : id
                  And G053.SnDelete = 0`,
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
   * @description Salvar um dado na tabela G053.
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

      let validaCadastroUnique = await con.execute(
        {
          sql: `Select G053.IDG053 
              From G053 G053
             Where G053.IDG003OR =  ${req.body.IDG003OR.id}
               And G053.IDG003DE =  ${req.body.IDG003DE.id}
               And G053.IDG014   =  ${req.body.IDG014.id}
               And G053.TPTRANSP = '${req.body.TPTRANSP.id}'`,
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
  
        if(validaCadastroUnique.length >= 1 ){
          await con.closeRollback();
          res.status(500);
          return {response: "Origem x Destino já cadastrado!"};
        }


      let result = await con.insert({
        tabela: 'G053',
        colunas: {

          IDG014     : req.body.IDG014.id,
          IDG003OR   : req.body.IDG003OR.id,
          IDG003DE   : req.body.IDG003DE.id,
          QTDIAENT   : req.body.QTDIAENT,
          QTDIENLO   : req.body.QTDIENLO,
          QTDIACOL   : req.body.QTDIACOL,
          CDTARIFA   : req.body.CDTARIFA,
          TPDIAS     : req.body.TPDIAS  ,
          IDG005     : (req.body.IDG005 != null)?req.body.IDG005.id:req.body.IDG005,
          TPTRANSP   : req.body.TPTRANSP.id,
          IDS001     : (req.UserId != null ? req.UserId : 97),
          DTCADAST   : new Date()
          
        },
        key: 'IdG053'
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
   * @description Atualizar um dado na tabela G053, .
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

      var id = req.body.IDG053;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'G053',
          colunas: {

            /*IDG014     : req.body.IDG014.id,*/
            /*IDG003OR   : req.body.IDG003OR.id,*/
            /*IDG003DE   : req.body.IDG003DE.id,*/
            QTDIAENT   : req.body.QTDIAENT,
            QTDIENLO   : req.body.QTDIENLO,
            QTDIACOL   : req.body.QTDIACOL,
            CDTARIFA   : req.body.CDTARIFA,
            TPDIAS     : req.body.TPDIAS,
            IDG005     :(req.body.IDG005 != null ? req.body.IDG005.id:req.body.IDG005),
            /*TPTRANSP   : req.body.TPTRANSP.id,*/

          },
          condicoes: 'IdG053 = :id',
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
   * @description Delete um dado na tabela G053.
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
      var ids = req.body.IDG053;  
    
    let result = await
      con.update({
        tabela: 'G053',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG053 in (`+ids+`)`
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
