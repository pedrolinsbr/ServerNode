/**
 * @description Possui os métodos Listar, Salvar, Atualizar, Buscar e Deletar da tabela G010.
 * @author Yusha Mariak Miranda Silva
 * @since 25/10/2017
*/

/**
 * @module controller/ConversaoUnidadeMedida
 * @description Função para realizar o CRUD da tabela G010.
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires dao/ConversaoUnidadeMedida
*/
module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.ConversaoUnidadeMedidaDAO;

/**
 * @description Lista todos os dados da tabela G013.
 *
 * @async
 * @function api/listar
 * @param {request} req - Possui as requisições para a função.
 * @param {response} res - A resposta gerada na função.
 * @param {next} next - Caso haja algum erro na rota.
 * @return {JSON} Retorna um objeto JSON.
 * @throws Caso falso, o número do log de erro aparecerá no console.
*/
  api.listarConversaoUnidMed = async function (req, res, next) {
    await dao.listarConversaoUnidMed(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

/**
 * @description Salva um dado na tabela G013.
 *
 * @async
 * @function api/salvar
 * @param {request} req - Possui as requisições para a função.
 * @param {response} res - A resposta gerada na função.
 * @param {next} next - Caso haja algum erro na rota.
 * @return {JSON} Retorna um objeto JSON.
 * @throws Caso falso, o número do log de erro aparecerá no console.
*/
  api.salvarConversaoUnidMed = async function (req, res, next) {
    await dao.salvarConversaoUnidMed(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

/**
 * @description Busca um dado da tabela G013.
 *
 * @async
 * @function api/buscar
 * @param {request} req - Possui as requisições para a função.
 * @param {response} res - A resposta gerada na função.
 * @param {next} next - Caso haja algum erro na rota.
 * @return {JSON} Retorna um objeto JSON.
 * @throws Caso falso, o número do log de erro aparecerá no console.
*/  
  api.buscarConversaoUnidMed = async function (req, res, next) {
    
    await dao.buscarConversaoUnidMed(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

/**
 * @description Atualiza um dado da tabela G013.
 *
 * @async
 * @function api/atualizar
 * @param {request} req - Possui as requisições para a função.
 * @param {response} res - A resposta gerada na função.
 * @param {next} next - Caso haja algum erro na rota.
 * @return {JSON} Retorna um objeto JSON.
 * @throws Caso falso, o número do log de erro aparecerá no console.
*/  
  api.atualizarConversaoUnidMed = async function (req, res, next) {
    await dao.atualizarConversaoUnidMed(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

/**
   * @description Exclui um dado da tabela G013.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
*/  
  api.excluirConversaoUnidMed = async function (req, res, next) {
    await dao.excluirConversaoUnidMed(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  return api;
};
  