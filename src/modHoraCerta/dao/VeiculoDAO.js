/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 12/03/2018
 *
*/

/**
 * @module dao/Veiculo
 * @description G032
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
   * @description Listar um dados da tabela G032.
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

      let slqWhereComplement= '';
      
      if(req.body['parameter[filterDataVencida]'] || req.body['parameter[filterDataVencida]'] != false || req.body['parameter[filterdataVencida]'] != undefined){
        slqWhereComplement = `and (
        TRUNC(G032.DTLICAMB) < TRUNC(CURRENT_DATE)  OR 
        TRUNC(G032.DTCERREG) < TRUNC(CURRENT_DATE)  OR 
        TRUNC(G032.DTTESTAC) < TRUNC(CURRENT_DATE)  OR 
        TRUNC(G032.DTTESFUM) < TRUNC(CURRENT_DATE)  OR 
        TRUNC(G032.DTVALANT) < TRUNC(CURRENT_DATE)  OR 
        TRUNC(G032.DTAETBIT) < TRUNC(CURRENT_DATE)  OR 
        TRUNC(G032.DTLIESSP) < TRUNC(CURRENT_DATE)  OR 
        TRUNC(G032.DTAETGO ) < TRUNC(CURRENT_DATE) OR 
        TRUNC(G032.DTAETMG ) < TRUNC(CURRENT_DATE) OR 
        TRUNC(G032.DTAETSP ) < TRUNC(CURRENT_DATE) OR 
        TRUNC(G032.DTVALEX2) < TRUNC(CURRENT_DATE)  OR 
        TRUNC(G032.DTVALE12) < TRUNC(CURRENT_DATE)  OR 
        TRUNC(G032.DTVALCAP) < TRUNC(CURRENT_DATE)  OR 
        TRUNC(G032.DTVALPIL) < TRUNC(CURRENT_DATE)  OR 
        TRUNC(G032.DTMASFAC) < TRUNC(CURRENT_DATE)  OR 
        TRUNC(G032.DTMASPO ) < TRUNC(CURRENT_DATE) OR 
        TRUNC(G032.DTEX12BI) < TRUNC(CURRENT_DATE)  OR 
        TRUNC(G032.DTCHELIS + 30) < TRUNC(CURRENT_DATE) OR 
        TRUNC(G032.DTVALCRL) < TRUNC(CURRENT_DATE) )`;
      delete req.body['parameter[filterDataVencida]'];
      }else{
        slqWhereComplement = '';
      }

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G032',true);

      if(bindValues.G032_NRPLAVEI != null){
        bindValues.G032_NRPLAVEI = bindValues.G032_NRPLAVEI.replace("-", "");
      }

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: `  Select  G032.IDG032,
                          G032.DSVEICUL,
                          G032.IDG003,
                          G032.NRPLAVEI,
                          G032.IDG030,
                          G032.DSRENAVA,
                          G032.NRCHASSI,
                          G032.IDG024,
                          G032.DTLICAMB,
                          G032.DTCERREG,
                          G032.DTTESTAC,
                          G032.DTTESFUM,
                          G032.DTVALANT,
                          G032.DTAETBIT,
                          G032.DTLIESSP,
                          G032.DTAETGO,
                          G032.DTAETMG,
                          G032.DTAETSP,
                          G032.DTVALEX2,
                          G032.DTVALE12,
                          G032.DTVALCAP,
                          G032.DTVALPIL,
                          G032.DTMASFAC,
                          G032.DTMASPO,
                          G032.DTEX12BI,
                          G032.DTCADAST,
                          G032.STCADAST,
                          G032.DTCHELIS,
                          G032.DTVALCRL,
                          G032.IDS001,
                          G032.NRFROTA,
                          G032.SNDELETE,

                          G032.TPPROPRI,
                          G032.IDG005PR,

                          G032.DSMARCA,
                          G032.DSMODELO,
                          G032.NRANO,
                          G032.DSCOR,
                          G032.QTTARA,
                          G032.QTLOTCAO,



                          G005.NMCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT || ']'  AS NMCLIEPR,

                          G030.DSTIPVEI || ' [' || G030.IDG030 || ']' as DSTIPVEI,
                          G030.PCMIN4PL,
                          G030.PCPESMIN,
                          G003.NMCIDADE || ' [' || G002.CDESTADO || ']' as NMCIDEST,
                          G024.NMTRANSP || ' [' || G024.idg024   || '-' || G024.idlogos || ']'  as NMTRANSP,
                          CASE 
                            WHEN(
                              TRUNC(G032.DTLICAMB) < TRUNC(CURRENT_DATE)  OR 
                              TRUNC(G032.DTCERREG) < TRUNC(CURRENT_DATE)  OR 
                              TRUNC(G032.DTTESTAC) < TRUNC(CURRENT_DATE)  OR 
                              TRUNC(G032.DTTESFUM) < TRUNC(CURRENT_DATE)  OR 
                              TRUNC(G032.DTVALANT) < TRUNC(CURRENT_DATE)  OR 
                              TRUNC(G032.DTAETBIT) < TRUNC(CURRENT_DATE)  OR 
                              TRUNC(G032.DTLIESSP) < TRUNC(CURRENT_DATE)  OR 
                              TRUNC(G032.DTAETGO ) < TRUNC(CURRENT_DATE) OR 
                              TRUNC(G032.DTAETMG ) < TRUNC(CURRENT_DATE) OR 
                              TRUNC(G032.DTAETSP ) < TRUNC(CURRENT_DATE) OR 
                              TRUNC(G032.DTVALEX2) < TRUNC(CURRENT_DATE)  OR 
                              TRUNC(G032.DTVALE12) < TRUNC(CURRENT_DATE)  OR 
                              TRUNC(G032.DTVALCAP) < TRUNC(CURRENT_DATE)  OR 
                              TRUNC(G032.DTVALPIL) < TRUNC(CURRENT_DATE)  OR 
                              TRUNC(G032.DTMASFAC) < TRUNC(CURRENT_DATE)  OR 
                              TRUNC(G032.DTMASPO ) < TRUNC(CURRENT_DATE) OR 
                              TRUNC(G032.DTEX12BI) < TRUNC(CURRENT_DATE)  OR
                              TRUNC(G032.DTCHELIS + 30) < TRUNC(CURRENT_DATE) OR
                              TRUNC(G032.DTVALCRL) < TRUNC(CURRENT_DATE)  OR                              
                              G032.DTLICAMB IS NULL  OR 
                              G032.DTCERREG IS NULL  OR 
                              G032.DTTESTAC IS NULL  OR 
                              G032.DTTESFUM IS NULL  OR 
                              G032.DTVALANT IS NULL  OR 
                              G032.DTAETBIT IS NULL  OR 
                              G032.DTLIESSP IS NULL  OR 
                              G032.DTAETGO  IS NULL OR 
                              G032.DTAETMG  IS NULL OR 
                              G032.DTAETSP  IS NULL OR 
                              G032.DTVALEX2 IS NULL  OR 
                              G032.DTVALE12 IS NULL  OR 
                              G032.DTVALCAP IS NULL  OR 
                              G032.DTVALPIL IS NULL  OR 
                              G032.DTMASFAC IS NULL  OR 
                              G032.DTMASPO  IS NULL OR 
                              G032.DTEX12BI IS NULL  OR
                              G032.DTCHELIS IS NULL OR 
                              G032.DTVALCRL IS NULL) THEN 1
                              ELSE 0
                              END DTVENCIDO,
                              G032.TPCOMPOS,
                              CASE WHEN G032.TPCOMPOS = 'C' THEN 'Cavalo'
                                   WHEN G032.TPCOMPOS = 'R' THEN 'Carreta'
                                   ELSE '' END AS NMCOMPOS,
                          COUNT(G032.idG032) OVER () as COUNT_LINHA
                     From G032 G032 
                     Join G030 G030 on (G032.IdG030 = G030.IdG030)
                     Left Join G003 G003 on (G032.IDG003 = G003.IDG003)
                     Left Join G002 G002 on (G003.IDG002 = G002.IDG002)
                     Join G024 G024 on (G032.IDG024 = G024.IDG024)
                     left join G005 G005 on (G032.IDG005PR = G005.IDG005)
                     `+
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
   * @description Listar um dado na tabela G032, H016.
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

      var id     = req.params.id;
      var result = {};

      logger.debug("Parametros buscar:", req.body);

      result.idg032cr =  await con.execute(
        {
          sql: `
           select DISTINCT 
                  G032.Dsveicul || ' ['|| nvl(G032.NrFrota, 'n.i') || ' - ' || G032.NrPlavei || '] ' as Text, 
                  g026.IdG032CR AS ID
           from g026 g026 
           inner join g032 g032 on g032.idg032 = g026.IdG032CR
           where G026.IdG032CV = : id
             And G026.sndelete = 0`,
          param: {
            id: id
          }
        })
        .then((result) => {
          return utils.array_change_key_case(result);
        })
        .catch((err) => {  
          throw err;
        });

        result.idg005pr =  await con.execute(
          {
            sql: `
             select DISTINCT 
             G005.NMCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT || ']' || ' - ' || G003.NMCIDADE || '-' || G002.CDESTADO  as Text, 

             G005.IdG005 AS ID
             from G032 G032 
             left join G005 G005 on (G032.IDG005PR = G005.IDG005)
             Left Join G003 G003 on (G032.IDG003 = G003.IDG003)
             Left Join G002 G002 on (G003.IDG002 = G002.IDG002)
             Where G032.IDG032   = : id
             And G032.SnDelete = 0`,
            param: {
              id: id
            }
          })
          .then((result) => {
            return utils.array_change_key_case(result);
          })
          .catch((err) => {  
            throw err;
          });

      result.obj = await con.execute(
      {
        sql: ` Select G032.IDG032,
                      G032.DSVEICUL,
                      G032.IDG003,
                      G032.NRPLAVEI,
                      G032.IDG030,
                      G032.DSRENAVA,
                      G032.NRCHASSI,
                      G032.IDG024,
                      G032.DTLICAMB,
                      G032.DTCERREG,
                      G032.DTTESTAC,
                      G032.DTTESFUM,
                      G032.DTVALANT,
                      G032.DTAETBIT,
                      G032.DTLIESSP,
                      G032.DTAETGO,
                      G032.DTAETMG,
                      G032.DTAETSP,
                      G032.DTVALEX2,
                      G032.DTVALE12,
                      G032.DTVALCAP,
                      G032.DTVALPIL,
                      G032.DTMASFAC,
                      G032.DTMASPO,
                      G032.DTEX12BI,
                      G032.DTCHELIS,
                      G032.DTVALCRL,
                      G032.DTCADAST,
                      G032.STCADAST,
                      G032.IDS001,
                      G032.SNDELETE,
                      G024.NMTRANSP,
                      G003.NMCIDADE,
                      G030.DSTIPVEI,
                      G003.IDG002,
                      G032.NRFROTA,
                      G030.PCMIN4PL,
                      G030.PCPESMIN,
                      G002.NMESTADO,
                      G032.TPCOMPOS,
                      G032.TPPROPRI,
                      G032.IDG005PR,

                      G032.DSMARCA,
                      G032.DSMODELO,
                      G032.NRANO,
                      G032.DSCOR,
                      G032.QTTARA,
                      G032.QTLOTCAO,
                      G032.IDS001GF,
                      S001GF.NMUSUARI,


                      G005.NMCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT || ']' || ' - ' || G003.NMCIDADE || '-' || G002.CDESTADO  AS NMCLIEPR, 


                      CASE WHEN G032.TPCOMPOS = 'C' THEN 'Cavalo'
                        WHEN G032.TPCOMPOS = 'R' THEN 'Carreta'
                        ELSE '' END AS NMCOMPOS
                From  G032 G032
                Left Join G024 G024 on (G032.IdG024 = G024.IdG024)
                Left Join G003 G003 on (G032.IdG003 = G003.IdG003)
                Left Join G030 G030 on (G032.IdG030 = G030.IdG030)
                left join G002 G002 ON (G003.IDG002 = G002.IDG002)
                left join G005 G005 on (G032.IDG005PR = G005.IDG005)
                left join S001 S001GF on (G032.IDS001GF = S001GF.IDS001)
                
                Where G032.IDG032   = : id
                  And G032.SnDelete = 0`,
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
   * @description Listar um dado na tabela G032, H016.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.buscarFrota = async function (req, res, next) {

    logger.debug("Inicio buscar frota");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var placa = req.body.NRPLAVEI;
      logger.debug("Parametros buscar frota:", req.body);

      let result = await con.execute(
      {
        sql: ` Select G032.NRPLAVEI,
                      G032.NRFROTA,
                      G032.IDG030,
                      G030.DSTIPVEI
                From  G032 G032
                Left Join  G030 G030 ON G030.IDG030 = G032.IDG030
                Where Upper(G032.NRPLAVEI)   = Upper(:placa)
                And G032.SnDelete = 0`,
        param: {
          placa: placa
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
   * @description Buscar a placa do veículo pelo número da frota.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */

  api.buscarPlaca = async function (req, res, next) {

    logger.debug('Início "Buscar Placa"');
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var frota = req.body.NRFROTA;
      logger.debug('Parâmetros "Buscar Placa": ', req.body);

      let result = await con.execute({
        sql: `
        SELECT
          G032.NRPLAVEI
        FROM
          G032
        WHERE
          G032.NRFROTA  = '${frota}'
        AND
          G032.SNDELETE = 0
        `,
        param: []
      })
        .then(result => {
          logger.debug('Retorno: ', result);
          return result[0];
        })
        .catch(err => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

      await con.close();
      logger.debug('Fim "Buscar Placa"');
      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro: ", err);
      throw err;
    }
  }


  /**
   * @description Salvar um dado na tabela G032.
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
    let con   = await this.controller.getConnection(null, req.UserId);
    var teste = dtatu.retornaData(req.body.DTLICAMB);
    let idd;

    try {

      logger.debug("Parametros recebidos:", req.body);
      var tpcompos = req.body.TPCOMPOS == null || req.body.TPCOMPOS.id == undefined ? null : req.body.TPCOMPOS.id;
      var idg032cr = req.body.IDG032CR != null ? req.body.IDG032CR.length : 0;
      var idg005pr = req.body.IDG005PR != undefined && req.body.IDG005PR != null ? req.body.IDG005PR.id : null;
      let Veiculo = await con.insert({
        tabela: 'G032',
        colunas: {

          DSVEICUL: req.body.DSVEICUL,
          IDG003:   req.body.IDG003,
          NRPLAVEI: req.body.NRPLAVEI.replace('-',''),
          IDG030:   req.body.IDG030,
          DSRENAVA: req.body.DSRENAVA,
          NRCHASSI: req.body.NRCHASSI,
          IDG024:   req.body.IDG024,
          // DTLICAMB: dtatu.validaData(req.body.DTLICAMB),
          // DTCERREG: dtatu.retornaData(req.body.DTCERREG),
          // DTTESTAC: dtatu.retornaData(req.body.DTTESTAC),
          // DTTESFUM: dtatu.retornaData(req.body.DTTESFUM),
          // DTVALANT: dtatu.retornaData(req.body.DTVALANT),
          // DTAETBIT: dtatu.retornaData(req.body.DTAETBIT),
          // DTLIESSP: dtatu.retornaData(req.body.DTLIESSP),
          // DTAETGO:  dtatu.retornaData(req.body.DTAETGO),
          // DTAETMG:  dtatu.retornaData(req.body.DTAETMG),
          // DTAETSP:  dtatu.retornaData(req.body.DTAETSP),
          // DTVALEX2: dtatu.retornaData(req.body.DTVALEX2),
          // DTVALE12: dtatu.retornaData(req.body.DTVALE12),
          // DTVALCAP: dtatu.retornaData(req.body.DTVALCAP),
          // DTVALPIL: dtatu.retornaData(req.body.DTVALPIL),
          // DTMASFAC: dtatu.retornaData(req.body.DTMASFAC),
          // DTMASPO:  dtatu.retornaData(req.body.DTMASPO),
          // DTEX12BI: dtatu.retornaData(req.body.DTEX12BI),
          NRFROTA:  req.body.NRFROTA,
          DTCADAST: new Date(),
          STCADAST: req.body.STCADAST,
          IDS001:   req.body.IDS001,
          TPCOMPOS: tpcompos,
          IDG005PR: idg005pr,
          TPPROPRI: req.body.TPPROPRI.id,
          DSMARCA: req.body.DSMARCA,
          DSMODELO: req.body.DSMODELO,
          NRANO: req.body.NRANO,
          DSCOR: req.body.DSCOR,
          QTTARA: req.body.QTTARA,
          QTLOTCAO: req.body.QTLOTCAO,
          IDS001GF: req.body.IDS001GF

        },
        key: 'IdG032'
      })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        idd = result1;
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

      if(idg032cr > 0 && Veiculo != null){

        for(var i = 0;req.body.IDG032CR.length>i;i++){
          let vinculoCR = await con.insert({
            tabela: 'G026',
            colunas: {
    
              IDG032CV: Veiculo,
              IDG032CR: req.body.IDG032CR[i].id,
              DTCADAST: new Date()

            },
            key: 'IdG026'
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

      }

      // Processo para sincronização entre Logos x Evolog
      let host = 'srvaplsl01.bravo.com.br';
      let path = '/'+ process.env.APP_ENV.toLocaleLowerCase() +'/evologos/public/evolog/logos/veiculo';
      let postObj = {
          'idg032' : Veiculo
      };

      await utilsCurl.curlHttpPost(host, path, postObj);

      await con.close();
      logger.debug("Fim salvar");
      return { 
                response: req.__('hc.sucesso.insert') ,
                idg032: idd
             };

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };

  /**
   * @description Atualizar um dado na tabela G032, H016.
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

      if(req.body.PCMIN4PL != null || req.body.PCMIN4PL !=''){
        let result2 = await
          con.update({
            tabela: 'G030',
            colunas: {
  
              PCMIN4PL: req.body.PCMIN4PL,      
  
            },
            condicoes: 'IdG030 = :id',
            parametros: {
              id: id = req.body.IDG030,
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
  
      }

      var id       = req.body.IDG032;
      var tpcompos = req.body.TPCOMPOS == null || req.body.TPCOMPOS.id == undefined ? null : req.body.TPCOMPOS.id;
      var idg032cr = req.body.IDG032CR != null ? req.body.IDG032CR.length : 0;
      var idg005pr = req.body.IDG005PR != undefined && req.body.IDG005PR != null ? req.body.IDG005PR.id : null;
      
      logger.debug("Parametros recebidos:", req.body);
      logger.debug("DTLICAMB: ", dtatu.validaData(req.body.DTLICAMB));

      let result = await
        con.update({
          tabela: 'G032',
          colunas: {

            DsVeicul: req.body.DSVEICUL,
            IdG003:   req.body.IDG003,
            NrPlaVei: req.body.NRPLAVEI.replace('-',''),
            IdG030:   req.body.IDG030,
            DsRenava: req.body.DSRENAVA,
            NrChassi: req.body.NRCHASSI,
            IdG024:   req.body.IDG024,
            NrFrota:  req.body.NRFROTA,
            IDG005PR: idg005pr,
            TPPROPRI: req.body.TPPROPRI.id,

            DSMARCA: req.body.DSMARCA,
            DSMODELO: req.body.DSMODELO,
            NRANO: req.body.NRANO,
            DSCOR: req.body.DSCOR,
            QTTARA: req.body.QTTARA,
            QTLOTCAO: req.body.QTLOTCAO,
            IDS001GF: req.body.IDS001GF,
            
            DtLiCamb: dtatu.validaData(req.body.DTLICAMB),
            DtCerReg: dtatu.validaData(req.body.DTCERREG),
            DtTesTac: dtatu.validaData(req.body.DTTESTAC),
            DtTesFum: dtatu.validaData(req.body.DTTESFUM),
            DtValAnt: dtatu.validaData(req.body.DTVALANT),
            DtAetBit: dtatu.validaData(req.body.DTAETBIT),
            DtLieSSP: dtatu.validaData(req.body.DTLIESSP),
            DtAetGo:  dtatu.validaData(req.body.DTAETGO),
            DtAetMG:  dtatu.validaData(req.body.DTAETMG),
            DtAetSP:  dtatu.validaData(req.body.DTAETSP),
            DtValEx2: dtatu.validaData(req.body.DTVALEX2),
            DtValE12: dtatu.validaData(req.body.DTVALE12),
            DtValCap: dtatu.validaData(req.body.DTVALCAP),
            DtValPil: dtatu.validaData(req.body.DTVALPIL),
            DtMasFac: dtatu.validaData(req.body.DTMASFAC),
            DtMasPo:  dtatu.validaData(req.body.DTMASPO),
            DtEx12Bi: dtatu.validaData(req.body.DTEX12BI),
            DtCheLis: dtatu.validaData(req.body.DTCHELIS),
            DtValCrl: dtatu.validaData(req.body.DTVALCRL),            
            StCadast: req.body.STCADAST,
            TpCompos: tpcompos

          },
          condicoes: 'IdG032 = :id',
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

      if(idg032cr > 0 || tpcompos == 'R'){

        let verificarCR = await con.execute({
          sql: `
                SELECT
                  COUNT(G026.IDG026) AS QTD
                FROM
                  G026
                WHERE
                  G026.IDG032CV = '${req.body.IDG032}' AND G026.SNDELETE = 0`,
          param: []
        }).then(result => {
            logger.debug('Retorno: ', result);
            return result[0];
        }).catch(err => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        });

        if(verificarCR.QTD > 0){

          let resultDelete = await con.execute(
            {
              sql: ` DELETE FROM G026 WHERE IDG032CV = ${req.body.IDG032} `,
              param: []
            })
            .then((result) => {
              logger.debug("Retorno:", result);
              return true;
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              logger.error("Erro:", err);
              throw err;
            });
        }

        for(var i = 0; idg032cr>i; i++){
          let vinculoCR = await con.insert({
            tabela: 'G026',
            colunas: {
    
              IDG032CV: req.body.IDG032,
              IDG032CR: req.body.IDG032CR[i].id,
              DTCADAST: new Date()
  
            },
            key: 'IdG026'
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
        
      }

      let host = 'srvaplsl01.bravo.com.br';
      let path = '/'+ process.env.APP_ENV.toLocaleLowerCase() +'/evologos/public/evolog/logos/veiculo';
      let postObj = {
          'idg032' : id
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
   * @description Delete um dado na tabela G032.
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
      var ids = req.params.id;

      let result = await
        con.update({
          tabela: 'G032',
          colunas: {
            SnDelete: 1
        },
        condicoes: ` IdG032 in (`+ids+`)`
      }).then((result1) => {
        logger.debug("Retorno:", result1);
        return { response: req.__('hc.sucesso.delete') };
      }).catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

      let resultDelete = await con.execute(
      {
        sql: ` UPDATE G026 SET SNDELETE = 1 WHERE IDG032CV in (`+ids+`) `,
        param: []
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return true;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

      // Processo para sincronização entre Logos x Evolog
      let host = 'srvaplsl01.bravo.com.br';
      let path = '/'+ process.env.APP_ENV.toLocaleLowerCase() +'/evologos/public/evolog/logos/veiculo';
      let postObj = {
          'idg032' : ids,
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

/**
   * @description Atualizar multiplas datas na tabela G032, H016.
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.atualizarMultiplasDatas = async function (req, res, next) {
    logger.debug("Inicio atualizar");
    let con = await this.controller.getConnection(null, req.UserId);
    
    try {

      var id = req.body.IDG032;
      logger.debug("Parametros recebidos:", req.body);
      var sqlComplement;
      sqlComplement = req.body.IDSVEICUL;
      delete req.body['parameter[IDSVEICUL]'];

      let result = await con.execute({
        sql: `        
        Update G032 G032
           Set 
          `  + (req.body.DTLICAMB ? ` G032.DTLICAMB = To_Date('` + dtatu.formataData(req.body.DTLICAMB,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTCERREG ? ` G032.DTCERREG = To_Date('` + dtatu.formataData(req.body.DTCERREG,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTTESTAC ? ` G032.DTTESTAC = To_Date('` + dtatu.formataData(req.body.DTTESTAC,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTTESFUM ? ` G032.DTTESFUM = To_Date('` + dtatu.formataData(req.body.DTTESFUM,'L') + `','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTVALANT ? ` G032.DTVALANT = To_Date('` + dtatu.formataData(req.body.DTVALANT,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTAETBIT ? ` G032.DTAETBIT = To_Date('` + dtatu.formataData(req.body.DTAETBIT,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTLIESSP ? ` G032.DTLIESSP = To_Date('` + dtatu.formataData(req.body.DTLIESSP,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTAETGO ?  ` G032.DTAETGO  = To_Date('` + dtatu.formataData(req.body.DTAETGO,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTAETMG ?  ` G032.DTAETMG  = To_Date('` + dtatu.formataData(req.body.DTAETMG,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTAETSP ?  ` G032.DTAETSP  = To_Date('` + dtatu.formataData(req.body.DTAETSP,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTVALEX2 ? ` G032.DTVALEX2 = To_Date('` + dtatu.formataData(req.body.DTVALEX2,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTVALE12 ? ` G032.DTVALE12 = To_Date('` + dtatu.formataData(req.body.DTVALE12,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTVALCAP ? ` G032.DTVALCAP = To_Date('` + dtatu.formataData(req.body.DTVALCAP,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTVALPIL ? ` G032.DTVALPIL = To_Date('` + dtatu.formataData(req.body.DTVALPIL,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTMASFAC ? ` G032.DTMASFAC = To_Date('` + dtatu.formataData(req.body.DTMASFAC,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTMASPO ? ` G032.DTMASPO   = To_Date('` + dtatu.formataData(req.body.DTMASPO,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTEX12BI ? ` G032.DTEX12BI = To_Date('` + dtatu.formataData(req.body.DTEX12BI,'L') +`','DD/MM/YYYY'),` : '') +
          `` + (req.body.DTCHELIS ? ` G032.DTCHELIS = To_Date('` + dtatu.formataData(req.body.DTCHELIS,'L') +`','DD/MM/YYYY'),` : '') + 
          `` + (req.body.DTVALCRL ? ` G032.DTVALCRL = To_Date('` + dtatu.formataData(req.body.DTVALCRL,'L') +`','DD/MM/YYYY'),` : '') + 
          `G032.SNDELETE = 0
         Where G032.IDG032 in (${sqlComplement})`,
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
      let path = '/'+ process.env.APP_ENV.toLocaleLowerCase() +'/evologos/public/evolog/logos/veiculo';
      let postObj = {
          'idg032' : id
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

  api.saveUploadImg = async function(req, res, next) {
    logger.info("Inicio salvar arquivo upload (saveUploadImg)");

    let valid = true;

    if ((Array.isArray(req.files)) && (req.files.length > 0)) {
      for (objFile of req.files) {
          var arDoc = objFile.originalname.split('.'); 
          var tpDoc = (arDoc.length == 0) ? null : arDoc[arDoc.length - 1]; 

          if(tpDoc != "jpg" && tpDoc != "jpeg" && tpDoc != "png"){
            valid = false;
          }
      }
    }else{
      valid = false;
    }

    if(valid){
      try {

        var blOK = true;
        var strErro = 'Não foi possível inserir';
        var con = await this.controller.getConnection(null, req.UserId);
        var objInfo = {};
        var arFiles = req.files;
        if ((Array.isArray(arFiles)) && (arFiles.length > 0)) {
            for (objFile of arFiles) {
                objInfo.DTDOCUME = new Date();
                objInfo.CTDOCUME = objFile.buffer;
                objInfo.TMDOCUME = objFile.size;
                objInfo.NMDOCUME = objFile.originalname;
                objInfo.DSMIMETP = objFile.mimetype;
                objInfo.IDG032 = req.body.IDG032;
                var arDoc = objInfo.NMDOCUME.split('.'); 
                var tpDoc = (arDoc.length == 0) ? null : arDoc[arDoc.length - 1]; 

                
                if ((!objInfo.TPDOCUME) && (tpDoc)) objInfo.TPDOCUME = tpDoc.toUpperCase();

                var sql = `INSERT INTO A004 
                      (IDA003,NMANEXO,TPEXTENS,TPCONTEN,AQANEXO, IDG032) 
                      VALUES 
                      (null, '${objInfo.NMDOCUME}', '.${tpDoc}', '${objInfo.DSMIMETP}', :text, ${objInfo.IDG032})`

                let result = await con.execute({
                        sql,
                        param: {
                            text: objInfo.CTDOCUME
                        },
                    })
                    .then((result) => {
                        logger.info("Result", result)
                        return result;
                    })
                    .catch((err) => {
                        logger.error("Erro: ", err)
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });
                
                
            }
        } else {
            strErro = 'Nenhum arquivo enviado';
        }
        await con.close();
        var cdStatus = (blOK) ? 200 : 400;
        res.status(cdStatus).send({ blOK, strErro });
      } catch (err) {
          logger.error("Erro ", err);
          res.status(500).send({ strErro: err.message });
      }

    }else{
      res.status(500).send({ strErro: "Extensão não suportada!" });
    }

    
}

api.getImagemVeiculo = async function (req, res, next) {
  let con = await this.controller.getConnection(null, req.UserId);

  let IDG032 = req.body.IDG032;

  let result = await con.execute({
      sql: `
      select * from a004
       WHERE A004.IDG032 = :id
       AND SNDELETE = 0
          
          `,
      param: {id:IDG032} ,
      fetchInfo: [{
        column : "AQANEXO", 
        type: "BLOB"
      }]
    })
    .then((result) => {
      
      return result;
    })
    .catch((err) => {
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    });

  await con.close();

  let buff = null;
  let base64data = null;

  for (let i = 0; i < result.length; i++) {
    buff = new Buffer(result[i].AQANEXO, 'base64');
    base64data = buff.toString('base64');
    result[i].AQANEXO64 = base64data;
    delete result[i].AQANEXO;
  }
  return result;
}

api.deleteImagemVeiculo = async function (req, res, next) {

  logger.debug("Inicio excluir");
  let con = await this.controller.getConnection(null, req.UserId);

  try {

    logger.debug("ID selecionados");
    var ids = req.body.IDA004;

    let result = await
      con.update({
        tabela: 'A004',
        colunas: {
          SnDelete: 1
      },
      condicoes: ` IdA004 in (`+ids+`)`
    }).then((result1) => {
      logger.debug("Retorno:", result1);
      return { response: req.__('hc.sucesso.delete') };
    }).catch((err) => {
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
}



  return api;
};
