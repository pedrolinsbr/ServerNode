/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de LancamentoCampanha
 * @author Desconhecido
 * @since 29/06/2018
 *
*/

/**
 * @module dao/LancamentoCampanha
 * @description G093.
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
  const xls      = require('xlsx');
  api.controller = app.config.ControllerBD;
  

  /**
   * @description Salvar um dado na tabela G093.
   *
   * @async
   * @function api/removerLancamento
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */

  //# validado para retificação
  //# validado com Brenda
  api.removerLancamento = async function (req, res, next) {

    logger.debug("Inicio removerLancamento");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      var sql      = '';
      sql = `  SELECT G093.IDG090, G093.IDG099, G093.IDG092, G093.STLANCAM FROM G093 G093 WHERE G093.IDG093 IN (${req.body.IDG093}) AND ROWNUM <=1 `;
  
      var returnAponta = await con.execute({ sql, param: [] })
      .then((result) => {
        return result[0];
      })
      .catch((err) => {
        con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

      //# Verificação de retificação
      var SnDeleteAux = 1;
      var StLanCamAux = returnAponta.STLANCAM;
      //var IdG093PaAux = null;

      if(req.body.STLANCAM == true){
        SnDeleteAux = 0;
        StLanCamAux = 3;
        //IdG093PaAux = req.body.IDG093;
      }
      //###########################


      let result = await
      con.update({
        tabela: 'G093',
        colunas: {
          SnDelete: SnDeleteAux,
          StLanCam: StLanCamAux          
        },
        condicoes: ` IdG093 in (`+req.body.IDG093+`) `
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


        sql = `  SELECT G093.IDG093, G093.VRPONTUA, G093.DSOBSERV
                   FROM G093 G093 
                  WHERE G093.IDG099 IN (${returnAponta.IDG099}) 
                    AND G093.IDG090 IN (${returnAponta.IDG090})
                    AND G093.IDG092 IN (${returnAponta.IDG092}) 
                    AND to_char(g093.DTAPONTA, 'MMYYYY') = '${req.body.CDMES.id}'
                    AND (G093.SNDELETE = 0 AND G093.STLANCAM <> 3)
                  `;
  
        var returnAponta = await con.execute({ sql, param: [] })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          con.closeRollback();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

      await con.close();
      logger.debug("Fim removerLancamento");
      return returnAponta;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };

  /**
   * @description Salvar um dado na tabela G093.
   *
   * @async
   * @function api/atualizaObservacao
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */

  //# validado
  api.atualizaObservacao = async function (req, res, next) {

    logger.debug("Inicio atualizaObservacao");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      let result = await
      con.update({
        tabela: 'G093',
        colunas: {
          DSOBSERV: req.body.DSOBSERV
        },
        condicoes: ` IdG093 in (`+req.body.IDG093+`) `
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
      logger.debug("Fim atualizaObservacao");
      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };
  



  /**
   * @description Salvar um dado na tabela G093.
   *
   * @async
   * @function api/buscaObservacao
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */

  //# validado
  api.buscaObservacao = async function (req, res, next) {

    logger.debug("Inicio buscaObservacao");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);
      var sql      = '';

        sql = `  SELECT G093.DSOBSERV
                   FROM G093 G093 
                  WHERE G093.IDG093 IN (${req.body.IDG093}) 
                    AND G093.SNDELETE = 0
                  `;
  
        var returnAponta = await con.execute({ sql, param: [] })
        .then((result) => {
          return result[0];
        })
        .catch((err) => {
          con.closeRollback();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

      await con.close();
      logger.debug("Fim buscaObservacao");
      return returnAponta;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };



  /**
   * @description Delete um dado na tabela G093.
   *
   * @async
   * @function api/excluirAnexoLancamento
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */

  //# validado
  api.excluirAnexoLancamento = async function (req, res, next) {

    logger.debug("Inicio excluirAnexoLancamento");
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
      logger.debug("Fim excluirAnexoLancamento");
      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };

  //# validado 
  api.saveUploadDoc = async function (req, res, next) {

    try {

        var blOK    = true;
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
              objInfo.IDG093   = req.body.IDG093;
      
              var arDoc = objInfo.NMDOCUME.split('.');
              var tpDoc = (arDoc.length == 0) ? null : arDoc[arDoc.length - 1];
      
              if ((!objInfo.TPDOCUME) && (tpDoc)) objInfo.TPDOCUME = tpDoc.toUpperCase();


              var sql = `INSERT INTO A004 
                          (IDA003,NMANEXO,TPEXTENS,TPCONTEN,AQANEXO, IDG093) 
                          VALUES 
                          (null, '${objInfo.NMDOCUME}', '.${tpDoc}', '${objInfo.DSMIMETP}', :text, ${objInfo.IDG093})`

              let result = await con.execute(
                {
                  sql,
                  param: {
                    text: objInfo.CTDOCUME
                  },
                })
                .then((result) => {
                  return result;
                })
                .catch((err) => {
                  err.stack = new Error().stack + `\r\n` + err.stack;
                  throw err;
                });

            }
        } else {
          strErro = 'Nenhum arquivo enviado';
        }


        await con.close();
        var cdStatus = (blOK) ? 200:400;
        res.status(cdStatus).send({ blOK, strErro });

    } catch (err) {
      res.status(500).send({ strErro: err.message });
    }

}



  /**
   * @description Salvar um dado na tabela G093.
   *
   * @async
   * @function api/listarAnexoLancamento
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */

  //# validado
  api.listarAnexoLancamento = async function (req, res, next) {

    logger.debug("Inicio listarAnexoLancamento");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);
      var sql      = '';

        sql = ` SELECT A004.IDA004,
                       A004.IDA003,
                       A004.NMANEXO,
                       A004.TPEXTENS,
                       A004.TPCONTEN,
                       A004.AQANEXO,
                       A004.IDG093,
                       A004.SNDELETE,
                       G093.STLANCAM
                  FROM A004 A004
                  JOIN G093 G093
                    ON G093.idG093 = a004.idG093
                 WHERE A004.sndelete = 0
                   AND G093.IDG093 IN (${req.body.IDG093})
              ORDER BY IDA004 DESC
                  `;
  
        var returnAponta = await con.execute({ sql, param: [] })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          con.closeRollback();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

      await con.close();
      logger.debug("Fim listarAnexoLancamento");
      return returnAponta;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };


  /**
   * @description Salvar um dado na tabela G093.
   *
   * @async
   * @function api/lancamentoKmMotorista
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */

  //# validado para retificação
  api.lancamentoKmMotorista = async function (req, res, next) {

    logger.debug("Inicio lancamentoMotoristakm");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      var sql      = '';
      sql = `  SELECT G092.IDG092, 
                      G092.VRPONTUA 
                 FROM G092 G092 
                WHERE G092.IDG092 IN (${req.body.IDG092}) 
                  AND ROWNUM <= 1 `;

      var returnAponta = await con.execute({ sql, param: [] })
      .then((result) => {
        return result[0];
      })
      .catch((err) => {
        con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });


        sql = `  SELECT G093.IDG093, 
                        G093.VRPONTUA,
                        G093.STLANCAM 
                  FROM G093 G093 
                  WHERE IDG090 = ${ req.body.IDG090} and  
                  IDG092 = ${ req.body.IDG092} and
                  IDG099 = ${ req.body.IDG099} and
                  IDG024 = ${ req.body.IDG024} and 
                  to_char(g093.DTAPONTA, 'MMYYYY') = '${req.body.CDMES.id}' and 
                  nvl(STLANCAM,0) <> 3 and 
                  SNDELETE = 0
                  order by G093.IDG093 desc`;

        var returnIDG093 = await con.execute({ sql, param: [] })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          con.closeRollback();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

        if(returnIDG093.length > 0){
          returnIDG093 = returnIDG093[0];
        }else{
          returnIDG093 = null;
        }


        var dtm, dty = '';
        dtm = req.body.CDMES.id.substr(0,2);
        dty = req.body.CDMES.id.substr(2,req.body.CDMES.id.length);

        let vrPontuacao = (returnAponta.VRPONTUA * req.body.VRKM).toFixed(2);
      
        //# Verificação de retificação
        var SnDeleteAux = 1;
        var StLanCamAux = (returnIDG093 != null ? returnIDG093.STLANCAM : 0);
        var IdG093PaAux = null;
        var SnComputAux = null;

        if(req.body.STLANCAM == true){
          SnDeleteAux = 0;
          StLanCamAux = 3;
          IdG093PaAux = (returnIDG093 != null ? returnIDG093.IDG093 : null);
        }
        //###########################  

        let updateLancamento = await
        con.update({
          tabela: 'G093',
          colunas: {
            SnDelete: SnDeleteAux,
            StLanCam: StLanCamAux,
            IdG093Pa: IdG093PaAux,
          },
          condicoes: ` IDG090 = ${ req.body.IDG090} and  
          IDG092 = ${ req.body.IDG092} and
          IDG099 = ${ req.body.IDG099} and
          IDG024 = ${ req.body.IDG024} and 
          to_char(g093.DTAPONTA, 'MMYYYY') = '${req.body.CDMES.id}' and
          sndelete = 0
          
          `
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
        
        //# Verificação de retificação
        StLanCamAux = 0;
        IdG093PaAux = null;
        SnComputAux = null;

        if(req.body.STLANCAM == true){
          StLanCamAux = 2;
          IdG093PaAux = (returnIDG093 != null ? returnIDG093.IDG093 : null);
          SnComputAux = 'S';
        }
        //########################### 

        let result = await con.insert({
          tabela: 'G093',
          colunas: {

            IDG090: req.body.IDG090,
            IDG092: req.body.IDG092,
            IDG099: req.body.IDG099,
            IDG024: req.body.IDG024,
            VRPONTUA: vrPontuacao,
            DTAPONTA: new Date(dty, (dtm-1), 1,0,0,0,0),
            DTCADAST: new Date(),
            SNDELETE: 0,
            STLANCAM: StLanCamAux,
            IDG093PA: IdG093PaAux,
            SNCOMPUT: SnComputAux

          },
          key: 'IdG093'
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

      result = {VRKM:req.body.VRKM, PTKM:vrPontuacao};

      await con.close();
      logger.debug("Fim lancamentoMotoristakm");
      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };





  /**
   * @description Salvar um dado na tabela G093.
   *
   * @async
   * @function api/lancamentoKmMotorista
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */

  //# validado para retificação
  api.lancamentoMdMotorista = async function (req, res, next) {

    logger.debug("Inicio lancamentoMdMotoristaNova");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      var sql      = '';
        sql = `  SELECT G093.IDG093, 
                        G093.VRPONTUA,
                        G093.STLANCAM 
                        FROM G093 G093 
                        WHERE G093.IDG099 IN (${req.body.IDG099}) 
                          AND G093.IDG090 IN (${req.body.IDG090})
                          AND G093.IDG092 IN (18,16,12)
                          AND to_char(g093.DTAPONTA, 'MMYYYY') = '${req.body.CDMES.id}' and
                  nvl(STLANCAM,0) <> 3 and 
                  SNDELETE = 0 AND 
                  ROWNUM <=1
                  order by G093.IDG093 desc`;

        var returnIDG093 = await con.execute({ sql, param: [] })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          con.closeRollback();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

        if(returnIDG093.length > 0){
          returnIDG093 = returnIDG093[0];
        }else{
          returnIDG093 = null;
        }


        var dtm, dty = '';
        dtm = req.body.CDMES.id.substr(0,2);
        dty = req.body.CDMES.id.substr(2,req.body.CDMES.id.length);

      

        sql = `  SELECT G092.IDG092, G092.VRPONTUA FROM G092 G092 WHERE G092.IDG092 = ${req.body.IDSELECT} AND G092.SNDELETE = 0 AND rownum <= 1`;

        var returnValorPontua = await con.execute({ sql, param: [] })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          con.closeRollback();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

        //# Verificação de retificação
        var SnDeleteAux = 1;
        var StLanCamAux = (returnIDG093 != null ? returnIDG093.IDG093 : 0);
        var IdG093PaAux = null;
        var SnComputAux = null;

        if(req.body.STLANCAM == true){
          SnDeleteAux = 0;
          StLanCamAux = 3;
          IdG093PaAux = (returnIDG093 != null ? returnIDG093.IDG093 : null);
        }
        //###########################  

        let updateLancamento = await
        con.update({
          tabela: 'G093',
          colunas: {
            SnDelete: SnDeleteAux,
            StLanCam: StLanCamAux,
            IdG093Pa: IdG093PaAux,
          },
          condicoes: ` IDG090 = ${ req.body.IDG090} and  
          IDG092 = ${ req.body.IDG092} and
          IDG099 = ${ req.body.IDG099} and
          IDG024 = ${ req.body.IDG024} and 
          to_char(g093.DTAPONTA, 'MMYYYY') = '${req.body.CDMES.id}' and 
          sndelete = 0

          
          `
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
        
        //# Verificação de retificação
        StLanCamAux = 0;
        IdG093PaAux = null;
        SnComputAux = null;

        if(req.body.STLANCAM == true){
          StLanCamAux = 2;
          IdG093PaAux = (returnIDG093 != null ? returnIDG093.IDG093 : null);
          SnComputAux = 'S';
        }
        //########################### 

        let result = await con.insert({
          tabela: 'G093',
          colunas: {

            IDG090: req.body.IDG090,
            IDG092: req.body.IDSELECT,
            IDG099: req.body.IDG099,
            IDG024: req.body.IDG024,
            VRPONTUA: returnValorPontua[0].VRPONTUA,
            DTAPONTA: new Date(dty, (dtm-1), 1,0,0,0,0),
            DTCADAST: new Date(),
            SNDELETE: 0,
            STLANCAM: StLanCamAux,
            IDG093PA: IdG093PaAux,
            SNCOMPUT: SnComputAux

          },
          key: 'IdG093'
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



      sql = `  SELECT G093.IDG093,
                      G093.IDG092
                 FROM G093 G093 
                WHERE G093.IDG099 IN (${req.body.IDG099}) 
                  AND G093.IDG090 IN (${req.body.IDG090})
                  AND G093.IDG092 IN (${req.body.IDSELECT})
                  AND to_char(g093.DTAPONTA, 'MMYYYY') = '${req.body.CDMES.id}'
                  AND nvl(STLANCAM,0) <> 3
                  AND SNDELETE = 0
                  AND ROWNUM <= 1 `;

      var returnAtualizado = await con.execute({ sql, param: [] })
      .then((result) => {
        return result[0];
      })
      .catch((err) => {
        con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

      await con.close();
      logger.debug("Fim lancamentoMdMotoristaNova");
      return returnAtualizado;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };



  /**
   * @description Salvar um dado na tabela G093.
   *
   * @async
   * @function api/lancamentoMdMotorista
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */

  //# validado para retificação
  api.lancamentoMdMotoristaAntiga = async function (req, res, next) {

    logger.debug("Inicio lancamentoMdMotorista");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      var sql      = '';
      sql = `  SELECT G093.IDG093, G093.STLANCAM
                 FROM G093 G093 
                WHERE G093.IDG099 IN (${req.body.IDG099}) 
                  AND G093.IDG090 IN (${req.body.IDG090})
                  AND G093.IDG092 IN (18,16,12)
                  AND to_char(g093.DTAPONTA, 'MMYYYY') = '${req.body.CDMES.id}'
                  AND ROWNUM <=1 `;

      var returnAponta = await con.execute({ sql, param: [] })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });


      sql = `  SELECT G092.IDG092, G092.VRPONTUA FROM G092 G092 WHERE G092.IDG092 = ${req.body.IDSELECT} AND G092.SNDELETE = 0 AND rownum <= 1`;

      var returnValorPontua = await con.execute({ sql, param: [] })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });



      var dtm, dty = '';
      dtm = req.body.CDMES.id.substr(0,2);
      dty = req.body.CDMES.id.substr(2,req.body.CDMES.id.length);


      //# Verificação de retificação
      // var StLanCamAux = returnAponta.STLANCAM;
      // if(req.body.STLANCAM == true){
      //   var StLanCamAux = 2;
      // }
      //###########################

      if(returnAponta.length > 0 && returnAponta[0].IDG093 != null){

        let result = await
        con.update({
          tabela: 'G093',
          colunas: {
            IDG092: req.body.IDSELECT,
            VRPONTUA: returnValorPontua[0].VRPONTUA,
            DTAPONTA: new Date(dty, (dtm-1), 1,0,0,0,0),
            DTCADAST: new Date(),
            //STLANCAM: StLanCamAux
          },
          condicoes: ` IdG093 in (`+returnAponta[0].IDG093+`) `
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

      }else{

        let result = await con.insert({
          tabela: 'G093',
          colunas: {

            IDG090: req.body.IDG090,
            IDG092: req.body.IDSELECT,
            IDG099: req.body.IDG099,
            IDG024: req.body.IDG024,
            VRPONTUA: returnValorPontua[0].VRPONTUA,
            DTAPONTA: new Date(dty, (dtm-1), 1,0,0,0,0),
            DTCADAST: new Date(),
            SNDELETE: 0,
            //STLANCAM: StLanCamAux

          },
          key: 'IdG093'
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


      sql = `  SELECT G093.IDG093,
                      G093.IDG092
                 FROM G093 G093 
                WHERE G093.IDG099 IN (${req.body.IDG099}) 
                  AND G093.IDG090 IN (${req.body.IDG090})
                  AND G093.IDG092 IN (${req.body.IDSELECT})
                  AND to_char(g093.DTAPONTA, 'MMYYYY') = '${req.body.CDMES.id}'
                  AND ROWNUM <= 1 `;

      var returnAtualizado = await con.execute({ sql, param: [] })
      .then((result) => {
        return result[0];
      })
      .catch((err) => {
        con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

      await con.close();
      logger.debug("Fim lancamentoMdMotorista");
      return returnAtualizado;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };
  

  /**
   * @description Salvar um dado na tabela G093.
   *
   * @async
   * @function api/lancamentoMotorista
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */

  //# validado para retificação
  //# validado com Brenda
  api.lancamentoMotorista = async function (req, res, next) {

    logger.debug("Inicio lancamentoMotorista");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);
      var sql      = '';

      //# inserir novo lancamento
      if(req.body.TPOPERAC == 1){

        sql = `  SELECT G092.IDG092, G092.VRPONTUA FROM G092 G092 WHERE G092.IDG092 IN (${req.body.IDG092}) AND ROWNUM <= 1 `;
  
        var returnAponta = await con.execute({ sql, param: [] })
        .then((result) => {
          return result[0];
        })
        .catch((err) => {
          con.closeRollback();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

        var dtm, dty = '';
        dtm = req.body.CDMES.id.substr(0,2);
        dty = req.body.CDMES.id.substr(2,req.body.CDMES.id.length);

        //# Verificação de retificação
        var StLanCamAux = 0;
        var SnComputAux = null;
        if(req.body.STLANCAM == true){
          StLanCamAux = 2;
          SnComputAux = 'S';
        }
        //######################

        let result = await con.insert({
          tabela: 'G093',
          colunas: {

            IDG090: req.body.IDG090,
            IDG092: req.body.IDG092,
            IDG099: req.body.IDG099,
            IDG024: req.body.IDG024,
            VRPONTUA: returnAponta.VRPONTUA,
            DTAPONTA: new Date(dty, (dtm-1), 1,0,0,0,0),
            DTCADAST: new Date(),
            SNDELETE: 0,
            STLANCAM: StLanCamAux,
            SNCOMPUT: SnComputAux

          },
          key: 'IdG093'
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

      //# remover lançamento
      }else if(req.body.TPOPERAC == 0){

        sql = `  SELECT G093.IDG093, G093.STLANCAM
                   FROM G093 G093 
                  WHERE G093.IDG099 IN (${req.body.IDG099}) 
                    AND G093.IDG090 IN (${req.body.IDG090})
                    AND G093.IDG092 IN (${req.body.IDG092})
                    AND to_char(g093.DTAPONTA, 'MMYYYY') = '${req.body.CDMES.id}'
                    and G093.DSOBSERV is null
                    AND (G093.SNDELETE = 0 and nvl(G093.STLANCAM,0) <> 3)
                    and 0 = (SELECT count(*) AS QTD 
                               FROM A004 A004 
                              WHERE A004.IDG093   = G093.IDG093  
                                AND A004.SNDELETE = 0)
                    AND ROWNUM <=1 `;
  
        var returnAponta = await con.execute({ sql, param: [] })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          con.closeRollback();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

        if(returnAponta.length >= 1){

          //# Verificação de retificação
          var SnDeleteAux = 1;
          var StLanCamAux = returnAponta.STLANCAM;

          if(req.body.STLANCAM == true){
            SnDeleteAux = 0;
            StLanCamAux = 3;
          }
        
          let result = await
          con.update({
            tabela: 'G093',
            colunas: {
              SnDelete: SnDeleteAux,
              StLanCam: StLanCamAux
            },
            condicoes: ` IdG093 in (`+returnAponta[0].IDG093+`) `
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

      sql = `  SELECT count(G093.IDG093) as QTD
                 FROM G093 G093 
                WHERE G093.IDG099 IN (${req.body.IDG099}) 
                  AND G093.IDG090 IN (${req.body.IDG090})
                  AND G093.IDG092 IN (${req.body.IDG092})
                  AND to_char(g093.DTAPONTA, 'MMYYYY') = '${req.body.CDMES.id}'
                  AND (G093.SNDELETE = 0 and nvl(G093.STLANCAM,0) <> 3)
                   `;
  
      var returnCount = await con.execute({ sql, param: [] })
      .then((result) => {
        return result[0];
      })
      .catch((err) => {
        con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

      result = returnCount.QTD;

      await con.close();
      logger.debug("Fim lancamentoMotorista");
      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };

  /**
   * @description Salvar um dado na tabela G093.
   *
   * @async
   * @function api/listaLancamento
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.listaLancamento = async function (req, res, next) {

    logger.debug("Inicio listaLancamento");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);
      var sql      = '';

        sql = `  SELECT G093.IDG093, G093.VRPONTUA, G093.DSOBSERV, G093.STLANCAM
                   FROM G093 G093 
                  WHERE G093.IDG099 IN (${req.body.IDG099}) 
                    AND G093.IDG090 IN (${req.body.IDG090})
                    AND G093.IDG092 IN (${req.body.IDG092}) 
                    AND to_char(g093.DTAPONTA, 'MMYYYY') = '${req.body.CDMES.id}'
                    AND G093.SNDELETE = 0
                  `;
  
        var returnAponta = await con.execute({ sql, param: [] })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          con.closeRollback();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

      await con.close();
      logger.debug("Fim listaLancamento");
      return returnAponta;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };


  /**
   * @description Listar um dados da tabela G093.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.listarMotoristas = async function (req, res, next) {

    logger.debug("Inicio listarMotoristas");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);
      let idMotorista = "0";
      if(req.body.IDG031.length >= 1){
        for (let j = 0; j < req.body.IDG031.length; j++) {
          idMotorista = idMotorista + ',' +req.body.IDG031[j].id;
        }
      }else{
        idMotorista = "";
      }

      let result = await con.execute(
        {
          sql: ` 
          SELECT x.*, (VRPT17/VRID17) AS VRKM17 FROM (
            SELECT G031.NMMOTORI || ' [' || G031.idG031   || '-' || G031.nrmatric || ']' As NMMOTORI,
                   G024.NMTRANSP || ' [' || G024.idG024   || '-' || G024.idlogos    || ']'  as NMTRANSP,
                   G090.DSCAMPAN || ' [' || G090.IDG090   || ']' As DSCAMPAN,
                   G099.IDG099,
                   G090.IDG090,
                   G024.IDG024,
                   FN_VALIDA_MOTORISTA_SP('${req.body.CDMES.id.substr(0,2)}','${req.body.CDMES.id.substr(2,4)}',G090.IDG090,G099.IDG099) as SNDIAJOB,
                   '' as ARAPONTA,
                   '' as SNLANCAM,

                    nvl((SELECT x.VRPONTUA FROM (SELECT G093.VRPONTUA
                    FROM G093 G093 
                    WHERE G093.IDG099 IN (g099.IDg099) 
                      AND G093.IDG090 IN (g090.IDG090)
                      AND G093.IDG092 IN (17)
                      AND to_char(g093.DTAPONTA, 'MMYYYY') = '${req.body.CDMES.id}'
                      ORDER BY DTCADAST DESC
                      ) x WHERE ROWNUM <= 1),0) as VRPT17,

                     (SELECT VRPONTUA FROM g092 g092 WHERE g092.idg092 = 17) AS VRID17,

                      nvl((SELECT x.IDG092 FROM (SELECT G093.IDG092
                      FROM G093 G093 
                      WHERE G093.IDG099 IN (g099.IDg099) 
                        AND G093.IDG090 IN (g090.IDG090)
                        AND G093.IDG092 IN (18,16,12)
                        AND to_char(g093.DTAPONTA, 'MMYYYY') = '${req.body.CDMES.id}'
                        ORDER BY DTCADAST DESC
                      ) x WHERE ROWNUM <= 1),0) as VRPT19

              FROM G031 G031
              JOIN g099 g099
                ON g099.idG031 = G031.idG031
              JOIN g091 g091
                ON g091.idg024 = G099.IDG024
              JOIN g090 g090
                ON g090.IDG090 = g091.IDG090
               AND G090.SNDELETE = 0
              Join G024 G024
                On G024.IdG024 = G099.IDG024
             WHERE G031.SNDELETE = 0
               AND G031.STCADAST = 'A' 
               AND G099.DTDEMMOT IS NULL
               ${(idMotorista != "" ?  ' AND g099.idg099 in ('+idMotorista+')'   : ' ')}
               ${(req.body.IDG090 != undefined ? ' AND g090.idg090 = '+ req.body.IDG090.id : ' ')}
              )x order by NMMOTORI`,
          param: []
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          return result;
          //return (utils.construirObjetoRetornoBD(result));
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

      for (let i = 0; i < result.length; i++) {
        
        var returnQTD = await con.execute({ 
          sql:` SELECT count(*) as QTD, IDG092
                  FROM G093 G093
                 WHERE G093.IDG099 IN (${result[i].IDG099})
                   AND G093.SNDELETE = 0 
                   AND to_char(g093.DTAPONTA, 'MMYYYY') = '${req.body.CDMES.id}'
              GROUP BY IDG092`, 
          param: [] 
        })
        .then((result) => {
          let b = {};
          for (let j = 0; j < result.length; j++) {
            b[result[j].IDG092] = result[j].QTD;
          }
          return b;
        })
        .catch((err) => {
          con.closeRollback();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

        result[i].ARAPONTA = returnQTD;

      }


        if( result.length >= 1){
          var returnFechamento = await con.execute({ 
            sql:`SELECT count(G093.IDG093) as QTD
                  FROM G093 G093 
                  WHERE 1 = 1 
                  ${(req.body.IDG090 != undefined ? ' AND G093.idg090 in ('+ req.body.IDG090.id+') ' : ' ')}
                    AND to_char(g093.DTAPONTA, 'MMYYYY') = '${req.body.CDMES.id}'
                    AND G093.SNDELETE = 0 
                    AND nvl(G093.STLANCAM,0) <> 0`, 
            param: [] 
          })
          .then((result) => {
            return result[0].QTD;
          })
          .catch((err) => {
            con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });
          result[0].SNLANCAM = returnFechamento;
        }
      
        

      await con.close();
      logger.debug("Fim listarMotoristas");
      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };


  /**
   * @description Listar um dados da tabela G093.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.buscarApontamentoExistentes = async function (req, res, next) {

    logger.debug("Inicio buscarApontamentoExistentes");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      let result = await con.execute(
        {
          sql: ` 
                 SELECT G092.IDG092,
                        G092.DSAPONTA,
                        G092.TPAPONTA,
                        G092.VRPONTUA,
                        G092.DTCADAST,
                        G092.TPVALAPO
                   FROM G092 G092
                  WHERE G092.SNDELETE = 0
                    AND G092.TPVALAPO = 1
               ORDER BY G092.IDG092 DESC
                   `,
          param: []
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          return result;
          //return (utils.construirObjetoRetornoBD(result));
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

      await con.close();
      logger.debug("Fim buscarApontamentoExistentes");
      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };

  
  /**
   * @description Listar um dados da tabela G093.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.buscarApontamentoExistentesUser = async function (req, res, next) {

    logger.debug("Inicio buscarApontamentoExistentesUser");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);
      let user = req.body.IDS001;
      let result = await con.execute(
        {
          sql: ` 
                 SELECT G092.IDG092
                        /*G092.DSAPONTA,
                        G092.TPAPONTA,
                        G092.VRPONTUA,
                        G092.DTCADAST,
                        G092.TPVALAPO*/
                   FROM G092 G092
                   JOIN G101 G101
                     ON G101.IDG092 = G092.IDG092
                  WHERE G092.SNDELETE = 0
                    AND G101.IDS001 = ${user}
               ORDER BY G092.IDG092 DESC
                   `,
          param: []
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          return result;
          //return (utils.construirObjetoRetornoBD(result));
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

        let arrayApontamentos = [];
        for (let i = 0; i < result.length; i++) {
          arrayApontamentos.push(result[i].IDG092);
        }

      await con.close();
      logger.debug("Fim buscarApontamentoExistentesUser");
      return arrayApontamentos;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };


  /**
   * @description Listar um dados da tabela G093.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.buscarApontamentoExistentesUserAcl = async function (req, res, next) {

    logger.debug("Inicio buscarApontamentoExistentesUserAcl");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);
      let user = req.body.IDS001;
      let result = await con.execute(
        {
          sql: ` 
                 SELECT DISTINCT 
                        G092.IDG092,  
                        LISTAGG(g024.IDG024, ',') WITHIN Group(Order By g024.IDG024) AS IDSG024
                   FROM G092 G092
                   JOIN G101 G101
                     ON G101.IDG092 = G092.IDG092

                   JOIN G024 G024
                     ON G024.IDG024 = G101.IDG024

                  WHERE G092.SNDELETE = 0
                    AND G101.IDS001 = ${user}
               GROUP BY G092.IDG092, g024.IDG024
               ORDER BY G092.IDG092 DESC
                   `,
          param: []
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

        let arrayApontamentos = [];
        for (let i = 0; i < result.length; i++) {
          arrayApontamentos[result[i].IDG092] = result[i].IDSG024;
        }

      await con.close();
      logger.debug("Fim buscarApontamentoExistentesUserAcl");
      return arrayApontamentos;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };

  /**
   * @description Listar um dados da tabela G093.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.buscarApontamentoExistentesUserRetifica = async function (req, res, next) {

    logger.debug("Inicio buscarApontamentoExistentesUserRetifica");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);
      let user = req.body.IDS001;
      let result = await con.execute(
        {
          sql: ` 
                 SELECT G092.IDG092
                   FROM G092 G092
                   JOIN G101 G101
                     ON G101.IDG092 = G092.IDG092
                  WHERE G092.SNDELETE = 0
                    AND G101.IDS001 = ${user}
                    and nvl(STRETIFI,'I') = 'A'
               ORDER BY G092.IDG092 DESC
                   `,
          param: []
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

        let arrayApontamentos = [];
        for (let i = 0; i < result.length; i++) {
          arrayApontamentos.push(result[i].IDG092);
        }

      await con.close();
      logger.debug("Fim buscarApontamentoExistentesUserRetifica");
      return arrayApontamentos;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };


  /**
   * @description Listar um dados da tabela G093.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.listarMotoristasRelatorio = async function (req, res, next) {

    logger.debug("Inicio listarMotoristasRelatorio");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G093', true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);


      let idMotorista = "0";
      if(bindValues.G093_IDG031 != undefined && Object.keys(bindValues.G093_IDG031).length >= 1){
        for (let j = 0; j < Object.keys(bindValues.G093_IDG031).length; j++) {
          idMotorista = idMotorista + ',' +bindValues.G093_IDG031[j].id;
        }
      }else{
        idMotorista = "";
      }

      let result = await con.execute(
        {
          sql: ` 
          SELECT x.*, 
            (VRPT17/VRID17) AS VRKM17,
          
            CASE x.VRPT19 
                WHEN 0 THEN 'Na média' 
                WHEN 18 THEN 'Na média' 
                WHEN 16 THEN 'Média acima' 
                WHEN 12 THEN 'Média abaixo' 
            END VRID19
          
          FROM (
            SELECT G031.NMMOTORI || ' [' || G031.idG031   || '-' || G031.nrmatric || ']' As NMMOTORI,
                   G024.NMTRANSP || ' [' || G024.idG024   || '-' || G024.idlogos    || ']'  as NMTRANSP,
                   G090.DSCAMPAN || ' [' || G090.IDG090   || ']' As DSCAMPAN,
                   G099.IDG099,
                   G090.IDG090,
                   G024.IDG024,

                    nvl((SELECT x.VRPONTUA FROM (SELECT G093.VRPONTUA
                    FROM G093 G093 
                    WHERE G093.IDG099 IN (g099.IDg099) 
                      AND G093.IDG090 IN (g090.IDG090)
                      AND G093.IDG092 IN (17)
                      AND G093.SNDELETE = 0
                      AND NVL(G093.STLANCAM,0) <> 3
                      AND to_char(g093.DTAPONTA, 'MMYYYY') = '${bindValues.G093_CDMES}'
                      ORDER BY DTCADAST DESC
                      ) x WHERE ROWNUM <= 1),0) as VRPT17,

                      (SELECT VRPONTUA FROM g092 g092 WHERE g092.idg092 = 17) AS VRID17,

                      nvl((SELECT count(*)
                      FROM G093 G093 
                      WHERE G093.IDG099 IN (g099.IDg099) 
                      AND G093.IDG090 IN (g090.IDG090)
                      AND G093.IDG092 IN (4)
                      AND G093.SNDELETE = 0
                      AND NVL(G093.STLANCAM,0) <> 3
                      AND to_char(g093.DTAPONTA, 'MMYYYY') = '${bindValues.G093_CDMES}'),0) as VRID4,

                      nvl((SELECT count(*)
                      FROM G093 G093 
                      WHERE G093.IDG099 IN (g099.IDg099) 
                      AND G093.IDG090 IN (g090.IDG090)
                      AND G093.IDG092 IN (5)
                      AND G093.SNDELETE = 0
                      AND NVL(G093.STLANCAM,0) <> 3
                      AND to_char(g093.DTAPONTA, 'MMYYYY') = '${bindValues.G093_CDMES}'),0) as VRID5,

                      nvl((SELECT count(*)
                      FROM G093 G093 
                      WHERE G093.IDG099 IN (g099.IDg099) 
                      AND G093.IDG090 IN (g090.IDG090)
                      AND G093.IDG092 IN (6)
                      AND G093.SNDELETE = 0
                      AND NVL(G093.STLANCAM,0) <> 3
                      AND to_char(g093.DTAPONTA, 'MMYYYY') = '${bindValues.G093_CDMES}'),0) as VRID6,

                      nvl((SELECT count(*)
                      FROM G093 G093 
                      WHERE G093.IDG099 IN (g099.IDg099) 
                      AND G093.IDG090 IN (g090.IDG090)
                      AND G093.IDG092 IN (7)
                      AND G093.SNDELETE = 0
                      AND NVL(G093.STLANCAM,0) <> 3
                      AND to_char(g093.DTAPONTA, 'MMYYYY') = '${bindValues.G093_CDMES}'),0) as VRID7,

                      nvl((SELECT count(*)
                      FROM G093 G093 
                      WHERE G093.IDG099 IN (g099.IDg099) 
                      AND G093.IDG090 IN (g090.IDG090)
                      AND G093.IDG092 IN (9)
                      AND G093.SNDELETE = 0
                      AND NVL(G093.STLANCAM,0) <> 3
                      AND to_char(g093.DTAPONTA, 'MMYYYY') = '${bindValues.G093_CDMES}'),0) as VRID9,

                      nvl((SELECT count(*)
                      FROM G093 G093 
                      WHERE G093.IDG099 IN (g099.IDg099) 
                      AND G093.IDG090 IN (g090.IDG090)
                      AND G093.IDG092 IN (10)
                      AND G093.SNDELETE = 0
                      AND NVL(G093.STLANCAM,0) <> 3
                      AND to_char(g093.DTAPONTA, 'MMYYYY') = '${bindValues.G093_CDMES}'),0) as VRID10,

                      nvl((SELECT count(*)
                      FROM G093 G093 
                      WHERE G093.IDG099 IN (g099.IDg099) 
                      AND G093.IDG090 IN (g090.IDG090)
                      AND G093.IDG092 IN (11)
                      AND G093.SNDELETE = 0
                      AND NVL(G093.STLANCAM,0) <> 3
                      AND to_char(g093.DTAPONTA, 'MMYYYY') = '${bindValues.G093_CDMES}'),0) as VRID11,

                      nvl((SELECT count(*)
                      FROM G093 G093 
                      WHERE G093.IDG099 IN (g099.IDg099) 
                      AND G093.IDG090 IN (g090.IDG090)
                      AND G093.IDG092 IN (13)
                      AND G093.SNDELETE = 0
                      AND NVL(G093.STLANCAM,0) <> 3
                      AND to_char(g093.DTAPONTA, 'MMYYYY') = '${bindValues.G093_CDMES}'),0) as VRID13,


                      nvl((SELECT count(*)
                      FROM G093 G093 
                      WHERE G093.IDG099 IN (g099.IDg099) 
                      AND G093.IDG090 IN (g090.IDG090)
                      AND G093.IDG092 IN (14)
                      AND G093.SNDELETE = 0
                      AND NVL(G093.STLANCAM,0) <> 3
                      AND to_char(g093.DTAPONTA, 'MMYYYY') = '${bindValues.G093_CDMES}'),0) as VRID14,


                      nvl((SELECT count(*)
                      FROM G093 G093 
                      WHERE G093.IDG099 IN (g099.IDg099) 
                      AND G093.IDG090 IN (g090.IDG090)
                      AND G093.IDG092 IN (15)
                      AND G093.SNDELETE = 0
                      AND NVL(G093.STLANCAM,0) <> 3
                      AND to_char(g093.DTAPONTA, 'MMYYYY') = '${bindValues.G093_CDMES}'),0) as VRID15,


                      nvl((SELECT x.IDG092 FROM (SELECT G093.IDG092
                      FROM G093 G093 
                      WHERE G093.IDG099 IN (g099.IDg099) 
                        AND G093.IDG090 IN (g090.IDG090)
                        AND G093.IDG092 IN (18,16,12)
                        AND G093.SNDELETE = 0
                        AND NVL(G093.STLANCAM,0) <> 3
                        AND to_char(g093.DTAPONTA, 'MMYYYY') = '${bindValues.G093_CDMES}'
                        ORDER BY DTCADAST DESC
                      ) x WHERE ROWNUM <= 1),0) as VRPT19

              FROM G031 G031
              JOIN g099 g099
                ON g099.idG031 = G031.idG031
              JOIN g091 g091
                ON g091.idg024 = G099.IDG024
              JOIN g090 g090
                ON g090.IDG090 = g091.IDG090
               AND G090.SNDELETE = 0
              Join G024 G024
                On G024.IdG024 = G099.IDG024
             WHERE G031.SNDELETE = 0
               AND G031.STCADAST = 'A' 
               AND G099.DTDEMMOT IS NULL
               ${(idMotorista != "" ?  ' AND g099.idg099 in ('+idMotorista+')'   : ' ')}
               ${(bindValues.G093_IDG090 != undefined ? ' AND g090.idg090 = '+ bindValues.G093_IDG090 : ' ')}
              )x order by NMMOTORI`,
          param: []
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

      for (let i = 0; i < result.length; i++) {
        
        var returnQTD = await con.execute({ 
          sql:` SELECT count(*) as QTD, IDG092
                  FROM G093 G093
                 WHERE G093.IDG099 IN (${result[i].IDG099})
                   AND G093.SNDELETE = 0
                   AND to_char(g093.DTAPONTA, 'MMYYYY') = '${bindValues.G093_CDMES}'
              GROUP BY IDG092`, 
          param: [] 
        })
        .then((result) => {
          let b = {};
          for (let j = 0; j < result.length; j++) {
            b[result[j].IDG092] = result[j].QTD;
          }
          return b;
        })
        .catch((err) => {
          con.closeRollback();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

        result[i].ARAPONTA = returnQTD;

      }

      await con.close();
      logger.debug("Fim listarMotoristasRelatorio");
      return (utils.construirObjetoRetornoBD(result, req.body));

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };

  /*
    //##########################################################################################
    //##########################################################################################
    //##########################################################################################
  */


  /**
   * @description Listar um dados da tabela G093.
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

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G093',true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: ` Select G093.IDG093,
                        G093.IDG090,
                        G093.IDG092,
                        G099.IDG031,
                        G093.IDG024,
                        G093.VRPONTUA,
                        G093.DTAPONTA,
                        G093.DSOBSERV,
                        G093.SNDELETE,
                        G093.DTCADAST,

                        G090.DSCAMPAN || ' [' || G093.IDG090   || ']' As DSCAMPAN,

                        G092.DSAPONTA || ' [' || G093.IDG092   || ']' As TPAPONTA,

                        G031.NMMOTORI || ' [' || G031.idg031   || '-' || G031.nrmatric   || ']' As NMMOTORI,

                        g024.NMTRANSP || ' [' || g024.idg024   || '-' || g024.idlogos    || ']'  as NMTRANSP,

                        COUNT(G093.IdG093) OVER () as COUNT_LINHA
                   From G093 G093 
                   Join G024 G024
                     On G024.IdG024 = G093.IDG024
                   Join G092 G092
                     On G092.IdG092 = G093.IDG092
                   Join G090 G090
                     On G090.IdG090 = G093.IDG090
                   Join G099 G099
                     On G099.IdG099 = G093.IDG099
                   Join G031 G031
                     On G031.Idg031 = G099.IDG031
                   `+
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
   * @description Listar um dado na tabela G093.
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

      var id = req.body.IDG093;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: `   Select G093.IDG093,
                        G093.IDG090,
                        G093.IDG092,
                        G099.IDG031,
                        G093.VRPONTUA,
                        G093.DTAPONTA,
                        G093.DSOBSERV,
                        G093.SNDELETE,
                        G093.DTCADAST,

                        G090.DSCAMPAN || ' [' || G093.IDG090   || ']' As DSCAMPAN,

                        G092.DSAPONTA || ' [' || G093.IDG092   || ']' As TPAPONTA,

                        G031.NMMOTORI || ' [' || G031.idg031   || '-' || G031.nrmatric   || ']' As NMMOTORI,

                        g024.NMTRANSP || ' [' || g024.idg024   || '-' || g024.idlogos    || ']'  as NMTRANSP,

                        '' as idg091,


                        COUNT(G093.IdG093) OVER () as COUNT_LINHA
                  From G093 G093 
                  
                  
                  Join G024 G024
                    On G024.IdG024 = G093.IDG024
                  Join G092 G092
                    On G092.IdG092 = G093.IDG092
                  Join G090 G090
                    On G090.IdG090 = G093.IDG090
                  Join G099 G099
                    On G099.IdG099 = G093.IDG0993

                  Join G031 G031
                    On G031.Idg031 = G099.IDG031

                 Where G093.IdG093   = : id
                   And G093.SnDelete = 0 `,
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


      let result2 = await con.execute(
        {
          sql: ` Select G091.IDG090,
                        G091.IDG024 as id,
                        G024.NMTRANSP as text
                   From G091 G091
                   Join G024 G024 on G024.idg024 = G091.idg024
                  Where G091.IdG090   = : id`,
          param: {
            id: result.IDG090
          }
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          //return (result[0]);
          return utils.array_change_key_case(result);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

      result.IDG091 = result2;


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
   * @description Listar um dado na tabela G093.
   *
   * @async
   * @function api/buscarTransportadoras
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.buscarTransportadoras = async function (req, res, next) {

    logger.debug("Inicio buscarTransportadoras");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var id = req.body.IDG090;
      logger.debug("Parametros buscarTransportadoras:", req.body);

      let result = await con.execute(
        {
          sql: ` Select G091.IDG090,
                        G091.IDG024 as id,
                        G024.NMTRANSP as text
                   From G091 G091
                   Join G024 G024 on G024.idg024 = G091.idg024
                  Where G091.IdG090   = : id`,
          param: {
            id: id
          }
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          //return (result[0]);
          return utils.array_change_key_case(result);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

      await con.close();
      logger.debug("Fim buscarTransportadoras");
      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    }

  };

  /**
   * @description Salvar um dado na tabela G093.
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

      let result = await con.insert({
        tabela: 'G093',
        colunas: {

          IDG090: req.body.IDG090.id,
          IDG092: req.body.IDG092.id,
          IDG031: req.body.IDG031.id,
          IDG024: req.body.IDG024.id,
          VRPONTUA: req.body.VRPONTUA,
          DTAPONTA: new Date( req.body.DTAPONTA.date.year, (req.body.DTAPONTA.date.month-1),  req.body.DTAPONTA.date.day,0,0,0,0),
          DSOBSERV: req.body.DSOBSERV,
          DTCADAST: new Date(),
          SNDELETE: 0,

        },
        key: 'IdG093'
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
   * @description Atualizar um dado na tabela G093, .
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

      var id = req.body.IDG093;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'G093',
          colunas: {

            IDG090: req.body.IDG090.id,
            IDG092: req.body.IDG092.id,
            IDG031: req.body.IDG031.id,
            IDG024: req.body.IDG024.id,
            VRPONTUA: req.body.VRPONTUA,
            DTAPONTA: new Date( req.body.DTAPONTA.date.year, (req.body.DTAPONTA.date.month-1),  req.body.DTAPONTA.date.day,0,0,0,0),
            DSOBSERV: req.body.DSOBSERV,
            
          },
          condicoes: 'IdG093 = :id',
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
   * @description Delete um dado na tabela G093.
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
      var ids = req.body.IDG093;

    let result = await
      con.update({
        tabela: 'G093',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdG093 in (`+ids+`)`
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
   * @description Importar excel, gravar informações na G093
   *
   * @async
   * @function /api/tp/lancamentoCampanha/importarExcel
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.importarExcel = async function (req, res, next) {

    try {
      console.log('inicioooo');
      var file = process.cwd() + '\\importar\\media0.xls';

      let workbook   = xls.readFile(`${file}`);             
      let worksheet  = workbook.Sheets[workbook.SheetNames[0]];
      var arJSON     = xls.utils.sheet_to_json(worksheet);
      console.log(arJSON);
      // var arFilial   = arJSON.filter(function(item) {
      //   console.log('processando....');
      //   return item.Transportadora == '37-BRAVO IBIPORA';
      // });
      var arFilial = arJSON;
      console.log(arFilial);
      let con        = null;
      let idg092     = null;
      let idg090     = null;
      let idg099     = null;
      let idg024     = null;
      let namdeCol   = null;
      console.log('começouuuuuuu');
      for (let x = 0; x < arFilial.length; x++) {
        con = await this.controller.getConnection();
        
        idg090 = arFilial[x]['Campanha'].split('-')[0];
        idg099 = arFilial[x]['Motorista'].split('-')[0];
        idg024 = arFilial[x]['Transportadora'].split('-')[0];

        for (let z = 3; z < Object.keys(arFilial[x]).length; z++) {

          idg092   = Object.keys(arFilial[x])[z].split('-')[0];
          namdeCol = Object.keys(arFilial[x])[z];

          if(idg092 == 12 && arFilial[x][namdeCol] != 0){

            switch(arFilial[x][namdeCol]){
              case 'Acima de 3% esperado':
                  idg092 = 16;
              break;
              case 'Abaixo do esperado':
                  idg092 = 12;
              break;
              case 'Atingiu a média esperada':
                  idg092 = 19;
              break;
              default:
                  idg092 = 0;
              break;
            }

            if(idg092 != 0){

              let vrpontua = await con.execute(
                {
                  sql: ` Select vrpontua from g092 where idg092 = :id `,
                  param: {
                    id: idg092
                  }
                })
                .then((result) => {
                  return (result[0].VRPONTUA);
                })
                .catch((err) => {
                  err.stack = new Error().stack + `\r\n` + err.stack;
                  throw err;
                });
  
                result = await con.insert({
                  tabela: 'G093',
                  colunas: {
                    IDG090: idg090,
                    IDG092: idg092,
                    IDG099: idg099,
                    IDG024: idg024,
                    VRPONTUA: vrpontua,
                    DTAPONTA: new Date(2019,06,01,0,0,0,0),
                    DTCADAST: new Date(),
                    SNDELETE: 0,
          
                  },
                  key: 'IdG093'
                })
                .then((result1) => {
                  logger.debug("Retorno:", result1);
                  return true;
                })
                .catch((err) => {
                  err.stack = new Error().stack + `\r\n` + err.stack;
                  logger.error("Erro:", err);
                  throw err;
                });
  
                await con.close();
            }

          }else if(idg092 == 17 && arFilial[x][namdeCol] != 0){

            let vrpontua = await con.execute(
              {
                sql: ` Select (:valor * vrpontua) as vrpontua from g092 where idg092 = :id `,
                param: {
                  valor: arFilial[x][namdeCol],
                  id: idg092
                }
              })
              .then((result) => {
                return (result[0].VRPONTUA);
              })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
              });

              result = await con.insert({
                tabela: 'G093',
                colunas: {
                  IDG090: idg090,
                  IDG092: idg092,
                  IDG099: idg099,
                  IDG024: idg024,
                  VRPONTUA: vrpontua,
                  DTAPONTA: new Date(2019,06,01,0,0,0,0),
                  DTCADAST: new Date(),
                  SNDELETE: 0,
        
                },
                key: 'IdG093'
              })
              .then((result1) => {
                logger.debug("Retorno:", result1);
                return true;
              })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                logger.error("Erro:", err);
                throw err;
              });

              await con.close();

          }else if(arFilial[x][namdeCol] != 0){

            for (let index = 0; index < arFilial[x][namdeCol]; index++) {

              let vrpontua = await con.execute(
              {
                sql: ` Select vrpontua from g092 where idg092 = :id `,
                param: {
                  id: idg092
                }
              })
              .then((result) => {
                return (result[0].VRPONTUA);
              })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
              });

              result = await con.insert({
                tabela: 'G093',
                colunas: {
                  IDG090: idg090,
                  IDG092: idg092,
                  IDG099: idg099,
                  IDG024: idg024,
                  VRPONTUA: vrpontua,
                  DTAPONTA: new Date(2019,06,01,0,0,0,0),
                  DTCADAST: new Date(),
                  SNDELETE: 0,
        
                },
                key: 'IdG093'
              })
              .then((result1) => {
                logger.debug("Retorno:", result1);
                return true;
              })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                logger.error("Erro:", err);
                throw err;
              });

                await con.close();
              
            }
          
          }

        }

      }
      logger.debug("Fimm");
    } catch (err) {
      // Rollback
      console.log(err.message);
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

    /**
   * @description Verifica se o usuário tem permissão para realizar o fechamento da campanha
   *
   * @async
   * @function /api/tp/lancamentoCampanha/usuariosFechamento
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.usuariosFechamento = async function (req, res, next) {

    let con = await this.controller.getConnection(null, req.UserId);
    let sql = null;
    let whereIdg090 = '';
    let mesAno = req.body.CDMES != undefined ? req.body.CDMES.id : " to_char(TO_DATE(current_date,'DD/MM/YY') - 30, 'MMYYYY') ";

    try {

      //Mostra o informações do fechamento, no qual não foi fechado totalmente
      if(!req.body.STLANCAM){
        whereIdg090 = req.body.IDG090 != undefined ? ` AND (G103.idg090 = ${req.body.IDG090.id} OR G103.IDG090 IS NULL )` : '';
        sql = `SELECT S001.NMUSUARI,
                      S001.IDS001,
                      G024.NMTRANSP,
                      G024.IDG024,
                      G097.DSVALUE,
                      G097.IDG097,
                      G090.IDG090,
                      case
                        when G097.IDG097 in (47, 48) then
                        (select to_char(g104.dtfecham,'DD/MM/YYYY HH24:MI:SS')
                            from g104
                          where g104.ids001 = s001.ids001
                            and G104.MESANOVI = ${mesAno}
                            and G104.IDG097 = G097.IDG097)
                        else
                        (select to_char(g104.dtfecham,'DD/MM/YYYY HH24:MI:SS')
                            from g104
                          where g104.ids001 = s001.ids001
                            and G104.MESANOVI = ${mesAno}
                            and G104.IDG097 = G097.IDG097
                            and G104.IDG090 = G090.IDG090
                            and G104.IDG024 = G024.IDG024)
                      end AS Dtfecham,
                      case
                        when G097.IDG097 in (47, 48) then
                        (select count(g104.idg104)
                            from g104
                          where G104.MESANOVI = ${mesAno}
                            and G104.IDG097 = G097.IDG097)
                        else
                        (select count(g104.idg104)
                            from g104
                          where G104.MESANOVI = ${mesAno}
                            and G104.IDG097 = G097.IDG097
                            and G104.IDG090 = G090.IDG090
                            and G104.IDG024 = G024.IDG024)
                      end AS STFECHAM
                FROM G103
                INNER JOIN S001
                  ON S001.IDS001 = G103.IDS001
                INNER JOIN G097
                  ON G097.IDG097 = G103.IDG097
                  AND G097.IDGRUPO = 8
                LEFT JOIN G090
                  ON G090.IDG090 = G103.IDG090
                LEFT JOIN G024
                  ON G024.IDG024 = G103.IDG024
                WHERE G103.SNDELETE = 0 
                      ${whereIdg090}
                ORDER BY G097.IDG097, G024.IDG024,S001.NMUSUARI`;
      }else{
        whereIdg090 = req.body.IDG090 != undefined ? ` AND (G104.idg090 = ${req.body.IDG090.id} OR G104.IDG090 IS NULL )` : '';
        //Mostra o informações do fechamento, no qual foi fechado totalmente - Tabela G104 - Histórico do fechamento
        sql = `SELECT S001.NMUSUARI, 
                      S001.IDS001, 
                      G024.NMTRANSP, 
                      G024.IDG024, 
                      G097.DSVALUE,
                      G097.IDG097, 
                      G090.IDG090,
                      to_char(g104.dtfecham,'DD/MM/YYYY HH24:MI:SS') AS Dtfecham,
                      1  AS STFECHAM
                FROM G104
              INNER JOIN S001
                  ON S001.IDS001 = G104.IDS001
              INNER JOIN G097
                  ON G097.IDG097 = G104.IDG097
                AND G097.IDGRUPO = 8
              LEFT JOIN G090 
                ON G090.IDG090 = G104.IDG090
              LEFT JOIN G024 
                ON G024.IDG024 = G104.IDG024
              WHERE G104.MESANOVI = ${mesAno} 
                   ${whereIdg090}
              ORDER BY G097.IDG097, G024.IDG024, S001.NMUSUARI`;
      }

      let result = await con.execute(
        {
          sql: sql,
          param: []
        })
        .then((result) => {
          return result;
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
      logger.error("Erro:", err);
      throw err;
    }

  };

  return api;
};
