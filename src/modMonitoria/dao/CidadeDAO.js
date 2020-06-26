/**
 * @module dao/Cidade
 * @description Função para realizar o CRUD da tabela G003.
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires controller/Cidade
*/
module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  api.controller = app.config.ControllerBD;
  var dicionario = app.src.utils.Dicionario;

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

    try {          
      let result = await con.insert({
        tabela: `G003`,
        colunas: {
          IDG002: req.body.IDG002,
          CDMUNICI: req.body.CDMUNICI,
          CPCIDADE: req.body.CPCIDADE,
          NMCIDADE: req.body.NMCIDADE,
          NRLATITU: req.body.NRLATITU,
          NRLONGIT: req.body.NRLONGIT,
          IDS001: req.body.IDS001,
          STCADAST: 'A',
          DTCADAST: new Date()
        },
        key: `G003.IDG003`
      })
      .then((result1) => {
        return { response: "Cidade criada com sucesso" };
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
    var id = req.body.IDG003;
    try {
      let result = await con.update({
        tabela: `G003`,
        colunas: {
          IDG002: req.body.IDG002,
          CDMUNICI: req.body.CDMUNICI,
          CPCIDADE: req.body.CPCIDADE,
          NMCIDADE: req.body.NMCIDADE,
          NRLATITU: req.body.NRLATITU,
          NRLONGIT: req.body.NRLONGIT,
          IDS001: req.body.IDS001,
          STCADAST: req.body.STCADAST
        },
        condicoes: `IDG003 = :id`,
        parametros: {
          id: id
        }
      })
      .then((result1) => {
        console.log(result1);
        return { response: "Cidade Atualizada com sucesso" };
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
    var id = req.body.IDG003;
    try {
      let result = await con.execute(
      {
        sql: `Select
                    G003.IdG003,
                    G003.IdG002,
                    G003.CdMunici,
                    G003.CpCidade,
                    G003.NmCidade,
                    G003.NrLatitu,
                    G003.NrLongit,
                    G003.SnDelete,
                    G002.NMESTADO,
                    G003.STCADAST,
                    COUNT(G003.IDG003) OVER () as COUNT_LINHA
              From G003 G003
              Join G002 G002
                    ON (G002.IDG002 = G003.IDG002)
              Where G003.SNDELETE= 0 and
                    IDG003 = ` + id,
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
   * @description Exclui um dado na tabela G003.
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

    var id = req.body.IDG003;
    try {
      let result = await con.update({
        tabela: `G003`,
        colunas: {
          SnDelete: 1
        },
        condicoes: `G003.IDG003 = :id`,
        parametros: {
          id: id
        }
      })
      .then((result1) => {
        return { response: "Cidade excluida com sucesso" };
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
  * @description Contém o SQL que requisita os dados da tabela G003.
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
    var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G003',true);

    try {
      let result = await con.execute(
        {
          sql: `Select
                    G003.IdG003,
                    G003.IdG002,
                    G003.IdS001,
                    G003.CdMunici,
                    G003.CpCidade,
                    G003.NmCidade,
                    G003.NrLatitu,
                    G003.NrLongit,
                    G003.SnDelete,
                    G002.NMESTADO G002_NMESTADO,
                    G002.CDESTADO,
                    G003.STCADAST,
                    COUNT(G003.IDG003) OVER () as COUNT_LINHA
              From  G003 G003
              Join  G002 G002
                      on (G002.IDG002 = G003.IDG002)`+
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


  api.excluirMunipiosSelecionados = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    try {    
      var municipiosSelecionados = {};
      var bindParameters = [];
      
      for (var i = 0; i < req.body.length; i++) {
        municipiosSelecionados['id' + (i + 1)] = req.body[i];
        bindParameters.push(':id' + (i + 1));
      }

      bindParameters = bindParameters.toString();
    
      let result = await
        con.update({
          tabela: `G003`,
          colunas: {
            SnDelete: 1
          },
          condicoes: `G003.IDG003 in (`+bindParameters+`)`,
          parametros: municipiosSelecionados
        })
        .then((result1) => {
          return { response: "Cidade excluida com sucesso" };
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
