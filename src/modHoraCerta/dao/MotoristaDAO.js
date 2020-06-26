/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 12/03/2018
 *
*/

/**
 * @module dao/GrupoTransportadora
 * @description G031
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api        = {};
  var utils      = app.src.utils.FuncoesObjDB;
  var utilsCurl  = app.src.utils.Utils;
  var dtatu      = app.src.utils.DataAtual;
  var acl        = app.src.modIntegrador.controllers.FiltrosController;
  var logger     = app.config.logger;
  api.controller = app.config.ControllerBD;

  /**
   * @description Listar um dados da tabela G031.
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
      console.log("fala",req.body.filterDataVencida)
      let slqWhereComplement= '';
      if(req.body['parameter[filterDataVencida]'] || req.body['parameter[filterDataVencida]' != false || req.body['parameter[filterdataVencida]'] != undefined]){
        slqWhereComplement = `and (
        TRUNC(G031.DTVALEXA) < TRUNC(CURRENT_DATE)  OR
        TRUNC(G031.DTVALCNH) < TRUNC(CURRENT_DATE)  OR 
        TRUNC(G031.DTVALSEG) < TRUNC(CURRENT_DATE)  OR 
        TRUNC(G031.DTVENMOP) < TRUNC(CURRENT_DATE)  OR
        G031.DTVALEXA IS NULL OR
        G031.DTVALCNH IS NULL OR 
        G031.DTVALSEG IS NULL OR 
        G031.DTVENMOP IS NULL)`;
      delete req.body['parameter[filterDataVencida]'];
      }else{
        slqWhereComplement = '';
      }



      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G031',true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: ` Select G031.IDG031,
                        G031.IDG024,
                        G024.NMTRANSP || ' [' || G024.IDG024   || '-' || G024.IDLOGOS || ']' as NmTransp,
                        G031.NMMOTORI,
                        G031.CJMOTORI,
                        G031.DTVALEXA,
                        G031.DSENDERE,
                        G031.BIENDERE,
                        G031.NRENDERE,
                        G031.DSCOMEND,
                        G031.CPENDERE,
                        G031.IDG003,
                        G003.NmCidade,
                        G031.DTVALCNH,
                        G031.DTVALSEG,
                        G031.DTVENMOP,
                        G031.NRCNHMOT,
                        G031.TPCONTRA,
                        G031.RGMOTORI,
                        G031.DTDEMMOT,
                        G031.NRINSMOT,
                        G031.NRTITELE,
                        G031.NRREGSIN,
                        G031.DTADMMOT,
                        G031.NRREGMOT,
                        G031.DTCADAST,
                        G031.STCADAST,
                        G031.NRMATRIC,
                        G031.DTNASCIM,
                        G031.NRTELDDD,
                        G031.NRTELEFO,



                        CASE
                            WHEN(
                              TRUNC(G031.DTVALEXA) < TRUNC(CURRENT_DATE)  OR
                              TRUNC(G031.DTVALCNH) < TRUNC(CURRENT_DATE)  OR 
                              TRUNC(G031.DTVALSEG) < TRUNC(CURRENT_DATE)  OR 
                              TRUNC(G031.DTVENMOP) < TRUNC(CURRENT_DATE)  OR
                              G031.DTVALEXA IS NULL OR
                              G031.DTVALCNH IS NULL OR 
                              G031.DTVALSEG IS NULL OR 
                              G031.DTVENMOP IS NULL) THEN 1 
                            ELSE 0
                          END SNVENCTO,  


                        COUNT(G031.IDG031) OVER () as COUNT_LINHA
                   From G031 G031
              Left Join G003 G003 on (G031.IdG003 = G003.IdG003)
              Left Join G024 G024 on (G024.IdG024 = G031.IdG024)`+
                    sqlWhere +
                    acl1 +
                    slqWhereComplement+
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
   * @description Listar um dado na tabela G031, H016.
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

      var id = req.body.IDG031;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select G031.IDG031,
                      G031.IDG024,
                      G024.NmTransp,
                      G031.NMMOTORI,
                      G031.CJMOTORI,
                      G031.DTVALEXA,
                      G031.DSENDERE,
                      G031.BIENDERE,
                      G031.NRENDERE,
                      G031.DSCOMEND,
                      G031.CPENDERE,
                      G031.IDG003,
                      G003.NmCidade,
                      G031.DTVALCNH,
                      G031.DTVALSEG,
                      G031.DTVENMOP,
                      G031.NRCNHMOT,
                      G031.TPCONTRA,
                      G031.RGMOTORI,
                      G031.DTDEMMOT,
                      G031.NRINSMOT,
                      G031.NRTITELE,
                      G031.NRREGSIN,
                      G031.DTADMMOT,
                      G031.NRREGMOT,
                      G031.DTCADAST,
                      G031.STCADAST,
                      G031.DTNASCIM,
                      G031.NRTELDDD,
                      G031.NRTELEFO,
                      G003.IdG002,
                      G031.NRMATRIC,
                      G002.NMESTADO
                From G031 G031
           Left Join G003 G003 on (G031.IdG003 = G003.IdG003)
           Left Join G002 G002 on (G002.IdG002 = G003.IdG002)
           Left Join G024 G024 on (G024.IdG024 = G031.IdG024)
               Where G031.IdG031   = : id
                 And G031.SnDelete = 0`,
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
   * @description Listar um dado na tabela G031, H016.
   *
   * @async
   * @function api/buscar
   * @author Everton Pessoa
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.buscarPorCPF = async function (req, res, next) {

    logger.debug("Inicio buscar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var cpf       = req.body.CPF;
      var matricula = req.body.NRMATRIC;
      logger.debug("Parametros buscar:", req.body);

      var sql = `Select G031.IDG031,
                  G031.NMMOTORI,
                  G031.CJMOTORI,
                  G031.NRCNHMOT,
                  G031.RGMOTORI,
                  G031.NRMATRIC
                  From G031 G031
                  Where (G031.CJMOTORI = '${cpf}'
                     Or G031.NRMATRIC = '${matricula}')
                  And G031.SnDelete = 0
            `

      let result = await con.execute(
      {
        sql,
        param: {
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
   * @description Salvar um dado na tabela G031.
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

      let GrupoTransportadora = await con.insert({
        tabela: 'G031',
        colunas: {

          IdG024: req.body.IDG024.id,
          NmMotori: req.body.NMMOTORI,
          CjMotori: req.body.CJMOTORI.replace(/[^\d]+/g,''),
          // DtValExa: new Date(req.body.DTVALEXA),
          DsEndere: req.body.DSENDERE,
          BiEndere: req.body.BIENDERE,
          NrEndere: req.body.NRENDERE,
          DsComEnd: req.body.DSCOMEND,
          CpEndere: req.body.CPENDERE,
          IdG003: req.body.IDG003.id,
          // DtValCnh: new Date(req.body.DTVALCNH),
          // DtValSeg: new Date(req.body.DTVALSEG),
          // DtVenMop: new Date(req.body.DTVENMOP),
          NrCnhMot: req.body.NRCNHMOT,
          TpContra: req.body.TPCONTRA.id,
          RgMotori: req.body.RGMOTORI,
          DtDemMot: new Date(req.body.DTDEMMOT),
          NrInsMot: req.body.NRINSMOT,
          NrTitEle: req.body.NRTITELE,
          NrRegSin: req.body.NRREGSIN,
          DtAdmMot: new Date(req.body.DTADMMOT),
          NrRegMot: req.body.NRREGMOT,
          DtCadast: new Date(),
          StCadast: req.body.STCADAST,
          NrMatric: req.body.NRMATRIC,
          NrTelDDD: req.body.NRTELDDD,
          NrTelefo: req.body.NRTELEFO,
          IdS001: 1,
          DtNascim: new Date(req.body.DTNASCIM)

        },
        key: 'IdG031'
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

      // Processo para sincronização entre Logos x Evolog
      let host = 'srvaplsl01.bravo.com.br';
      let path = '/'+ process.env.APP_ENV.toLocaleLowerCase() +'/evologos/public/evolog/logos/motorista';
      let postObj = {
          'idg031' : GrupoTransportadora
      };
      await utilsCurl.curlHttpPost(host, path, postObj);

      await con.close();
      logger.debug("Fim salvar");
      return { response: req.__('hc.sucesso.insert') };

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };

    /**
   * @description Salvar um dado na tabela G031.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.salvarPreCadastro = async function (req, res, next) {

    logger.debug("Inicio salvar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      let motorista = await con.insert({
        tabela: 'G031',
        colunas: {
          IdG024: req.body.IDG024, // id da transportadora essa informacao terá que vir do front
          NmMotori: req.body.NMMOTORI,
          CjMotori: req.body.CJMOTORI,
          RgMotori: req.body.RGMOTORI,
          NrCnhMot: req.body.NRCNHMOT,
          DtCadast: new Date(),
          StCadast: "A",
          IdS001: 1, // id da transportadora essa informacao terá que vir do front
        },
        key: 'IdG031'
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
      return { response: req.__('hc.sucesso.insert'), IDG031:motorista };

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };

  /**
   * @description Atualizar um dado na tabela G031, H016.
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

      var id = req.body.IDG031;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'G031',
          colunas: {

            IdG024: req.body.IDG024.id,
            NmMotori: req.body.NMMOTORI,
            CjMotori: req.body.CJMOTORI.replace(/[^\d]+/g,''),
            DtValExa: dtatu.validaData(req.body.DTVALEXA),
            DsEndere: req.body.DSENDERE,
            BiEndere: req.body.BIENDERE,
            NrEndere: req.body.NRENDERE,
            DsComEnd: req.body.DSCOMEND,
            CpEndere: req.body.CPENDERE,
            IdG003: req.body.IDG003.id,
            DtValCnh: dtatu.validaData(req.body.DTVALCNH),
            DtValSeg: dtatu.validaData(req.body.DTVALSEG),
            DtVenMop: dtatu.validaData(req.body.DTVENMOP),
            NrCnhMot: req.body.NRCNHMOT,
            TpContra: req.body.TPCONTRA.id,
            RgMotori: req.body.RGMOTORI,
            DtDemMot: new Date(req.body.DTDEMMOT),
            NrInsMot: req.body.NRINSMOT,
            NrTitEle: req.body.NRTITELE,
            NrRegSin: req.body.NRREGSIN,
            DtAdmMot: new Date(req.body.DTADMMOT),
            NrRegMot: req.body.NRREGMOT,
            StCadast: req.body.STCADAST,
            NrMatric: req.body.NRMATRIC,
            NrTelDDD: req.body.NRTELDDD,
            NrTelefo: req.body.NRTELEFO,
            DtNascim: new Date(req.body.DTNASCIM)

          },
          condicoes: 'IdG031 = :id',
          parametros: {
            id: id
          }
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

        let host = 'srvaplsl01.bravo.com.br';
        let path = '/'+ process.env.APP_ENV.toLocaleLowerCase() +'/evologos/public/evolog/logos/motorista';
        let postObj = {
            'idg031' : id
        };
        await utilsCurl.curlHttpPost(host, path, postObj);

      await con.close();
      logger.debug("Fim atualizar");
      //return result;
      return { response: req.__('hc.sucesso.update') };

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };

  /**
   * @description Delete um dado na tabela G031.
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
      var ids = req.body.IDG031;

    let result = await
      con.update({
        tabela: 'G031',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG031 in (`+ids+`)`
      })
        .then((result1) => {
        logger.debug("Retorno:", result1);
        return { response: req.__('hc.sucesso.delete') };
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

      // Processo para sincronização entre Logos x Evolog
      let host = 'srvaplsl01.bravo.com.br';
      let path = '/'+ process.env.APP_ENV.toLocaleLowerCase() +'/evologos/public/evolog/logos/motorista';
      let postObj = {
          'idg031' : ids,
          'objdelet' : true
      };
      await utilsCurl.curlHttpPost(host, path, postObj);

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

  api.atualizarMultiplasDatas = async function (req, res, next) {
    logger.debug("Inicio atualizar");
    let con = await this.controller.getConnection(null, req.UserId);
    
    try {

      var id = req.body.IDG031;
      logger.debug("Parametros recebidos:", req.body);
      var sqlComplement;
      sqlComplement = req.body.IDSMOTORI;
      delete req.body['parameter[IDSMOTORI]'];

      let result = await con.execute({
        sql: `        
        Update G031 G031
           Set 
          `  + (req.body.DTVALEXA ? ` G031.DTVALEXA = To_Date('` + dtatu.formataData(req.body.DTVALEXA,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTVALCNH ? ` G031.DTVALCNH = To_Date('` + dtatu.formataData(req.body.DTVALCNH,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTVALSEG ? ` G031.DTVALSEG = To_Date('` + dtatu.formataData(req.body.DTVALSEG,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTVENMOP ? ` G031.DTVENMOP = To_Date('` + dtatu.formataData(req.body.DTVENMOP,'L') + `','DD/MM/YYYY'),` : '') + 
          `G031.SNDELETE = 0
         Where G031.IDG031 in (${sqlComplement})`,
        param: []
      })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

       let host = 'srvaplsl01.bravo.com.br';
       let path = '/'+ process.env.APP_ENV.toLocaleLowerCase() +'/evologos/public/evolog/logos/motorista';
      let postObj = {
          'idg031' : id
      };
      await utilsCurl.curlHttpPost(host, path, postObj);

      await con.close();
      logger.debug("Fim atualizar");
      //return result;
      return { response: req.__('hc.sucesso.update') };

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };


  return api;
};
