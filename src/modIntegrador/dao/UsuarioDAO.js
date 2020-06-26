/**
 * @description Possui os métodos Listar, Salvar, Atualizar, Buscar e Deletar da tabela S001.
 * @author Samuel Gnoçalves Miranda
 * @since ?
 *
 *
 * @description Adicionando conversão automática de nome de tabelas atravéz de dicionário.
 * @author João Eduardo Saad
 * @since 06/11/2017
*/

/**
 * @module dao/Usuario
 * @description Função para realizar o CRUD da tabela S001.
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires controller/Usuario
*/
module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  var db = app.config.database;
  const tmz = app.src.utils.DataAtual;
  let hash = app.src.modMonitoria.controllers.HashController;

  api.controller = app.config.ControllerBD;

   /**
   * @description Contém o SQL que requisita os dados da tabela S001.
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

    var params    = req.query;
    var strStart  = (req.query.start  != undefined ? req.query.start : 0);
    var strLength = (req.query.length != undefined ? req.query.length : 10);
    var arrOrder = [];

    if(params.order != null) {
      params.order.forEach(function (order) {
        arrOrder.push(params.columns[order.column]['name']  + ' ' + order['dir']);
      })
      arrOrder = arrOrder.join();
    }else{
      arrOrder = `S001.IDS001` ;
    }

    return await db.execute(
      {
        sql: `SELECT
                    S001.IDS001,
                    S001.NMUSUARI,
                    S001.DSEMALOG,
                    TO_CHAR(S001.DTULTACE, 'DD/MM/YYYY') DTULTACE,
                    S001.QTACEINV,
                    S001.STUSUARI,
                    COUNT(S001.IDS001) OVER () AS COUNT_LINHA
              FROM S001
              WHERE S001.SNDELETE = 0
              ORDER BY ` + arrOrder,
        param: []
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result));
      })
      .catch((err) => {
        throw err;
      });
  };

  /**
   * @description Busca um dado na tabela S001.
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

    return await db.execute(
      {
        sql: `SELECT 
                    S001.IDS001,
                    S001.NMUSUARI,
                    S001.DSEMALOG,
                    S001.DSSENHA,
                    S001.DTULTACE,
                    S001.QTACEINV,
                    S001.STUSUARI
              FROM  S001
              WHERE S001.SNDELETE = 0
                AND S001.IDS001 = ${req.params.id}`,
        param: [],
      })
      .then((result) => {
        result[0].DSSENHA = ( result[0].DSSENHA ) ? utils.decript(result[0].DSSENHA) : "";
        return (result[0]);
      })
      .catch((err) => {
        throw err;
      });
  };

  /**
   * @description Insere um dado na tabela S001.
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

    return await db.insert({
      tabela: `S001`,
      colunas: {
        NMUSUARI: req.body.NMUSUARI,
        DSEMALOG: req.body.DSEMALOG,
        DSSENHA:  utils.cript(req.body.DSSENHA),
        STUSUARI: req.body.STUSUARI,
        QTACEINV: 0,
        DTULTACE: new Date(),
        DTCADAST: new Date()
      },
      key: `S001.IDS001`
    })
      .then((result) => {
        return (result);
      })
      .catch((err) => {
        throw err;
      });
  };

    /**
     * @description Insere um dado na tabela S001.
     *
     * @async
     * @function api/salvarLayout
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
    */
  api.salvarLayout = async function (req, res, next) {

    //console.log('af', req.body);
    return await
      db.update({
        tabela: `S001`,
        colunas: {
          DSTEMA:   req.body.DSTEMA,
          DSINTERN: req.body.DSINTERN,
          DSSIDEBA: req.body.DSSIDEBA
        },
        condicoes: `S001.IDS001 = :id `,
        parametros: {
          id: req.params.id
        }
      })
        .then( (result) => {
          return { response : "Layout Atualizado com sucesso" };
        })
        .catch((err) => {
          throw err;
        });
  };

  /**
   * @description Atualiza um dado da tabela S001.
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
    return await
      db.update({
        tabela: `S001`,
        colunas: {
          NMUSUARI: req.body.NMUSUARI,
          DSEMALOG: req.body.DSEMALOG,
          STUSUARI: req.body.STUSUARI,
          DSSENHA:  utils.cript(req.body.DSSENHA),
          DTULTACE: new Date(),
          QTACEINV: 0
        },
        condicoes: `S001.IDS001 = ${req.params.id}`,
        parametros: {
          id: req.params.id
        }
      })
        .then( (result) => {
          return { response : "Usuario Atualizado com sucesso" };
        })
        .catch((err) => {
          throw err;
        });
  };
  /**
   * @description Exclui um dado na tabela S001.
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
    return await
      db.update({
        tabela: `S001`,
        colunas: {
          SnDelete: 1
        },
        condicoes: `S001.IDS001 = ${req.params.id}`,
        parametros: {
          id: req.params.id
        }
      })
        .then( (result) => {
          return { response : "Usuario excluido com sucesso" };
        })
        .catch((err) => {
          throw err;
        });
  };

  api.login = async function (req, res, next) {
    let db = await this.controller.getConnection();

    try {
      let dssenha = await hash.encryptLogin(req.body.dssenha);
      let strResult = await db.execute(
        {
          sql: ` Select X.*,
                  ( Select Count(Distinct S025.IdS025) As modulo 
                    From  S027 S027 /* Grupos/Usuários */
                          Join S001 S001 On (S001.IdS001 = S027.IdS001) /* Usuários */
                          Join S026 S026 On (S026.IdS026 = S027.IdS026) /* Grupos */
                          Join S025 S025 On (S025.IdS025 = S026.IdS025) /* Módulos */
                    Where S001.DsEmaLog = :dsemalog And
                          S001.DsSenha = :dssenha And 
                          Upper(S025.DsModulo) = Upper(:dsmodulo) And 
                          S001.StUsuari = 'A' And 
                          S026.SnDelete = 0 And 
                          S025.SnDelete = 0 And 
                          S001.SnDelete = 0) as modulo,
                  ( Select S001.IdS001
                    From S001 S001
                    Where S001.DsEmaLog = :dsemalog And
                                S001.DsSenha = :dssenha And
                                S001.StUsuari = 'A' And
                                S001.SnDelete = 0) As IdS001
                  From
                  (Select Count(S001.IdS001) As liberado
                  From S001 S001
                  Where S001.DsEmaLog = :dsemalog And
                        S001.DsSenha = :dssenha And
                        S001.StUsuari = 'A' And
                        S001.SnDelete = 0) X`,
          param: {
            dsemalog: req.body.dsemalog,
            dssenha: dssenha,
            dsmodulo: req.body.dsmodulo
          },
          debug: true
        })
        .then((result) => {
          return (result[0]);
        })
        .catch((err) => {
          throw err;
        });
      
        strResult = Object.assign(strResult, await db.execute(
          {
            sql: ` Select   S001.NmUsuari, S001.DsEmaLog, S001.SnAdmin,
                            S001.DSTEMA,   S001.DSINTERN, S001.DSSIDEBA, S001.STEMAIL, S001.DTULTACE
                    From    S001 S001
                    Where   S001.IdS001 = :ids001`,
    
            param: {
              ids001: strResult.IDS001
            }
          })
          .then((result) => {
            return (result[0]);
          })
          .catch((err) => {
            throw err;
        }));
      
      if(req.body.dsmodulo == "") {
        strResult = Object.assign(strResult, await db.execute(
          {
            sql: `  Select Listagg(DsModulo, ',') Within Group(Order By DsModulo) As DSMODULO
                      From (Select Distinct Upper(S025.DsModulo) As DsModulo
                              From S026 S026
                              Join S025 S025
                                On S025.IDS025 = S026.IDS025 And S025.SNDELETE = 0
                              Join S027 S027
                                On S027.IDS026 = S026.IDS026
                              Join S001 S001
                                On S001.IDS001 = S027.IDS001
                              And S001.IDS001 = :ids001
                            Where S026.TpGrupo in ('M', 'A'))`,
            param: {
              ids001: strResult.IDS001
            }
          })
          .then((result) => {
            return (result[0]);
          })
          .catch((err) => {
            throw err;
        }));
      }



      var strUpdate = await
      db.update({
        tabela: `S001`,
        colunas: {
          DTULTACE: new Date(),
        },
        condicoes: ` S001.IDS001 = :id `,
        parametros: {
          id: strResult.IDS001
        }
      })
        .then( (result) => {
          return { response : "Usuario Atualizado com sucesso" };
        })
        .catch((err) => {
          throw err;
          });
      
      strResult = Object.assign(strResult, {
        DSENVSER:
          {
            APP_ENV: process.env.APP_ENV,
            PORT: process.env.PORT,
            DB_USERNAME: process.env.DB_USERNAME,
            ADDRESS: process.env.ADDRESS,
            TOKEN: process.env.TOKEN,
            TOKEN_BD: process.env.TOKEN_BD,
            TOKEN_EXP_RELOAD: process.env.TOKEN_EXP_RELOAD,
            TOKEN_EXP_TIME: process.env.TOKEN_EXP_TIME,
            TOKEN_PRIVATE_KEY: process.env.TOKEN_PRIVATE_KEY,
            TOKEN_RANDOM: process.env.TOKEN_RANDOM,
            USERDNSDOMAIN: process.env.USERDNSDOMAIN,
            USERDOMAIN: process.env.USERDOMAIN,
            USERNAME: process.env.USERNAME
          }
      });
      
      await db.close();
      return strResult;
      
    } catch(err) {
      await db.closeRollback
      throw err;
    }
  };

  /**
	 * @description Salva o token na banco de dados, quando a opção TOKEN_BD for 1
	 * @author Everton Pessoa
	 * @since 07/02/2018
	 *
	 * @async
	 * @function api/SalvarToken
	*/
  api.SalvarToken = async function (req, res, next) {
    var dataAtual = tmz.tempoAtual('YYYY-MM-DD HH:mm:ss');
    var dataExp = tmz.tempoAdd(dataAtual, 'YYYY-MM-DD HH:mm:ss', 2, 'hours');

    var strSQL = `INSERT INTO S029 (IDTOKEN, DTEXPIRA, DTCRIACA, TPEXPIRA,  IDS001) VALUES
    ('${req.TOKEN}', TO_DATE('${dataExp}', 'YYYY-MM-DD HH24:MI:SS'), TO_DATE('${dataAtual}', 'YYYY-MM-DD HH24:MI:SS')
    , ${process.env.TOKEN_EXP_TIME}
    , ${req.IDS001})`  

    return await db.execute(
      {
        sql: strSQL,
        param: []
      })

      .then((result) => {
        return true;
      })

      .catch((err) => {
        throw err;
      });
  }  

  /**
	 * @description Verifica se tem algum token valid0 no banco de dados, se a opção TOKEN_BD == 1
	 * @author Everton Pessoa
	 * @since 07/02/2018
	 *
	 * @async
	 * @function api/ValidarToken
	*/
  api.ValidarToken = async function (req, res, next) {
    var dataAtual = tmz.tempoAtual('YYYY-MM-DD HH:mm:ss');
    return await db.execute(
      {
        sql: `SELECT 
                S029.IDS029,
                S029.IDTOKEN,
                S029.IDS001,
                S001.SNADMIN
              FROM S029
              Inner Join S001
                on S001.IDS001 = S029.IDS001 
              WHERE IDTOKEN = '${req}' 
                    AND DTEXPIRA > TO_DATE('${dataAtual}', 'YYYY-MM-DD HH24:MI:SS')
              ORDER BY IDS029 DESC`,
        param: []
      })

      .then((result) => {
        return (result);
      })

      .catch((err) => {
        throw err;
      });
  }
  
  /**
   * @description atualiza a data de expiração do token, se a opção TOKEN_EXP_RELOAD ==r 1
   * @author Everton Pessoa
   * @since 07/02/2018
   *
    * @async
   * @function api/ValidarToken
  */
  api.TokenUpdateDataExp = async function (req, res, next) {
    var dataAtual = tmz.tempoAtual('YYYY-MM-DD HH:mm:ss');
    var dataExp = tmz.tempoAdd(dataAtual, 'YYYY-MM-DD HH:mm:ss', 2, 'hours');
    await db.execute(
      {
        sql: `UPDATE S029 SET DTEXPIRA = TO_DATE('${dataExp}', 'YYYY-MM-DD HH24:MI:SS') WHERE IDS029 = ${req[0].IDS029}`,
        param: []
      })

      .then((result) => {
        return (result);
      })

      .catch((err) => {
        throw err;
      });
  }

  api.teste = async function (req, res, next) {
    
    let con = await this.controller.getConnection(); // UserId
    con = await this.controller.getConnection(null, req.UserId); // UserId
    await con.execute(
      {
        sql: `UPDATE S001 SET dtcadast = current_date WHERE IDS001 = `+ req.UserId,
        param: []
      })

      .then((result) => {
        return (result);
      })

      .catch((err) => {
        throw err;
      });
      await con.close();
  }

  return api;
};
