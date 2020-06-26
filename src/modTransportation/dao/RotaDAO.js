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
   * @description Listar um dados da tabela T001.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.listarRota = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection(null, req.UserId);

    //DELENTANDO TEMPORARIAMENTE PARA TESTES
    delete req.body['parameter[CALEND][id]'];
    delete req.body['parameter[CALEND][text]'];

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
      
      var sqlWhereComplement = '';

      if(req.body['parameter[SNDIA0_filter]'] == 'true' && req.body['parameter[SNDIA0_filter]'] != null){
        sqlWhereComplement += ` and T001.SNDIA0 ='1'`;
      }

      if(req.body['parameter[SNDIA1_filter]'] == 'true' && req.body['parameter[SNDIA1_filter]'] != null){
        sqlWhereComplement += ` and T001.SNDIA1 = '1'`;
      }

      if(req.body['parameter[SNDIA2_filter]'] == 'true' && req.body['parameter[SNDIA2_filter]'] != null){
        sqlWhereComplement += ` and T001.SNDIA2 = '1'`;
      }

      if(req.body['parameter[SNDIA3_filter]'] == 'true' && req.body['parameter[SNDIA3_filter]'] != null){
        sqlWhereComplement += ` and T001.SNDIA3 = '1'`;
      }

      if(req.body['parameter[SNDIA4_filter]'] == 'true' && req.body['parameter[SNDIA4_filter]'] != null){
        sqlWhereComplement += ` and T001.SNDIA4 = '1'`;
      }
      

      if(req.body['parameter[SNDIA5_filter]'] == 'true' && req.body['parameter[SNDIA5_filter]'] != null){
        sqlWhereComplement += ` and T001.SNDIA5 = '1'`;
      }

      if(req.body['parameter[SNDIA6_filter]'] == 'true' && req.body['parameter[SNDIA6_filter]'] != null){
        sqlWhereComplement += ` and T001.SNDIA6 = '1'`;
      }
      
      delete req.body['parameter[SNDIA0_filter]'];
      delete req.body['parameter[SNDIA1_filter]'];
      delete req.body['parameter[SNDIA2_filter]'];
      delete req.body['parameter[SNDIA3_filter]'];
      delete req.body['parameter[SNDIA4_filter]'];
      delete req.body['parameter[SNDIA5_filter]'];
      delete req.body['parameter[SNDIA6_filter]'];

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'T001',true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let sqlRota = ` Select  distinct
                              T001.IDT001,
                              T001.IDG024,
                              T001.DSPRACA,
                              T001.CDZONA,
                              T001.CDSETOR,
                              T001.PCFREROT,
                              T001.VRFREMIN,
                              T001.QTINTVIS,
                              T001.SNDELETE,
                              T001.STCADAST,
                              T001.IDT005,
                              T005.DSCLUSTE T005_DSCLUSTE,
                              T001.DTCADAST,
                              T001.IDS001,
                              T001.SNDIA0,
                              T001.SNDIA1,
                              T001.SNDIA2,
                              T001.SNDIA3,
                              T001.SNDIA4,
                              T001.SNDIA5,
                              T001.SNDIA6,
                              g024.NMTRANSP   || ' [' || g024.idg024   || '-' || g024.idlogos   || ']'  as G024_NMTRANSP,
                              '0' as COUNT_LINHA,
                              (Select 
                                COUNT(T002.IdT002)
                                From T002 T002A
                                Where T002A.IDT001 = T001.IDT001 And T002.SNDELETE = 0
                              ) NRCIDADES
                        From T001 T001
                        INNER JOIN G024 G024
                          ON T001.IDG024 = G024.IDG024
                        LEFT JOIN T005 T005
                          ON T001.IDT005 = T005.IDT005
                          AND T005.SNDELETE = 0

                        LEFT JOIN T003 T003
                           ON T003.IDT001 = T001.IDT001
                          AND T003.SNDELETE = 0

                        LEFT JOIN T002 T002
                          ON T002.IDT001 = T001.IDT001
                          AND T002.SNDELETE = 0
                          
                        LEFT JOIN G003 G003
                          ON G003.IDG003 = T002.IDG003
                          AND T005.SNDELETE = 0` +
                          sqlWhere +
                          acl1 +
                          sqlWhereComplement;


      let resultCount = await con.execute(
        {
          sql: ` select count(x.IDT001) as QTD from (`+sqlRota +`) x `,
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
          sql:      sqlRota +
                    sqlOrder +
                    sqlPaginate,
          param: bindValues
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          return result;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

        if(result.length > 0){
          result[0].COUNT_LINHA = resultCount.QTD;
        }
      
      result = (utils.construirObjetoRetornoBD(result));

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
  api.buscarRota = async function (req, res, next) {

    logger.debug("Inicio buscar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var id = req.body.IDT001;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select T001.IDT001,
                      T001.IDG024,
                      T001.DSPRACA,
                      T001.CDZONA,
                      T001.CDSETOR,
                      T001.PCFREROT,
                      T001.VRFREMIN,
                      T001.QTINTVIS,
                      T001.SNDELETE,
                      T001.IDT005,
                      T005.DSCLUSTE T005_DSCLUSTE,
                      T001.STCADAST,
                      T001.DTCADAST,
                      T001.IDS001,
                      T001.SNDIA0,
                      T001.SNDIA1,
                      T001.SNDIA2,
                      T001.SNDIA3,
                      T001.SNDIA4,
                      T001.SNDIA5,
                      T001.SNDIA6,
                      G024.NMTRANSP AS G024_NMTRANSP,
                      COUNT(T001.IdT001) OVER () as COUNT_LINHA
                 From T001 T001
                 INNER JOIN G024 G024
                   ON T001.IDG024 = G024.IDG024
                   INNER JOIN T005 T005
                   ON T001.IDT005 = T005.IDT005 AND T005.SNDELETE = 0
                Where T001.IdT001   = : id
                  And T001.SnDelete = 0`,
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
  api.salvarRota = async function (req, res, next) {

    logger.debug("Inicio salvar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      let result = await con.insert({
        tabela: 'T001',
        colunas: {

          IDG024: req.body.IDG024.id,
          DSPRACA: req.body.DSPRACA,
          CDZONA: req.body.CDZONA,
          CDSETOR: req.body.CDSETOR,
          PCFREROT: req.body.PCFREROT,
          VRFREMIN: req.body.VRFREMIN,
          QTINTVIS: req.body.QTINTVIS,
          STCADAST: req.body.STCADAST,
          IDT005: req.body.IDT005.id,
          SNDIA0: (req.body.SNDIA0 == true ? 1 : 0),
          SNDIA1: (req.body.SNDIA1 == true ? 1 : 0),
          SNDIA2: (req.body.SNDIA2 == true ? 1 : 0),
          SNDIA3: (req.body.SNDIA3 == true ? 1 : 0),
          SNDIA4: (req.body.SNDIA4 == true ? 1 : 0),
          SNDIA5: (req.body.SNDIA5 == true ? 1 : 0),
          SNDIA6: (req.body.SNDIA6 == true ? 1 : 0),
          DTCADAST: new Date(),
          IDS001: req.UserId,

        },
        key: 'IdT001'
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
  api.atualizarRota = async function (req, res, next) {

    logger.debug("Inicio atualizar");
    let con = await this.controller.getConnection(null, req.UserId);
    try {

      var id = req.body.IDT001;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'T001',
          colunas: {

            IDG024: req.body.IDG024.id,
            DSPRACA: req.body.DSPRACA,
            CDZONA: req.body.CDZONA,
            CDSETOR: req.body.CDSETOR,
            PCFREROT: req.body.PCFREROT,
            VRFREMIN: req.body.VRFREMIN,
            QTINTVIS: req.body.QTINTVIS,
            STCADAST: req.body.STCADAST,
            IDT005: req.body.IDT005.id,
            SNDIA0: (req.body.SNDIA0 == true ? 1 : 0),
            SNDIA1: (req.body.SNDIA1 == true ? 1 : 0),
            SNDIA2: (req.body.SNDIA2 == true ? 1 : 0),
            SNDIA3: (req.body.SNDIA3 == true ? 1 : 0),
            SNDIA4: (req.body.SNDIA4 == true ? 1 : 0),
            SNDIA5: (req.body.SNDIA5 == true ? 1 : 0),
            SNDIA6: (req.body.SNDIA6 == true ? 1 : 0),
          },
          condicoes: 'IdT001 = :id',
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
  api.excluirRota = async function (req, res, next) {

    logger.debug("Inicio excluir");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("ID selecionados");
      var ids = req.body.IDT001;

    let result = await
      con.update({
        tabela: 'T001',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdT001 in (`+ids+`)`
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
   * @description Listar um dados da tabela T002.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.listarCidade = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

			delete req.body['parameter[IDT005][id]'];
      delete req.body['parameter[IDT005][text]'];
      delete req.body['parameter[IDT005][dscluste]'];

			delete req.body['parameter[G003_IDG003][text]'];
      delete req.body['parameter[G003_IDG003][id]'];

      delete req.body['parameter[SNDIA0_filter]'];
      delete req.body['parameter[SNDIA1_filter]'];
      delete req.body['parameter[SNDIA2_filter]'];
      delete req.body['parameter[SNDIA3_filter]'];
      delete req.body['parameter[SNDIA4_filter]'];
      delete req.body['parameter[SNDIA5_filter]'];
      delete req.body['parameter[SNDIA6_filter]'];


      //DELENTANDO TEMPORARIAMENTE PARA TESTES
      delete req.body['parameter[CALEND][id]'];
      delete req.body['parameter[CALEND][text]'];


      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'T002',true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: ` Select T002.IDT002,
                        T002.IDT001,
                        T002.IDG024,
                        T002.IDG003,
                        T002.NRORDCAR,
                        T002.SNDELETE,
                        T002.STCADAST,
                        T002.DTCADAST,
                        T002.IDS001,

                        T002.SNDIA0,
                        T002.SNDIA1,
                        T002.SNDIA2,
                        T002.SNDIA3,
                        T002.SNDIA4,
                        T002.SNDIA5,
                        T002.SNDIA6,

                        
                        T001.DSPRACA,

                        T005.DSCLUSTE,

                        G024.NMTRANSP AS G024_NMTRANSP,
                        G003.NMCIDADE || ' - ' || G002.CDESTADO  AS G003_NMCIDADE,
                        COUNT(T002.IdT002) OVER () as COUNT_LINHA
                   From T002 T002

                  INNER JOIN G024 G024
                     ON T002.IDG024 = G024.IDG024

                  INNER JOIN T001 T001
                     ON T001.IDT001 = T002.IDT001 AND T001.SNDELETE = 0
                     
                  INNER JOIN T005 T005
                     ON T001.IDT005 = T005.IDT005 AND T005.SNDELETE = 0

                   INNER JOIN G003 G003
                     ON T002.IDG003 = G003.IDG003 

                  Inner Join G002 G002 on G003.IDG002 = G002.IDG002 `+
                    sqlWhere +
                    sqlOrder +
                    sqlPaginate,
          param: bindValues
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          // return (utils.construirObjetoRetornoBD(result));
          return result;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

      result = (utils.construirObjetoRetornoBD(result, req.body)); //É O QUE FAZ O EXCELSERVER FUNCIONAR!!!!!


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
   * @description Listar um dado na tabela T002.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.buscarCidade = async function (req, res, next) {

    logger.debug("Inicio buscar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var id = req.body.IDT002;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select T002.IDT002,
                      T002.IDT001,
                      T002.IDG024,
                      T002.IDG003,
                      T002.NRORDCAR,
                      T002.SNDELETE,
                      T002.STCADAST,
                      T002.DTCADAST,
                      T002.IDS001,
                      T002.IDS001,
                      T002.SNDIA0,
                      T002.SNDIA1,
                      T002.SNDIA2,
                      T002.SNDIA3,
                      T002.SNDIA4,
                      T002.SNDIA5,
                      T002.SNDIA6,
                      G024.NMTRANSP AS G024_NMTRANSP,
                      G003.NMCIDADE AS G003_NMCIDADE,
                      COUNT(T002.IdT002) OVER () as COUNT_LINHA
                 From T002 T002
                 INNER JOIN G024 G024
                   ON T002.IDG024 = G024.IDG024
                 INNER JOIN G003 G003
                   ON T002.IDG003 = G003.IDG003
                Where T002.IdT002   = : id
                  And T002.SnDelete = 0`,
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
   * @description Salvar um dado na tabela T002.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.salvarCidade = async function (req, res, next) {

    logger.debug("Inicio salvar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      let result = await con.insert({
        tabela: 'T002',
        colunas: {

          IDG024: req.body.IDG024.id,
          IDT001: req.body.IDT001,
          IDG003: req.body.IDG003.id,
          NRORDCAR: req.body.NRORDCAR,
          STCADAST: req.body.STCADAST,
          SNDIA0: (req.body.SNDIA0 == true ? 1 : 0),
          SNDIA1: (req.body.SNDIA1 == true ? 1 : 0),
          SNDIA2: (req.body.SNDIA2 == true ? 1 : 0),
          SNDIA3: (req.body.SNDIA3 == true ? 1 : 0),
          SNDIA4: (req.body.SNDIA4 == true ? 1 : 0),
          SNDIA5: (req.body.SNDIA5 == true ? 1 : 0),
          SNDIA6: (req.body.SNDIA6 == true ? 1 : 0),
          DTCADAST: new Date(),
          IDS001: req.UserId,

        },
        key: 'IdT002'
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
   * @description Atualizar um dado na tabela T002, .
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.atualizarCidade = async function (req, res, next) {

    logger.debug("Inicio atualizar");
    let con = await this.controller.getConnection(null, req.UserId);
    try {

      var id = req.body.IDT002;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'T002',
          colunas: {

            IDG024: req.body.IDG024.id,
            IDT001: req.body.IDT001,
            IDG003: req.body.IDG003.id,
            NRORDCAR: req.body.NRORDCAR,
            STCADAST: req.body.STCADAST,
            SNDIA0: (req.body.SNDIA0 == true ? 1 : 0),
            SNDIA1: (req.body.SNDIA1 == true ? 1 : 0),
            SNDIA2: (req.body.SNDIA2 == true ? 1 : 0),
            SNDIA3: (req.body.SNDIA3 == true ? 1 : 0),
            SNDIA4: (req.body.SNDIA4 == true ? 1 : 0),
            SNDIA5: (req.body.SNDIA5 == true ? 1 : 0),
            SNDIA6: (req.body.SNDIA6 == true ? 1 : 0)
          },
          condicoes: 'IdT002 = :id',
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
   * @description Delete um dado na tabela T002.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.excluirCidade = async function (req, res, next) {

    logger.debug("Inicio excluir");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("ID selecionados");
      var ids = req.body.IDT002;

      let resultT002 = null;

      resultT002 = await con.execute(
        {
          sql: ` Select T002.IDT002, 
                        T002.IDG024, 
                        T002.IDT001, 
                        T002.IDG003
                   From T002 T002
                  Where T002.IDT002  = :id `,
          param: {
            id: ids

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


    resultT002 = await con.execute(
      {
        sql: ` Select T002.IDT002
                  From T002 T002
                Where T002.IDG024  = :IDG024 
                  And T002.IDT001  = :IDT001 
                  And T002.IDG003  = :IDG003 `,
        param: {
          IDG024: resultT002.IDG024,
          IDT001: resultT002.IDT001,
          IDG003: resultT002.IDG003,

        }
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return (result.length);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

    
    var snDeleteT002 = (resultT002 + 1);



    let result = await
      con.update({
        tabela: 'T002',
        colunas: {
          SnDelete: snDeleteT002
        },
        condicoes: ` IdT002 in (`+ids+`)`
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
   * @description Listar um dados da tabela T003.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.listarCliente = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      //DELENTANDO TEMPORARIAMENTE PARA TESTES
      delete req.body['parameter[CALEND][id]'];
      delete req.body['parameter[CALEND][text]'];


      logger.debug("Parametros recebidos:", req.body);

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'T003',true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: ` Select T003.IDT003,
                        T003.IDT001,
                        T003.IDG024,
                        T003.IDG005,
                        T003.NRORDCAR,
                        T003.SNDELETE,
                        T003.STCADAST,
                        T003.DTCADAST,
                        T003.IDS001,
                        G024.NMTRANSP AS G024_NMTRANSP,
                        G005.NMCLIENT AS G005_NMCLIENT,
                        COUNT(T003.IdT003) OVER () as COUNT_LINHA
                   From T003 T003
                   INNER JOIN G024 G024
                     ON T003.IDG024 = G024.IDG024
                   INNER JOIN G005 G005
                     ON T003.IDG005 = G005.IDG005 `+
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
   * @description Listar um dado na tabela T003.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.buscarCliente = async function (req, res, next) {

    logger.debug("Inicio buscar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var id = req.body.IDT003;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select T003.IDT003,
                      T003.IDT001,
                      T003.IDG024,
                      T003.IDG005,
                      T003.NRORDCAR,
                      T003.SNDELETE,
                      T003.STCADAST,
                      T003.DTCADAST,
                      T003.IDS001,
                      G024.NMTRANSP AS G024_NMTRANSP,
                      G005.NMCLIENT AS G005_NMCLIENT,
                      COUNT(T003.IdT003) OVER () as COUNT_LINHA
                 From T003 T003
                 INNER JOIN G024 G024
                   ON T003.IDG024 = G024.IDG024
                 INNER JOIN G005 G005
                   ON T003.IDG005 = G005.IDG005
                Where T003.IdT003   = : id
                  And T003.SnDelete = 0`,
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
   * @description Salvar um dado na tabela T003.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.salvarCliente = async function (req, res, next) {

    logger.debug("Inicio salvar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      let result = await con.insert({
        tabela: 'T003',
        colunas: {

          IDT001: req.body.IDT001,
          IDG024: req.body.IDG024.id,
          IDG005: req.body.IDG005.id,
          NRORDCAR: req.body.NRORDCAR,
          STCADAST: req.body.STCADAST,
          DTCADAST: new Date(),
          IDS001: req.UserId,

        },
        key: 'IdT003'
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
   * @description Atualizar um dado na tabela T003, .
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.atualizarCliente = async function (req, res, next) {

    logger.debug("Inicio atualizar");
    let con = await this.controller.getConnection(null, req.UserId);
    try {

      var id = req.body.IDT003;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'T003',
          colunas: {

            IDT001: req.body.IDT001,
            IDG024: req.body.IDG024.id,
            IDG005: req.body.IDG005.id,
            NRORDCAR: req.body.NRORDCAR,
            STCADAST: req.body.STCADAST,
          },
          condicoes: 'IdT003 = :id',
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
   * @description Delete um dado na tabela T003.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.excluirCliente = async function (req, res, next) {

    logger.debug("Inicio excluir");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("ID selecionados");
      var ids = req.body.IDT003;


      let resultT003 = null;

      resultT003 = await con.execute(
        {
          sql: ` Select T003.IDT003, T003.IDG024, T003.IDT001, T003.IDG005
                    From T003 T003
                  Where T003.IDT003  = :id `,
          param: {
            id: ids

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


      resultT003 = await con.execute(
      {
        sql: ` Select T003.IDT003
                  From T003 T003
                Where T003.IDG024  = :IDG024 
                  And T003.IDT001  = :IDT001 
                  And T003.IDG005  = :IDG005 `,
        param: {
          IDG024: resultT003.IDG024,
          IDT001: resultT003.IDT001,
          IDG005: resultT003.IDG005,

        }
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return (result.length);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

      var snDeleteT003 = (resultT003 + 1);


      let result = await
      con.update({
        tabela: 'T003',
        colunas: {
          SnDelete: snDeleteT003
        },
        condicoes: ` IdT003 in (`+ids+`)`
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
   * @description Salvar um dado na tabela T005.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.salvarCluster = async function (req, res, next) {

    logger.debug("Inicio salvar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      let result = await con.insert({
        tabela: 'T005',
        colunas: {

          DSCLUSTE: req.body.DSCLUSTE

        },
        key: 'IdT005'
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
   * @description Listar um dados da tabela T005.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.listarCluster = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'T005',true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: ` Select T005.IDT005 T005_IDT005,
                        T005.SNDELETE T005_SNDELETE,
                        T005.DSCLUSTE T005_DSCLUSTE,
                        COUNT(T005.IdT005) OVER () as COUNT_LINHA                        
                   From T005`+
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
   * @description Atualizar um dado na tabela T005, .
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.atualizarCluster = async function (req, res, next) {

    logger.debug("Inicio atualizar");
    let con = await this.controller.getConnection(null, req.UserId);
    try {

      var id = req.body.IDT005;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'T005',
          colunas: {

            DSCLUSTE: req.body.DSCLUSTE

          },
          condicoes: 'IdT005 = :id',
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
   * @description Delete um dado na tabela T005.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.excluirCluster = async function (req, res, next) {

    logger.debug("Inicio atualizar");
    let con = await this.controller.getConnection(null, req.UserId);
    try {

      var id = req.body.IDT005;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'T005',
          colunas: {
           
            SNDELETE: 1

          },
          condicoes: 'IdT005 = :id',
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
  api.buscarCluster = async function (req, res, next) {

    logger.debug("Inicio buscar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var id = req.body.IDT005;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select *
                 From T005
                Where T005.IdT005   = : id`,
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


  return api;
};
