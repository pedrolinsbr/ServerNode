module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
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
    let con = await this.controller.getConnection(null, req.UserId);
    //filtra,ordena,pagina
    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'S001', true);

    try {
      let result = await con.execute({
        sql: `Select S001.IDS001,
                     S001.NMUSUARI,
                     S001.DSEMALOG,
                     S001.SNCAR4PL,
                     S001.SNBRAVO,
                     NVL(TO_CHAR(S001.DTULTACE, 'DD/MM/YYYY'), 'Nenhuma informação') DTULTACE,
                     S001.QTACEINV,
                     CASE
                      WHEN S001.STUSUARI = 'A' THEN
                        'Ativo'
                      ELSE 
                        'Inativo'
                     END AS STUSUARI,
                     CASE
                      WHEN S001.SNADMIN = 1 THEN
                        'Administrador'
                      ELSE 
                        'Comum'
                     END AS SNADMIN,
                     COUNT(S001.IDS001) OVER () as COUNT_LINHA
                From S001 S001 `+
          sqlWhere +
          sqlOrder +
          sqlPaginate,
        param: bindValues
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
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  /**
 * @description Busca um dado na tabela IDS001.
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
    var id = req.body.IDS001;
    try {
      let result = await con.execute(
        {
          sql: `Select S001.IDS001,
                       S001.NMUSUARI,
                       S001.DSEMALOG,
                       S001.DSSENHA,
                       S001.DTULTACE,
                       S001.QTACEINV,
                       S001.SNCAR4PL,
                       S001.SNBRAVO,
                       S001.SNADMIN,
                       S001.STUSUARI,
                       S001.IDG097PR,
                       G097.DSVALUE
                  From S001 
                  Left join G097
                    on S001.IDG097PR = G097.IDG097 
                 Where S001.SNDELETE= 0
                   And S001.IDS001 = ` + id,
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

  api.listarGruposUsuarios = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'S001', true);
    try {
      let result = await con.execute(
        {
          sql: `
          Select 
              DISTINCT
              S001.Ids001, 
              S026.Ids026, 
              S001.NmUsuari AS S001_NMUSUARI, 
              S026.DsGrupo AS S026_DSGRUPO, 
              S025.DSMODULO AS S025_DSMODULO,
              S026.TPGRUPO AS S026_TPGRUPO,
              COUNT(S026.IDS026) OVER () as COUNT_LINHA
          From S027 S027
          Join S026 S026
            On (S026.Ids026 = S027.Ids026)
          JOIN S025 S025	
            ON (S025.IDS025 = S026.IDS025)
          Join S001 S001
            On (S001.Ids001 = S027.Ids001)
            `+
            sqlWhere +
            sqlOrder +
            sqlPaginate,
          param: bindValues
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
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.validaEmail = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    let email = req.body.DSEMALOG;
    try {
      let result = await con.execute(
        {
          sql: `Select Count(1) As QTD
                  From S001 S001
                 Where S001.SNDELETE= 0 
                   And Upper(S001.DSEMALOG)  Like Upper(:DSEMALOG)`,
          param: {
            DSEMALOG: email
          },
        })
        .then((result) => {
          return result[0];
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
    let con = await this.controller.getConnection(null, req.UserId);

    try {
      let result = await con.insert({
        tabela: `S001`,
        colunas: {
          NMUSUARI: req.body.NMUSUARI,
          DSEMALOG: req.body.DSEMALOG,
          STUSUARI: req.body.STUSUARI,
          SNCAR4PL: req.body.SNCAR4PL,
          SNBRAVO: req.body.SNBRAVO,
          SNADMIN: req.body.SNADMIN,
          DTCADAST: new Date(),
          SNDELETE: 0,
          STEMAIL: 0,
          IDG097PR: req.body.IDG097  //Cargos
        },
        key: `S001.IDS001`
      })
        .then((result1) => {
          return result1;
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
   * @description Exclui um dado na tabela IDS001.
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
    let con = await this.controller.getConnection(null, req.UserId);

    var id = req.body.IDS001;
    try {
      let result = await con.update({
        tabela: `S001 S001`,
        colunas: {
          SnDelete: 1
        },
        condicoes: `S001.IDS001 = :id`,
        parametros: {
          id: id
        }
      })
        .then((result1) => {
          return { response: "Usuário excluído com sucesso." };
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

  api.atualizarEnviado = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);

    var IDS001 = req.body.IDS001;
    try {
      let result = await con.update({
        tabela: `S001 S001`,
        colunas: {
          STEMAIL: 0
        },
        condicoes: `S001.IDS001 = :id`,
        parametros: {
          id: IDS001
        }
      })
        .then((result1) => {
          return { response: "Registro atualizado com sucesso." };
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

  api.gravarHashcode = async function (usuario, passwordEncrypted, userID) {
    let con = await this.controller.getConnection(null, userID);

    try {
      let result = await con.update({
        tabela: `S001 S001`,
        colunas: {
          HASHEMA: passwordEncrypted
        },
        condicoes: `S001.IDS001 = :id`,
        parametros: {
          id: usuario
        }
      })
        .then((result1) => {
          return { response: "Registro atualizado com sucesso." };
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

  api.removerUsuarioGrupo = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);

    let IDS001 = req.body.IDS001;
    let IDS026 = req.body.IDS026;

    try {
      let result = await con.execute({
        sql: `        
        Delete From S027 S027 Where S027.Ids001 = `+ IDS001 + ` And S027.Ids026 = ` + IDS026,
        param: []
      })
        .then((result1) => {
          return { response: "Registro removido com sucesso." };
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

  api.excluirUsuariosSelecionados = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    try {
      var usuariosSelecionados = {};
      var bindParameters = [];

      for (var i = 0; i < req.body.length; i++) {
        usuariosSelecionados['id' + (i + 1)] = req.body[i];
        bindParameters.push(':id' + (i + 1));
      }

      bindParameters = bindParameters.toString();

      let result = await
        con.update({
          tabela: `S001`,
          colunas: {
            SnDelete: 1
          },
          condicoes: `S001.IDS001 in (` + bindParameters + `)`,
          parametros: usuariosSelecionados
        })
          .then((result1) => {
            return { response: "Registros removidos com sucesso" };
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
    var id = req.body.IDS001;
    try {
      let result = await con.update({
        tabela: `S001`,
        colunas: {
          NMUSUARI: req.body.NMUSUARI,
          DSEMALOG: req.body.DSEMALOG,
          STUSUARI: req.body.STUSUARI,
          SNCAR4PL: req.body.SNCAR4PL,
          SNBRAVO: req.body.SNBRAVO,
          SNADMIN: req.body.SNADMIN,
          IDG097PR: req.body.IDG097
        },
        condicoes: `IDS001 = :id`,
        parametros: {
          id: id
        }
      })
        .then((result1) => {
          return { response: "Registro atualizado com sucesso." };
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

  /**
   * @description Contém o SQL que requisita os dados da tabela S001.
   *
   * @async
   * @function api/buscarEmailUsuario
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscarEmailUsuario = async function (usuario) {
    let con = await this.controller.getConnection(null, req.UserId);

    try {
      let result = await con.execute({
        sql: `Select S001.DSEMALOG                     
                From S001 S001 
               Where S001.IDS001 = `+ usuario,
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
      throw err;
    }
  };

  /**
   * @description Contém o SQL que requisita os dados da tabela S001.
   *
   * @async
   * @function api/buscarEmailUsuario
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscarPrimeiroNomeUsuario = async function (usuario) {
    let con = await this.controller.getConnection(null, req.UserId);

    try {
      let result = await con.execute({
        sql: `Select Substr(NMUSUARI, 1, Instr(NMUSUARI, ' ') - 1) as NOME
                From S001 S001 
               Where S001.IDS001 = `+ usuario,
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
      throw err;
    }
  };

  /**
   * @description Contém o SQL que requisita os dados da tabela S001.
   *
   * @async
   * @function api/buscarEmailUsuario
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscarInfoRegSenha = async function (usuario, UserId) {
    let con = await this.controller.getConnection(null, UserId);

    try {
      let result = await con.execute({
        sql: `Select Case
                      When Instr(nmusuari, ' ') <> 0 Then
                        Substr(NMUSUARI, 1, Instr(NMUSUARI, ' ') - 1)
                      Else
                        NMUSUARI
                     End As NMUSUARI,
                     IDS001,
                     STEMAIL,
                     DSEMALOG
                From S001 S001
               Where S001.IDS001 = `+ usuario,
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
  api.salvarSenha = async function (usuario, UserId) {
    let con = await this.controller.getConnection(null, UserId);

    try {
      let result = await con.update({
        tabela: `S001`,
        colunas: {
          DSSENHA: usuario.DSSENHA,
          STEMAIL: 1
        },
        condicoes: `IDS001 = :id`,
        parametros: {
          id: usuario.IDS001
        }
      })
        .then((result1) => {
          return { response: "Senha salva com sucesso." };
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


  api.validaTime4pl = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);

    try {
      let result = await con.execute({
        sql: `SELECT 
                NVL(SNCAR4PL,0) as SNCAR4PL, 
                NVL(SNADMIN,0) as SNADMIN,
                NVL(SNBRAVO,0) as SNBRAVO
              FROM S001 WHERE IDS001 = ${req.body.ID_USER}`,
        param: []
      })
        .then((result) => {
          return result[0];
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


  api.resetPasswordByEmail = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    let email = req.body.DSEMALOG;
    try {
      let result = await con.execute(
        {
          sql: `Select S001.IDS001
                  From S001 S001
                 Where S001.SNDELETE= 0 
                   And Upper(S001.DSEMALOG)  Like Upper(:DSEMALOG)`,
          param: {
            DSEMALOG: email
          },
        })
        .then(async (result) => {
          if (result.length > 0) {
            let IDS001 = await con.update({
              tabela: `S001 S001`,
              colunas: {
                STEMAIL: 0
              },
              condicoes: `S001.IDS001 = :id`,
              parametros: {
                id: result[0].IDS001
              }
            })
              .then((result1) => {
                return { IDS001: result[0].IDS001, response: "Registro atualizado com sucesso." };
              })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
              });
            return IDS001;
          } else {
            return { response: "Nome do usuário não encontrado." };
          }
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

  return api;
};
