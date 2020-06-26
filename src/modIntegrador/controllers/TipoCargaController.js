/**
 * @description Possui os métodos Listar, Salvar, Atualizar, Buscar e Deletar da tabela H002 - TIPOS DE CARGAS.
 * @author João Eduardo Saad
 * @since 05/12/2017
*/

/**
 * @module controller/TipoCarga
 * @description Função para realizar o CRUD da tabela H002 - TIPOS DE CARGA.
 * @param {application} app - The first color, in hexadecimal format.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires dao/UnidadeMedida
*/
module.exports = function (app, cb) {

	var api = {};
	var dao = app.src.modIntegrador.dao.TipoCargaDAO;

	/**
	 * @description Lista todos os dados da tabela H002.
	 *
	 * @async
	 * @function api/listar
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	*/
	api.listarTipoCarga = async function (req, res, next) {
		await dao.listarTipoCarga(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				next(err);
			});
	};

	/**
	 * @description Salva um dado na tabela H002.
	 *
	 * @async
	 * @function api/salvar
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	*/
	api.salvarTipoCarga = async function (req, res, next) {
		await dao.salvarTipoCarga(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				next(err);
			});
	};

	/**
	 * @description Busca um dado da tabela H002.
	 *
	 * @async
	 * @function api/buscar
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	*/
	api.buscarTipoCarga = async function (req, res, next) {
		await dao.buscarTipoCarga(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				next(err);
			});
	};

	/**
	 * @description Atualiza um dado da tabela H002.
	 *
	 * @async
	 * @function api/atualizar
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	*/
	api.atualizarTipoCarga = async function (req, res, next) {
		await dao.atualizarTipoCarga(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				next(err);
				throw err;
			});
	};

	/**
	   * @description Exclui um dado da tabela H002.
	   *
	   * @async
	   * @function api/excluir
	   * @param {request} req - Possui as requisições para a função.
	   * @param {response} res - A resposta gerada na função.
	   * @param {next} next - Caso haja algum erro na rota.
	   * @return {JSON} Retorna um objeto JSON.
	   * @throws Caso falso, o número do log de erro aparecerá no console.
	*/
	api.excluirTipoCarga = async function (req, res, next) {
		await dao.excluirTipoCarga(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				next(err);
			});
	};
	
	api.buscarFiltroTipoCarga = async function (req, res, next) {
		await dao.buscarFiltroTipoCarga(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				next(err);
			});
	};

	return api;
};
