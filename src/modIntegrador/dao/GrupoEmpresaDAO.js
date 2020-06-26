/**
 * @description Possui os métodos Listar, Salvar, Atualizar, Buscar e Deletar da tabela G009.
 * @author João Eduardo SAad
 * @since 27/10/2017
*/

/**
 * @module dao/GrupoEmpresa
 * @description Função para realizar o CRUD da tabela G009.
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires controller/GrupoEmpresa
*/
module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  var db = app.config.database;

  /**
   * @description Contém o SQL que requisita os dados da tabela G009.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.listarGrupoEmpresa = async function (req, res, next) {

    var params    = req.query;
    var arrOrder = [];

    if(params.order != null) {
      params.order.forEach(function (order) {
        arrOrder.push(params.columns[order.column]['name']  + ' ' + order['dir']);
      })
      arrOrder = arrOrder.join();
    }else{
      arrOrder = ' G023.IdG023';
    }

    return await db.execute(
      {
        sql: `Select 
                     G023.IdG023, G023.DsGruTra, G023.StCadast, G023.DtCadast,
                     S001.NmUsuari, COUNT(G023.IdG023) OVER () as COUNT_LINHA
              From G023 G023
                     Join S001 S001 on (G023.IdS001 = S001.IdS001)
              Where G023.SnDelete = 0
              Order By `+ arrOrder,
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
   * @description Busca um dado na tabela G009.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscarGrupoEmpresa = async function (req, res, next) {
    var id = req.params.id;

    return await db.execute(
      {
        sql: `Select 
                     G023.IdG023, G023.DsGruTra, G023.StCadast, G023.DtCadast,
                     S001.NmUsuari
              From   G023 G023
                     Join S001 S001 on (G023.IdS001 = S001.IdS001)
              Where  G023.SnDelete = 0 and 
                     G023.IdG023 = `+ id,
        param: []
      })
      .then((result) => {
        return (result[0]);
      })
      .catch((err) => {
        throw err;
      });
  };

  /**
   * @description Insere um dado na tabela G009.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */

  api.salvarGrupoEmpresa = async function (req, res, next) {
    
    return await db.insert({
      tabela: 'G023',
      colunas: {
        IdS001 : req.body.IdS001,
        DsGruEmp : req.body.DsGruEmp,
        DtCadast : req.body.DtCadast,
        StCadast : req.body.StCadast,
      },
      key: 'IdG023'
    })
      .then((result) => {
        return (result);
      })
      .catch((err) => {
        throw err;
      });
  };

  /**
   * @description Atualiza um dado da tabela G009.
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.atualizarGrupoEmpresa = async function (req, res, next) {
    var id = req.params.id;

    return await
      db.update({
        tabela: 'G023',
        colunas: {
          IdS001 : req.body.IdS001,
          DsGruEmp : req.body.DsGruEmp,
          DtCadast : req.body.DtCadast,
          StCadast : req.body.StCadast,
        },
        condicoes: 'IdG023 = :id',
        parametros: {
          id: id
        }
      })
        .then( (result) => {
          return { response : "Grupo de Empresas atualizado com sucesso" };
        })
        .catch((err) => {
          throw err;
        });
  };

  /**
   * @description Exclui um dado na tabela G009.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.excluirGrupoEmpresa = async function (req, res, next) {
    var id = req.params.id;

    return await
      db.update({
        tabela: 'G023',
        colunas: {
          SnDelete: 1
        },
        condicoes: 'IdG023 = :id',
        parametros: {
          id: id
        }
      })
        .then((result) => {
          return { response: "Grupo de Empresas excluído com sucesso." };
        })
        .catch((err) => {
          throw err;
        });
  };

  return api;
};
