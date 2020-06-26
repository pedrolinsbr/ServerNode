/**
 * @description Possui os métodos Listar, Salvar, Atualizar, Buscar e Deletar da tabela A008.
 * @author @Adryell_Batista
 * @since 18/04/2018
 *
 *
 * @description Adicionando conversão automática de nome de tabelas atravéz de dicionário.
 * @author ????
 * @since 06/11/2017
*/

/**
 * @module dao/Acoes
 * @description Função para realizar o CRUD da tabela A008.
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires controller/Acoes
*/
module.exports = function (app) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  api.controller = app.config.ControllerBD;
  var dicionario = app.src.utils.Dicionario;

  api.listar = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    //filtra,ordena,pagina
    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'A008', true);

    let result = await con.execute(
      {
        sql: `Select
                      A008.IdA008,
                      A008.DsAcao,
                      A008.SnDelete,
                      A008.SnPadrao,
                      COUNT(A008.IdA008) OVER () as COUNT_LINHA
                From A008 A008`+
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
   * @description Insere um dado na tabela A008.
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
        tabela: `A008`,
        colunas: {
          DSACAO: req.body.DSACAO,
          SNDELETE: 0,
        },
        key: `A008.IDA008`
      })
      .then((result1) => {
        return { response: "Ação criada com sucesso" };
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
   * @description Busca um dado na tabela A008.
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
    var id = req.body.IDA008;
    try {
      let result = await con.execute(
      {
          sql: `Select A008.IDA008,
                        A008.DSACAO,
                        A008.SNPADRAO,
                        COUNT(A008.IDA008) OVER() as COUNT_LINHA
                  From A008 A008
                  Where A008.SNDELETE= 0
                    And IDA008 = ` + id,
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
   * @description Atualiza um dado da tabela A008.
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
    var id = req.body.IDA008;
    try {
      let result = await con.update({
        tabela: `A008`,
        colunas: {
          DSACAO: req.body.DSACAO,
        },
        condicoes: `IDA008 = :id`,
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
      await con.close();
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  }



  /**
   * @description Atualiza um dado da tabela A008.
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
    var id = req.body.IDA008;
    try {
      let result = await con.update({
        tabela: `A008`,
        colunas: {
          SNDELETE: 1,
        },
        condicoes: `IDA008 = :id`,
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
