/**
 * @description Possui os métodos Listar, Salvar, Atualizar, Buscar e Deletar da tabela G003.
 * @author ?
 * @since ?
 *
 *
 * @description Adicionando conversão automática de nome de tabelas atravéz de dicionário.
 * @author ????
 * @since 06/11/2017
*/

/**
 * @module dao/Cliente
 * @description Função para realizar o CRUD da tabela G005.
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires controller/Cliente
*/
module.exports = function (app) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  api.controller = app.config.ControllerBD;
  var dicionario = app.src.utils.Dicionario;

  api.listar = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    //filtra,ordena,pagina
    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G005', true);
    
    let result = await con.execute(
      {
        sql: `Select
                      G005.IdG005,
                      G005.NmClient,
                      G005.RsClient,
                      G005.TpPessoa,
                      G005.CjClient,
                      G005.IeClient,
                      G005.ImClient,
                      G005.DsEndere,
                      G005.NrEndere,
                      G005.DsComEnd,
                      G005.BiEndere,
                      G005.CpEndere,
                      /*G005.IdG003,
                      G005.NrLatitu,
                      G005.NrLongit,
                      G005.StCadast,
                      to_char(G005.DtCadast, 'dd/mm/yyyy') as DtCadast,
                      G005.IdS001,
                      G005.SnDelete,
                      G005.IdG040,
                      G005.NrDepart,
                      G005.NrSeller,
                      G003.NMCIDADE,
                      S001.NMUSUARI,*/
                      COUNT(G005.IdG005) OVER () as COUNT_LINHA
                From G005 G005
                      Join G003 G003 ON (G003.IdG003 = G005.IdG003)
                      Join G002 G002 ON (G002.IdG002 = G003.IdG002)
                      Join S001 S001 ON (S001.IdS001 = G005.IdS001)`+
                      sqlWhere +
                      sqlOrder +
                      sqlPaginate,
        param: bindValues,
                    debug: true
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result));
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      await con.close(); 
      return result;
  }

  /**
   * @description Insere um dado na tabela G003.
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
    let con = await this.controller.getConnection(null, req.UserId);
    console.log(req.body);
    try {          
      let result = await con.insert({
        tabela: `G005`,
        colunas: {
          NMCLIENT: req.body.NMCLIENT,
          RSCLIENT: req.body.RSCLIENT,
          TPPESSOA: req.body.TPPESSOA,
          CJCLIENT: req.body.CJCLIENT,
          IECLIENT: req.body.IECLIENT,
          IMCLIENT: req.body.IMCLIENT,
          DSENDERE: req.body.DSENDERE,
          NRENDERE: req.body.NRENDERE,
          DSCOMEND: req.body.DSCOMEND,
          BIENDERE: req.body.BIENDERE,
          CPENDERE: req.body.CPENDERE,
          IDG003: req.body.IDG003,
          NRLATITU: req.body.NRLATITU,
          NRLONGIT: req.body.NRLONGIT,
          IDS001: 1,
          SNDELETE: 0,
          STCADAST: 'A',
          DTCADAST: new Date()
        },
        key: `G005.IDG005`
      })
      .then((result1) => {
        return { response: "Cliente criado com sucesso" };
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

    /**
   * @description Busca um dado na tabela G003.
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
    let con = await this.controller.getConnection(null, req.UserId);
    var id = req.body.IDG005;
    try {
      let result = await con.execute(
      {
          sql: `Select G005.IDG005,
                        G005.NMCLIENT,
                        G005.RSCLIENT,
                        G005.TPPESSOA,
                        G005.CJCLIENT,
                        G005.IECLIENT,
                        G005.IMCLIENT,
                        G005.DSENDERE,
                        G005.NRENDERE,
                        G005.DSCOMEND,
                        G005.BIENDERE,
                        G005.CPENDERE,
                        G005.IDG003,
                        G003.NMCIDADE,
                        G005.NRLATITU,
                        G005.NRLONGIT,
                        COUNT(G005.IDG005) OVER() as COUNT_LINHA
                  From G005 G005
                  Join G003 G003
                    On (G003.IDG003 = G005.IDG003)
                  Where G005.SNDELETE= 0
                    And IDG005 = ` + id,
        param: [],
      })
      .then((result) => {
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

  /**
   * @description Atualiza um dado da tabela G003.
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
    let con = await this.controller.getConnection(null, req.UserId);
    var id = req.body.IDG005;
    try {
      let result = await con.update({
        tabela: `G005`,
        colunas: {
          NMCLIENT: req.body.NMCLIENT,
          RSCLIENT: req.body.RSCLIENT,
          TPPESSOA: req.body.TPPESSOA,
          CJCLIENT: req.body.CJCLIENT,
          IECLIENT: req.body.IECLIENT,
          IMCLIENT: req.body.IMCLIENT,
          DSENDERE: req.body.DSENDERE,
          NRENDERE: req.body.NRENDERE,
          DSCOMEND: req.body.DSCOMEND,
          BIENDERE: req.body.BIENDERE,
          CPENDERE: req.body.CPENDERE,
          IDG003: req.body.IDG003,
          NRLATITU: req.body.NRLATITU,
          NRLONGIT: req.body.NRLONGIT
        },
        condicoes: `IDG005 = :id`,
        parametros: {
          id: id
        }
      })
      .then((result1) => {
        console.log(result1);
        return { response: "Usuario Atualizado com sucesso" };
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
  }

  api.marcarTracking = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    let objTracking = req.body.objTracking;
    let operationSuccess = true;
    let contRegRemov = 0;
    let contRegCriad = 0;
    let returnObj = null;
    //console.log("marcarTracking ======= ",req.body);
    
    try {          

  
      for(let i = 0; i < objTracking.length; i++){
    
        let result = await con.update({
          tabela: 'G022',
          colunas: {
            SNRASTRE: 1
          },
            key: `G077.IDG077`
          })
          .then((result2) => {
            contRegCriad++;
            operationSuccess = operationSuccess && true;
            //return { response: "Cliente criado com sucesso" };
          })
          .catch((err) => {
            operationSuccess = operationSuccess && false;
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        });    


      }
      
      
      if(!operationSuccess){
        await con.closeRollback();
        returnObj = { success: false, 
                    response: "Erro ao vincular cliente.", 
                    userCreate: contRegCriad,
                    userRemove: contRegRemov
                  };
      }else{
        await con.close(); 
        returnObj = { success: true, 
                      response: "Vínculo do cliente realizado com sucesso.", 
                      userCreate: contRegCriad,
                      userRemove: contRegRemov
                    };
      } 

      return returnObj;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.desmarcarTracking = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    let objTracking = req.body.objTracking;
    let objIndustriaRastreio = req.body.objIndustriaRastreio;
    let operationSuccess = true;
    let contRegRemov = 0;
    let returnObj = null;
    //console.log("desmarcarTracking ======= ",req.body);
    
    try {    

      for(let ind = 0; ind < objIndustriaRastreio.length; ind++){
        for(let i = 0; i < objTracking.length; i++){
          //remove tudo sobre o usuário em questão
          let resultDelete= await con.execute({ 
            sql: `        
            Delete From G077 G077 Where G077.IDG005 = `+ objTracking[i] + ` and G077.IDG022 =  `+ objIndustriaRastreio[ind], 
            param: []
          })
          .then((result1) => {
            contRegRemov++;
            operationSuccess = operationSuccess && true;
          })
          .catch((err) => {
            operationSuccess = operationSuccess && false;
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });
        }
      }
      
      if(!operationSuccess){
        await con.closeRollback();
        returnObj = { success: false, 
                    response: "Erro ao remover vínculo do cliente.", 
                    userRemove: contRegRemov
                  };
      }else{
        await con.close(); 
        returnObj = { success: true, 
                      response: "Vínculo do cliente removido com sucesso.", 
                      userRemove: contRegRemov
                    };
      } 

      return returnObj;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.vincularContatoCliente = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    let validaContato = 0;
    let objDados = req.body;
    let returnObj = {};
    try {          

      //remove tudo sobre o usuário em questão
      await con.execute({ 
        sql: `        
                SELECT COUNT(*) AS TOTAL FROM G020 G020
                WHERE G020.IDG005 = ${objDados.cliente}
                AND G020.IDG007 = ${objDados.contato.id} `,  
        param: []
      })
      .then((result1) => {
        validaContato = result1[0].TOTAL;
        return validaContato;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      
      
      if(validaContato == 1){
        //await con.closeRollback();
        returnObj = { success: false, 
                    response: "Contato já vinculado para esse cliente."
                  };
      }else{
        let result = await con.insert({
          tabela: `G020`,
          colunas: {
            IDG005: objDados.cliente,
            IDG007: objDados.contato.id,
            TPCONTAT: 'C'
          },
          key: `G020.IDG020`
        })
        .then((result2) => {
          returnObj = { success: true, 
                        response: "Contato vinculado ao cliente com sucesso."
                      };
          //return { response: "Cliente criado com sucesso" };
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });   

      } 
      await con.close(); 
      return returnObj;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.marcarTrackingV2 = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    let objTracking = req.body.objTracking;
    let operationSuccess = true;
    let contRegRemov = 0;
    let contRegCriad = 0;
    let returnObj = null;
    //console.log("marcarTracking ======= ",req.body);
    
    try {          

  
      for(let i = 0; i < objTracking.length; i++){
    
        let result = await con.update({
          tabela: 'G022',
          colunas: {
            SNRASTRE: 1
          },
          condicoes: `IDG005 = ${objTracking[i]} And IDG014 = ${req.body.objOperacaoRastreio} And SNINDUST = 0`
  
        })
        .then((result2) => {
          contRegCriad++;
          operationSuccess = operationSuccess && true;
          //return { response: "Cliente criado com sucesso" };
        })
        .catch((err) => {
          operationSuccess = operationSuccess && false;
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });    


      }
      
      
      if(!operationSuccess){
        await con.closeRollback();
        returnObj = { success: false, 
                    response: "Erro ao vincular cliente.", 
                    userCreate: contRegCriad,
                    userRemove: contRegRemov
                  };
      }else{
        await con.close(); 
        returnObj = { success: true, 
                      response: "Vínculo do cliente realizado com sucesso.", 
                      userCreate: contRegCriad,
                      userRemove: contRegRemov
                    };
      } 

      return returnObj;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.desmarcarTrackingV2 = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    let objTracking = req.body.objTracking;
    let operationSuccess = true;
    let contRegRemov = 0;
    let returnObj = null;
    //console.log("desmarcarTracking ======= ",req.body);
    
    try {    

      for(let i = 0; i < objTracking.length; i++){
        //remove tudo sobre o usuário em questão
        let resultDelete= await con.update({
          tabela: 'G022',
          colunas: {
            SNRASTRE: 0
          },
          condicoes: `IDG005 = ${objTracking[i]} And IDG014 = ${req.body.objOperacaoRastreio} And SNINDUST = 0`
  
        })
        .then((result1) => {
          contRegRemov++;
          operationSuccess = operationSuccess && true;
        })
        .catch((err) => {
          operationSuccess = operationSuccess && false;
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });
      }
      
      
      if(!operationSuccess){
        await con.closeRollback();
        returnObj = { success: false, 
                    response: "Erro ao remover vínculo do cliente.", 
                    userRemove: contRegRemov
                  };
      }else{
        await con.close(); 
        returnObj = { success: true, 
                      response: "Vínculo do cliente removido com sucesso.", 
                      userRemove: contRegRemov
                    };
      } 

      return returnObj;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  

  return api;
};
