/**
 * @description Possui os métodos Listar, Salvar, Atualizar, Buscar e Deletar da tabela H012 - TIPOS DE CARGAS.
 * @author João Eduardo Saad
 * @since 05/12/2017
*/

/**
 * @module controller/TipoCarga
 * @description Função para realizar o CRUD da tabela H012 - TIPOS DE CARGA.
 * @param {application} app - The first color, in hexadecimal format.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires dao/UnidadeMedida
*/
module.exports = function (app, cb) {
    /**
     * @description Declaração de array para receber os dados do JSON.
     * @namespace api
    */
    var api = {};

    /**
     * @description Variável que contém o caminho para o DAO.
     * @namespace dao
    */
    var dao = app.src.modHoraCerta.dao.DocasDAO;

    /**
     * @description Lista todos os dados da tabela H012.
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
        await dao.listar(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    /**
     * @description Salva um dado na tabela H012.
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
        await dao.salvar(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                //console.log("aaaaa");
                //console.log(err.joi);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    /**
     * @description Busca um dado da tabela H012.
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
        await dao.buscar(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    /**
     * @description Atualiza um dado da tabela H012.
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
        await dao.atualizar(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
                throw err;
            });
    };

    /**
       * @description Exclui um dado da tabela H012.
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
        await dao.excluir(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    return api;
};
