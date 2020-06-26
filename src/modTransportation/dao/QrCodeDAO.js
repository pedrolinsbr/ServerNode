/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 28/06/2018
 * 
*/

/** 
 * @module dao/QrCode
 * @description M001.
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
   * @description Listar um dados da tabela M001.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'M001',true);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      


			var user = null;
			if(req.UserId != null){
			  user = req.UserId;
			}else if(req.headers.ids001 != null){
			  user = req.headers.ids001;
			}else if(req.body.ids001 != null){
			  user = req.body.ids001;
			}
			
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


      let result = await con.execute(
        {
          sql: ` Select M001.IDM001,
                        M001.DSMOBILE,
                        M001.NRFONE,
                        M001.DSMACADD,
                        M001.DSHASHQR,
                        M001.STQRCODE,
                        M001.IDG031,
                        M001.DTATUALI,
                        M001.SNDELETE,
                        COUNT(M001.IdM001) OVER () as COUNT_LINHA,
                        G031.NMMOTORI || ' [' || G031.IDG031 || '-' || G031.NRMATRIC || ']' as NMMOTORI ,
                        G031.NRMATRIC,
                        s043.NRVERSAO,
                        M001.DTENTSYN
                   From M001 M001
                   Join G031 G031 on G031.IDG031 = M001.IDG031 
                   Join G024 G024 on G024.IDG024 = G031.IDG024
              Left Join s043 s043 on (s043.IDS043 = M001.IDS043)`+
                    sqlWhere +
                    acl1     +
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
   * @description Listar um dado na tabela M001.
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

      var id = req.body.IDM001;
      logger.debug("Parametros buscar:", req.body);


			var user = null;
			if(req.UserId != null){
			  user = req.UserId;
			}else if(req.headers.ids001 != null){
			  user = req.headers.ids001;
			}else if(req.body.ids001 != null){
			  user = req.body.ids001;
			}
			
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

      let result = await con.execute(
      {
        sql: ` Select M001.IDM001,
                      M001.DSMOBILE,
                      M001.NRFONE,
                      M001.DSMACADD,
                      M001.DSHASHQR,
                      M001.STQRCODE,
                      M001.IDG031,
                      M001.DTATUALI,
                      M001.SNDELETE,
                      COUNT(M001.IdM001) OVER () as COUNT_LINHA
                 From M001 M001
                 Join G031 G031 on G031.IDG031 = M001.IDG031 
                 Join G024 G024 on G024.IDG024 = G031.IDG024
                Where M001.IdM001   = : id
                  And M001.SnDelete = 0 `+acl1,
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
   * @description Salvar um dado na tabela M001.
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


     var crypto = require('crypto');
      
     /**
      * Calculates the MD5 hash of a string.
      *
      * @param  {String} string - The string (or buffer).
      * @return {String}        - The MD5 hash.
      */

      let time = new Date().getTime();

      time = time + 'S';

      let DSHASHQR = crypto.createHash('md5').update(time).digest('hex');

      let result = await con.insert({
        tabela: 'M001',
        colunas: {

          DSMOBILE: req.body.DSMOBILE,
          DSMACADD: req.body.DSMACADD,
          NRFONE: req.body.NRFONE,
          DSHASHQR: DSHASHQR,
          STQRCODE: req.body.STQRCODE,
          IDG031: req.body.IDG031.id,
          DTATUALI: new Date(),
          SNDELETE: 0,
          IDS001: req.UserId
          
        },
        key: 'IdM001'
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
   * @description Atualizar um dado na tabela M001, .
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

      var id = req.body.IDM001;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'M001',
          colunas: {

            DSMOBILE: req.body.DSMOBILE,
            DSMACADD: req.body.DSMACADD,
            NRFONE: req.body.NRFONE,
            DSHASHQR: req.body.DSHASHQR,
            STQRCODE: req.body.STQRCODE,
            IDG031:   req.body.IDG031.id,

          },
          condicoes: 'IdM001 = :id',
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
   * @description Delete um dado na tabela M001.
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
      var ids = req.body.IDM001;  
    
    let result = await
      con.update({
        tabela: 'M001',
        colunas: {
          /*SnDelete: 1*/
          STQRCODE: 'C'
        },
        condicoes: ` IdM001 in (`+ids+`)`
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



    /**
   * @description Atualizar um dado na tabela M001, .
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.autenticaQrCode = async function (req, res, next) {

    logger.debug("Inicio autenticaQrCode");
    let con = await this.controller.getConnection(null, req.UserId);
    try {

      /*#
      C - Cadastrado
      G - Gerado
      U - Em uso
      I - Inutilizado      
      #*/

      var DSMACADD = req.body.DSMACADD;

      logger.debug("Parametros recebidos:", req.body);

      let result = await con.execute(
        {
          sql: ` Select M001.IDM001,
                        M001.DSMOBILE,
                        M001.DSMACADD,
                        M001.NRFONE,
                        M001.DSHASHQR,
                        M001.STQRCODE,
                        M001.IDG031,
                        M001.DTATUALI,
                        M001.SNDELETE,
                        G031.NMMOTORI,
                        G031.NRMATRIC
                   From M001 M001
                   Join G031 G031 on G031.IDG031 = M001.IDG031
                  Where M001.DSMACADD like '${DSMACADD}'
                    And M001.SnDelete = 0 
                    And M001.STQRCODE = 'C' `,
          param: {}
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          return (result);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });


        if(result.length <= 0){
          //res.status(200);
          return {msg: "Opss.. QR Code em uso! ", success:false}; //# forcando erro;
        }else{
          result = result[0];
        }

      var id = result.IDM001;
      
      let result2 = await
        con.update({
          tabela: 'M001',
          colunas: {

            STQRCODE: 'U',
            DTATUALI: new Date()

          },
          condicoes: 'IdM001 = :id',
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
      logger.debug("Fim autenticaQrCode");

      return {retorno:result, success:true, msg:result2};
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err; 
    
    }
  
  };




  /**
   * @description Atualizar um dado na tabela M001, .
   *
   * @async
   * @function api/atualizarMotorista
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.atualizarMotorista = async function (req, res, next) {

    logger.debug("Inicio atualizarMotorista");
    let con = await this.controller.getConnection(null, req.UserId);
    try {

      var id = req.body.IDM001;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'M001',
          colunas: {
            IDG031:   req.body.IDG031.id,
            STQRCODE: 'C'
          },
          condicoes: 'IdM001 = :id',
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
      logger.debug("Fim atualizarMotorista");
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
