/**
 * @description Possui os métodos Listar, Salvar, Atualizar, Buscar e Deletar da tabela G023.
 * @author João Eduardo Saad
 * @since 26/10/2017
*/

/**
 * @module controller/GrupoEmpresa
 * @description Função para realizar o CRUD da tabela G023.
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array GrupoEmpresa.
 * @requires dao/RecursoHumano
*/
module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.GrupoEmpresaDAO;

/**
 * @description Lista todos os dados da tabela G023.
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
    await dao.listarGrupoEmpresa(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

/**
 * @description Salva um dado na tabela G023.
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
    
    await dao.salvarGrupoEmpresa(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

/**
 * @description Busca um dado da tabela G023.
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

    await dao.buscarGrupoEmpresa(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

/**
 * @description Atualiza um dado da tabela G023.
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
    await dao.atualizarGrupoEmpresa(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

/**
 * @description Exclui um dado da tabela G023.
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
    await dao.excluirGrupoEmpresa(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  return api;

};
