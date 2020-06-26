/**
 * @description Possui os métodos Listar, Salvar, Atualizar, Buscar e Deletar da tabela A002.
 * @author @Adryell_Batista
Add a comment to this line
 * @since 18/04/2018
 *
 *
 * @description Adicionando conversão automática de nome de tabelas atravéz de dicionário.
 * @author ????
 * @since 06/11/2017
*/

/**
 * @module dao/Motivos
 * @description Função para realizar o CRUD da tabela A002.
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires controller/Acoes
*/
module.exports = function (app) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  var fnUtil = app.src.utils.Utils;
  api.controller = app.config.ControllerBD;
  var dicionario = app.src.utils.Dicionario;

  api.listar = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    //filtra,ordena,pagina
    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'A002', true);

    let result = await con.execute(
      {
        sql: `Select
                      A002.IdA002,
                      A002.IdA008,
                      upper(SUBSTR( A008.DsAcao, 0 ,2 )) ||'-'|| lpad(A002.IdA002, 3, '0') ||' - '|| A002.DsTpMoti   DsTpMoti,
                      A002.SnVisCli,
                      A002.DsDeta,
                      A002.SnDelete,
                      COUNT(A002.IdA002) OVER () as COUNT_LINHA
                From A002 A002
                      INNER JOIN A008 A008 ON A008.IDA008 = A002.IDA008`+
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
   * @description Insere um dado na tabela A002.
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
        tabela: `A002`,
        colunas: {
          IDA008    : req.body.IDA008,
          DSTPMOTI  : req.body.DSTPMOTI,
          SNVISCLI  : req.body.SNVISCLI,
          DSDETA    : req.body.DSDETA,
          SNDELETE  : 0,
        },
        key: `A002.IDA002`
      })
        .then((result1) => {
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

      for (let i = 0; i < req.body.ARCONFIG.length; i++) {
        await api.salvarConfig(result, req.body.ARCONFIG[i], con, req.UserId);
      }
      

      await con.close();
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.salvarConfig = async function (IDA002, params, con1, userId) {
    let con = await this.controller.getConnection(con1, userId);

    let obj = {
      M: "DS",
      S: "DS",
      N: "NR",
      D: "DT"
    }

    let objParams      = params;
    objParams.IDS007   = 17;
    objParams.IDS007CO = 18;
    objParams.NMCAMPO  = obj[params.TPINPUT] + ((params.NMLABEL.trim()).toUpperCase()).slice(0, 3) + fnUtil.leftPad(IDA002, 3);
    objParams.IDVALUCO = IDA002;
    objParams.DSCOLUNA = params.NMLABEL;
    objParams.DTCADAST = new Date();

    try {
      let result;
      if (objParams.IDG075) {
        result = await con.update({
          tabela: `G075`,
          colunas: objParams,
          condicoes: ` IDG075 = ${objParams.IDG075} `,
        })
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });
      } else {
        delete objParams.IDG075;
        result = await con.insert({
          tabela: `G075`,
          colunas: objParams,
          key: `G075.IDG075`
        })
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });
      }
      await con.close();
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

    /**
   * @description Busca um dado na tabela A002.
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
    var id = req.body.IDA002;
    try {
      let result = await con.execute(
      {
          sql: `Select A002.IdA002,
                        A002.IdA008,
                        A002.DsTpMoti,
                        A002.SnVisCli,
                        A002.DsDeta,
                        A002.SnDelete,
                        COUNT(A002.IDA002) OVER() as COUNT_LINHA
                  From A002 A002
                  Where A002.SNDELETE= 0
                    And IDA002 = ` + id,
        param: [],
      })
      .then((result) => {
        return (result[0]);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

      let config = await api.getConfig(id, con, req.UserId);

      (config && config.length > 0) ? Object.assign(result, { 'ARCONFIG': config }) : [];

      await con.close();
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.getConfig = async function (IDA002, con1, userId) {
    let con = await this.controller.getConnection(con1, userId);
    try {
      let result = await con.execute(
      {
          sql: `Select DISTINCT G075.TPINPUT,
                      G075.TMCAMPO,
                      G075.SNOBRIGA,
                      G075.TPLOGIST,
                      G075.SNCAMPO,
                      G075.NMLABEL,
                      G075.IDG075
                  From G075 G075
                  Where G075.SNDELETE= 0
                    And G075.IDS007CO = 18
                    And G075.IDS007 = 17
                    And G075.IDVALUCO = ` + IDA002,
        param: [],
      })
      .then((result) => {
        return (result);
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
   * @description Atualiza um dado da tabela A002.
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
    var id = req.body.IDA002;
    try {
      let result = await con.update({
        tabela: `A002`,
        colunas: {
          IDA008    : req.body.IDA008,
          DSTPMOTI  : req.body.DSTPMOTI,
          SNVISCLI  : req.body.SNVISCLI,
          DSDETA    : req.body.DSDETA,
        },
        condicoes: `IDA002 = :id`,
        parametros: {
          id: id
        }
      })
      .then((result1) => {
        console.log(result1);
        return { response: "Ação Atualizada com sucesso" };
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

      for (let i = 0; i < req.body.ARCONFIG.length; i++) {
        await api.salvarConfig(id, req.body.ARCONFIG[i], con, req.UserId);
      }

      await con.close();
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  }



  /**
   * @description Atualiza um dado da tabela A002.
   *
   * @async
   * @function api/deletar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.deletar = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    var id = req.body.IDA002;
    try {
      let result = await con.update({
        tabela: `A002`,
        colunas: {
          SNDELETE: 1,
        },
        condicoes: `IDA002 = :id`,
        parametros: {
          id: id
        }
      })
      .then((result1) => {
        console.log(result1);
        return { response: "Ação Excluída com sucesso" };
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