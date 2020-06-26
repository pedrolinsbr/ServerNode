/**
 * @description Possui os métodos Listar, Salvar, Atualizar, Buscar e Deletar das tabelas G056 e I014.
*/

/**
 * @module dao/Cidade
 * @description Função para realizar o CRUD das tabelas G056 e I014.
 * @param {application} app - Configurações do app.
 * @param {connection} db - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires controller/Cidade
*/
module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  var db = app.config.database;
  const tmz       = app.src.utils.DataAtual;
  api.controller = app.config.ControllerBD;

  const gdao = app.src.modGlobal.dao.GenericDAO;

  /**
  * @description Contém o SQL que requisita os dados da tabela G056.
  *
  * @async
  * @function api/listar
  * @param {request} req - Possui as requisições para a função.
  * @param {response} res - A resposta gerada na função.
  * @param {next} next - Caso haja algum erro na rota.
  * @return {JSON} Retorna um objeto JSON.
  * @throws Caso falso, o número do log de erro aparecerá no console.
 */
  api.listarVendorCode = async function (req, res, next) {
    var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G056',true);

    return await db.execute(
      {
        sql: `SELECT
              	 G056.IDG056
              	,G056.IDG024
              	,G024.NMTRANSP
              	,G056.IDG014
              	,G014.DSOPERAC
                ,G056.IDTRAOPE
                ,G056.DTCADAST
                ,G056.STCADAST
              	,COUNT(G056.IDG056)  OVER() AS COUNT_LINHA
              FROM G056 G056

              INNER JOIN G024 G024
               ON G024.IDG024 = G056.IDG024

              INNER JOIN G014 G014
               ON G014.IDG014 = G056.IDG014`+
              sqlWhere +
              sqlOrder +
              sqlPaginate ,
        param: bindValues
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result));
      })
      .catch((err) => {
        throw err;
      });
  };

  /**
   * @description Insere um dado na tabela G056.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.salvarVendorCode = async function (req, res, next) {

    let result = await req.objConn.insert({
      tabela: `G056`,
      colunas: {
        IDTRAOPE: req.body.IDTRAOPE,
        IDG024: req.body.IDG024.id,
        IDG014: req.body.IDG014.id,
        STCADAST: req.body.STCADAST,
        DTCADAST: new Date(),
        IDS001: req.body.IDS001,
        SNDELETE: 0
      },
      key: `G056.IDG056`
    })
    .then((result) => {
      return result;
    })
    .catch((err) => {
      throw err;
    });

    return result;
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
  api.atualizarVendorCode = async function (req, res, next) {
    return await
      db.update({
        tabela: `G056`,
        colunas: {
          IDTRAOPE: req.body.IDTRAOPE,
          IDG024: req.body.IDG024.id,
          IDG014: req.body.IDG014.id,
          STCADAST: req.body.STCADAST,
        },
        condicoes: `G056.IDG056 = :id`,
        parametros: {
          id: req.body.IDG056
        }
      })
        .then((result) => {
          return { response: "Vendor Code atualizado com sucesso" };
        })
        .catch((err) => {
          throw err;
        });
  };

  /**
   * @description Exclui um dado na tabela G056.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.excluirVendorCode = async function (req, res, next) {

    var sql = `DELETE FROM G056 WHERE G056.IDG056 = ${req.params.id}`;
    
      return await db.execute({ sql, param: [] })
        .then((result) => {
          return ({response: 'Excluído'});
        })
        .catch((err) => {
          throw err;
        });
  };

  /**
  * @description Contém o SQL que requisita os dados da tabela I014.
  *
  * @async
  * @function api/listar
  * @param {request} req - Possui as requisições para a função.
  * @param {response} res - A resposta gerada na função.
  * @param {next} next - Caso haja algum erro na rota.
  * @return {JSON} Retorna um objeto JSON.
  * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscarG024 = async function (req, res, next) {
    let IDG056 = req.params.id

    return await db.execute(
      {
        sql: `SELECT G056.IDG024
                FROM G056 G056
               WHERE G056.IDG056 = :id`,
        param: { id: IDG056}
      })
      .then((result) => {
        return result[0].IDG024;
      })
      .catch((err) => {
        throw err;
      });
  };

  /**
  * @description Contém o SQL que requisita os dados da tabela I014.
  *
  * @async
  * @function api/listar
  * @param {request} req - Possui as requisições para a função.
  * @param {response} res - A resposta gerada na função.
  * @param {next} next - Caso haja algum erro na rota.
  * @return {JSON} Retorna um objeto JSON.
  * @throws Caso falso, o número do log de erro aparecerá no console.
 */
api.listarI014 = async function (req, res, next) {
  var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'I014',true);
  let IDG024 = req.params.id

  return await db.execute(
    {
      sql: `SELECT
               I014.IDI014
              ,I014.IDG024
              ,I014.DTCADAST
              ,I014.STCADAST
              ,I014.IDG002
              ,G002.NMESTADO
              ,I014.IDG003
              ,G003.NMCIDADE
              ,COUNT(I014.IDI014)  OVER() AS COUNT_LINHA
            FROM I014 I014

            INNER JOIN G002 G002
              ON G002.IDG002 = I014.IDG002

            LEFT JOIN G003 G003
              ON G003.IDG003 = I014.IDG003`+
            sqlWhere +
            `AND I014.IDG024 = `+
            IDG024 +
            sqlOrder +
            sqlPaginate ,
      param: bindValues
    })
    .then((result) => {
      return (utils.construirObjetoRetornoBD(result));
    })
    .catch((err) => {
      throw err;
    });
};

  /**
  * @description Contém o SQL que busca os dados da tabela I014 por IDG002.
  *
  * @async
  * @function api/listar
  * @param {request} req - Possui as requisições para a função.
  * @param {response} res - A resposta gerada na função.
  * @param {next} next - Caso haja algum erro na rota.
  * @return {JSON} Retorna um objeto JSON.
  * @throws Caso falso, o número do log de erro aparecerá no console.
 */
api.verificarI014 = async function (req, res, next) {

  let con = await this.controller.getConnection();

  try {

    let result = await con.execute(
      {
        sql: `SELECT I014.IDI014,
                    I014.IDG024,
                    I014.IDG002
                FROM I014 I014
              WHERE I014.IDG002 = :id`,
        param: {
          id: req.body.IDG002.id
        }
      })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });

    await con.close();
    return result;

  } catch (err) {
    await con.closeRollback();
    throw err;
  }

};


  /**
   * @description Insere dados na tabela I014.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.salvarI014 = async function (req, res, next) {

    try {

      req.objI014.DTCADAST = tmz.tempoAtual('DD/MM/YYYY');

      var arCampos  = ['IDG003', 'IDG002', 'IDG024', 'IDS001', 'STCADAST', 'DTCADAST', 'SNDELETE'];
      var arValores = [];

      var sql = `INSERT INTO I014 (${arCampos.join()}) \n`;

      sql += 'WITH input_values AS ( \n';

      for (var id of req.objI014[arCampos[0]]) {

          var strValor = `SELECT
                            ${id.id} ${arCampos[0]},
                            ${req.objI014[arCampos[1]]} ${arCampos[1]},
                            ${req.objI014[arCampos[2]]} ${arCampos[2]},
                            ${req.objI014[arCampos[3]]}  ${arCampos[3]},
                           '${req.objI014[arCampos[4]]}' ${arCampos[4]},
                            TO_DATE('${req.objI014[arCampos[5]]}', 'dd/mm/yyyy') ${arCampos[5]},
                            0 ${arCampos[6]} FROM DUAL`;
          arValores.push(strValor);

      } 

      sql += arValores.join(' UNION ALL \n');

      sql += `) SELECT * FROM input_values`;

      req.sql = sql;

      await gdao.executar(req, res, next);

      return true;

    } catch (err) {

        throw err;

    }
  };


  /**
   * @description Atualiza um dado da tabela I014.
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.atualizarI014 = async function (req, res, next) {
    return await
      db.update({
        tabela: `I014`,
        colunas: {
          IDG002: req.body.IDG002.id,
          IDG003: (req.body.IDG003 !=null)?req.body.IDG003.id:null
        },
        condicoes: `I014.IDI014 = :id`,
        parametros: {
          id: req.body.IDI014
        }
      })
        .then((result) => {
          return { response: "Registro Atualizado com sucesso" };
        })
        .catch((err) => {
          throw err;
        });
  };

    /**
   * @description Altera a situação de um dado da tabela I014.
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.alterarSituacaoI014 = async function (req, res, next) {

    let result = await db.execute(
      {
        sql: `SELECT I014.STCADAST
                FROM I014 I014
              WHERE I014.IDI014 = :id`,
        param: {
          id: req.body.IDI014
        }
      })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });

    let STCADAST =  (result[0].STCADAST == 'A') ? 'I' : 'A';

    let resultUpdate = await db.update({
        tabela: `I014`,
        colunas: {
          STCADAST: STCADAST
        },
        condicoes: `I014.IDI014 = :id`,
        parametros: {
          id: req.body.IDI014
        }
      })
      .then((result) => {
        return { response: "Situação alterada com sucesso!" };
      })
      .catch((err) => {
        throw err;
      });

    return resultUpdate;
  };

  /**
   * @description Exclui um dado na tabela I014.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.excluirI014 = async function (req, res, next) {

    var sql = `DELETE FROM I014 WHERE I014.IDI014 = ${req.params.id}`;
    
      return await db.execute({ sql, param: [] })
        .then((result) => {
          return { response: "Registro excluido com sucesso" };
        })
        .catch((err) => {
          throw err;
        });
  };

  /**
   * @description Exclui dados na tabela I014 em cascata da G056.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.excluirCascataI014 = async function (req, res, next) {

    var sql = `DELETE FROM I014 WHERE I014.IDG024 = ${req.body.IDG024}`;
    
      return await db.execute({ sql, param: [] })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          throw err;
        });
  };

  return api;
};
