/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 13/07/2018
 *
*/

/**
 * @module dao/Seguradora
 * @description T004, .
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
   * @description Listar um dados da tabela T004.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body, 'T004', false);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      if (sqlWhere != null && sqlWhere != "" && sqlWhere != undefined){
        sqlWhere += " and 1=1 ";
      }else{
        sqlWhere = " Where 1=1 "
      }

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
          sql: ` Select T004.IDT004,
                        T004.IDG046,
                        T004.IDG012,
                        T004.STSITUAC,
                        T004.IDS001,
                        T004.DTVALIDA,
                        T004.DTCADAST,
                        T004.TXVALIDA,
                        G046.DSCARGA,
                        G046.Vrcarga,
                        G046.Pscarga,
                        G046.Vrporocu,
                        G046.Idg030,
                        G030.DSTIPVEI,
                        G012.DSHISTOR,
                        G067.DSOCORRE,
                        S001.NMUSUARI,
                        G067.IDG067,

                        COUNT(T004.IdT004) OVER () as COUNT_LINHA
                  From T004 T004
                  Left Join G012 G012 on G012.IDG012 = T004.IDG012
                  Join G067 G067 on G067.IDG067 = T004.IDG067
                  Join G046 G046 on G046.IDG046 = T004.IDG046
                                and G046.SNdelete = 0 
                                and G046.stcarga Not In ('C')
                  Left Join G024 G024 on G024.IDG024 = G046.IDG024
                  Left Join S001 S001 on S001.IDS001 = T004.IDS001
                  Left Join G030 G030 on G030.IDG030 = G046.IDG030
                   
                  `+ sqlWhere + acl1 +` 
                  
                     and g067.idg067 in (1,2,3)
                     and g046.idg046 in 
                    (select g046.idg046 from g046 G046 join G048 G048 on G048.idg046 = G046.IDG046
                      join G049 G049 on G049.idg048 = G048.idg048
                      join G043 G043 on G049.idG043 = G043.idG043 and G043.dtentreg is null
                      
                      union
                      
                      select g046.idg046 from g046 G046 join G048 G048 on G048.idg046 = G046.IDG046
                      join G049 G049 on G049.idg048 = G048.idg048
                      join G051 G051 on G051.idG051 = G049.idG051
                      join G052 G052 on G052.idG051 = G051.idG051
                      join G043 G043 on G052.idG043 = G043.idG043 and G043.dtentreg is null) `+
                    sqlOrder +
                    sqlPaginate,
          param: bindValues,
          fetchInfo:["TXVALIDA"]
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
   * @description Atualizar um dado na tabela T004, .
   *
   * @async
   * @function api/aprovar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.aprovar = async function (req, res, next) {

    logger.debug("Inicio aprovar");
    let con = await this.controller.getConnection(null, req.UserId);
    try {

      var id = req.body.IDT004;

      logger.debug("Parametros recebidos:", req.body);

      //#validando Ocorrencia
      let result = await
        con.update({
          tabela: 'T004',
          colunas: {

            DTVALIDA: new Date(),
            STSITUAC: 'A',
            TXVALIDA: req.body.TXVALIDA,
            IDG012: req.body.IDG012.id,

          },
          condicoes: `IdT004 in (${ id })`,
          parametros: {}
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

        //# verificando se existe mais ocorrencias para a mesma carga
        let resultVerifica = await con.execute(
          {
            sql: `
            
            Select Idt004
            From T004
           Where Idg046 =
                 (Select Idg046 From T004 Where Idt004 = `+ id +`)
             And Idt004 <> `+ id +`
             And Stsituac = 'P' `,
            param: []
          })
          .then((result1) => {
            logger.debug("Retorno:", result1);
            return (result1);
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });

          //# se não existe mais ocorrencias, passar a carga para a proxima etapa
          if(resultVerifica.length == 0){

            let resultCarga = await con.execute(
              {
                sql: `
                Select idg046, stproxim
                From g046
               Where Idg046 =
                     (Select Idg046 From T004 Where Idt004 = `+ id +`)`,
                param: []
              })
              .then((result1) => {
                logger.debug("Retorno:", result1);
                return (result1);
              })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
              });

            if(resultCarga.length > 0){
              var sql = `UPDATE G046
                            SET STCARGA = '${resultCarga[0].STPROXIM}'
                          WHERE IDG046 in (${resultCarga[0].IDG046}) `;
      
              let resultUpdateCarga = await con.execute({ sql, param: [] })
              .then((result) => {
                return { response: "Aprovação feita com sucesso!" };
              })
              .catch((err) => {
                con.closeRollback();
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
              });
              result = resultUpdateCarga;
            }
          }
        await con.close();
        return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };

  /**
   * @description Delete um dado na tabela T004.
   *
   * @async
   * @function api/reprovar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.reprovar = async function (req, res, next) {

    logger.debug("Inicio reprovar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var carga = app.src.modTransportation.dao.CargaDAO;

      var id = req.body.IDT004;

      logger.debug("Parametros recebidos:", req.body);

      //#validando Ocorrencia
      let result = await
        con.update({
          tabela: 'T004',
          colunas: {

            DTVALIDA: new Date(),
            STSITUAC: 'R',
            TXVALIDA: req.body.TXVALIDA,
            IDG012: req.body.IDG012.id,

          },
          condicoes: `IdT004 in (${ id })`,
          parametros: {}
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


          let resultCarga = await con.execute(
            {
              sql: `
              Select idg046, stproxim
              From g046
             Where Idg046 =
                   (Select Idg046 From T004 Where Idt004 = `+ id +`)`,
              param: []
            })
            .then((result1) => {
              logger.debug("Retorno:", result1);
              return (result1[0]);
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });


          await con.close();
            
          req.body.IDG046S = resultCarga.IDG046.toString();

          var objCancelCarga = await carga.cancelarCarga(req, res, next);

          //console.log("aaaaaaa::",objCancelCarga);
          
          return objCancelCarga;


    } catch (err) {

      //await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };

  api.menuIndi = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection(null, req.UserId);

    let IDS001 = req.body.ids001;

    try {
      
      let result = await con.execute(
        {
          sql: `
          SELECT count(DISTINCT t004.idt004) as QTD
          FROM t004 t004 
          WHERE STSITUAC = 'P'
          AND t004.ids001 = ${IDS001}         
          `,
          param: []
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
      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;

    }

  };


  return api;
};
